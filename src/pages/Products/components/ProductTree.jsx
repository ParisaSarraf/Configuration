import {useEffect, useMemo, useState} from "react";
import {message, Modal} from "antd";
import {DeleteOutlined, EditOutlined, FileExcelOutlined, PlusOutlined,} from '@ant-design/icons';
import {useDeleteProduct} from "../../../QueryServises/productQuery";
import Tree from "../../../components/Tree";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {useExportExcelProductChildrenBom,} from "@/QueryServises/ExcelExporterQuery/index.js";
import {handleDownload} from "@utils/HandleDownload.js";

const ProductTree = ({productData, setModal, refetch, isLoading, isError, onChange, selectedKeys, onProductClick}) => {
    const {mutate: deleteProduct, isLoading: isDeleting} = useDeleteProduct();
    const [exportProductId, setExportProductId] = useState(null);
    const {data: exportExcelData, isFetching: isExporting} = useExportExcelProductChildrenBom(exportProductId);


    useEffect(() => {
        if (exportExcelData && exportProductId) {
            handleDownload(
                exportExcelData,
                `زیرمجموعه_محصول_${exportProductId}.csv`,
                setExportProductId
            );
        }
    }, [exportExcelData, exportProductId]);


    const rightClickMenuItems = [
        {
            key: "edit",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <EditOutlined/>
                    <span>ویرایش شاخه</span>
                </div>
            )
        },
        {
            key: "delete",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <DeleteOutlined/>
                    <span>حذف شاخه</span>
                </div>
            ),
            danger: true
        },
        {
            key: "addToParent",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <PlusOutlined/>
                    <span>افزودن زیرشاخه</span>
                </div>
            )
        },
        {
            key: "exportExcel",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <FileExcelOutlined/>
                    <span>خروجی اکسل</span>
                </div>
            )
        },
    ];

    const transformDataToTreeFormat = (productData) => {
        if (!productData) return [];
        return productData?.map(item => ({
            title: (
                <div className="flex items-center">
                    <FiberManualRecordIcon
                        fontSize="small"
                        color={
                            item.status === 'active' ? 'success' :
                                item.status === 'inactive' ? 'error' :
                                    'warning'
                        }
                    />
                    <span>{item.persian_title} ({item.final_code || item.code})</span>
                </div>
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
        } else if (actionKey === 'exportExcel') {
            try {
                setExportProductId(node?.productData?.id);
                message.loading({content: 'درحال آماده‌سازی فایل اکسل...', key: 'exporting'});
            } catch (error) {
                message.error("خطا در خروجی اکسل");
            }
        }
    }
    return (
        <div className="p-2">
            <Tree
                className="custom-product-tree"
                data={treeData}
                isLoading={isLoading || isDeleting || isExporting}
                isError={isError || isDeleting}
                onSelect={(_, {node}) => onProductClick(node.productData)}
                selectedKeys={selectedKeys}
                showLine={true}
                checkable={false}
                showIcon={false}
                rightClickMenuItems={rightClickMenuItems}
                onRightClickAction={handleRightClickAction}
            />
        </div>
    );
};

export default ProductTree;