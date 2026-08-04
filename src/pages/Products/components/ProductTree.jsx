import { useEffect, useMemo, useRef, useState } from "react";
import { Input, message, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  PlusOutlined,
  FileZipOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMyAxios } from "@/hooks/useMyAxios";
import { useDeleteProduct } from "../../../QueryServises/productQuery";
import { useExportExcelProductChildrenBom } from "@/QueryServises/ExcelExporterQuery/index.js";
import { handleDownload } from "@utils/HandleDownload.js";
import ProductTreeEtc from "../../../components/Tree/ProductTree";
import { useCreateZipReport } from "../../../QueryServises/productDocumentQuery";
import { useLazyProductTree } from "../../../hooks/useLazyProductTree";
import { mapProductToTreeNode } from "../../../utils/mapProductToTreeNode";
import ZipProgressModal from "../../../components/ZipProgressModal/ZipProgressModal";

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
  const { myAxios } = useMyAxios();
  const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [exportProductId, setExportProductId] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const { data: exportExcelData, isFetching: isExporting } =
    useExportExcelProductChildrenBom(exportProductId);

  const { mutate: createZip, isLoading: isRequestingZip } =
    useCreateZipReport();
  const [zipTask, setZipTask] = useState(null);

  const baseTreeData = useMemo(() => {
    if (!Array.isArray(productData)) return [];
    return productData
      .map((p) => mapProductToTreeNode(p, false))
      .filter(Boolean);
  }, [productData]);

  const { treeData, loadChildren, expandToPath } =
    useLazyProductTree(baseTreeData);

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

  const handleSearch = async (rawCode) => {
    const fullCode = rawCode?.trim();
    if (!fullCode) return;

    setSearchLoading(true);
    try {
      const { data } = await myAxios.get(
        "/product/search-product-tree-by-full-code/",
        { params: { full_code: fullCode } },
      );
      const idPath = data?.id_path;

      if (!Array.isArray(idPath) || idPath.length === 0) {
        message.warning("محصولی با این کد یافت نشد");
        return;
      }

      const {
        expandedKeys: pathKeys,
        targetKey,
        targetNode,
      } = await expandToPath(idPath);

      setExpandedKeys((prev) => Array.from(new Set([...prev, ...pathKeys])));

      if (targetNode?.productData) {
        onProductClick(targetNode.productData);
      }
    } catch (error) {
      message.error("خطا در جستجوی محصول");
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (exportExcelData && exportProductId) {
      handleDownload(
        exportExcelData.url,
        exportExcelData.fileName,
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
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-100 p-1.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
          <SearchOutlined className="text-sm text-slate-500" />
        </div>
        <Input.Search
          bordered={false}
          size="middle"
          allowClear
          loading={searchLoading}
          placeholder="جستجوی کد محصول..."
          onSearch={handleSearch}
          enterButton={<span className="px-2 text-xs">جستجو</span>}
          className="
      flex-1
      [&_.ant-input]:!bg-transparent
      [&_.ant-input]:!text-sm
      [&_.ant-input]:placeholder:text-xs
      [&_.ant-input-search-button]:!h-8
      [&_.ant-input-search-button]:!rounded-md
      [&_.ant-input-search-button]:!bg-slate-800
      [&_.ant-input-search-button]:hover:!bg-slate-700
    "
        />
      </div>

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
