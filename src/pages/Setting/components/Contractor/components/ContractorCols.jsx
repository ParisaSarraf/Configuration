import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";

export const ContractorCols = ({ handleDelete, handleEdit }) => [
  {
    title: "اولویت نمایش",
    dataIndex: "order",
    key: "order",    
  },
  {
    title: "نام",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "کد",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "عملیات",
    key: "actions",
    render: (_, record) => (
      <Flex gap="small">
        <Button
          onClick={() => handleEdit(record)}
          className="text-green-500 border-green-500"
          icon={<EditOutlined />}
          size="small"
        />
        <Button
          danger
          onClick={() => handleDelete(record.id)}
          icon={<DeleteOutlined />}
          className="text-red-500 border-red-500"
          size="small"
        />
      </Flex>
    ),
  },
];
