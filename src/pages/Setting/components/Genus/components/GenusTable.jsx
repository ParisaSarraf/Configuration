import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import {
  useDeleteGenusProduct,
  useGenusProductList,
} from "../../../../../QueryServises/genusQuery";

const LOCAL_STORAGE_KEY = "genusTreeExpandedKeys";

const GenusTable = ({ setModal, setSelectedGenusLabel, setGenusId }) => {
  const { data, isFetching, refetch } = useGenusProductList();
  const { mutate: deleteGenus, isPending: isDeleting } =
    useDeleteGenusProduct();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectRow, setSecletdRow] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /* ---------------- load expanded keys ---------------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) setExpandedRowKeys(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveExpandedKeys = (keys) => {
    setExpandedRowKeys(keys);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
  };

  /* ---------------- tree helpers ---------------- */
  const flattenGenusData = (items, level = 0, parentKey = null) => {
    if (!items) return [];

    return items.flatMap((item) => {
      const key = item.id;
      const hasChildren = item.children && item.children.length > 0;

      const row = {
        ...item,
        key,
        level,
        parentKey,
        hasChildren,
      };

      const children = hasChildren
        ? flattenGenusData(item.children, level + 1, key)
        : [];

      return [row, ...children];
    });
  };

  const toggleExpand = (key, hasChildren) => {
    if (!hasChildren) return;

    const newKeys = expandedRowKeys.includes(key)
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key];

    saveExpandedKeys(newKeys);
  };

  const getVisibleRows = (rows) =>
    rows.filter((row) => {
      if (!row.parentKey) return true;
      return expandedRowKeys.includes(row.parentKey);
    });

  const handleSelect = (record) => {
    if (record && record.id) {
      setSelectedGenusLabel(record.name);
      setGenusId(record.id);
      setSecletdRow(true);
      setSelectedRowKeys([record.id]);
    } else {
      setGenusId(null);
      setSelectedGenusLabel(null);
      setSecletdRow(false);
      setSelectedRowKeys([]);
    }
  };

  /* ---------------- actions ---------------- */
  const handleDelete = (id, name) => {
    Modal.confirm({
      title: "حذف ماده اولیه",
      content: `آیا از حذف ماده اولیه «${name}» مطمئن هستید؟`,
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      onOk() {
        return new Promise((resolve, reject) => {
          deleteGenus(id, {
            onSuccess: () => {
              message.success("ماده اولیه با موفقیت حذف شد");
              refetch();
              resolve();
            },
            onError: () => {
              message.error("حذف ماده اولیه با خطا مواجه شد");
              reject();
            },
          });
        });
      },
    });
  };

  /* ---------------- table data ---------------- */
  const flatData = flattenGenusData(data);
  const visibleData = getVisibleRows(flatData);

  /* ---------------- columns ---------------- */
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
            onClick={() =>
              setModal({
                mode: "edit",
                data: record,
              })
            }
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

  /* ---------------- render ---------------- */
  return (
    <Table
      columns={columns}
      dataSource={visibleData}
      loading={isFetching || isDeleting}
      rowSelection={{
        type: "radio",
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
      pagination={false}
      rowKey="key"
      size="small"
      bordered
      locale={{ emptyText: "هیچ ماده اولیهی یافت نشد" }}
    />
  );
};

export default GenusTable;
