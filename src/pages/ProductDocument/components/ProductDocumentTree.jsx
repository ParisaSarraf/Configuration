import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import { Button, message, Modal, Space } from "antd";
import {
    useDeleteProductDocument,
    useDeleteProductDocumentEdition,
    useProductDocumentTreeById
} from "../../../QueryServises/productDocumentQuery";
import { useEffect } from "react";
import { checkEditionDuplicate } from "../../../Utils/checkEditionDuplicate";

const ProductDocumentTree = ({ currentProduct, setModal, refetch }) => {
    const selectedProductId = currentProduct?.productData?.id;
    const {
        data: productDocument,
        isLoading,
        isError,
    } = useProductDocumentTreeById(selectedProductId, { enabled: !!selectedProductId }
    );
    const { mutate: deleteProductDocument } = useDeleteProductDocument();
    const { mutate: deleteProductDocumentEdition } = useDeleteProductDocumentEdition();

    useEffect(() => {
        if (selectedProductId) {
            refetch();
        }
    }, [selectedProductId, refetch]);

    const handleDeleteEdition = (editionId) => {
        Modal.confirm({
            title: "حذف نسخه",
            content: "از حذف این نسخه مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            onOk() {
                deleteProductDocumentEdition(editionId, {
                    onSuccess: () => {
                        message.success("نسخه با موفقیت حذف شد");
                        refetch();
                    },
                    onError: (error) => {
                        const errorMessage = error?.response?.data?.detail || "عملیات حذف موفقیت آمیز نبود";
                        message.error(errorMessage);
                        console.error(error);
                    }
                });
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

    // const transformNode = (node) => {
    //     const hasEditions = Array.isArray(node.edition) && node.edition.length > 0;
    //     const baseNode = {
    //         key: `node-${node.id}`,
    //         title: node.title || 'بدون عنوان',
    //         id: node.id,
    //         edition: node.edition,
    //         product_document_id: node.product_document_id,
    //         is_reportable: node.is_reportable,
    //         document: node.document,
    //         survey_date: node.survey_date,
    //         children: []
    //     };
    //     if (node.children && node.children.length > 0) {
    //         baseNode.children = [
    //             ...baseNode.children,
    //             ...node.children.map(child => transformNode(child))
    //         ];
    //     }

    //     if (hasEditions) {
    //         baseNode.children = [
    //             ...baseNode.children,
    //             ...node.edition.map(edition => ({
    //                 key: `edition-${edition.id}`,
    //                 title: (
    //                     <div className="flex flex-row -mt-2 justify-between items-center w-full h-3">
    //                         <span
    //                             className="mr-8 -mt-4">{edition.edition + "-" + baseNode.product_document_id.title}</span>
    //                         <Space className="-mt-4">
    //                             <Button
    //                                 type="text"
    //                                 icon={<EditOutlined/>}
    //                                 onClick={(e) => {
    //                                     e.stopPropagation();
    //                                     handleEditEdition(edition);
    //                                 }}
    //                                 className="text-green-500 hover:text-green-700"
    //                             />
    //                             <Button
    //                                 type="text"
    //                                 icon={<DeleteOutlined/>}
    //                                 onClick={(e) => {
    //                                     e.stopPropagation();
    //                                     handleDeleteEdition(edition.id);
    //                                 }}
    //                                 className="text-red-500 hover:text-red-700"
    //                             />
    //                         </Space>
    //                     </div>
    //                 ),
    //                 edition: edition.edition,
    //                 id: edition.id,
    //                 is_reportable: node.is_reportable,
    //                 document: node.document,
    //                 survey_date: edition.survey_date,
    //                 product_document_id: edition.product_document_id || node.id,
    //                 isLeaf: true,
    //             }))
    //         ];
    //     }

    //     return baseNode;
    // };

    const transformNode = (node) => {
        const hasEditions = Array.isArray(node.edition) && node.edition.length > 0;
        const hasProductDocument = node.product_document_id && node.product_document_id.id;
        const baseNode = {
            key: `node-${node.id}`,
            title: node.title || 'بدون عنوان',
            id: node.id,
            edition: node.edition,
            product_document_id: node.product_document_id,
            is_reportable: node.is_reportable,
            document: node.document,
            survey_date: node.survey_date,
            children: []
        };
        if (node.children && node.children.length > 0) {
            baseNode.children = [
                ...baseNode.children,
                ...node.children.map(child => transformNode(child))
            ];
        }
        if (hasProductDocument) {
            const productDocNode = {
                key: `product-doc-${node.product_document_id.id}`,
                title: (
                    <div>
                        <span>{node.product_document_id.title || 'بدون عنوان'}</span>
                        {/* <Space>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProductDocument(node.product_document_id);
                                }}
                                className="text-green-500 hover:text-green-700"
                            />
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProductDocument(node.product_document_id.id);
                                }}
                                className="text-red-500 hover:text-red-700"
                            />
                        </Space> */}
                    </div>
                ),
                id: node.product_document_id.id,
                isLeaf: false,
                product_document_id: node.product_document_id
            };

            if (hasEditions) {
                productDocNode.children = node.edition.map(edition => ({
                    key: `edition-${edition.id}`,
                    title: (
                        <div >
                            <span>{edition.edition}</span>
                            <Space>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEdition(edition);
                                    }}
                                    className="text-green-500 hover:text-green-700"
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
                    isLeaf: true
                }));
            }

            baseNode.children.push(productDocNode);
        } else if (hasEditions) {
            baseNode.children = [
                ...baseNode.children,
                ...node.edition.map(edition => ({
                    key: `edition-${edition.id}`,
                    title: (
                        <div >
                            <span>{edition.edition}</span>
                            <Space>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEdition(edition);
                                    }}
                                    className="text-green-500 hover:text-green-700"
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
                        </div >
                    ),
                    edition: edition.edition,
                    id: edition.id,
                    isLeaf: true,

                }))
            ];
        }

        return baseNode;
    };


    const transformDataToTreeView = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) {
            return data.map(node => transformNode(node));
        }
        return [transformNode(data)];
    };

    const treeData = transformDataToTreeView(productDocument);

    const rightClickMenu = [
        {
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
        if (actionKey === 'edit') {
            setModal({
                mode: 'edit',
                data: {
                    title: node.title,
                    id: node.id,
                    is_reportable: node.is_reportable,
                    document: node.document,
                    survey_date: node.survey_date,
                },
                type: 'add'
            });
        } else if (actionKey === 'edition') {
            const isDuplicate = checkEditionDuplicate(treeData, node.edition);
            if (isDuplicate) {
                message.error("نسخه‌ای با این نام قبلاً ثبت شده است");
                return;
            }
            setModal({
                mode: 'edition',
                data: {
                    edition: node.edition,
                    id: node.id,
                    survey_date: node.survey_date,
                    document_id: node.document?.id,
                    product_document_id: node.product_document_id,
                },
                type: 'edition'
            });
        }
    };

    return (
        <Tree
            className={'custom-tree'}
            mode="tree"
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            treeIcon={false}
            showLine={true}
            checkable={false}
            showIcon={false}
            rightClickMenuItems={rightClickMenu}
            onRightClickAction={handleRightClickAction}
        />
    );
};

export default ProductDocumentTree;