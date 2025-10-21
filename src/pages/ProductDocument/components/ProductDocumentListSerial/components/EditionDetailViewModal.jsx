import Modal from "../../../../../components/Modal";
import { renderFileButton } from "@/components/DetailModal/DetailModal.jsx";

// --- کامپوننت کمکی برای نمایش ردیف‌های اطلاعات ---
// این کامپوننت به ما کمک می‌کند تا کد تمیزتر و شیک‌تری داشته باشیم
const InfoRow = ({ label, children }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
    {/* لیبل (کلید) */}
    <span className="text-sm font-medium text-gray-500 col-span-1">
      {label}
    </span>
    {/* مقدار */}
    <div className="text-sm text-gray-800 font-medium col-span-2">
      {/* اگر مقدار وجود نداشت، خط تیره نمایش بده */}
      {children || "-"}
    </div>
  </div>
);

// --- کامپوننت کمکی برای عنوان هر بخش ---
const SectionTitle = ({ title }) => (
  <h3 className="text-lg font-semibold text-gray-900 mb-3 pt-4 first:pt-0">
    {title}
  </h3>
);

const EditionDetailViewModal = ({
  isOpen,
  modalMode,
  modalmodaData,
  closeModal,
}) => {
  const { modaData } = modalmodaData;

  return (
    <Modal
      isOpen={isOpen}
      title="جزئیات نسخه"
      size={700}
      onClose={closeModal}
      footer
      mode={modalMode}
    >
      <div className="p-6 text-right">
        {/* بخش اطلاعات اصلی */}
        <SectionTitle title="اطلاعات اصلی نسخه" />
        <InfoRow label="کد کامل">{modal?.full_code}</InfoRow>
        <InfoRow label="نسخه (Edition)">{modaData?.edition}</InfoRow>
        <InfoRow label="وضعیت (State)">{modaData?.state}</InfoRow>
        <InfoRow label="دلیل ویرایش">{modaData?.reasons_editing?.name}</InfoRow>
        <InfoRow label="توضیحات نسخه">{modaData?.description}</InfoRow>

        {/* بخش اطلاعات لاگ */}
        <SectionTitle title="اطلاعات لاگ بررسی" />
        <InfoRow label="تاریخ بررسی">{modaData?.logmodaData?.survey_date}</InfoRow>
        <InfoRow label="سریال محصول (لاگ)">
          {modaData?.logmodaData?.product_serial?.serial}
        </InfoRow>
        <InfoRow label="وضعیت لاگ">{modaData?.logmodaData?.status}</InfoRow>
        <InfoRow label="توضیحات لاگ">{modaData?.logmodaData?.description}</InfoRow>

        {/* بخش فایل‌ها */}
        <SectionTitle title="فایل‌ها" />
        <InfoRow label="فایل لاگ">
          {renderFileButton("فایل بررسی", modaData?.logmodaData?.file)}
        </InfoRow>
        <InfoRow label="فایل ۱">
          {renderFileButton("فایل ۱", modaData?.file_1)}
        </InfoRow>
        <InfoRow label="فایل ۲">
          {renderFileButton("فایل ۲", modaData?.file_2)}
        </InfoRow>
        <InfoRow label="فایل ۳">
          {renderFileButton("فایل ۳", modaData?.file_3)}
        </InfoRow>
        <InfoRow label="فایل ۴">
          {renderFileButton("فایل ۴", modaData?.file_4)}
        </InfoRow>
      </div>
    </Modal>
  );
};

export default EditionDetailViewModal;