import {Button, Flex, Tooltip, Space, Image ,Tag} from "antd";
import {DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined} from "@ant-design/icons";
import {BASEURL} from "@/Services/axiosInstance.js";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

export const IndependentMinutesCols = ({handleEdit, handleDelete, handleShowDetail, handleAddActivities}) => {
    return [
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'موضوع جلسه',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'کد صورتجلسه',
            key: 'meetingCode',
            render: (_, record) => {
                // const prefix = record.type === 'internal' ? 'MOU-I' : 'MOU-O';
                // const productCode = record.product?.code;
                return `${record.full_code}`;
            }
        },
        {
            title: 'طرف صورتجلسه',
            key: 'contractor',
            render: (_, record) => {
                if (record.type === 'company') {
                    return 'گروه مهندسی صادق یکتا';
                }
                return record.contractor?.name;
            },
        },
        {
            title: 'نوع',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                if (type === 'company') {
                    return <Tag color="blue">شرکت</Tag>;
                } else if (type === 'employer') {
                    return <Tag color="green">کارفرما</Tag>;
                } else if (type === 'contractor') {
                    return <Tag color="orange">پیمانکار</Tag>;
                }
                return <Tag>{type}</Tag>;
            }
        },
        {
            title: 'تاریخ جلسه',
            dataIndex: 'date',
            key: 'date',
            render: (date) => {
                return (
                    georgianDateToJalaliDate(date)
                )
            }
        },
        {
            title: 'فایل پیوست',
            dataIndex: 'file',
            key: 'file',
            render: (file) => {
                if (!file) return "فایلی وجود ندارد";
                const url = `${BASEURL.replace("/api/v1", "")}${file}`;
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
                return (
                    <Space>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{color: "#1890ff"}}
                        >
                            {isImage ? (
                                <Image
                                    width={50}
                                    height={30}
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
                            // target="_blank"
                            download
                            style={{color: "#52c41a"}}
                        >
                            دانلود
                        </a>
                    </Space>
                );
            }
        },
        {
            title: 'عملیات',
            key: 'actions',
            render: (_, record) => (
                <Flex gap={4}>
                    <Tooltip title="حذف">
                        <Button
                            onClick={() => handleDelete(record.id)}
                            title="حذف"
                            icon={<DeleteOutlined/>}
                            danger
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="ویرایش">
                        <Button
                            icon={<EditOutlined/>}
                            className="text-green-500 border-green-500"
                            onClick={() => handleEdit(record)}
                            title='ویرایش'
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="جزئیات">
                        <Button
                            icon={<EyeOutlined/>}
                            className="text-sky-500 border-sky-500"
                            onClick={() => handleShowDetail(record)}
                            title='نمایش جزئیات '
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="اضافه کردن فعالیت">
                        <Button
                            icon={<PlusOutlined/>}
                            className="text-orange-500 border-orange-500"
                            onClick={() => handleAddActivities(record)}
                            title='اضافه کردن فعالیت'
                            size="small"
                        />
                    </Tooltip>
                </Flex>
            ),
        },
    ];
};

