import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Skeleton, Tag, Tree } from "antd";
import Modal from "@/components/Modal";
import { useProductSerialTreeById } from "@/QueryServises/productSerialQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { buildSerialTreeData } from "./serialTreeData";

const SerialTreeModal = ({ open, serialId, serialLabel, productId, onClose }) => {
  const query = useProductSerialTreeById(serialId, {
    enabled: Boolean(open && serialId),
  });
  const result = useMemo(
    () => buildSerialTreeData(query.data, productId, serialId),
    [query.data, productId, serialId],
  );
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    setExpandedKeys(result.expandedKeys);
    setSelectedKeys(result.clickedKeys);
  }, [result, open]);

  const renderContent = () => {
    if (query.isLoading || query.isFetching)
      return <Skeleton active paragraph={{ rows: 8 }} />;
    if (query.isError)
      return (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(query.error, "دریافت درخت سریال انجام نشد.")}
          action={<Button onClick={() => query.refetch()}>تلاش مجدد</Button>}
        />
      );
    if (!result.treeData.length)
      return <Empty description="درختی یافت نشد یا ساختار پاسخ API قابل شناسایی نیست." />;
    return (
      <div dir="rtl" className="space-y-4">
        
        <div className="max-h-[65vh] overflow-auto rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <Tree
            blockNode
            showLine
            treeData={result.treeData}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            selectedKeys={selectedKeys}
            onSelect={setSelectedKeys}
            titleRender={(node) => (
              <span className={`inline-flex flex-wrap items-center gap-2 rounded-lg px-2 py-1`}>
                <strong>{node.serialLabel}</strong>
                {node.productLabel ? <span className="text-xs">{node.productLabel}</span> : null}
                {node.productId != null ? <span className="text-xs opacity-60">محصول: {node.productId}</span> : null}
                {/* {node.isProductMatch ? <Tag color="green">مرتبط با محصول جاری</Tag> : null} */}
                {node.isClickedSerial ? <Tag color="blue">سریال انتخاب‌شده</Tag> : null}
              </span>
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={open}
      title={`نمایش درخت سریال${serialLabel ? ` — ${serialLabel}` : ""}`}
      size={900}
      onClose={onClose}
      footer={null}
    >
      {open ? renderContent() : null}
    </Modal>
  );
};

export default SerialTreeModal;