import { DeleteOutlined, EditOutlined, EyeOutlined, FileDoneOutlined, PlusOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import { Button, message, Modal, Space } from "antd";
import {
    useDeleteProductDocument,
    useDeleteProductDocumentEdition,
    useProductDocumentTreeById
} from "../../../QueryServises/productDocumentQuery";
import { useEffect, useMemo, useState } from "react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const LOCAL_STORAGE_KEY = 'productDocumentTreeExpandedKeys';
const ProductDocumentTree = ({ currentProduct, setModal, refetch }) => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const selectedProductId = currentProduct?.id;

    const { data: productDocument, isLoading, isError } =
        useProductDocumentTreeById(selectedProductId);

    const { mutate: deleteProductDocument } = useDeleteProductDocument();
    const { mutate: deleteProductDocumentEdition } = useDeleteProductDocumentEdition();
    useEffect(() => {
        try {
            const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedKeys) {
                setExpandedKeys(JSON.parse(storedKeys));
            }
        } catch (error) {
            console.error("Failed to load expanded keys from localStorage", error);
        }
    }, []);

    const handleExpand = (keys) => {
        try {
            setExpandedKeys(keys);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
        } catch (error) {
            console.error("Failed to save expanded keys to localStorage", error);
        }
    };

    useEffect(() => {
        if (selectedProductId) refetch();
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
                        const errorMessage =
                            error?.response?.data?.detail || "عملیات حذف موفقیت آمیز نبود";
                        message.error(errorMessage);
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
            mode: "edit",
            data: { ...edition },
            type: "edition"
        });
    };

    const handleShowDetailEdition = (edition) => {
        setModal({
            mode: "add",
            data: { ...edition },
            type: "EditionDetail",
        })
    }

    const handleAutomationFiles = (edition) => {
        setModal({ mode: 'add', data: edition, type: "AutomationFiles" });
    }

    const handleDeleteProductDocument = (productDocumentId) => {
        Modal.confirm({
            title: "حذف سند",
            content: "از حذف این سند مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            onOk() {
                deleteProductDocument(productDocumentId, {
                    onSuccess: () => {
                        message.success("سند با موفقیت حذف شد");
                        refetch();
                    },
                    onError: (error) => {
                        const errorMessage =
                            error?.response?.data?.detail || "عملیات حذف موفقیت آمیز نبود";
                        message.error(errorMessage);
                    }
                });
            },
            onCancel() {
                message.warning("عملیات حذف لغو شد");
            }
        });
    };

    const handleEditDocumentProduct = (productDoc) => {
        setModal({
            mode: "edit",
            data: productDoc,
            type: "AddDocumentProduct",
        })
    }

    const transformNode = (node) => {
        const productDoc = node.product_document;
        const editions = productDoc?.edition || [];
        const hasEditions = editions.length > 0;
        const hasDocument = productDoc?.id;

        const baseNode = {
            key: `node-${node.id || productDoc.id}`, 
            title: (
                <div className="flex flex-row justify-between items-center w-full">
                    <span>
                        {productDoc?.document?.code
                            ? ` ${productDoc.title} - ${productDoc.document.code}`
                            : node.title}
                    </span>
                    {hasDocument && (
                        <Space>
                            <Button
                                size={'small'}
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProductDocument(productDoc.id);
                                }}
                                title={'حذف سند محصول'}
                                className="text-red-500 hover:text-red-700"
                            />
                            <Button
                                size={'small'}
                                type="text"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditDocumentProduct(productDoc);
                                }}
                                title={'ویرایش سند محصول'}
                                className="text-green-500 hover:text-green-700"
                            />
                        </Space>
                    )}
                </div>
            ),
            value: `node-${node.id || productDoc.id}`, 
            id: node.id,
            edition: editions,
            product_document_id: productDoc,
            is_reportable: productDoc?.is_reportable,
            document: productDoc?.document,
            survey_date: productDoc?.survey_date,
            children: []
        };

        if (hasEditions) {
            const editionNodes = editions.map((edition) => ({
                key: `edition-${edition.id}`, 
                value: `edition-${edition.id}`,
                title: (
                    <div className="flex flex-row justify-between items-center w-full">
                        <span className='w-full gap-2'>
                            {edition.edition_full} -
                            <FiberManualRecordIcon
                                fontSize="small"
                                className={
                                    edition?.state === 10 ? 'text-[#f5222d]' :
                                        edition?.state === 20 ? 'text-[#faad14]' :
                                            edition?.state === 30 ? 'text-[#52c41a]' :
                                                edition?.state === 40 ? 'text-[#722ed1]' :
                                                    'text-[#faad14]'
                                }
                            />
                            {edition.reasons_editing}
                        </span>
                        <Space>
                            <Button
                                size={'small'}
                                type="text"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEdition(edition);
                                }}
                                title={'ویرایش'}
                                className="text-green-500 hover:text-green-700"
                            />
                            <Button
                                size={'small'}
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEdition(edition.id);
                                }}
                                title={'حذف'}
                                className="text-red-500 hover:text-red-700"
                            />
                            <Button
                                size={'small'}
                                type="text"
                                icon={<FileDoneOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAutomationFiles(edition);
                                }}
                                title={'روال اسناد'}
                                className="text-purple-500 hover:text-purple-700"
                            />
                            <Button
                                size={'small'}
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowDetailEdition(edition);
                                }}
                                className="text-sky-500 hover:text-sky-700"
                            />
                        </Space>
                    </div>
                ),
                edition: edition.edition,
                id: edition.id,
                isLeaf: true
            }));
            baseNode.children.push(...editionNodes);
        }

        if (node.children?.length > 0) {
            const childNodes = node.children.map((child) => transformNode(child));
            baseNode.children.push(...childNodes);
        }

        return baseNode;
    };


    const transformDataToTreeView = (data) => {
        if (!data) return [];
        return Array.isArray(data) ? data.map(transformNode) : [transformNode(data)];
    };
const treeData = useMemo(() => {
    return transformDataToTreeView(productDocument);
}, [productDocument])

    const rightClickMenu = [
        {
            key: "edition",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <PlusOutlined />
                    <span>افزودن نسخه</span>
                </div>
            )
        }
    ];

    const handleRightClickAction = (actionKey, node) => {
        if (actionKey === "edition") {
            setModal({
                mode: "edition",
                data: {
                    edition: node.edition,
                    id: node.id,
                    survey_date: node.survey_date,
                    document_id: node.document?.id,
                    product_document_id: node.product_document_id
                },
                type: "edition"
            });
        }
    };

    return (
        <Tree
            className="custom-product-tree"
            // mode="tree"
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            showLine={true}
            checkable={false}
            showIcon={false}
            blockNode
            rightClickMenuItems={rightClickMenu}
            onRightClickAction={handleRightClickAction}
            expandedKeys={expandedKeys}
            onExpand={handleExpand}

        />
    );
};

export default ProductDocumentTree;
