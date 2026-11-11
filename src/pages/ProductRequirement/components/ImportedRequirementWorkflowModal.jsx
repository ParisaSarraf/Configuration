import { useRef, useState } from "react";
import { Alert, Button, Input, message, Modal, Select } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, FileDoneOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useProductTheme } from "../../../components/Theme/ProductThemeContext";
import { getProductThemeVariables } from "../../../components/Theme/productThemes";
import { useChangeExportedRequirementEditionState } from "../../../QueryServises/productRequirementQuery";
import { getAssignmentState } from "../utils/requirementTree";
import {
  IMPORTED_WORKFLOW_STEPS, buildImportedTransition, getCurrentProductAssignments,
  getImportedTransitionTarget, getImportedWorkflowIndex,
} from "../utils/importedRequirementWorkflow";
import "./requirement-workflow.css";
import { RequirementWorkflowHistory, useRequirementWorkflowHistory } from "./RequirementWorkflowHistory";
import ExportedAttachmentModal from "./ExportedAttachmentModal";
import { findEditionInTree } from "../utils/requirementWorkflow";

export default function ImportedRequirementWorkflowModal({ isOpen, node, closeModal, refetch }) {
  const { getThemeForModule } = useProductTheme();
  const themeVariables = getProductThemeVariables(getThemeForModule("4"));
  const requirement = node?.requirement;
  const edition = node?.edition;
  const [assignments, setAssignments] = useState(() => getCurrentProductAssignments(edition));
  const [selectedId, setSelectedId] = useState(() => {
    const matches = getCurrentProductAssignments(edition);
    return matches.length === 1 ? matches[0].id : undefined;
  });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileAssignment, setFileAssignment] = useState(null);
  const submitLock = useRef(false);
  const queryClient = useQueryClient();
  const { mutateAsync: changeState } = useChangeExportedRequirementEditionState();
  const assignment = assignments.find((item) => String(item.id) === String(selectedId));
  const history = useRequirementWorkflowHistory(assignment?.id, "product_requirement_edition_exported", IMPORTED_WORKFLOW_STEPS);
  const state = assignment?.state;
  const index = getImportedWorkflowIndex(state);
  const unknown = assignment && index < 0;
  const currentLabel = !assignment ? "انتخاب نشده" : getAssignmentState(state).label;
  const previous = assignment ? getImportedTransitionTarget(state, -1) : null;
  const next = assignment ? getImportedTransitionTarget(state, 1) : null;
  const canMove = requirement?.imported === true && !!assignment && !!comment.trim() && !busy;

  const move = async (direction) => {
    if (submitLock.current) return;
    let payload;
    try { payload = buildImportedTransition(requirement, assignment, direction, comment); }
    catch (error) { message.warning(error.message); return; }
    submitLock.current = true;
    setBusy(true);
    try {
      await changeState(payload);
      setAssignments((items) => items.map((item) => String(item.id) === String(payload.id) ? { ...item, state: payload.state } : item));
      setComment("");
      message.success("مرحله تخصیص با موفقیت تغییر کرد");
      history.refetch();
      try {
        const result = await refetch();
        await queryClient.invalidateQueries({ queryKey: ["product-requirement-acceptor", edition?.id] });
        if (result?.isError) message.warning("مرحله ثبت شد، اما به‌روزرسانی درخت ناموفق بود");
      } catch { message.warning("مرحله ثبت شد، اما به‌روزرسانی درخت ناموفق بود"); }
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data?.message;
      message.error(typeof detail === "string" ? detail : error?.message || "تغییر مرحله ناموفق بود");
    } finally { submitLock.current = false; setBusy(false); }
  };

  return (
    <Modal open={isOpen} width={880} footer={null} centered className="requirement-workflow-modal"
      style={themeVariables} aria-label="روال الزام واردشده"
      onCancel={() => { if (!submitLock.current) closeModal(); }}
      closable={!busy} maskClosable={!busy} keyboard={!busy} destroyOnClose>
      <div className="rw-shell" dir="rtl">
        <header className="rw-header">
          <div className="rw-heading-icon" aria-hidden="true"><FileDoneOutlined /></div>
          <div className="rw-heading-copy"><div className="rw-eyebrow">مدیریت نسخه واردشده</div>
            <h2>روال الزام واردشده</h2><p>مراحل تخصیص این نسخه به محصول جاری را مدیریت کنید.</p></div>
        </header>
        <section className="rw-summary" aria-label="اطلاعات نسخه">
          <div className="rw-summary-main"><span className="rw-caption">الزام</span>
            <strong>{requirement?.title || "الزام بدون عنوان"}</strong>
            <span className="rw-version">نسخه <bdi dir="ltr">{edition?.full_code || edition?.code || edition?.id || "—"}</bdi></span></div>
          <div className="rw-current"><span className="rw-caption">وضعیت تخصیص</span>
            <span className="rw-current-badge"><span className="rw-current-dot" />{currentLabel}</span></div>
        </section>
        <section className="rw-section rw-assignment-selector" aria-label="انتخاب تخصیص">
          {!assignments.length ? <Alert type="warning" showIcon message="تخصیص معتبری برای محصول جاری پیدا نشد." /> : (
            <>
              <div className="rw-section-head"><div><h3>تخصیص به محصول جاری</h3>
                <p>{assignments.length > 1 ? "برای تغییر وضعیت، تخصیص موردنظر را انتخاب کنید." : "وضعیت مربوط به همین تخصیص تغییر می‌کند."}</p></div></div>
              <Select aria-label="انتخاب تخصیص محصول جاری" value={selectedId} disabled={busy}
                onChange={(value) => { setSelectedId(value); setComment(""); }}
                placeholder="انتخاب تخصیص" options={assignments.map((item) => ({
                  value: item.id,
                  label: `تخصیص ${item.id} — محصول ${item.to_product_id ?? "نامشخص"} — ${getAssignmentState(item.state).label}`,
                }))} />
              {assignment && <div className="mt-3"><Button disabled={busy}
                onClick={() => setFileAssignment(assignment)}>افزودن یا ویرایش فایل تخصیص</Button></div>}
            </>
          )}
        </section>
        <section className="rw-section" aria-labelledby="imported-workflow-stages">
          <div className="rw-section-head"><div><h3 id="imported-workflow-stages">مراحل روال</h3>
            <p>جایگاه تخصیص انتخاب‌شده در مسیر سه‌مرحله‌ای</p></div>
            {index >= 0 && <span className="rw-counter">مرحله {index + 1} از ۳</span>}</div>
          {unknown && <Alert type="warning" showIcon message={`وضعیت تخصیص (${state ?? "نامشخص"}) خارج از مراحل شناخته‌شده است؛ تغییر مرحله امکان‌پذیر نیست.`} />}
          {assignment && <RequirementWorkflowHistory history={history} steps={IMPORTED_WORKFLOW_STEPS} currentState={state} />}

        </section>
        <section className="rw-section rw-comment-section" aria-labelledby="imported-workflow-comment">
          <div className="rw-section-head"><div><h3 id="imported-workflow-comment">توضیح تغییر مرحله <span className="rw-required">الزامی</span></h3>
            <p>دلیل انتقال یا بازگشت این تخصیص را ثبت کنید.</p></div></div>
          <Input.TextArea aria-labelledby="imported-workflow-comment" aria-required="true" rows={3} value={comment}
            onChange={(event) => setComment(event.target.value)} disabled={busy || !assignment || !!unknown}
            placeholder="توضیح مربوط به این مرحله را وارد کنید..." />
        </section>
        <footer className="rw-footer">
          <Button className="rw-close" onClick={closeModal} disabled={busy}>بستن</Button>
          <div className="rw-actions">
            <Button icon={<ArrowRightOutlined />} onClick={() => move(-1)} disabled={!canMove || !previous} loading={busy}>
              {previous ? `بازگشت به ${previous.label}` : "مرحله قبل"}
            </Button>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => move(1)} disabled={!canMove || !next} loading={busy}>
              {next ? `انتقال به ${next.label}` : "مرحله نهایی"}
            </Button>
          </div>
        </footer>
      </div>
      {fileAssignment && <ExportedAttachmentModal assignment={fileAssignment} editionId={edition?.id}
        refetch={refetch} onClose={() => setFileAssignment(null)} onSaved={(data) => {
          const fresh = findEditionInTree(data, requirement?.id, edition?.id);
          if (fresh) setAssignments(getCurrentProductAssignments(fresh.edition));
          else closeModal();
        }} />}
    </Modal>
  );
}
