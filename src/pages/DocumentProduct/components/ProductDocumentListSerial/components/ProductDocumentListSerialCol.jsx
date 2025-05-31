import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";

const ProductDocumentListSerialCol = ({ handleEditLogEdition, handleDeleteLogEdition }) => {
  return [
    {
      title: "نام محصول",
      dataIndex: ['product', 'persian_title'],
      key: "persian_title",
    },
    {
      title: "عنوان سند",
      dataIndex: "experienceText",
      key: "experienceText",
    },
    {
      title: "کد کامل سند به همراه سریال محصول",
      dataIndex: ["product", "code"],
      key: "code",
    },
    {
      title: "عملیات",
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="ویرایش">
              <Button
                title="ویرایش"
                icon={<EditOutlined />}
                className="text-green-500 border-green-500"
                onClick={() => handleEditLogEdition(record)}
              />
            </Tooltip>
            <Tooltip title="حذف">
              <Button
                title="حذف"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDeleteLogEdition(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};

export default ProductDocumentListSerialCol;