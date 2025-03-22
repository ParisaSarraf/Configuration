import { useState, useMemo } from "react";
import { Tree, Dropdown, Menu, message } from "antd";
import {
  useDocumentList,
  useDeleteDocument,
} from "../../../QueryServises/documentQuery";
import "../../../index.css";

const { DirectoryTree } = Tree;

const DocumentTree = ({ setModal }) => {
  const { data: documentData, isFetching } = useDocumentList();
  const { mutate: deleteDocument } = useDeleteDocument();
  const [rightClickNode, setRightClickNode] = useState(null);
  const [showDropDown, setShowDropDown] = useState(false);

  const onSelect = (selectedKeys, info) => {
    console.log(info.node);
  };

  const transformDataToTreeFormat = (documentData) => {
    return documentData.map((document) => ({
      title: document.persianTitle,
      key: `document-${document.id}-${document.parentId || "root"}`,
      children: Array.isArray(document.children)
        ? document.children.map((child) => ({
          title: child.persianTitle,
          key: `document-${child.id}-${document.id}`,
          isLeaf: true,
        }))
        : [],
    }));
  };

  const onRightClick = ({ event, node }) => {
    console.log("hi");
    setRightClickNode({ ...node, x: event.pageX, y: event.pageY });
    setShowDropDown(true);
  };

  const handleMenuClick = ({ key }) => {
    if (!rightClickNode) return;

    const documentId = rightClickNode.key.split("-")[1];

    if (key === "delete") {
      deleteDocument(documentId, {
        onSuccess: () => {
          message.success("سند با موفقیت حذف شد");
        },
        onError: () => {
          message.error("حذف سند با خطا مواجه شد");
        },
      });
    } else if (key === "edit") {
      setModal({ mode: "edit", data: { ...rightClickNode } });
    }

    setRightClickNode(null);
    setShowDropDown(false);
  };

  const itemsMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="edit">Edit</Menu.Item>
      <Menu.Item key="delete">Delete</Menu.Item>
    </Menu>
  );

  const treeData = useMemo(() => {
    return documentData && transformDataToTreeFormat(documentData);
  }, [documentData]);

  return (
    <>
      <DirectoryTree
        className="custom-tree"
        onRightClick={onRightClick}
        treeData={treeData}
        showLine
        onSelect={onSelect}
        loading={isFetching}
        blockNode
      />

      {rightClickNode && showDropDown && (
        <Dropdown
          menu={{ items: [itemsMenu] }}
          visible={showDropDown}
          onVisibleChange={(visible) => setShowDropDown(visible)}
          trigger={["contextMenu"]}
        >
          <div
            style={{
              position: "absolute",
              top: rightClickNode.y,
              left: rightClickNode.x,
              width: "1px",
              height: "1px",
            }}
          />
        </Dropdown>
      )}
    </>
  );
};

export default DocumentTree;
