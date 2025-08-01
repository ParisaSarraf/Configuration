import {message, Modal} from "antd";
import {
    useDocumentList,
    useDeleteDocument,
} from "../../../QueryServises/documentQuery";
import "../../../index.css";
import Tree from "../../../components/Tree";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

const DocumentTree = ({setModal}) => {
    const {data: documentData, isFetching, refetch} = useDocumentList();
    const {mutate: deleteDocument} = useDeleteDocument();

    const transformDataToTreeFormat = (documentData) => {
        if (!documentData) return [];

        const transformNode = (node) => ({
            // title: `${node.persianTitle} (${node.code})   `,
            title: node.persianTitle,
            key: `document-${node.id}`,
            id: node.id,
            tag: node.tag,
            code: node.code,
            log: node.log,
            englishTitle: node.englishTitle,
            isUsable: node.isUsable,
            isReproducible: node.isReproducible,
            parent: node.parent,
            children: Array.isArray(node.children)
                ? node.children.map(child => transformNode(child))
                : [],
            isLeaf: node.children?.length === 0
        });

        const documents = Array.isArray(documentData) ? documentData : [documentData];
        return documents.map(document => transformNode(document));
    };

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
    ];

    const handleRightClickAction = (actionKey, node) => {
        const documentId = node.id;


        if (actionKey === "delete") {
            Modal.confirm({
                title: 'حذف سند',
                content: 'آیا از حذف این سند مطمئن هستید؟',
                okText: 'بله',
                cancelText: 'خیر',
                okType: 'danger',
                onOk() {
                    return new Promise((resolve, reject) => {
                        deleteDocument(documentId, {
                            onSuccess: () => {
                                message.success("سند با موفقیت حذف شد");
                                refetch();
                                resolve();
                            },
                            onError: (error) => {
                                if (error?.response?.data?.detail === "this document has children") {
                                    message.error("این سند دارای زیرسند است");
                                } else {
                                    message.error("حذف سند با خطا مواجه شد");
                                }
                                reject();
                            }
                        });
                    });
                },
                onCancel() {
                    console.log('حذف لغو شد');
                },
            });
        } else if (actionKey === "edit") {
            setModal({
                mode: "edit",
                id: node.id,
                data: node,
                log: node.log,
                parent: node.parent_id
            });
        }
    };

    const treeData = transformDataToTreeFormat(documentData);


    return (
        <Tree
            mode="tree"
            data={treeData}
            isLoading={isFetching}
            isError={isFetching}
            showLine={true}
            checkable={false}
            rightClickMenuItems={rightClickMenuItems}
            onRightClickAction={handleRightClickAction}
        />

    );
};

export default DocumentTree;
