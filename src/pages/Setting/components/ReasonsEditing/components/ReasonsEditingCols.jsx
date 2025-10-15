import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";

export const ReasonsEditingCols = ({handleDelete, handleEdit}) => {
  return [
    {
      title: "شرح دلیل",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "عملیات",
      render: (_, record) => {
        return (
          <Space className="w-full flex flex-col gap-2">
            <Button
              icon={<EditOutlined />}
              title="ویرایش"
              onClick={() => handleEdit(record)}
            />
            <Button
              icon={<DeleteOutlined />}
              title="حذف"
              onClick={() => handleDelete(record?.id)}
            />
          </Space>
        );
      },
    },
  ];
};
