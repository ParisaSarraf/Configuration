import { useEffect, useState } from "react";
import { Table, Modal, message } from "antd";
import {
  useDeleteGenusProduct,
  useGenusProductList,
} from "../../../../../QueryServises/genusQuery";
import GenusCols from "./Genus/GenusCols";

const LOCAL_STORAGE_KEY = "genusTreeExpandedKeys";

const GenusTreeTable = ({ setModal, setGenusId, setSelectedGenusLabel }) => {
  const { data = [], isFetching, refetch } = useGenusProductList();
  const { mutate: deleteGenus, isPending: isDeleting } =
    useDeleteGenusProduct();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
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

  /* ---------------- selection ---------------- */
  const handleSelect = (record) => {
    if (!record) return;
    setSelectedGenusLabel(record.name);
    setGenusId(record.id);
    setSelectedRowKeys([record.id]);
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

  const handleEdit = (record) => {
    setModal({ mode: "edit", data: record, type: "GenusModalType" });
  };

  const normalizeTreeData = (list, level = 0) => {
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      const childrenArray = Array.isArray(item?.children) ? item.children : [];
      const hasChildren = childrenArray.length > 0;
      const normalizedItem = {
        ...item,
        level,
      };
      if (hasChildren) {
        normalizedItem.children = normalizeTreeData(childrenArray, level + 1);
      }
      return normalizedItem;
    });
  };

  const safeData = Array.isArray(data) ? data : [];
  const tableData = normalizeTreeData(safeData);

  return (
    <Table
      rowKey="id"
      size="small"
      bordered
      pagination={false}
      loading={isFetching || isDeleting}
      dataSource={tableData}
      columns={GenusCols({
        expandedRowKeys,
        saveExpandedKeys,
        handleEdit,
        handleDelete,
        isDeleting,
      })}
      rowSelection={{
        type: "radio",
        selectedRowKeys,
        onChange: (_, rows) => handleSelect(rows[0]),
      }}
      onRow={(record) => ({
        onClick: () => handleSelect(record),
      })}
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange: saveExpandedKeys,
        rowExpandable: (record) =>
          Array.isArray(record.children) && record.children.length > 0,
        showExpandColumn: false,
      }}
      locale={{ emptyText: "هیچ ماده اولیه‌ای یافت نشد" }}
    />
  );
};

export default GenusTreeTable;
