import React, { useState, useMemo } from "react";
import { Tree as AntTree, Dropdown, Menu, message, TreeSelect } from "antd";
import { DownOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';

const { DirectoryTree } = AntTree;

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
  className,
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
  mode = "tree",
  showSearch = true,
  allowClear = true,
  placeholder = "لطفا انتخاب کنید",
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

  const transformData = (data, level = 0) => {
    if (!data) return [];

    return data.map((item) => ({
      title: item[titleField],
      label: (
        <div style={{ paddingLeft: `${level * 16}px`, display: 'flex', alignItems: 'center' }}>
          {item[childrenField]?.length > 0 ? (
            <FolderOutlined style={{ marginLeft: 8 }} />
          ) : (
            <FileOutlined style={{ marginLeft: 8 }} />
          )}
          <span style={{ marginRight: 4 }}>
            {item[titleField]}
          </span>
        </div>
      ),
      value: item[keyField],
      key: item[keyField],
      children: item[childrenField] ? transformData(item[childrenField], level + 1) : undefined,
      ...item,
    }));
  };

  const treeData = useMemo(() => {
    return data && transformData(data);
  }, [data]);

  if (isLoading) return loadingComponent;
  if (isError) return errorComponent;

  if (mode === "select") {
    return (
      <TreeSelect
        treeData={treeData}
        placeholder={placeholder}
        treeDefaultExpandAll
        showSearch={showSearch}
        allowClear={allowClear}
        style={{ width: '100%' }}
        dropdownStyle={{
          maxHeight: 400,
          overflow: 'auto',
          padding: '8px 0'
        }}
        treeNodeLabelProp="label"
        treeLine={{
          showLeafIcon: false
        }}
        switcherIcon={<DownOutlined />}
        onChange={(value) => onChange && onChange(value)}
        {...props}
      />
    );
  }

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
        className={className}
       
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