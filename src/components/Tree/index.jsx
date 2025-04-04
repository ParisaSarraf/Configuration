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
  onNodeClick,
  showRightClickMenu = true,
  rightClickMenuItems = [
    { key: "edit", label: "ویرایش" },
    { key: "delete", label: "حذف" },
  ],
  onRightClickAction,
  onSelect = () => { },
  loadingComponent = <div className="text-center py-8">در حال بارگذاری...</div>,
  errorComponent = (
    <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>
  ),
  ...props
}) => {
  const [rightClickNode, setRightClickNode] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const handleSelect = (selectedKeys, info) => {
    onSelect(selectedKeys, info);
    if (info.selected && onNodeClick) {
      onNodeClick(info.node);
    }
  };

  const onCheck = (checkedKeys, info) => {
    onChange && onChange(checkedKeys);
  };

  const onRightClick = ({ event, node }) => {
    if (!showRightClickMenu) return;

    event.preventDefault();
    setRightClickNode(node);
    setDropdownPosition({ x: event.clientX, y: event.clientY });
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
  };

  const menu = (
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
        onSelect={handleSelect}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        {...props}
      />

      {showRightClickMenu && rightClickNode && (
        <div
          style={{
            position: 'fixed',
            left: dropdownPosition.x,
            top: dropdownPosition.y,
            visibility: 'hidden',
          }}
        >
          <Dropdown
            overlay={menu}
            open={!!rightClickNode}
            onOpenChange={(open) => !open && setRightClickNode(null)}
          >
            <span />
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default Tree;