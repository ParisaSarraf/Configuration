import { Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';

const GenusCols = ({
  expandedRowKeys = [],
  toggleExpand,
  handleEdit,
  handleDelete,
  isDeleting = false
}) => {
  const columns = [
    {
      title: "نام ماده اولیه",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div
          style={{
            paddingRight: `${record.level * 20}px`,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          {record.hasChildren ? (
            <Button
              type="text"
              size="small"
              icon={
                expandedRowKeys.includes(record.key) ? (
                  <FolderOpenOutlined />
                ) : (
                  <FolderOutlined />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(record.key, record.hasChildren);
              }}
              style={{ marginLeft: 8 }}
            />
          ) : (
            <span style={{ width: 24, marginLeft: 8 }} />
          )}
          <span>{text}</span>
        </div>
      ),
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

  return columns;
};

export default GenusCols;