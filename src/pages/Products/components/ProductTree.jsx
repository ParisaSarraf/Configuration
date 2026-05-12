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
import { useGetZipById } from "../../../QueryServises/productDocumentQuery";
import { useLazyProductTree } from "../../../hooks/useLazyProductTree";
import { mapProductToTreeNode } from "../../../utils/mapProductToTreeNode";

const LOCAL_STORAGE_KEY = "productTreeExpandedKeys";

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

  const [zipProductId, setZipProductId] = useState(null);
  const [zipFileName, setZipFileName] = useState("");

  const { refetch: fetchZip, isFetching: isDownloadingZip } = useGetZipById(
    zipProductId,
    {
      enabled: false,
    },
  );

  // Prepare base tree data from productData
  const baseTreeData = useMemo(() => {
    if (!Array.isArray(productData)) return [];
    return productData
      .map((p) => mapProductToTreeNode(p, false))
      .filter(Boolean);
  }, [productData]);

  // Use the lazy loading hook with the prepared base data
  const { treeData, loadChildren } = useLazyProductTree(baseTreeData);

  useEffect(() => {
    if (zipProductId) {
      fetchZip().then((result) => {
        const blobData = result.data;
        if (blobData) {
          try {
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              `Documents-${zipFileName || "Product"}.zip`,
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            message.success("فایل با موفقیت دانلود شد");
          } catch (error) {
            console.error("Download error:", error);
            message.error("خطا در دانلود فایل");
          }
        } else if (result.error) {
          message.error("خطا در دریافت فایل از سرور");
        }

        setZipProductId(null);
      });
    }
  }, [zipProductId, fetchZip, zipFileName]);

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

  const handleRightClickAction = async (actionKey, node) => {
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
      setZipFileName(
        node?.productData?.persian_title || node?.productData?.code,
      );
      setZipProductId(node?.productData?.id);
      message.loading({
        content: "درحال آماده‌سازی فایل ZIP...",
        key: "zipping",
        duration: 1,
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
    <div className="p-2">
      <ProductTreeEtc
        className="custom-product-tree"
        data={treeData}
        isLoading={isLoading || isDeleting || isExporting || isDownloadingZip}
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
    </div>
  );
};

export default ProductTree;