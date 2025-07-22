import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";

export const StandardCodeCol = ({ handleDelete, handleEdit }) => {
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
            title: 'عملیات',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle" className="flex flex-row gap-2 justify-center">
                    <Button
                        onClick={() => handleEdit(record)}
                        icon={<EditOutlined />}
                        className="text-green-600 border-green-600"
                        size="small"
                    />
                    <Button
                        danger
                        onClick={() => handleDelete(record?.id)}
                        icon={<DeleteOutlined />}
                        size="small"
                    />
                </Space >
            )
        }
    ];
}
