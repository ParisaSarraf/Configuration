import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";

const ProductDocumentListSerialCol = () => {
  return [
    {
      title: "نام محصول",
      dataIndex: ['product', 'persian_title'],
      key: "domain",
    },
    {
      title: "عنوان سند",
      dataIndex: "experienceText",
      key: "experienceText",
    },
    {
      title: "کد کامل سند به همراه سریال محصول",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "عملیات",
      render() {
        return (
          <Space>
            <Tooltip title="ویرایش">
              <Button
                title="ویرایش"
                icon={<EditOutlined />}
                className="text-green-500 , border-green-500"
              />
            </Tooltip>
            <Tooltip title="حذف">
              <Button title="حذف" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};

export default ProductDocumentListSerialCol;
