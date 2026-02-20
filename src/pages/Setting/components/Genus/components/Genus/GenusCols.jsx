import { Button, Space } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";

const GenusCols = ({
  expandedRowKeys = [],
  saveExpandedKeys,
  handleEdit,
  handleDelete,
  isDeleting,
}) => {
  return [
    {
      title: "نام ماده اولیه",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const hasChildren =
          Array.isArray(record.children) && record.children.length > 0;
        const isExpanded = expandedRowKeys.includes(record.id);

        return (
          <div
            style={{
              paddingRight: `${record.level * 20}px`,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {hasChildren ? (
              <Button
                type="text"
                size="small"
                icon={isExpanded ? <FolderOpenOutlined /> : <FolderOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  const nextKeys = isExpanded
                    ? expandedRowKeys.filter((k) => k !== record.id)
                    : [...expandedRowKeys, record.id];
                  saveExpandedKeys(nextKeys);
                }}
                style={{ marginLeft: 8 }}
              />
            ) : (
              <span style={{ width: 24, marginLeft: 8 }} />
            )}
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      title: "عملیات",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            className="text-green-600 border-green-500"
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={isDeleting}
            onClick={() => handleDelete(record.id, record.name)}
          />
        </Space>
      ),
    },
  ];
};

export default GenusCols;
