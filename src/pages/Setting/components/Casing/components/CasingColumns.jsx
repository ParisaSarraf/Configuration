import { Button, Flex } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const renderOptionalField = (value) => value ? <bdi>{value}</bdi> : "—";

export const CasingColumns = ({ handleDelete, handleEdit }) => [
  {
    title: "ردیف",
    key: "rowNumber",
    render: (_, __, index) => index + 1,
  },

  {
    title: "نام",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "نام انگلیسی",
    dataIndex: "english_name",
    key: "english_name",
    render: renderOptionalField,
  },
  {
    title: "کد اختصاری",
    dataIndex: "symbol",
    key: "symbol",
    render: renderOptionalField,
  },
  {
    title: "عملیات",
    key: "actions",
    render: (_, record) => (
      <Flex gap="small">
        <Button
          size={"small"}
          onClick={() => handleEdit(record)}
          className={"text-green-600 border border-green-600"}
          icon={<EditOutlined />}
        />
        <Button
          size={"small"}
          danger
          onClick={() => handleDelete(record.id)}
          icon={<DeleteOutlined />}
        />
      </Flex>
    ),
  },
];
