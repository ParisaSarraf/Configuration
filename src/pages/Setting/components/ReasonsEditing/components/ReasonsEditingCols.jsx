import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Button, Space} from "antd";

export const ReasonsEditingCols = ({handleDelete, handleEdit}) => {
    return [
        {
            title: 'ردیف',
            key: 'name',
            render: (_, __, index) => index + 1,
        },
        {
            title: "شرح دلیل",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "عملیات",
            render: (_, record) => {
                return (
                    <Space className="w-full flex flex-row gap-2">
                        <Button
                            className={'text-green-500 border border-green-500'}
                            icon={<EditOutlined/>}
                            title="ویرایش"
                            onClick={() => handleEdit(record)}
                            size={'small'}
                        />
                        <Button
                            icon={<DeleteOutlined/>}
                            danger
                            title="حذف"
                            onClick={() => handleDelete(record?.id)}
                            size={'small'}
                        />
                    </Space>
                );
            },
        },
    ];
};
