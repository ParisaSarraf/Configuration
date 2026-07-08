import { useEffect } from "react";
import { useZipSerialReportStatusBySerialId } from "../../QueryServises/productDocumentQuery";
import { message, Modal, Progress, Typography } from "antd";
import { BASEURL } from "../../Services/axiosInstance";

const ZipSerialProgressModal = ({ uuid, fileName, onDone, onClose }) => {
  const { data, isError } = useZipSerialReportStatusBySerialId(uuid, {
    enabled: true,
  });

  const status = data?.status;
  const percent = data?.progress_percent ?? 0;
  const passed = data?.passed ?? 0;
  const total = data?.total ?? 0;

  useEffect(() => {
    if (status === "SUCCESS" && data?.file) {
      const baseOrigin = BASEURL.replace("/api/v1", "");
      const downloadUrl = `${baseOrigin}${data.file}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Documents-${fileName || "Product"}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success("فایل با موفقیت دانلود شد");
      onDone();
    }
    if (status === "FAILURE" || isError) {
      message.error("خطا در ساخت فایل ZIP");
      onClose();
    }
  }, [status, isError]);

  const progressStatus =
    status === "SUCCESS" ? "success" : isError ? "exception" : "active";

  return (
    <Modal
      open
      title="در حال آماده‌سازی فایل ZIP"
      footer={null}
      closable={status === "SUCCESS" || status === "FAILURE" || isError}
      onCancel={onClose}
      centered
    >
      <div className="py-4 flex flex-col gap-3">
        <Progress
          percent={percent}
          status={progressStatus}
          strokeColor={{ from: "#108ee9", to: "#87d068" }}
        />
        <Typography.Text type="secondary" className="text-center block">
          {status === "SUCCESS"
            ? "آماده — در حال دانلود..."
            : `پردازش شده: ${passed} از ${total} فایل`}
        </Typography.Text>
        {status !== "SUCCESS" && (
          <Typography.Text
            type="secondary"
            className="text-center block text-xs"
          >
            وضعیت هر ۲ ثانیه به‌روز می‌شود
          </Typography.Text>
        )}
      </div>
    </Modal>
  );
};

export default ZipSerialProgressModal;
