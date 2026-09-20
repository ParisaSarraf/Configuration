import { useState } from "react";
import { Alert, Button, Checkbox, Input, Modal, Steps } from "antd";

const { TextArea } = Input;

const DEFAULT_STATIONS = "ثبت درخواست\nبررسی مدیر\nپایان";

// الگوهای آماده‌ی پرکاربرد؛ فقط متن همین جعبه را پر می‌کنند.
const TEMPLATES = [
  { label: "تأیید یک‌مرحله‌ای", value: "ثبت درخواست\nبررسی مدیر\nپایان" },
  {
    label: "تأیید دومرحله‌ای",
    value: "ثبت درخواست\nبررسی کارشناس\nتأیید مدیر\nپایان",
  },
  { label: "ثبت ← بررسی ← پایان", value: "ثبت\nبررسی\nپایان" },
];

const ProcessWizardModal = ({ open, onClose, onApply, hasNodes }) => {
  const [step, setStep] = useState(0);
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  const [withApprove, setWithApprove] = useState(true);
  const [withDenied, setWithDenied] = useState(true);

  const names = stations
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const reset = () => {
    setStep(0);
    setStations(DEFAULT_STATIONS);
    setWithApprove(true);
    setWithDenied(true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFinish = () => {
    onApply({ names, withApprove, withDenied });
    reset();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="ساخت سریع مسیر فرایند"
      width={560}
      footer={
        <div className="process-wizard__footer">
          <Button onClick={handleClose}>انصراف</Button>
          {step === 0 ? (
            <Button
              type="primary"
              disabled={names.length < 2}
              onClick={() => setStep(1)}
            >
              مرحله‌ی بعد
            </Button>
          ) : (
            <>
              <Button onClick={() => setStep(0)}>مرحله‌ی قبل</Button>
              <Button type="primary" onClick={handleFinish}>
                ساخت روی بوم
              </Button>
            </>
          )}
        </div>
      }
    >
      <Steps
        size="small"
        current={step}
        className="process-wizard__steps"
        items={[{ title: "مراحل" }, { title: "عملیات" }]}
      />

      {step === 0 ? (
        <div className="process-wizard__body">
          <p className="process-wizard__hint">
            نام هر مرحله را در یک خط بنویسید؛ به همین ترتیب به هم وصل می‌شوند.
            خط اول مرحله شروع و خط آخر مرحله پایان در نظر گرفته می‌شود.
          </p>
          <div className="process-wizard__templates">
            <span className="process-wizard__templates-label">
              از یک الگوی آماده شروع کنید:
            </span>
            <div className="process-wizard__template-list">
              {TEMPLATES.map((template) => (
                <Button
                  key={template.label}
                  size="small"
                  className="process-wizard__template"
                  onClick={() => setStations(template.value)}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>
          <TextArea
            rows={7}
            value={stations}
            onChange={(event) => setStations(event.target.value)}
            placeholder="هر خط، یک مرحله"
          />
          <p className="process-wizard__count">
            {names.length < 2
              ? "دست‌کم دو مرحله لازم است."
              : `${names.length} مرحله ساخته می‌شود.`}
          </p>
        </div>
      ) : (
        <div className="process-wizard__body">
          <Checkbox
            checked={withApprove}
            onChange={(event) => setWithApprove(event.target.checked)}
          >
            عملیات «تأیید» روی همه‌ی مسیرهای ساخته‌شده قرار بگیرد
          </Checkbox>
          <Checkbox
            checked={withDenied}
            onChange={(event) => setWithDenied(event.target.checked)}
          >
            مرحله «رد شده» با عملیات «رد» هم اضافه شود
          </Checkbox>

          <Alert
            type="info"
            showIcon
            className="process-wizard__note"
            message="چیزی روی سرور ذخیره نمی‌شود"
            description="این مراحل فقط روی بوم ساخته می‌شوند. برای ثبت، مانند قبل دکمه‌ی «ذخیره فرایند» را بزنید."
          />

          {hasNodes ? (
            <Alert
              type="warning"
              showIcon
              className="process-wizard__note"
              message="مراحل فعلی پاک نمی‌شوند"
              description="مسیر جدید به فرایند فعلی اضافه می‌شود. اگر قبلاً مرحله شروع دارید، خط اول به عنوان مرحله عادی ساخته می‌شود."
            />
          ) : null}
        </div>
      )}
    </Modal>
  );
};

export default ProcessWizardModal;
