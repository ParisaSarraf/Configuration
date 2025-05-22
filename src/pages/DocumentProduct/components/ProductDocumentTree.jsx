import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import { useProductById } from "../../../QueryServises/productQuery";
import { Button, message, Modal, Space } from "antd";
import { useDeleteProductDocument, useDeleteProductDocumentEdition } from "../../../QueryServises/productDocumentQuery";

const ProductDocumentTree = ({ currentProduct, setModal }) => {
    const selectedProductId = currentProduct?.productData?.id;
    const { data: productDocument, isLoading, isError, refetch } = useProductById(selectedProductId);
    const { mutate: deleteProductDocument } = useDeleteProductDocument();
    const { mutate: deleteProductDocumentEdition } = useDeleteProductDocumentEdition();
    const documentProducts = productDocument?.product_documents;

    const handleDeleteEdition = (editionId) => {
        Modal.confirm({
            title: "حذف نسخه",
            content: "از حذف این نسخه مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            onOk() {
                try {
                    deleteProductDocumentEdition(editionId)
                    message.success("نسخه با موفقیت حذف شد");
                    refetch();
                } catch (error) {
                    message.error(error?.detail);
                    console.error(error);
                }
            },
            onCancel() {
                message.warning("عملیات حذف لغو شد");
            }
        });
    };

    const handleEditEdition = (edition) => {
        setModal({
            mode: 'edit',
            data: {
                edition: edition.edition,
                id: edition.id,
                survey_date: edition.survey_date,
                file_1: edition.file_1,
                file_2: edition.file_2,
                file_3: edition.file_3,
                file_4: edition.file_4,
            },
            type: 'edition'
        });
    };

    const transformDataToTreeView = (documentProducts) => {
        if (!documentProducts) return [];
        const transformNode = (node) => ({
            title: node.title || `نسخه ${node.edition}`,
            edition: node.edition,
            id: node.id,
            is_reportable: node.is_reportable,
            document: node.document,
            survey_date: node.survey_date,
            children: node.editions && node.editions.length > 0
                ? node.editions.map(edition => ({
                    title: (
                        <div className="flex flex-row -mt-2 justify-between items-center w-full h-3">
                            <span className="mr-8 -mt-4">{edition.edition}</span>
                            <Space className="-mt-4">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEdition(edition);
                                    }}
                                    className="text-green-500 hover:text-green-700 "
                                />
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEdition(edition.id);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                />
                            </Space>
                        </div>
                    ),
                    edition: edition.edition,
                    id: edition.id,
                    is_reportable: node.is_reportable,
                    document: node.document,
                    survey_date: edition.survey_date,
                    isLeaf: true
                }))
                : undefined,
        });
        const productDoc = Array.isArray(documentProducts) ? documentProducts : [documentProducts];
        return productDoc.map((document) => transformNode(document));
    };

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
            )
        },
    ];

    const handleRightClickAction = (actionKey, node) => {
        const documentProductId = node.id;
        if (actionKey === 'delete') {
            Modal.confirm({
                title: "حذف سند",
                content: "از حذف این سند مطمئن هستید؟",
                okText: "بله ، مطمئنم",
                cancelText: "خیر ، منصرف شدم.",
                onOk() {
                    try {
                        deleteProductDocument(documentProductId);
                        message.success("سند با موفقیت حذف شد");
                        refetch();
                    } catch (error) {
                        message.error(error?.detail);
                        console.error(error);
                    }
                },
                onCancel() {
                    message.warning("عملیات حذف لغو شد");
                }
            });
        } else if (actionKey === 'edit') {
            setModal({
                mode: 'edit',
                data: {
                    title: node.title,
                    id: node.id,
                    is_reportable: node.is_reportable,
                    document: node.document,
                    survey_date: node.survey_date
                },
                type: 'add'
            });
        } else if (actionKey === 'edition') {
            setModal({
                mode: 'edition',
                data: {
                    edition: node.edition,
                    id: node.id,
                    survey_date: node.survey_date,
                    document_id: node.document?.id
                },
                type: 'edition'
            });
        }
    };

    return (
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
    );
};

export default ProductDocumentTree;