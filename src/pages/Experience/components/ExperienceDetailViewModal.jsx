import { Image, Space } from "antd";
import Modal from "../../../components/Modal";
import { BASEURL } from "../../../Services/axiosInstance";

const ExperienceDetailViewModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
}) => {
    if (!modalData) return null;

    const { precinct, user, experiment_text, file, code, registration_date } = modalData;
    const url = `${BASEURL.replace("/api/v1", "")}${file}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
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
                <div className="grid grid-cols-3 gap-4">
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

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg border-b pb-2 mb-3">اطلاعات ثبت کننده</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-gray-600">نام و نام خانوادگی:</span>
                                <p className="mt-1">{`${user?.name || ''} ${user?.last_name || ''}`}</p>
                            </div>


                        </div>
                    </div>
                    {file ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg border-b pb-2 mb-3">فایل ضمیمه</h3>
                            <Space>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#1890ff" }}
                                >
                                    {isImage ? (
                                        <Image
                                            width={70}
                                            height={50}
                                            src={url}
                                            alt="فایل پیوست"
                                            preview={false}
                                        />
                                    ) : (
                                        "مشاهده فایل"
                                    )}
                                </a>
                                <a
                                    href={url}
                                    download
                                    style={{ color: "#52c41a" }}
                                >
                                    دانلود
                                </a>
                            </Space>
                        </div>
                    )
                        : (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg  pb-2 mb-3">
                                    فایلی وجود ندارد
                                </h3>
                            </div>
                        )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg border-b pb-2 mb-3">متن تجربه</h3>
                    <p className="whitespace-pre-line text-justify">
                        {experiment_text || 'متن تجربه وارد نشده است'}
                    </p>
                </div>


            </div>
        </Modal>
    )
}

export default ExperienceDetailViewModal;