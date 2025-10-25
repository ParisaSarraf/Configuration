import Modal from "../../../../../components/Modal";
import {renderFileButton} from "@/components/DetailModal/DetailModal.jsx";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

const InfoRow = ({label, children}) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
    <span className="text-sm font-medium text-gray-500 col-span-1">
      {label}
    </span>
        <div className="text-sm text-gray-800 font-medium col-span-2">
            {children || "-"}
        </div>
    </div>
);

const SectionTitle = ({title}) => (
    <h3 className="text-lg font-semibold text-gray-900 mb-3 pt-4 first:pt-0">
        {title}
    </h3>
);

const EditionDetailViewModal = ({
                                    isOpen,
                                    modalMode,
                                    modalData,
                                    closeModal,
                                }) => {
    const editionData = modalData?.logRecord;
    const specificLog = modalData?.logRecord?.logData;

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات نسخه"
            size={1400}
            onClose={closeModal}
            footer
            mode={modalMode}
        >
            <div className="w-full grid grid-cols-3 p-6 text-right gap-4">
                <div className={"p-4 border rounded-xl border-blue-200 border-dashed"}>
                    <SectionTitle title="اطلاعات اصلی نسخه"/>
                    <InfoRow label="کد کامل">{editionData?.full_code}</InfoRow>
                    <InfoRow label="نسخه">{editionData?.edition}</InfoRow>
                    <InfoRow label="دلیل ویرایش">
                        {editionData?.reasons_editing?.name}
                    </InfoRow>
                    <InfoRow label="توضیحات نسخه">{editionData?.description}</InfoRow>
                </div>

                <div className={"p-4 border rounded-xl border-blue-200 border-dashed"}>
                    <SectionTitle title="اطلاعات لاگ"/>
                    <InfoRow label="تاریخ بررسی">
                        {georgianDateToJalaliDate(specificLog?.survey_date)}
                    </InfoRow>
                    <InfoRow label="سریال محصول">
                        {specificLog?.product_serial?.serial}
                    </InfoRow>
                    {/*<InfoRow label="توضیحات">{specificLog?.description}</InfoRow>*/}
                </div>

                <div className={"p-4 border rounded-xl border-blue-200 border-dashed"}>
                    <SectionTitle title="فایل‌ها"/>
                    <InfoRow label="فایل لاگ">
                        {renderFileButton("فایل بررسی", specificLog?.file)}
                    </InfoRow>
                    <InfoRow label="فایل ۱">
                        {renderFileButton("فایل ۱", editionData?.file_1)}
                    </InfoRow>
                    <InfoRow label="فایل ۲">
                        {renderFileButton("فایل ۲", editionData?.file_2)}
                    </InfoRow>
                    <InfoRow label="فایل ۳">
                        {renderFileButton("فایل ۳", editionData?.file_3)}
                    </InfoRow>
                    <InfoRow label="فایل ۴">
                        {renderFileButton("فایل ۴", editionData?.file_4)}
                    </InfoRow>
                </div>
            </div>
        </Modal>
    );
};

export default EditionDetailViewModal;
