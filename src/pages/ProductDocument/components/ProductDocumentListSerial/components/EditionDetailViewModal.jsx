import Modal from "../../../../../components/Modal"

const EditionDetailViewModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
}) => {
    if (!modalData) return null;

    const { product, document, data } = modalData;

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات نسخه"
            size={700}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
        >
            <div className="space-y-4 text-right p-4">
                {/* بخش محصول */}
                {/* <div className="bg-gray-50 rounded-xl p-4 shadow-sm border">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">محصول</h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-gray-500">کد:</span>
                        <span>{product?.code || "-"}</span>

                        <span className="text-gray-500">عنوان فارسی:</span>
                        <span>{product?.persian_title || "-"}</span>

                        <span className="text-gray-500">تعداد:</span>
                        <span>{product?.quantity || "-"}</span>

                        <span className="text-gray-500">برند:</span>
                        <span>{product?.brand1 || "-"}</span>

                        <span className="text-gray-500">کد نهایی:</span>
                        <span>{product?.final_code || "-"}</span>
                    </div>
                </div> */}

                {/* بخش سند */}
                <div className="bg-gray-50 rounded-xl p-4 shadow-sm border">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">سند</h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-gray-500">کد:</span>
                        <span>{document?.code || "-"}</span>

                        <span className="text-gray-500">عنوان فارسی:</span>
                        <span>{document?.persianTitle || "-"}</span>

                        <span className="text-gray-500">عنوان انگلیسی:</span>
                        <span>{document?.englishTitle || "-"}</span>

                        <span className="text-gray-500">وضعیت:</span>
                        <span>{document?.isUsable ? "قابل استفاده" : "غیرقابل استفاده"}</span>
                    </div>
                </div>

                {/* بخش اطلاعات نسخه */}
                <div className="bg-gray-50 rounded-xl p-4 shadow-sm border">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">اطلاعات نسخه</h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-gray-500">کد سریال:</span>
                        <span>{data?.product_serial?.serial || "-"}</span>

                        <span className="text-gray-500">نسخه:</span>
                        <span>{data?.product_document_edition?.edition || "-"}</span>

                        <span className="text-gray-500">تاریخ بررسی:</span>
                        <span>{data?.product_document_edition?.survey_date || "-"}</span>

                        {/* <span className="text-gray-500">وضعیت:</span>
                        <span>{data?.status || "-"}</span> */}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default EditionDetailViewModal;
