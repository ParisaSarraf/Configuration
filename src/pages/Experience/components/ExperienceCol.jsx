import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Image, Space, Tooltip } from "antd"
import { BASEURL } from "../../../Services/axiosInstance";

const ExperienceCol = ({ handleDelete, handleEdit }) => {
    console.log(BASEURL);
    return [
        {
            title: 'حوزه',
            dataIndex: ['precinct', 'title'],
            key: 'precinct',
            render: (_, record) => record.precinct?.title || 'ندارد'
        },
        {
            title: 'متن تجربه',
            dataIndex: 'experiment_text',
            key: 'experiment_text',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'کاربر ثبت کننده',
            dataIndex: 'user',
            key: 'username',
            render: (user) => user?.username || 'ندارد'
        },
        {
            title: 'تاریخ ثبت',
            dataIndex: 'registration_date',
            key: 'registration_date',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'کد محصول',
            dataIndex: 'code',
            key: 'code',
            render: (text) => text || 'ندارد'
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
                        {/* نمایش لینک باز کردن */}
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
                );
            }
        }
        ,
        {
            title: 'عملیات',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="ویرایش">
                        <Button
                            title="ویرایش"
                            icon={<EditOutlined />}
                            className="text-green-500 border-green-500"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="حذف">
                        <Button
                            title="حذف"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDelete(record?.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ]
}

export default ExperienceCol