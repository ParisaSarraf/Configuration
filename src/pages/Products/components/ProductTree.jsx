import { useEffect, useMemo, useRef, useState } from "react";
import { Empty, Input, message, Modal } from "antd";
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

// Only keys are stored; product data is always loaded again through the API.
const readExpandedKeys = () => {
  try {
    const value = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((key) => typeof key === "string" || typeof key === "number").map(String))]
      : [];
  } catch {
    return [];
  }
};

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
  const [expandedKeys, setExpandedKeys] = useState(readExpandedKeys);
  const expandedKeysRef = useRef(expandedKeys);
  const restoringKeysRef = useRef(new Set());
  const failedRestoreKeysRef = useRef(new Set());
  const [exportProductId, setExportProductId] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const searchRef = useRef(null);

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
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // Keep matching descendants and their ancestry without changing lazy-loaded data.
  const visibleTreeData = useMemo(() => {
    if (statusFilter === "all") return treeData;
    const filterNodes = (nodes = []) => nodes.flatMap((node) => {
      const children = filterNodes(node.children);
      return node.productData?.status === statusFilter || children.length
        ? [{...node, children: children.length ? children : undefined}] : [];
    });
    return filterNodes(treeData);
  }, [treeData, statusFilter]);

  const updateExpandedKeys = (keys) => {
    expandedKeysRef.current = keys;
    setExpandedKeys(keys);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      // Tree interaction must still work when browser storage is unavailable.
      console.warn("Failed to save expanded product keys", error);
    }
  };

  const handleExpand = (keys) => {
    const previousKeys = new Set(expandedKeysRef.current);
    keys.forEach((key) => {
      if (!previousKeys.has(key)) failedRestoreKeysRef.current.delete(key);
    });
    updateExpandedKeys(keys);
  };

  // An expanded key alone cannot restore a lazy tree: its children must be
  // fetched first. Each successful load exposes the next expanded level.
  useEffect(() => {
    const expanded = new Set(expandedKeys);
    const pending = restoringKeysRef.current;
    const failed = failedRestoreKeysRef.current;
    const visit = (nodes) => {
      nodes.forEach((node) => {
        if (!node) return;
        if (expanded.has(node.key) && !node.isLeaf && !Array.isArray(node.children)
            && !pending.has(node.key) && !failed.has(node.key)) {
          pending.add(node.key);
          loadChildren(node).catch((error) => {
            failed.add(node.key);
            console.warn("Failed to restore product branch", error);
            message.warning("بازیابی یکی از شاخه‌ها ناموفق بود؛ شاخه را دوباره باز کنید.");
          }).finally(() => pending.delete(node.key));
        }
        if (Array.isArray(node.children)) visit(node.children);
      });
    };
    visit(treeData);
  }, [treeData, expandedKeys, loadChildren]);

  const handleSearch = async (rawCode) => {
    const fullCode = rawCode?.trim();
    if (!fullCode) return;

    setStatusFilter("all");
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

      updateExpandedKeys(Array.from(new Set([...expandedKeysRef.current, ...pathKeys])));

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
      <div className="pw-product-search">
        <Input.Search ref={searchRef} allowClear loading={searchLoading}
          aria-label="جستجوی کد کامل محصول" placeholder="جستجوی کد کامل محصول..."
          onSearch={handleSearch} enterButton={<SearchOutlined/>}/>
        <kbd>Ctrl K</kbd>
      </div>
      <div className="pw-product-filters" role="group" aria-label="فیلتر وضعیت محصولات">
        {[{key: "all", label: "همه"}, {key: "active", label: "فعال"}, {key: "inactive", label: "غیرفعال"}].map((filter) => (
          <button key={filter.key} type="button" aria-pressed={statusFilter === filter.key}
            className={statusFilter === filter.key ? "is-active" : ""}
            onClick={() => setStatusFilter(filter.key)}>{filter.label}</button>
        ))}
      </div>
      {!visibleTreeData.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="محصولی یافت نشد"/>}

      <p className="pw-product-tree-hint">برای دیدن شاخه‌های عمیق، درخت را افقی پیمایش کنید.</p>
      <div className="pw-product-tree-scroll" role="region" aria-label="درخت محصولات؛ برای مشاهده شاخه‌های عمیق به صورت افقی پیمایش کنید" tabIndex={0}>
        <ProductTreeEtc
          className="pw-product-tree"
          data={visibleTreeData}
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
      </div>

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
