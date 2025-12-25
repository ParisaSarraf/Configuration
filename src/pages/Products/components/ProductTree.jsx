import { useEffect, useMemo, useState } from "react";
import { message, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  useDeleteProduct,
  useChildProductByIdKey,
} from "../../../QueryServises/productQuery";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useExportExcelProductChildrenBom } from "@/QueryServises/ExcelExporterQuery/index.js";
import { handleDownload } from "@utils/HandleDownload.js";
import ProductTreeEtc from "../../../components/Tree/ProductTree";
import { useQueryClient } from "@tanstack/react-query";
import { useMyAxios } from "../../../hooks/useMyAxios";

const LOCAL_STORAGE_KEY = "productTreeExpandedKeys";

const ProductTree = ({
  productData,
  setModal,
  refetch,
  isLoading,
  isError,
  onChange,
  selectedKeys,
  onProductClick,
}) => {
  const queryClient = useQueryClient();
  const { myAxios } = useMyAxios();
  const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();

  const [treeDataSource, setTreeDataSource] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [exportProductId, setExportProductId] = useState(null);

  const { data: exportExcelData, isFetching: isExporting } =
    useExportExcelProductChildrenBom(exportProductId);

  useEffect(() => {
    if (productData) {
      setTreeDataSource(productData);
    }
  }, [productData]);

  useEffect(() => {
    // try {
    //   const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
    //   if (storedKeys) {
    //     setExpandedKeys(JSON.parse(storedKeys));
    //   }
    // } catch (error) {
    //   console.error("Failed to load expanded keys", error);
    // }
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

  const updateTreeData = (list, key, children) => {
    return list.map((node) => {
      const nodeKey = `product-${node.id}`;
      if (nodeKey === key) {
        return { ...node, children };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  };

  const onLoadData = ({ key, id, children }) => {
    return new Promise(async (resolve) => {
      if (children && children.length > 0) {
        resolve();
        return;
      }
      try {
        const data = await queryClient.fetchQuery({
          queryKey: useChildProductByIdKey(id),
          queryFn: () =>
            myAxios
              .get(`/product/get-product-child-by-id/${id}`)
              .then((res) => res.data),
        });
        setTreeDataSource((prev) => updateTreeData(prev, key, data));
        resolve();
      } catch (error) {
        resolve();
      }
    });
  };

  useEffect(() => {
    if (exportExcelData && exportProductId) {
      handleDownload(
        exportExcelData,
        `زیرمجموعه_محصول_${exportProductId}.csv`,
        setExportProductId
      );
    }
  }, [exportExcelData, exportProductId]);

  const transformDataToTreeFormat = (data) => {
    if (!data) return [];
    return data.map((item) => {
      const hasLoadedChildren = item.children && item.children.length > 0;

      return {
        title: (
          <div className="flex items-center">
            <FiberManualRecordIcon
              fontSize="small"
              color={
                item.status === "active"
                  ? "success"
                  : item.status === "inactive"
                  ? "error"
                  : "warning"
              }
            />
            <span>
              {item.persian_title} ({item.final_code || item.code})
            </span>
          </div>
        ),
        key: `product-${item.id}`,
        id: item.id,
        productData: item,
        children: hasLoadedChildren
          ? transformDataToTreeFormat(item.children)
          : undefined,
        isLeaf: !item.has_children,
      };
    });
  };

  const treeData = useMemo(() => {
    return transformDataToTreeFormat(treeDataSource);
  }, [treeDataSource]);

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
  ];

  return (
    <div className="p-2">
      <ProductTreeEtc
        className="custom-product-tree"
        data={treeData}
        isLoading={isLoading || isDeleting || isExporting}
        isError={isError}
        onSelect={(_, { node }) => onProductClick(node.productData)}
        selectedKeys={selectedKeys}
        showLine={true}
        checkable={false}
        showIcon={false}
        blockNode
        loadData={onLoadData}
        rightClickMenuItems={rightClickMenuItems}
        onRightClickAction={handleRightClickAction}
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
      />
    </div>
  );
};

export default ProductTree;
