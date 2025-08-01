import {DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined} from "@ant-design/icons";
import Tree from "../../../components/Tree";
import {Button, message, Modal, Space} from "antd";
import {
    useDeleteProductDocument,
    useDeleteProductDocumentEdition,
    useProductDocumentTreeById
} from "../../../QueryServises/productDocumentQuery";
import {useEffect} from "react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const ProductDocumentTree = ({currentProduct, setModal, refetch}) => {
    const selectedProductId = currentProduct?.productData?.id;


    const {data: productDocument, isLoading, isError} =
        useProductDocumentTreeById(selectedProductId, {enabled: !!selectedProductId});

    const {mutate: deleteProductDocument} = useDeleteProductDocument();
    const {mutate: deleteProductDocumentEdition} = useDeleteProductDocumentEdition();

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
        console.log(edition);
        setModal({
            mode: "edit",
            data: {...edition},
            type: "edition"
        });
    };

    const handleShowDetailEdition = (edition) => {
        setModal({
            mode: "add",
            data: {...edition},
            type: "EditionDetail",
        })
    }

    const transformNode = (node) => {
        const productDoc = node.product_document;
        const editions = productDoc?.edition || [];
        const hasEditions = editions.length > 0;

        const baseNode = {
            key: `node-${Math.random()}`,
            title: (
                <div>
                    {productDoc?.document?.code
                        ? ` ${productDoc.title} - ${productDoc.document.code}`
                        : node.title}
                </div>
            ),
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
                title: (
                    <div className="flex flex-row justify-between items-center w-full">
                        <span className='w-fuull gap-2'>
                            {edition.edition_full}
                            <FiberManualRecordIcon
                                fontSize="small"
                                // color={
                                //     item.status === 'active' ? 'success' :
                                //         item.status === 'inactive' ? 'error' :
                                //             'warning'
                                // }
                            />
                        </span>
                        <Space>
                            <Button
                                size={'small'}
                                type="text"
                                icon={<EditOutlined/>}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEdition(edition);
                                }}
                                className="text-green-500 hover:text-green-700"
                            />
                            <Button
                                size={'small'}
                                type="text"
                                icon={<DeleteOutlined/>}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEdition(edition.id);
                                }}
                                className="text-red-500 hover:text-red-700"
                            />
                            <Button
                                size={'small'}
                                type="text"
                                icon={<EyeOutlined/>}
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

    const treeData = transformDataToTreeView(productDocument);

    const rightClickMenu = [
        {
            key: "edition",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <PlusOutlined/>
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
            className="custom-tree"
            mode="tree"
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            treeIcon={false}
            showLine
            checkable={false}
            showIcon={false}
            rightClickMenuItems={rightClickMenu}
            onRightClickAction={handleRightClickAction}
        />
    );
};

export default ProductDocumentTree;
