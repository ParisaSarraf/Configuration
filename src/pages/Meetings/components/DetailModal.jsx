import Modal from "../../../components/Modal";
// import { formatDate } from "../../../utils/dateUtils";

const DetailModal = ({ isOpen, modalMode, modalData, closeModal }) => {
    if (!modalData) return null;

    const renderField = (label, value, isImportant = false) => (
        <div className={`mb-4 ${isImportant ? "font-bold" : ""}`}>
            <label className="block text-gray-600 text-sm mb-1">{label}</label>
            <div className="text-gray-800">
                {value || <span className="text-gray-400">---</span>}
            </div>
        </div>
    );

    const renderSection = (title, children) => (
        <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
            {children}
        </div>
    );

    const getStateLabel = (state) => {
        const states = {
            10: "در انتظار تایید",
            20: "تایید شده",
            30: "انجام شده",
            40: "رد شده",
        };
        return states[state] || "نامشخص";
    };

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات فعالیت‌ها"
            size={700}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
            className={'scroll-modal'}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSection("اطلاعات کلی", (
                    <>
                        {renderField("نوع فعالیت", modalData.type)}
                        {renderField("توضیحات", modalData.description)}
                        {renderField("وضعیت", getStateLabel(modalData.state), true)}
                        {renderField("تاریخ شروع", modalData.from_date)}
                        {renderField("تاریخ پایان", modalData.to_date)}
                        {renderField("تاریخ تایید", modalData.confirmed_date)}
                        {renderField("تاریخ انجام", modalData.done_date || "---")}
                        {renderField("تعداد نفر-روز", modalData.person_day)}
                    </>
                ))}

                {renderSection("اطلاعات متولی", (
                    <>
                        {renderField("نام کامل", `${modalData.trustee.name} ${modalData.trustee.last_name}`)}
                        {renderField("نام کاربری", modalData.trustee.username)}
                        {/* {renderField("کد ملی", modalData.trustee.national_code)} */}
                        {/* {renderField("شماره تماس", modalData.trustee.phone_number)} */}
                        {/* {renderField("تاریخ ثبت", formatDate(modalData.trustee.registry_date))} */}
                        {renderField("توضیحات مسئول", modalData.trustee_description || "---")}
                    </>
                ))}

                {renderSection("مستندات", (
                    <>
                        {renderField("فایل طرح و برنامه", modalData.plan_file ? (
                            <a
                                href={modalData.plan_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                مشاهده فایل
                            </a>
                        ) : "---")}
                        {renderField("توضیحات طرح و برنامه", modalData.plan_description || "---")}
                        {renderField("فایل متولی", modalData.trustee_file ? (
                            <a
                                href={modalData.trustee_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                مشاهده فایل
                            </a>
                        ) : "---")}
                    </>
                ))}
            </div>
        </Modal>
    );
};

export default DetailModal;