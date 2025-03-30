import { message, Modal } from "antd";
import {
  useDocumentList,
  useDeleteDocument,
} from "../../../QueryServises/documentQuery";
import "../../../index.css";
import Tree from "../../../components/Tree";

const DocumentTree = ({ setModal }) => {
  const { data: documentData, isFetching, refetch } = useDocumentList();
  const { mutate: deleteDocument } = useDeleteDocument();

  const transformDataToTreeFormat = (documentData) => {
    if (!documentData) return [];
    return documentData.map((document) => ({
      title: document.persianTitle,
      key: `document-${document.id}-${document.parentId || "root"}`,
      id: document.id,
      children: Array.isArray(document.children)
        ? document.children.map((child) => ({
          title: child.persianTitle,
          key: `document-${child.id}-${document.id}`,
          id: child.id,
          isLeaf: true,
        }))
        : [],
    }));
  };

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
              onError: () => {
                message.error("حذف سند با خطا مواجه شد");
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
      setModal({ mode: "edit", data: { ...node } });
    }
  };

  return (
    <Tree
      className="custom-tree"
      data={documentData}
      isLoading={isFetching}
      titleField="persianTitle"
      transformData={transformDataToTreeFormat}
      showLine
      blockNode
      showRightClickMenu={true}
      rightClickMenuItems={[
        { key: "edit", label: "ویرایش" },
        { key: "delete", label: "حذف", danger: true },
      ]}
      onRightClickAction={handleRightClickAction}
    />
  );
};

export default DocumentTree;