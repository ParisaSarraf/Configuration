import { useEffect, useMemo, useState } from "react";
import {
  useChildProductByIdKey,
  useHideProduct,
} from "../../../QueryServises/productQuery";
import ProductTreeEtc from "../../../components/Tree/ProductTree";
import { useQueryClient } from "@tanstack/react-query";
import { useMyAxios } from "../../../hooks/useMyAxios";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"; // آیکون چشم را هم اضافه کردم
import { Modal, message } from "antd"; // message را ایمپورت کنید

const LOCAL_STORAGE_KEY = "productTreeExpandedKeys";

const ManageProductTree = ({
  productData,
  isLoading,
  isError,
  selectedKeys,
  onProductClick,
  refetch, // فرض بر این است که تابع refetch را به عنوان پراپ پاس می‌دهید (در کد اصلی نبود)
}) => {
  const queryClient = useQueryClient();
  const { myAxios } = useMyAxios();

  const [treeDataSource, setTreeDataSource] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const { mutate: hideProduct, isLoading: isHiding } = useHideProduct();

  useEffect(() => {
    if (productData) {
      setTreeDataSource(productData);
    }
  }, [productData]);

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

  const transformDataToTreeFormat = (data) => {
    if (!data) return [];
    return data.map((item) => {
      const hasLoadedChildren = item.children && item.children.length > 0;
      return {
        title: `${item.persian_title} (${item.final_code || item.code})`,
        key: `product-${item.id}`,
        id: item.id,
        productData: item,
        children: hasLoadedChildren
          ? transformDataToTreeFormat(item.children)
          : undefined,
        isLeaf: !item.has_children,
        // اگر کتابخانه درخت شما از style پشتیبانی می‌کند، می‌توانید نودهای مخفی را کمرنگ کنید
        style: item.hide ? { opacity: 0.5 } : {}, 
      };
    });
  };

  const treeData = useMemo(() => {
    return transformDataToTreeFormat(treeDataSource);
  }, [treeDataSource]);

  // --- قسمت تغییر کرده ---
  const handleRightClickAction = async (actionKey, node) => {
    if (actionKey === "toggle_visibility") {
      
      // 1. تشخیص وضعیت فعلی
      // فرض بر این است که فیلد 'hide' در دیتای محصول وجود دارد و true/false است
      const isCurrentlyHidden = node?.productData?.hide === true;
      
      // 2. تعیین وضعیت جدید (برعکس وضعیت فعلی)
      const nextHideStatus = !isCurrentlyHidden;

      // 3. تعیین متن‌های مودال بر اساس عملیات
      const actionTitle = isCurrentlyHidden ? "آشکار کردن" : "مخفی کردن";
      const actionContent = isCurrentlyHidden 
        ? "آیا از آشکار کردن این شاخه مطمئن هستید؟" 
        : "آیا از مخفی کردن این شاخه مطمئن هستید؟ (کاربران دیگر آن را نخواهند دید)";

      Modal.confirm({
        title: `${actionTitle} شاخه`,
        content: actionContent,
        okText: "بله",
        cancelText: "خیر",
        okType: isCurrentlyHidden ? "primary" : "danger", // رنگ دکمه را هم متناسب تغییر می‌دهیم
        onOk() {
          return new Promise((resolve, reject) => {
            hideProduct(
              { id: node?.id, hide: nextHideStatus }, // ارسال وضعیت جدید
              {
                onSuccess: () => {
                  message.success(`محصول با موفقیت ${isCurrentlyHidden ? "آشکار" : "مخفی"} شد`);
                  
                  // اگر refetch از پراپ‌ها نیامده، باید راهی برای رفرش دیتا داشته باشید
                  if (refetch) refetch(); 
                  // یا اگر از queryClient استفاده می‌کنید:
                  // queryClient.invalidateQueries(['YOUR_QUERY_KEY']);
                  
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

  // منو را جنریک می‌کنیم چون در لحظه رندر نمی‌دانیم روی کدام نود کلیک می‌شود
  // مگر اینکه کامپوننت ProductTreeEtc قابلیت dynamic menu داشته باشد.
  const rightClickMenuItems = [
    {
      key: "toggle_visibility", // کلید را تغییر دادیم
      label: (
        <div className="flex items-center gap-2">
          {/* نمایش هر دو آیکون یا یک آیکون ترکیبی */}
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
        loadData={onLoadData}
        expandedKeys={expandedKeys}
        rightClickMenuItems={rightClickMenuItems}
        onRightClickAction={handleRightClickAction}
        onExpand={handleExpand}
      />
    </div>
  );
};
export default ManageProductTree;