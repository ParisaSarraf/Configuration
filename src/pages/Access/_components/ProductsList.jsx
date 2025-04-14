import { Card, Empty, Spin, Alert } from "antd";
import { useUnAccessProductsByUserAndRoleId } from "../../../QueryServises/accsessQuery";
import { useState } from "react";
import Tree from "../../../components/Tree";


const ProductsList = ({ selectedUserAndRoleId }) => {
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
    };

    if (isLoading) return <Spin />;
    if (error) return <Alert message={`خطا: ${error.response?.data?.message || error.message}`} type="error" />;

    return (
        <Card>
            {data?.length > 0 ? (
                <Tree
                    multiple
                    checkable
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onCheck={onCheck}
                    checkedKeys={checkedKeys}
                    treeData={transformDataToTree(data)}
                />
            ) : (
                <Empty description="محصولی یافت نشد" />
            )}
        </Card>
    );
};

export default ProductsList;