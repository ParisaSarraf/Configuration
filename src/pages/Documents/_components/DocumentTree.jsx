import { useState, useMemo } from "react";
import { Tree, Dropdown, Menu } from "antd";
import { useDocumentList } from "../../../QueryServises/documentQuery";
const { DirectoryTree } = Tree;
import "../../../index.css"

const DocumentTree = () => {
  const { data: documentData, isFetching } = useDocumentList();
  const [rightClickNode, setRightClickNode] = useState(null);

  const onSelect = (selectedKeys, info) => {
    console.log(info.node);
  };

  const transformDataToTreeFormat = (documentData) => {
    return documentData.map((document) => ({
      title: document.persianTitle,
      key: `document-${document.id}-${document.parentId || "root"}`,
      children: Array.isArray(document.children)
        ? document.children.map((children) => ({
            title: children.persianTitle,
            key: `document-${children.id}-${document.id}`,
            isLeaf: true,
          }))
        : [],
    }));
  };

  const onRightClick = ({ node }) => {
    setRightClickNode(node);
  };

  const handleMenuClick = (key) => {
    if (rightClickNode) {
      console.log(`Action: ${key}, Node:`, rightClickNode);
    } else {
      console.warn("No node selected");
    }
    setRightClickNode(null);
  };

  const treeData = useMemo(() => {
    return documentData && transformDataToTreeFormat(documentData);
  }, [documentData]);

  return (
    <Dropdown
      menu={{
        items: [
          { key: "delete", label: "حذف" },
          { key: "edit", label: "ویرایش" },
        ],
        onClick: ({ key }) => handleMenuClick(key),
      }}
      trigger={["contextMenu"]}
      open={!!rightClickNode}
      onOpenChange={(open) => setRightClickNode(open ? node : null)}
    >
      <DirectoryTree
        className="custom-tree"
        onRightClick={onRightClick}
        treeData={treeData}
        showLine
        onSelect={onSelect}
        loading={isFetching}
        blockNode
      />
    </Dropdown>
  );
};

export default DocumentTree;
