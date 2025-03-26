import { useState, useMemo } from "react";
import { Tree, Dropdown, message, Empty, Modal } from "antd";
import { useDeleteProduct } from "../../../QueryServises/productQuery";

const { DirectoryTree } = Tree;

const ProductTree = ({ productData, setModal, refetch }) => {
    const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();
    const [rightClickNode, setRightClickNode] = useState(null);
    const [showDropDown, setShowDropDown] = useState(false);

    const onSelect = (selectedKeys, info) => {
        console.log('Selected node:', info.node);
    };

    const transformDataToTreeFormat = (data) => {
        // اضافه کردن بررسی null/undefined
        if (!data || !Array.isArray(data)) return [];

        const parentProducts = data.filter(product => !product.parent_code_id);

        return parentProducts.map(product => ({
            title: (
                <span className="text-sm">
                    {product.persian_title || 'بدون عنوان'}
                </span>
            ),
            key: `product-${product.id}`,
            children: data
                .filter(child => child.parent_code_id === product.id)
                .map(child => ({
                    title: (
                        <span className="text-sm">
                            {child.persian_title || 'بدون عنوان'}
                        </span>
                    ),
                    key: `product-${child.id}`,
                    isLeaf: true,
                    ...child
                })),
            ...product
        }));
    };

    const onRightClick = ({ event, node }) => {
        setRightClickNode({ ...node, x: event.pageX, y: event.pageY });
        setShowDropDown(true);
    };

    const handleMenuClick = ({ key }) => {
        if (!rightClickNode) return;

        const productId = rightClickNode.key.split('-')[1];

        if (key === 'delete') {
            Modal.confirm({
                title: 'حذف محصول',
                content: 'آیا از حذف این محصول مطمئن هستید؟',
                okText: 'بله',
                cancelText: 'خیر',
                onOk: () => {
                    deleteProduct(productId, {
                        onSuccess: () => {
                            message.success('محصول با موفقیت حذف شد');
                            refetch();
                        },
                        onError: () => {
                            message.error('حذف محصول با خطا مواجه شد');
                        },
                    });
                }
            });
        } else if (key === 'edit') {
            setModal({ mode: 'edit', data: { ...rightClickNode } });
        }

        setRightClickNode(null);
        setShowDropDown(false);
    };

    const itemsMenu = [
        {
            key: 'edit',
            label: 'ویرایش',
        },
        {
            key: 'delete',
            label: 'حذف',
            danger: true,
            disabled: isDeleting,
        },
    ];

    const treeData = useMemo(() => {
        return transformDataToTreeFormat(productData || []);
    }, [productData]);

    if (!productData || productData.length === 0) {
        return (
            <div className="p-4">
                <Empty description="محصولی یافت نشد" />
            </div>
        );
    }

    return (
        <>
            <DirectoryTree
                className="custom-tree"
                onRightClick={onRightClick}
                treeData={treeData}
                showLine
                onSelect={onSelect}
                blockNode
            />

            {rightClickNode && showDropDown && (
                <Dropdown
                    menu={{ items: itemsMenu, onClick: handleMenuClick }}
                    open={showDropDown}
                    onOpenChange={(visible) => setShowDropDown(visible)}
                    trigger={['contextMenu']}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: rightClickNode.y,
                            left: rightClickNode.x,
                            width: '1px',
                            height: '1px',
                        }}
                    />
                </Dropdown>
            )}
        </>
    );
};

export default ProductTree;