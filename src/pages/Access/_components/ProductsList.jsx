import { useState } from "react";
import { useUnAccessProductsByUserAndRoleId } from "../../../QueryServises/accsessQuery";
import { Alert, Card, Empty, Spin } from "antd";
import Tree from "../../../components/Tree";

const ProductsList = ({ selectedUserAndRoleId, setSelectedProducts }) => {
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const userId = selectedUserAndRoleId?.[1];
    const roleId = selectedUserAndRoleId?.[0];

    const { data, isLoading, error } = useUnAccessProductsByUserAndRoleId(
        userId && roleId ? {
            user_id: userId,
            role_id: roleId
        } : null
    );

    const transformDataToTree = (products) => {
        if (!products) return [];
        return products.map(product => ({
            title: product.persian_title,
            key: `unaccess-product-role-${roleId}-product-${product.id}`,
            isLeaf: true,
            ...product
        }));
    };

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck = (checkedKeysValue) => {
        setCheckedKeys(checkedKeysValue);
        const productIds = checkedKeysValue
            .filter(key => key.startsWith(`unaccess-product-role-${roleId}-product-`))
            .map(key => parseInt(key.split('-').pop())); // استخراج ID از انتهای کلید
        setSelectedProducts(productIds);
    };

    if (isLoading) return <Spin size="small" />;
    if (error) return <Alert message={`خطا: ${error.response?.data?.message || error.message}`} type="error" />;
    if (!data || data.length === 0) return <Empty description="محصولی یافت نشد" />;

    return (
        <Card>
            <Tree
                multiple
                checkable
                onExpand={onExpand}
                isLoading={isLoading}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                treeData={transformDataToTree(data)}
            />
        </Card>
    );
};

export default ProductsList;
