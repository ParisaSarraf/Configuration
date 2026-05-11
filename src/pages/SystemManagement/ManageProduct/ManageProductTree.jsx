import { useEffect, useMemo, useState } from "react";
import { useHideProduct } from "../../../QueryServises/productQuery";
import ProductTreeEtc from "../../../components/Tree/ProductTree";
import { EyeOutlined } from "@ant-design/icons";
import { Modal, message } from "antd";
import { useLazyProductTree } from "../../../hooks/useLazyProductTree";
import { mapProductToTreeNode } from "../../../utils/mapProductToTreeNode";

const LOCAL_STORAGE_KEY = "productTreeExpandedKeys";

const ManageProductTree = ({
  productData,
  isLoading,
  isError,
  selectedKeys,
  onProductClick,
  refetch,
}) => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const { mutate: hideProduct } = useHideProduct();
  
  const initialTree = useMemo(
    () =>
      productData?.map((p) => mapProductToTreeNode(p, true)).filter(Boolean) ??
      [],
    [productData]
  );

  const { treeData, loadChildren } = useLazyProductTree(initialTree);

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

  const handleRightClickAction = async (actionKey, node) => {
    if (actionKey === "toggle_visibility") {
      const isCurrentlyHidden = node?.productData?.hide === true;
      const nextHideStatus = !isCurrentlyHidden;
      const actionTitle = isCurrentlyHidden ? "آشکار کردن" : "مخفی کردن";
      const actionContent = isCurrentlyHidden
        ? "آیا از آشکار کردن این شاخه مطمئن هستید؟"
        : "آیا از مخفی کردن این شاخه مطمئن هستید؟ (کاربران دیگر آن را نخواهند دید)";

      Modal.confirm({
        title: `${actionTitle} شاخه`,
        content: actionContent,
        okText: "بله",
        cancelText: "خیر",
        okType: isCurrentlyHidden ? "primary" : "danger",
        onOk() {
          return new Promise((resolve, reject) => {
            hideProduct(
              { id: node?.id, hide: nextHideStatus },
              {
                onSuccess: () => {
                  message.success(
                    `محصول با موفقیت ${isCurrentlyHidden ? "آشکار" : "مخفی"} شد`
                  );

                  if (refetch) refetch();
                  resolve();
                },
                onError: () => {
                  message.error("خطا در تغییر وضعیت محصول");
                  reject();
                },
              }
            );
          });
        },
      });
    }
  };

  const rightClickMenuItems = [
    {
      key: "toggle_visibility",
      label: (
        <div className="flex items-center gap-2">
          <EyeOutlined />
          <span>تغییر وضعیت نمایش (مخفی/آشکار)</span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <ProductTreeEtc
        className="custom-product-tree"
        data={treeData}
        isLoading={isLoading}
        isError={isError}
        onSelect={(_, { node }) => onProductClick(node.productData)}
        selectedKeys={selectedKeys}
        showLine={true}
        checkable={false}
        showIcon={false}
        blockNode
        loadData={loadChildren}
        expandedKeys={expandedKeys}
        rightClickMenuItems={rightClickMenuItems}
        onRightClickAction={handleRightClickAction}
        onExpand={handleExpand}
      />
    </div>
  );
};
export default ManageProductTree;
