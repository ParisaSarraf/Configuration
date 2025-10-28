import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Button, Image, Space} from "antd";
import {BASEURL} from "@/Services/axiosInstance.js";

export const StandardCodeCol = ({handleDelete, handleEdit}) => {
    return [
        {
            title: 'ردیف',
            width: 100,
            render: (_, __, index) => <span>{index + 1}</span>
        },
        {
            title: ' کد استاندارد',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text) => <span>{text}</span>
        },
        {
            title: ' کد طبقه بندی',
            dataIndex: 'full_ware_house_code',
            key: 'warehouse_code',
            width: 200,
            render: (text) => <span>{text}</span>
        },
        {
            title: 'فایل پیوست',
            dataIndex: 'standard_file',
            key: 'standard_file',
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
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle" className="flex flex-row gap-2 justify-center">
                    <Button
                        onClick={() => handleEdit(record)}
                        icon={<EditOutlined/>}
                        className="text-green-600 border-green-600"
                        size="small"
                    />
                    <Button
                        danger
                        onClick={() => handleDelete(record?.id)}
                        icon={<DeleteOutlined/>}
                        size="small"
                    />
                </Space>
            )
        }
    ];
}
