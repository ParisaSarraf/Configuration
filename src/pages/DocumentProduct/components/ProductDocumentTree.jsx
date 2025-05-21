import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import { useProductById } from "../../../QueryServises/productQuery";
import { message, Modal } from "antd";
import { useDeleteProductDocument } from "../../../QueryServises/productDocumentQuery";
import ProductDocumentEditionModal from "./ProductDocumentEdition/ProductDocumentEditionModal";

const ProductDocumentTree = ({ currentProduct, setModal }) => {
    const selectedProductId = currentProduct?.productData?.id
    const { data: productDocument, isLoading, isError, refetch } = useProductById(selectedProductId);
    const { mutate: deleteProductDocument } = useDeleteProductDocument();
    const documentProducts = productDocument?.product_documents



    const transformDataToTreeView = (documentProducts) => {
        if (!documentProducts) return []
        const transformNode = (node) => ({
            title: node.title,
            id: node.id,
            is_reportable: node.is_reportable,
            document: node.document,
            survey_date: node.survey_date
        })
        const productDoc = Array.isArray(documentProducts) ? documentProducts : [documentProducts]
        return productDoc.map((document) => transformNode(document))
    }
    const treeData = transformDataToTreeView(documentProducts);

    const rightClickMenu = [
        {
            key: 'edit',
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <EditOutlined />
                    <span>ویرایش شاخه</span>
                </div>
            )
        }, {
            key: "delete",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <DeleteOutlined />
                    <span>حذف شاخه</span>
                </div>
            ),
            danger: true
        }, {
            key: "edition",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <PlusOutlined />
                    <span>افزودن نسخه</span>
                </div>
            ),
            danger: true
        },
    ]

    const handleRightClickAction = (actionKey, node) => {
        const documentProductId = node.id
        if (actionKey === 'delete') {
            Modal.confirm({
                title: "حذف سند",
                content: "از حذف این سند مطمئن هستید؟",
                okText: "بله ، مطمئنم",
                cancelText: "خیر ، منصرف شدم.",
                onOk() {
                    try {
                        deleteProductDocument(documentProductId)
                        message.success("سند با موفقیت حذف شد")
                        refetch()
                    } catch (error) {
                        message.error(error?.detail)
                        console.error(error);
                    }
                },
                onCancel() {
                    message.warning("عملیات حذف لغو شد")
                }
            })
        } else if (actionKey === 'edit') {
            setModal({
                mode: 'edit',
                data: {
                    title: node.title,
                    id: node.id,
                    is_reportable: node.is_reportable,
                    document: node.document,
                    survey_date: node.survey_date
                }
            })
        } else if (actionKey === 'edition') {
            setModal({
                mode: 'edition',
                data: {
                    edition: node.edition,
                    id: node.id,
                    // is_reportable: node.is_reportable,
                    // document: node.document,
                    survey_date: node.survey_date
                }
            })
        }
    }

    return (
        <>
            <Tree
                mode="tree"
                data={treeData}
                isLoading={isLoading}
                isError={isError}
                showLine={true}
                checkable={true}
                rightClickMenuItems={rightClickMenu}
                onRightClickAction={handleRightClickAction}
            />
            {
                <ProductDocumentEditionModal />
            }
        </>


    )

}

export default ProductDocumentTree
