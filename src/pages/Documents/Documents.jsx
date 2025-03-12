import React, { useState } from "react";
import { CarryOutOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { Tree, Popover, Button } from "antd";
import { useDocumentList } from "../../QueryServises/documentQuery";

const Documents = () => {
  const { data: apiData, isFetching } = useDocumentList();

  const [expandedKeys, setExpandedKeys] = useState([]);
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(false);
  const [showLeafIcon, setShowLeafIcon] = useState(false);

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);

  const onSelect = (selectedKeys, info) => {
    console.log(info.node.pos);
  };

  const transformDataToTreeFormat = (data) => {
    const processedIds = new Set();
    const buildTree = (items) => {
      return items
        .filter((item) => {
          if (processedIds.has(item.id)) {
            return false;
          }
          processedIds.add(item.id);
          return true;
        })
        .map((item) => ({
          title: item.persianTitle,
          key: item.id.toString(),
          icon: <CarryOutOutlined />,
          children: item.children > 0 ? buildTree(item.children) : [],
        }));
    };

    return buildTree(data);
  };

  const treeData = apiData ? transformDataToTreeFormat(apiData) : [];

  const treeNodeonRightClick = ({ event, node }) => {
    event.preventDefault();
    setPopoverPosition({ x: event.clientX, y: event.clientY });
    setSelectedNode(node);
    setPopoverVisible(true);
  };

  const handleMenuClick = (action) => {
    console.log(`Action: ${action} on Node: ${selectedNode?.title}`);
    setPopoverVisible(false);
  };

  return (
    <div className="card" style={{ position: "relative" }}>
      <Tree
        onRightClick={treeNodeonRightClick}
        showLine={showLine ? { showLeafIcon } : false}
        showIcon={showIcon}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
        onSelect={onSelect}
        treeData={treeData}
        loading={isFetching}
      />
      {popoverVisible && (
        <Popover
          content={
            <div>
              <Button type="text" onClick={() => handleMenuClick("Edit")}>
                ویرایش
              </Button>
              <Button type="text" onClick={() => handleMenuClick("Delete")}>
                حذف
              </Button>
            </div>
          }
          open={popoverVisible}
          trigger="click"
          placement="rightTop"
        >
          <div
            style={{
              position: "absolute",
              top: popoverPosition.y,
              left: popoverPosition.x,
              width: 0,
              height: 0,
            }}
          />
        </Popover>
      )}
    </div>
  );
};

export default Documents;
