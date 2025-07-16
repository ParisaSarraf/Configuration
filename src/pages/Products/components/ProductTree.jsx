import { useMemo } from "react";
import { message, Modal } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useDeleteProduct } from "../../../QueryServises/productQuery";
import Tree from "../../../components/Tree";
import CircleIcon from '@mui/icons-material/Circle';
import SquareIcon from '@mui/icons-material/Square';


const ProductTree = ({ productData, setModal, refetch, isLoading, isError, onChange, checkedKeys, onProductClick }) => {
    const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct();

    const rightClickMenuItems = [
        {
            key: "edit",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <EditOutlined />
                    <span>ویرایش شاخه</span>
                </div>
            )
        },
        {
            key: "delete",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <DeleteOutlined />
                    <span>حذف شاخه</span>
                </div>
            ),
            danger: true
        },
        {
            key: "addToParent",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <PlusOutlined />
                    <span>افزودن زیرشاخه</span>
                </div>
            )
        },
        // {
        //     key: "exportExcel",
        //     label: (
        //         <div className="w-full flex flex-row items-center gap-2">
        //             <FileExcelOutlined />
        //             <span>خروجی اکسل</span>
        //         </div>
        //     )
        // },
        // {
        //     key: "export",
        //     label: (
        //         <div className="w-full flex flex-row items-center gap-2">
        //             <FileOutlined />
        //             <span>خروجی اسناد</span>
        //         </div>
        //     )
        // }
    ];

    const getIconByItem = (item) => {
        if (item.children && item.children.length > 0) {
            return (
                <span className="flex items-center gap-1 mr-1">
                    <CircleIcon fontSize="s" className="text-red-600" />
                    <SquareIcon fontSize="s" />
                </span>
            );
        } else {
            return <CircleIcon fontSize="small" className="mr-1" />;
        }
    };


    const transformDataToTreeFormat = (productData) => {
        if (!productData) return [];
        return productData.map(item => ({
            title: (
                // <div style={{ display: 'flex', alignItems: 'center'}}>
                // {/* {getIconByItem(item)} */}
                // <span>
                `${item.persian_title} (${item.code})`
                // </span>
                // </div>
            ),
            key: `product-${item.id}`,
            id: item.id,
            name: item.persian_title,
            parentId: item.parent,
            productData: item,
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
                                message.error("محصول دارای زیرمجموعه است ")
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
                setModal({
                    mode: "edit",
                    data: node.productData,
                });
            } catch (error) {
                message.error("خطا در دریافت اطلاعات محصول");
            }
        } else if (actionKey === "addToParent") {
            try {
                setModal({
                    mode: "addToParent",
                    data: node.productData,
                });
            } catch (error) {
                message.error("خطا در دریافت اطلاعات محصول");
            }
        }
    }
    return (
        <div className="p-2">
            <Tree
                data={treeData}
                className="text-[12px] "
                isLoading={isLoading || isDeleting}
                isError={isError || isDeleting}
                onChange={onChange}
                checkedKeys={checkedKeys}
                showLine={true}
                onNodeClick={onProductClick}
                checkable={false}
                rightClickMenuItems={rightClickMenuItems}
                onRightClickAction={handleRightClickAction}
            />
        </div>
    );
};

export default ProductTree;