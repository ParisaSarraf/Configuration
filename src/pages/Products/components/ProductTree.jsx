import { useEffect, useMemo, useState } from "react";
import { message, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  PlusOutlined,
  FileZipOutlined,
} from "@ant-design/icons";
import { useDeleteProduct } from "../../../QueryServises/productQuery";
import { useExportExcelProductChildrenBom } from "@/QueryServises/ExcelExporterQuery/index.js";
import { handleDownload } from "@utils/HandleDownload.js";
import ProductTreeEtc from "../../../components/Tree/ProductTree";
import { useCreateZipReport } from "../../../QueryServises/productDocumentQuery";
import { useLazyProductTree } from "../../../hooks/useLazyProductTree";
import { mapProductToTreeNode } from "../../../utils/mapProductToTreeNode";
import ZipProgressModal from "../../../components/ZipProgressModal/ZipProgressModal";

const LOCAL_STORAGE_KEY = "productTreeExpandedKeys";

// ── main component ─────────────────────────────────────────────────────────
const ProductTree = ({
  productData,
  setModal,
  refetch,
  isLoading,
  isError,
  selectedKeys,
  onProductClick,
}) => {
  const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [exportProductId, setExportProductId] = useState(null);
  const { data: exportExcelData, isFetching: isExporting } =
    useExportExcelProductChildrenBom(exportProductId);

  // zip state
  const { mutate: createZip, isLoading: isRequestingZip } =
    useCreateZipReport();
  const [zipTask, setZipTask] = useState(null); // { uuid, fileName }

  const baseTreeData = useMemo(() => {
    if (!Array.isArray(productData)) return [];
    return productData
      .map((p) => mapProductToTreeNode(p, false))
      .filter(Boolean);
  }, [productData]);

  const { treeData, loadChildren } = useLazyProductTree(baseTreeData);

  useEffect(() => {
    setExpandedKeys([]);
  }, []);

  const handleExpand = (keys) => {
    try {
      setExpandedKeys(keys);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error("Failed to save expanded keys", error);
    }
  };

  useEffect(() => {
    if (exportExcelData && exportProductId) {
      handleDownload(
        exportExcelData,
        `زیرمجموعه_محصول_${exportProductId}.csv`,
        setExportProductId,
      );
    }
  }, [exportExcelData, exportProductId]);

  const handleRightClickAction = (actionKey, node) => {
    const genusId = node.id;

    if (actionKey === "delete") {
      Modal.confirm({
        title: "حذف محصول",
        content: "آیا از حذف این محصول مطمئن هستید؟",
        okText: "بله",
        cancelText: "خیر",
        okType: "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            deleteProduct(genusId, {
              onSuccess: () => {
                message.success("محصول با موفقیت حذف شد");
                refetch();
                resolve();
              },
              onError: () => {
                message.error("محصول دارای زیرمجموعه است");
                reject();
              },
            });
          });
        },
      });
    } else if (actionKey === "edit") {
      setModal({ mode: "edit", data: node.productData });
    } else if (actionKey === "addToParent") {
      setModal({ mode: "addToParent", data: node.productData });
    } else if (actionKey === "exportExcel") {
      setExportProductId(node?.productData?.id);
      message.loading({ content: "درحال آماده‌سازی...", key: "exporting" });
    } else if (actionKey === "downloadZip") {
      const fileName =
        node?.productData?.persian_title || node?.productData?.code;
      const productId = node?.productData?.id;
      createZip(productId, {
        onSuccess: (data) => {
          if (data?.uuid) {
            setZipTask({ uuid: data.uuid, fileName });
          } else {
            message.error("خطا: شناسه وظیفه دریافت نشد");
          }
        },
        onError: () => {
          message.error("خطا در شروع ساخت فایل ZIP");
        },
      });
    }
  };

  const rightClickMenuItems = [
    {
      key: "edit",
      label: (
        <div className="flex items-center gap-2">
          <EditOutlined />
          <span>ویرایش شاخه</span>
        </div>
      ),
    },
    {
      key: "delete",
      label: (
        <div className="flex items-center gap-2">
          <DeleteOutlined />
          <span>حذف شاخه</span>
        </div>
      ),
      danger: true,
    },
    {
      key: "addToParent",
      label: (
        <div className="flex items-center gap-2">
          <PlusOutlined />
          <span>افزودن زیرشاخه</span>
        </div>
      ),
    },
    {
      key: "exportExcel",
      label: (
        <div className="flex items-center gap-2">
          <FileExcelOutlined />
          <span>خروجی اکسل</span>
        </div>
      ),
    },
    {
      key: "downloadZip",
      label: (
        <div className="flex items-center gap-2">
          <FileZipOutlined />
          <span>دانلود مستندات (ZIP)</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <ProductTreeEtc
        className="-p-2"
        data={treeData}
        isLoading={isLoading || isDeleting || isExporting || isRequestingZip}
        isError={isError}
        onSelect={(_, { node }) => onProductClick(node.productData)}
        selectedKeys={selectedKeys}
        showLine={true}
        checkable={false}
        showIcon={false}
        blockNode
        loadData={loadChildren}
        rightClickMenuItems={rightClickMenuItems}
        onRightClickAction={handleRightClickAction}
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
      />

      {/* Progress modal — only mounts while a zip task is active */}
      {zipTask && (
        <ZipProgressModal
          uuid={zipTask.uuid}
          fileName={zipTask.fileName}
          onDone={() => setZipTask(null)}
          onClose={() => setZipTask(null)}
        />
      )}
    </>
  );
};

export default ProductTree;
