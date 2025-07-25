import Modal from "../../../components/Modal";
// import { formatDate } from "../../../utils/dateUtils";

const DetailModal = ({ isOpen, modalMode, modalData, closeModal }) => {
    if (!modalData) return null;

    const renderField = (label, value, isImportant = false) => (
        <div className={`flex items-start mb-4 ${isImportant ? "font-bold" : ""}`}>
            <label className="w-1/3 text-gray-600 text-sm mb-1 min-w-[120px]">{label}</label>
            <div className="w-2/3 text-gray-800 break-words">
                {value || <span className="text-gray-400">---</span>}
            </div>
        </div>
    );

    const renderSection = (title, children) => (
        <div className="mb-6 pb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {children}
            </div>
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

    const renderFileLink = (file) => (
        <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:underline"
        >
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            مشاهده فایل
        </a>
    );

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات فعالیت‌ها"
            size={900}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
            className={'scroll-modal'}
        >
            <div className="space-y-6">
                {renderSection("اطلاعات کلی", (
                    <>
                        {renderField("نوع فعالیت", modalData.type)}
                        {renderField("وضعیت", getStateLabel(modalData.state), true)}
                        {renderField("تاریخ شروع", modalData.from_date)}
                        {renderField("تاریخ پایان", modalData.to_date)}
                        {renderField("تعداد نفر-روز", modalData.person_day)}
                        {renderField("تاریخ تایید", modalData.confirmed_date)}
                        {renderField("تاریخ انجام", modalData.done_date || "---")}
                        <div className="col-span-2">
                            {renderField("توضیحات", modalData.description)}
                        </div>
                    </>
                ))}

                {renderSection("اطلاعات متولی", (
                    <>
                        {renderField("نام کامل", `${modalData.trustee.name} ${modalData.trustee.last_name}`)}
                        {renderField("نام کاربری", modalData.trustee.username)}
                        {/* {renderField("کد ملی", modalData.trustee.national_code)} */}
                        {/* {renderField("شماره تماس", modalData.trustee.phone_number)} */}
                        {/* {renderField("تاریخ ثبت", formatDate(modalData.trustee.registry_date))} */}
                        <div className="col-span-2">
                            {renderField("توضیحات مسئول", modalData.trustee_description || "---")}
                        </div>
                    </>
                ))}

                {renderSection("مستندات", (
                    <>
                        {renderField("فایل طرح و برنامه", modalData.plan_file ? renderFileLink(modalData.plan_file) : "---")}
                        {renderField("توضیحات طرح و برنامه", modalData.plan_description || "---")}
                        {renderField("فایل متولی", modalData.trustee_file ? renderFileLink(modalData.trustee_file) : "---")}
                    </>
                ))}
            </div>
        </Modal>
    );
};

export default DetailModal;