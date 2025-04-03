import { useMemo } from "react";
import { message, Modal } from "antd";
import { useDeleteProduct } from "../../../QueryServises/productQuery";
import Tree from "../../../components/Tree";

const ProductTree = ({ productData, setModal, refetch, isLoading, isError, onChange, checkedKeys }) => {
    const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();
    // const { mutateAsync: fetchProductDetails } = useProductDetails();



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



    const handleRightClickAction = async (actionKey, node) => {
        const genusId = node.id;
        if (actionKey === "delete") {
            Modal.confirm({
                title: 'حذف محصول',
                content: 'آیا از حذف این محصول مطمئن هستید؟',
                okText: 'بله',
                cancelText: 'خیر',
                okType: 'danger',
                onOk() {
                    return new Promise((resolve, reject) => {
                        deleteProduct(genusId, {
                            onSuccess: () => {
                                message.success("محصول با موفقیت حذف شد");
                                refetch();
                                resolve();
                            },
                            onError: () => {
                                message.error("حذف محصول با خطا مواجه شد");
                                reject();
                            },
                        });
                    });
                },
                onCancel() {
                    console.log('حذف لغو شد');
                },
            });
        } else if (actionKey === "edit") {
            try {
                // const productDetails = await fetchProductDetails(node.id);
                setModal({
                    mode: "edit",
                    // data: productDetails
                });
            } catch (error) {
                message.error("خطا در دریافت اطلاعات محصول");
            }
        }
    }


    return (
        <div className="p-4">
            <Tree
                className="custom-tree"
                data={treeData}
                isLoading={isLoading || isDeleting}
                isError={isError || isDeleting}
                onChange={onChange}
                checkedKeys={checkedKeys}
                showLine={true}
                checkable={true}
                rightClickMenuItems={[
                    { key: "edit", label: "ویرایش" },
                    { key: "delete", label: "حذف", danger: true },
                ]}
                onRightClickAction={handleRightClickAction} />
        </div>
    );
};

export default ProductTree;