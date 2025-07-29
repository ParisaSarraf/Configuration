import Modal from "../../../components/Modal";
import {Badge, Button, Space, Image} from "antd";
import {FileOutlined, CopyOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {BASEURL} from "../../../Services/axiosInstance";


const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    return dayjs(dateStr).format("YYYY/MM/DD");
};

const DetailModal = ({isOpen, modalMode, modalData, closeModal, modalType}) => {
    if (!modalData) return null;

    const getStateInfo = (state) => {
        const states = {
            10: {label: "در انتظار تایید", status: "warning"},
            20: {label: "تایید شده", status: "success"},
            30: {label: "انجام شده", status: "processing"},
            40: {label: "رد شده", status: "error"},
        };
        return states[state] || {label: "نامشخص", status: "default"};
    };

    const renderInfoItem = (label, value, copyable = false) => (
        <div className="flex justify-between items-start py-1 text-sm border-b border-dashed last:border-none">
            <span className="text-gray-500">{label}</span>
            <div className="text-right max-w-[60%]">
                {value || <span className="text-gray-400">---</span>}
                {copyable && value && (
                    <CopyOutlined
                        onClick={() => navigator.clipboard.writeText(value)}
                        className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    />
                )}
            </div>
        </div>
    );

    const renderFileButton = (label, filePath) => {
        if (!filePath) return <div className="text-gray-400">فایلی وجود ندارد</div>;
        const fullUrl = `${BASEURL.replace("/api/v1", "")}${filePath}`;
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);

        return (
            <Space className="flex flex-col">
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{color: "#1890ff"}}>
                    {isImage ? (
                        <Image
                            width={90}
                            height={90}
                            src={fullUrl}
                            alt="فایل پیوست"
                            preview={true}
                        />
                    ) : (
                        <>
                            <FileOutlined/> مشاهده فایل
                        </>
                    )}
                </a>
                <a href={fullUrl} download style={{color: "#52c41a"}} target="_blank" rel="noopener noreferrer">
                    دانلود
                </a>
            </Space>
        );
    };

    const SectionCard = ({title, children}) => (
        <div className="border rounded-lg p-4 shadow-sm bg-white">
            <h4 className="text-base font-semibold text-blue-700 mb-3 border-b pb-2">{title}</h4>
            <div className="space-y-4">{children}</div>
        </div>
    );

    const stateInfo = getStateInfo(modalData.state);

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات فعالیت"
            size={1000}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
        >
            {
                modalType === 'showDetail' ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-4 px-2">
                            <SectionCard title="مشخصات فعالیت">
                                {renderInfoItem("نوع فعالیت", modalData.type)}
                                {renderInfoItem("تاریخ شروع", modalData.from_date)}
                                {renderInfoItem("تاریخ پایان", modalData.to_date)}
                                {renderInfoItem("تعداد نفر-روز", modalData.person_day)}


                                {/* {renderInfoItem("تاریخ تایید", formatDate(modalData.confirmed_date))}
                                {renderInfoItem("تاریخ انجام", formatDate(modalData.done_date))} */}


                                <div className="flex justify-between py-1">
                                    <span className="text-gray-500">وضعیت</span>
                                    <Badge status={stateInfo.status} text={stateInfo.label}/>
                                </div>
                            </SectionCard>

                            <SectionCard title="متولی فعالیت">
                                {renderInfoItem("نام کامل", `${modalData.trustee?.name} ${modalData.trustee?.last_name}`)}
                                {renderInfoItem("نام کاربری", modalData.trustee?.username)}
                                {renderInfoItem("تاریخ انجام", formatDate(modalData.done_date))}
                                {modalData.trustee_description &&
                                    renderInfoItem("توضیحات متولی", modalData.trustee_description)}
                                {renderFileButton("فایل متولی", modalData.trustee_file)}
                            </SectionCard>

                            <SectionCard title="طرح و برنامه">
                                {renderInfoItem("توضیحات", modalData.plan_description)}
                                {renderInfoItem("تاریخ تایید", formatDate(modalData.confirmed_date))}

                                {renderFileButton("فایل طرح و برنامه", modalData.plan_file)}
                            </SectionCard>


                            {/* <SectionCard title="مشخصات محصول">
                            {renderInfoItem("کد محصول", modalData.product?.code, true)}
                            {renderInfoItem("عنوان فارسی", modalData.product?.persian_title)}
                            {renderInfoItem("مقدار", modalData.product?.quantity)}
                            {renderInfoItem("کد برند اول", modalData.product?.brand1)}
                            {renderInfoItem("توضیح کاربر", modalData.product?.user_description)}
                            {renderInfoItem("کد استاندارد", modalData.product?.standard_code?.toString())}
                            {renderFileButton("تصویر کاربر", modalData.product?.user_image)}
                            </SectionCard> */}


                            {(modalData.trustee?.signature_image || modalData.trustee?.temp_image) && (
                                <SectionCard title="تصاویر">
                                    <div className="flex gap-4">
                                        {modalData.trustee.signature_image && (
                                            <Image
                                                src={modalData.trustee.signature_image}
                                                alt="امضا"
                                                width={120}
                                                className="rounded border"
                                            />
                                        )}
                                        {modalData.trustee.temp_image && (
                                            <Image
                                                src={modalData.trustee.temp_image}
                                                alt="تصویر موقت"
                                                width={120}
                                                className="rounded border"
                                            />
                                        )}
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 py-4 px-2">
                            <SectionCard title="مشخصات صورتجلسه">
                                {renderInfoItem("نوع صورتجلسه", modalData.type)}
                                {renderInfoItem("نام ", modalData.title)}
                                {/*{renderInfoItem("فعالیت های متصل", modalData.to_date)}*/}
                                {/* {renderInfoItem("تعداد نفر-روز", modalData.person_day)} */}
                                {/* {renderInfoItem("تاریخ تایید", formatDate(modalData.confirmed_date))}
                                {renderInfoItem("تاریخ انجام", formatDate(modalData.done_date))} */}
                                {/* <div className="flex justify-between py-1">
                                    <span className="text-gray-500">وضعیت</span>
                                    <Badge status={stateInfo.status} text={stateInfo.label} />
                                </div> */}

                            </SectionCard>
                            <SectionCard title={'فایل پیوست شده'}>
                                {renderFileButton("فایل طرح و برنامه", modalData.plan_file)}
                            </SectionCard>
                        </div>
                    </>
                )
            }
            {/* </div> */}
        </Modal>
    );
};

export default DetailModal;
