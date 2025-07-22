import Modal from "../../../components/Modal";

const ExperienceDetailViewModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
}) => {
    if (!modalData) return null;

    const { precinct, user, experiment_text, file, code, registration_date } = modalData;

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات تجارب ثبت شده"
            size={700}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
        >
            <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* بخش اول - اطلاعات پایه */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg border-b pb-2 mb-3">اطلاعات پایه</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-gray-600">عنوان حوزه:</span>
                                <p className="mt-1">{precinct?.title || '---'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">تاریخ ثبت:</span>
                                <p className="mt-1">{registration_date || '---'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">کد:</span>
                                <p className="mt-1">{code || 'تعیین نشده'}</p>
                            </div>
                        </div>
                    </div>

                    {/* بخش دوم - اطلاعات کاربر */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg border-b pb-2 mb-3">اطلاعات ثبت کننده</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-gray-600">نام و نام خانوادگی:</span>
                                <p className="mt-1">{`${user?.name || ''} ${user?.last_name || ''}`}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">کد ملی:</span>
                                <p className="mt-1">{user?.national_code || '---'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">شماره تماس:</span>
                                <p className="mt-1">{user?.phone_number || '---'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* بخش سوم - متن تجربه */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg border-b pb-2 mb-3">متن تجربه</h3>
                    <p className="whitespace-pre-line text-justify">
                        {experiment_text || 'متن تجربه وارد نشده است'}
                    </p>
                </div>

                {/* بخش چهارم - فایل ضمیمه */}
                {file && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg border-b pb-2 mb-3">فایل ضمیمه</h3>
                        <a
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            مشاهده و دانلود فایل
                        </a>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default ExperienceDetailViewModal;