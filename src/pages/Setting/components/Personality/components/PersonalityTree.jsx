import { useEffect, useState } from "react";
import { message, Modal, Table, Button, Space, Input } from "antd";
import { EditOutlined, DeleteOutlined, FolderOutlined, FolderOpenOutlined } from "@ant-design/icons";
import {
  useDeletePersonalityProduct,
  usePersonalityProductList,
} from "../../../../../QueryServises/personalityQuery";
const LOCAL_STORAGE_KEY = 'pesonalityTreeExpandedKeys';
const PersonalityTable = ({
  setModal,
  setPersonalityId,
  setSelectedPersonalityLabel,
}) => {
  const { data, isFetching, refetch } = usePersonalityProductList();
  const { mutate: deletePersonality, isPending: isDeleting } =
    useDeletePersonalityProduct();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectRow, setSecletdRow] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);


  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedKeys) {
        setExpandedRowKeys(JSON.parse(storedKeys));
      }
    } catch (error) {
      console.error("Failed to load expanded keys from localStorage", error);
    }
  }, []);

  const handleExpand = (keys) => {
    try {
      setExpandedRowKeys(keys);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error("Failed to save expanded keys to localStorage", error);
    }
  };

  const handleDelete = (personalityId, name) => {
    Modal.confirm({
      title: "حذف هویت",
      content: `آیا از حذف هویت "${name}" مطمئن هستید؟`,
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      onOk() {
        return new Promise((resolve, reject) => {
          deletePersonality(personalityId, {
            onSuccess: () => {
              message.success("هویت با موفقیت حذف شد");
              refetch();
              resolve();
            },
            onError: (err) => {
              console.error("Error deleting personality:", err);
              message.error("حذف هویت با خطا مواجه شد");
              reject();
            },
          });
        });
      },
    });
  };

  const handleEdit = (record) => {
    setModal({
      mode: "edit",
      data: {
        id: record.id,
        name: record.name,
        parentId: record.parentId,
        warehouse_code: record.warehouse_code,
      },
      type: "addPersonality",
    });
  };

  const handleSelect = (record) => {
    if (record && record.id) {
      setPersonalityId(record.id);
      setSelectedPersonalityLabel(record.name);
      setSecletdRow(true);
      setSelectedRowKeys([record.id]);
    } else {
      setPersonalityId(null);
      setSelectedPersonalityLabel(null);
      setSecletdRow(false);
      setSelectedRowKeys([]);
    }
  };
  
  const toggleExpand = (key, hasChildren) => {
    if (!hasChildren) return;
    const newExpandedKeys = expandedRowKeys.includes(key)
      ? expandedRowKeys.filter(k => k !== key)
      : [...expandedRowKeys, key];
    handleExpand(newExpandedKeys);
  };

  const columns = [
    {
      title: "نام هویت",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div
          style={{
            paddingRight: `${record.level * 20}px`,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          {record.hasChildren && (
            <Button
              type="text"
              size="small"
              icon={expandedRowKeys.includes(record.key) ? <FolderOpenOutlined /> : <FolderOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(record.key, record.hasChildren);
              }}
              style={{ marginLeft: '8px' }}
            />
          )}
          {!record.hasChildren && (
            <span style={{ width: '24px', display: 'inline-block', marginLeft: '8px' }}></span>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "کد انبار",
      dataIndex: "warehouse_code",
      key: "warehouse_code",
      width: 120,
      render: (text) => (
        <span >
          {text}
        </span>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            className="text-green-600 border-green-600"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            size="small"
            title="ویرایش"
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id, record.name);
            }}
            title="حذف"
            loading={isDeleting}
          />
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Table
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: (keys, rows) => {
            const record = rows[0];
            if (record) handleSelect(record);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            handleSelect(record);
          },
        })}
        columns={columns}
        dataSource={data}
        loading={isFetching || isDeleting}
        pagination={false}
        size="small"
        rowKey="id"
        locale={{
          emptyText: "هیچ هویتی یافت نشد",
        }}
        bordered
      />
    </div>
  );
};

export default PersonalityTable;