import { Button, Flex, Tooltip, Tag, Space } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { BASEURL } from "../../../Services/axiosInstance";

export const MeetingsCol = ({ handleEdit, handleDelete, handleShowDetail }) => {
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
            render: (_, record, index) => {
                const prefix = record.type === 'internal' ? 'MOU-I' : 'MOU-O';
                const productCode = record.product?.code;
                return `${prefix}-${productCode}-${index + 1}`;
            }
        },
        {
            title: 'طرف صورتجلسه',
            dataIndex: 'type',
            key: 'type',
            // render: (record) => record.type === 'internal' ? 'داخلی' : 'خارجی',
        },
        {
            title: 'تاریخ جلسه',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'فایل ضمیمه',
            key: 'file',
            render: (file) => {
                if (!file) return "فایلی وجود ندارد";
                const url = `${BASEURL.replace("/api/v1", "")}${file}`;
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
                return (
                    <Space>
                        <a
                            href={url}
                            // target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1890ff" }}
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
                            target="_blank"
                            download
                            style={{ color: "#52c41a" }}
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
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="ویرایش">
                        <Button
                            icon={<EditOutlined />}
                            className="text-green-500 border-green-500"
                            onClick={() => handleEdit(record)}
                            title='ویرایش'
                            size="small"
                        />
                    </Tooltip>
                    {/* <Tooltip title="جزئیات">
                        <Button
                            icon={<EyeOutlined />}
                            className="text-sky-500 border-sky-500"
                            onClick={() => handleShowDetail(record)}
                            title='نمایش جزئیات '
                            size="small"
                        />
                    </Tooltip> */}
                </Flex>
            ),
        },
    ];
};

export const MeetingRelatedToActivities = () => {
    return [
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'نوع فعالیت',
            key: 'activityType',
            render: (record) => record.type || 'نامشخص',
        },
        {
            title: 'توضیحات',
            key: 'description',
            render: (record) => record.description || 'بدون توضیح',
        },
        {
            title: 'متولی',
            key: 'trustee',
            render: (record) => (
                <div>
                    {record.trustee?.name} {record.trustee?.last_name}
                    <br />
                    {record.trustee_description && `(${record.trustee_description})`}
                </div>
            ),
        },
        {
            title: 'بازه زمانی',
            key: 'dateRange',
            render: (record) => (
                <div>
                    از: {record.from_date}
                    <br />
                    تا: {record.to_date}
                </div>
            ),
        },
        {
            title: 'وضعیت',
            key: 'state',
            render: (record) => (
                <Tag color={record.state === 30 ? 'green' : 'orange'}>
                    {record.state === 30 ? 'تکمیل شده' : 'در حال انجام'}
                </Tag>
            ),
        },
        {
            title: 'تاریخ‌های مهم',
            key: 'importantDates',
            render: (record) => (
                <div>
                    <div>تاریخ انجام: {record.done_date}</div>
                    <div>تاریخ تایید: {record.confirmed_date}</div>
                </div>
            ),
        },
        {
            title: 'فایل‌ها',
            key: 'files',
            render: (record) => {
                const base = BASEURL.replace("/api/v1", "");
                return (
                    <Flex vertical gap={4}>
                        {record.trustee_file && (
                            <Space>
                                <a
                                    href={`${base}${record.trustee_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#1890ff" }}
                                >
                                    مشاهده فایل متولی
                                </a>
                                <a
                                    href={`${base}${record.trustee_file}`}
                                    download
                                    style={{ color: "#52c41a" }}
                                >
                                    دانلود
                                </a>
                            </Space>
                        )}
                        {record.plan_file && (
                            <Space>
                                <a
                                    href={`${base}${record.plan_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#1890ff" }}
                                >
                                    مشاهده فایل طرح
                                </a>
                                <a
                                    href={`${base}${record.plan_file}`}
                                    download
                                    style={{ color: "#52c41a" }}
                                >
                                    دانلود
                                </a>
                            </Space>
                        )}
                    </Flex>
                );
            }
        },

    ];
};