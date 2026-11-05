import { useRef, useState } from "react";
import { Alert, Button, Input, message, Modal } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, FileDoneOutlined } from "@ant-design/icons";
import "./requirement-workflow.css";
import { useProductTheme } from "../../../components/Theme/ProductThemeContext";
import { getProductThemeVariables } from "../../../components/Theme/productThemes";
import { useChangeProductRequirementEditionState } from "../../../QueryServises/productRequirementQuery";
import { getRequirementState } from "../utils/requirementTree";
import { REQUIREMENT_WORKFLOW_STEPS, allAssignmentsCompleted, findEditionInTree, buildRequirementTransition, canRunRequirementWorkflow, getWorkflowIndex } from "../utils/requirementWorkflow";

export default function RequirementWorkflowModal({ isOpen, node, closeModal, refetch }) {
  // The modal is rendered through a portal, so carry the requirement tab's
  // theme explicitly instead of inheriting the global theme from document.body.
  const { getThemeForModule } = useProductTheme();
  const themeVariables = getProductThemeVariables(getThemeForModule("4"));
  const requirement = node?.requirement;
  const edition = node?.edition;
  const [currentState, setCurrentState] = useState(edition?.state);
  const [liveEdition, setLiveEdition] = useState(edition);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const submitLock = useRef(false);
  const { mutateAsync: changeState } = useChangeProductRequirementEditionState();
  const index = getWorkflowIndex(currentState);
  const eligible = canRunRequirementWorkflow(requirement, edition);
  const current = getRequirementState(currentState);
  const canMove = eligible && index >= 0 && Boolean(comment.trim()) && !busy;
  const previous = index > 0 ? REQUIREMENT_WORKFLOW_STEPS[index - 1] : null;
  const next = index >= 0 ? REQUIREMENT_WORKFLOW_STEPS[index + 1] : null;
  const gateBlocked = !allAssignmentsCompleted(liveEdition);

  const refreshEdition = async () => {
    const result = await refetch();
    if (result?.isError || !result?.data) throw new Error("دریافت آخرین وضعیت تخصیص‌ها ناموفق بود؛ دوباره تلاش کنید.");
    const found = findEditionInTree(result.data, requirement?.id, edition?.id);
    if (!found || found.requirement?.imported !== false) throw new Error("نسخه اصلی در اطلاعات به‌روز پیدا نشد.");
    setLiveEdition(found.edition);
    return found.edition;
  };
  const refreshGate = async () => {
    if (submitLock.current) return;
    submitLock.current = true; setBusy(true);
    try {
      const latest = await refreshEdition();
      setCurrentState(latest.state);
      message.success("وضعیت تخصیص‌ها به‌روز شد");
    } catch (error) { message.error(error?.message || "به‌روزرسانی ناموفق بود"); }
    finally { submitLock.current = false; setBusy(false); }
  };

  const move = async (direction) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setBusy(true);
    try {
      let checkedEdition = liveEdition;
      const target = index >= 0 ? REQUIREMENT_WORKFLOW_STEPS[index + direction] : null;
      // Recheck the server before the gated transition; cached assignment states
      // can change while this modal is open.
      if (target?.value === 30) {
        checkedEdition = await refreshEdition();
        if (Number(checkedEdition.state) !== Number(currentState)) {
          setCurrentState(checkedEdition.state);
          throw new Error("وضعیت نسخه تغییر کرده است؛ لطفاً مرحله را دوباره بررسی کنید.");
        }
      }
      const payload = buildRequirementTransition(requirement, checkedEdition, currentState, direction, comment);
      await changeState(payload);
      setCurrentState(payload.state);
      setComment("");
      message.success("مرحله الزام با موفقیت تغییر کرد");
      try {
        const result = await refetch();
        if (result?.isError) message.warning("مرحله ثبت شد، اما به‌روزرسانی درخت ناموفق بود");
        else {
          const found = findEditionInTree(result?.data, requirement?.id, edition?.id);
          if (found) setLiveEdition(found.edition);
        }
      } catch { message.warning("مرحله ثبت شد، اما به‌روزرسانی درخت ناموفق بود"); }
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data?.message;
      message.error(typeof detail === "string" ? detail : error?.message || "تغییر مرحله ناموفق بود");
    } finally { submitLock.current = false; setBusy(false); }
  };

  return (
    <Modal open={isOpen} width={880} footer={null} centered
      className="requirement-workflow-modal" style={themeVariables} aria-label="روال الزام"
      onCancel={() => { if (!submitLock.current) closeModal(); }}
      closable={!busy} maskClosable={!busy} keyboard={!busy} destroyOnClose>
      <div className="rw-shell" dir="rtl">
        <header className="rw-header">
          <div className="rw-heading-icon" aria-hidden="true"><FileDoneOutlined /></div>
          <div className="rw-heading-copy">
            <div className="rw-eyebrow">مدیریت نسخه الزام</div>
            <h2>روال الزام</h2>
            <p>مراحل بررسی و پیشرفت این نسخه را مدیریت کنید.</p>
          </div>
        </header>

        <section className="rw-summary" aria-label="اطلاعات نسخه">
          <div className="rw-summary-main">
            <span className="rw-caption">الزام</span>
            <strong>{requirement?.title || "الزام بدون عنوان"}</strong>
            <span className="rw-version">نسخه <bdi dir="ltr">{edition?.full_code || edition?.code || edition?.id || "—"}</bdi></span>
          </div>
          <div className="rw-current">
            <span className="rw-caption">وضعیت فعلی</span>
            <span className="rw-current-badge"><span className="rw-current-dot" />{current.label}</span>
          </div>
        </section>

        <section className="rw-section" aria-labelledby="rw-stages-title">
          <div className="rw-section-head">
            <div><h3 id="rw-stages-title">مراحل روال</h3><p>جایگاه فعلی نسخه در مسیر پنج‌مرحله‌ای</p></div>
            {index >= 0 && <span className="rw-counter">مرحله {index + 1} از {REQUIREMENT_WORKFLOW_STEPS.length}</span>}
          </div>
          {!eligible && <Alert type="warning" showIcon message="این روال فقط برای نسخه الزام غیرایمپورت‌شده در دسترس است." />}
          {gateBlocked && (next?.value === 30 || previous?.value === 30) && <Alert type="warning" showIcon
            message="انتقال نسخه اصلی به اجرا (۳۰) پس از صحه‌گذاری همه تخصیص‌ها امکان‌پذیر است."
            description="اگر وضعیت تخصیص‌ها تغییر کرده است، فهرست را به‌روز کنید."
            action={<Button size="small" onClick={refreshGate} disabled={busy}>به‌روزرسانی</Button>} />}
          {index < 0 && <Alert type="warning" showIcon message="وضعیت این نسخه نامشخص یا خارج از مراحل روال است؛ تغییر مرحله امکان‌پذیر نیست." />}
          <ol className="rw-stages" aria-label="مراحل پنج‌گانه الزام">
            {REQUIREMENT_WORKFLOW_STEPS.map((step, stepIndex) => {
              const isCurrent = index === stepIndex;
              const isPast = index >= 0 && stepIndex < index;
              return (
                <li key={step.value} className={`rw-stage${isCurrent ? " is-current" : ""}${isPast ? " is-past" : ""}`} aria-current={isCurrent ? "step" : undefined}>
                  <span className="rw-stage-marker" aria-hidden="true">{isPast ? <CheckOutlined /> : stepIndex + 1}</span>
                  <span className="rw-stage-copy"><strong>{step.label}</strong><small>{isCurrent ? "مرحله فعلی" : isPast ? "مرحله پیشین" : index >= 0 && stepIndex === index + 1 ? "مرحله بعدی" : "در انتظار"}</small></span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rw-section rw-comment-section" aria-labelledby="rw-comment-label">
          <div className="rw-section-head">
            <div><h3 id="rw-comment-label">توضیح تغییر مرحله <span className="rw-required">الزامی</span></h3>
              <p>دلیل انتقال یا بازگشت این نسخه را ثبت کنید.</p></div>
          </div>
          <Input.TextArea aria-labelledby="rw-comment-label" aria-required="true" rows={3} value={comment}
            onChange={(event) => setComment(event.target.value)} disabled={busy || !eligible || index < 0}
            placeholder="توضیح مربوط به این مرحله را وارد کنید..." />
        </section>
        <footer className="rw-footer">
          <Button className="rw-close" onClick={closeModal} disabled={busy}>بستن</Button>
          <div className="rw-actions">
            <Button icon={<ArrowRightOutlined />} onClick={() => move(-1)} disabled={!canMove || !previous || (previous?.value === 30 && gateBlocked)} loading={busy}>
              {previous ? `بازگشت به ${previous.label}` : "مرحله قبل"}
            </Button>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => move(1)} disabled={!canMove || !next || (next?.value === 30 && gateBlocked)} loading={busy}>
              {next ? `انتقال به ${next.label}` : "مرحله نهایی"}
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
}
