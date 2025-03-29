import { useState, useMemo } from "react";
import { Dropdown, message, Empty, Modal } from "antd";
import { useDeleteProduct } from "../../../QueryServises/productQuery";
import Tree from "../../../components/Tree";

const ProductTree = ({ productData, setModal, refetch, isLoading, isError, onChange, checkedKeys }) => {
    const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();

    const transformDataToTreeFormat = (data) => {
        return data?.map((product) => ({
            title: product.name,
            key: `product-${product.id}`,
            originalData: product,
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