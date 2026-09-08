/* eslint-disable react/prop-types */
import { useState } from "react";
import { Alert, Button, Checkbox, Input, Modal, Steps } from "antd";

const { TextArea } = Input;

const DEFAULT_STATIONS = "ثبت درخواست\nبررسی مدیر\nپایان";

/**
 * ویزارد ساخت سریع یک مسیر خطی.
 *
 * این کامپوننت فقط ورودی کاربر را جمع می‌کند و به onApply می‌دهد؛
 * ساخت گراف و ذخیره‌سازی همان‌جایی انجام می‌شود که قبلاً انجام می‌شد.
 */
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
        items={[{ title: "ایستگاه‌ها" }, { title: "عملیات‌ها" }]}
      />

      {step === 0 ? (
        <div className="process-wizard__body">
          <p className="process-wizard__hint">
            نام هر مرحله را در یک خط بنویسید؛ به همین ترتیب به هم وصل
            می‌شوند. خط اول ایستگاه شروع و خط آخر ایستگاه پایان در نظر گرفته
            می‌شود.
          </p>
          <TextArea
            rows={7}
            value={stations}
            onChange={(event) => setStations(event.target.value)}
            placeholder="هر خط، یک ایستگاه"
          />
          <p className="process-wizard__count">
            {names.length < 2
              ? "دست‌کم دو ایستگاه لازم است."
              : `${names.length} ایستگاه ساخته می‌شود.`}
          </p>
        </div>
      ) : (
        <div className="process-wizard__body">
          <Checkbox
            checked={withApprove}
            onChange={(event) => setWithApprove(event.target.checked)}
          >
            عملیات «تأیید» روی همه‌ی ارتباط‌های مسیر ساخته شود
          </Checkbox>
          <Checkbox
            checked={withDenied}
            onChange={(event) => setWithDenied(event.target.checked)}
          >
            ایستگاه «رد شده» با عملیات «رد» هم اضافه شود
          </Checkbox>

          <Alert
            type="info"
            showIcon
            className="process-wizard__note"
            message="چیزی روی سرور ذخیره نمی‌شود"
            description="این مرحله‌ها فقط روی بوم ساخته می‌شوند. برای ثبت، مانند قبل دکمه‌ی «ذخیره فرایند» را بزنید."
          />

          {hasNodes ? (
            <Alert
              type="warning"
              showIcon
              className="process-wizard__note"
              message="ایستگاه‌های فعلی پاک نمی‌شوند"
              description="مسیر جدید به فرایند فعلی اضافه می‌شود. اگر قبلاً ایستگاه شروع دارید، خط اول به عنوان ایستگاه عادی ساخته می‌شود."
            />
          ) : null}
        </div>
      )}
    </Modal>
  );
};

export default ProcessWizardModal;
