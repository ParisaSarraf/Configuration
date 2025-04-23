import { useState } from "react";
import { useUnAccessProductsByUserAndRoleId } from "../../../QueryServises/accsessQuery";
import { Alert, Card, Empty, Spin } from "antd";
import Tree from "../../../components/Tree";

const ProductsList = ({ selectedUserAndRoleId, setSelectedProducts }) => {
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const { data, isLoading, error } = useUnAccessProductsByUserAndRoleId(
        selectedUserAndRoleId?.length === 2 ? {
            user_id: selectedUserAndRoleId[1],
            role_id: selectedUserAndRoleId[0]
        } : null
    );

    const transformDataToTree = (products) => {
        if (!products) return [];
        const treeData = products.map(product => ({
            title: product.persian_title,
            key: `product-${product.id}`,
            isLeaf: true,
            ...product
        }));
        return treeData;
    };

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck = (checkedKeysValue) => {
        setCheckedKeys(checkedKeysValue);
        const productIds = checkedKeysValue
            .filter(key => key.startsWith('product-'))
            .map(key => parseInt(key.replace('product-', '')));
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