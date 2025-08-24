import {useEffect, useState} from "react";
import {useUnAccessProductsByUserAndRoleId} from "../../../QueryServises/accsessQuery";
import {Alert, Empty, Spin, Tree} from "antd";

const ProductsList = ({selectedUserId, selectedRoleId, onSelectionChange}) => {
    const [checkedKeys, setCheckedKeys] = useState([]);

    const {data: products, isLoading, error} = useUnAccessProductsByUserAndRoleId(
        selectedUserId && selectedRoleId ? {user_id: selectedUserId, role_id: selectedRoleId} : null,
        {enabled: !!(selectedUserId && selectedRoleId)}
    );

    useEffect(() => {
        setCheckedKeys([]);
        onSelectionChange([]);
    }, [selectedUserId, selectedRoleId, onSelectionChange]);

    const onCheck = (keys, info) => {
        const productIds = info.checkedNodes.map(node => node.productId);
        setCheckedKeys(keys);
        onSelectionChange(productIds);
    };

    const transformDataToTree = (products) => {
        if (!products) return [];
        return products.map(product => ({
            title: product.persian_title,
            key: `product-${product.id}`,
            isLeaf: true,
            productId: product.id,
        }));
    };

    if (!selectedUserId || !selectedRoleId) {
        return <Empty description="برای مشاهده محصولات، ابتدا کاربر و سمت را انتخاب کنید."/>;
    }

    if (isLoading) return <Spin/>;
    if (error) return <Alert message="خطا در بارگذاری محصولات" type="error"/>;
    if (!products || products.length === 0) return <Empty description="محصول جدیدی برای افزودن یافت نشد."/>;

    return (
        <Tree
            checkable
            blockNode
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            treeData={transformDataToTree(products)}
        />
    );
};

export default ProductsList;