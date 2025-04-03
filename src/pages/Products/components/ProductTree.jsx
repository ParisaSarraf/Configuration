import { useState, useMemo } from "react";
import { Dropdown, message, Empty, Modal } from "antd";
import { useDeleteProduct } from "../../../QueryServises/productQuery";
import Tree from "../../../components/Tree";

const ProductTree = ({ productData, setModal, refetch, isLoading, isError, onChange, checkedKeys }) => {
    const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();


    const transformDataToTreeFormat = (productData) => {
        if (!productData) return [];
        return productData.map(item => ({
            title: item.persian_title,
            key: `product-${item.id}`,
            id: item.id,
            name: item.persian_title,
            parentId: item.parent,
            children: item.children && item.children.length > 0
                ? transformDataToTreeFormat(item.children)
                : undefined,
            isLeaf: !item.children || item.children.length === 0
        }));
    };


    const treeData = useMemo(() => {
        return transformDataToTreeFormat(productData);
    }, [productData]);

    return (
        <div className="p-4">
            <Tree
                data={treeData}
                isLoading={isLoading}
                isError={isError}
                onChange={onChange}
                checkedKeys={checkedKeys}
                showLine={true}
                checkable={true}
                showRightClickMenu={true}
            />
        </div>
    );
};

export default ProductTree;