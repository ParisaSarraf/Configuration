import { Tree as TR, Dropdown, Menu, message } from "antd";
import React, { useState, useMemo } from "react";

const { DirectoryTree } = TR;

const Tree = ({
  data,
  isLoading,
  isError,
  onChange,
  checkedKeys,
  titleField = "title",
  keyField = "key",
  childrenField = "children",
  showLine = true,
  checkable = true,
  showRightClickMenu = true,
  rightClickMenuItems = [
    { key: "edit", label: "ویرایش" },
    { key: "delete", label: "حذف" },
  ],
  onRightClickAction,
  loadingComponent = <div className="text-center py-8">در حال بارگذاری...</div>,
  errorComponent = (
    <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>
  ),
  ...props
}) => {
  const [rightClickNode, setRightClickNode] = useState(null);
  const [showDropDown, setShowDropDown] = useState(false);

  const onSelect = (selectedKeys, info) => {
    if (props.onSelect) {
      props.onSelect(selectedKeys, info);
    } else {
      console.log(info.node);
    }
  };

  const onCheck = (checkedKeys, info) => {
    onChange && onChange(checkedKeys);
  };

  const onRightClick = ({ event, node }) => {
    if (!showRightClickMenu) return;

    setRightClickNode({ ...node, x: event.pageX, y: event.pageY });
    setShowDropDown(true);
  };

  const handleMenuClick = ({ key }) => {
    if (!rightClickNode) return;

    if (onRightClickAction) {
      onRightClickAction(key, rightClickNode);
    } else {
      if (key === "edit") {
        message.info(`ویرایش: ${rightClickNode.title}`);
      } else if (key === "delete") {
        message.success(`حذف: ${rightClickNode.title}`);
      }
    }

    setRightClickNode(null);
    setShowDropDown(false);
  };

  const itemsMenu = (
    <Menu onClick={handleMenuClick}>
      {rightClickMenuItems.map((item) => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );

  const transformData = (data) => {
    if (!data) return [];
    
    return data.map((item) => ({
      title: item[titleField],
      key: item[keyField],
      children: item[childrenField] ? transformData(item[childrenField]) : undefined,
      ...item,
    }));
  };

  const treeData = useMemo(() => {
    return data && transformData(data);
  }, [data]);

  if (isLoading) return loadingComponent;
  if (isError) return errorComponent;

  return (
    <div>
      <DirectoryTree
        onRightClick={showRightClickMenu ? onRightClick : undefined}
        treeData={treeData}
        showLine={showLine}
        checkable={checkable}
        onSelect={onSelect}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        {...props}
      />

      {showRightClickMenu && rightClickNode && showDropDown && (
        <Dropdown
          menu={{ items: [itemsMenu] }}
          open={showDropDown}
          onOpenChange={(visible) => setShowDropDown(visible)}
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
    </div>
  );
};

export default Tree;