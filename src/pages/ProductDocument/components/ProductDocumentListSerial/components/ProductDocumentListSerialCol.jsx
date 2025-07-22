import { DeleteOutlined, EditOutlined, EyeFilled } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";

const ProductDocumentListSerialCol = ({ handleEditLogEdition, handleDeleteLogEdition, handleShowDetailEdiotnLog }) => {
  return [
    {
      title: "نام محصول",
      dataIndex: ['product', 'persian_title'],
      key: "persian_title",
    },
    {
      title: "عنوان سند",
      dataIndex: ['document', 'persianTitle'],
      key: "persianTitle",
    },
    {
      title: "کد کامل سند به همراه سریال محصول",
      dataIndex: 'mainKey',
      key: "mainKey",
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
            <Tooltip title="نمایش جزئیات">
              <Button
                title="نمایش جزئیات"
                icon={<EyeFilled />}
                className="text-sky-500 border-sky-500"
                onClick={() => handleShowDetailEdiotnLog(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};

export default ProductDocumentListSerialCol;