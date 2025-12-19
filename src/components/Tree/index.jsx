import { useState, useMemo, useCallback } from "react";
import { Dropdown, message, Tree as AntTree, TreeSelect, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";

const Tree = ({
  data,
  isLoading,
  isError,
  onChange, // برای checkable و mode="select"
  checkedKeys,
  titleField = "title",
  keyField = "key",
  childrenField = "children",
  showLine = true,
  checkable = true,
  className,
  onNodeClick,
  loadData, // تابع جدید برای لود کردن داده‌های فرزندان
  showRightClickMenu = true,
  rightClickMenuItems = [
    { key: "edit", label: "ویرایش" },
    { key: "delete", label: "حذف" },
  ],
  onRightClickAction,
  onSelect = () => {},
  loadingComponent = <div className="text-center py-8">در حال بارگذاری...</div>,
  errorComponent = (
    <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>
  ),
  mode = "tree", // "tree" | "select"
  showSearch = true,
  allowClear = true,
  placeholder = "لطفا انتخاب کنید",
  expandedKeys: controlledExpandedKeys,
  defaultExpandedKeys,
  onExpand,
  ...props
}) => {
  const [rightClickNode, setRightClickNode] = useState(null);
  const [internalExpandedKeys, setInternalExpandedKeys] = useState(
    defaultExpandedKeys || []
  );
  
  const isExpandedControlled = controlledExpandedKeys !== undefined;
  const currentExpandedKeys = isExpandedControlled
    ? controlledExpandedKeys
    : internalExpandedKeys;

  const handleExpand = useCallback(
    (keys) => {
      if (!isExpandedControlled) {
        setInternalExpandedKeys(keys);
      }
      if (onExpand) {
        onExpand(keys);
      }
    },
    [isExpandedControlled, onExpand]
  );

  const handleLoadData = useCallback(
    async (node) => {
      if (loadData) {
        try {
          // اضافه کردن آیکون لودینگ
          node.isLoading = true;
          await loadData(node);
          node.isLoading = false;
        } catch (error) {
          console.error("Error loading node children:", error);
          node.isLoading = false;
        }
      }
    },
    [loadData]
  );

  const handleSelect = useCallback(
    (selectedKeys, info) => {
      onSelect(selectedKeys, info);
      if (info.selected && onNodeClick) {
        onNodeClick(info.node);
      }
    },
    [onSelect, onNodeClick]
  );

  const handleCheck = useCallback(
    (checkedKeys, info) => {
      if (onChange) {
        onChange(checkedKeys, info);
      }
    },
    [onChange]
  );

  const handleRightClick = useCallback(
    ({ event, node }) => {
      if (!showRightClickMenu) return;
      event.preventDefault();
      setRightClickNode(node);
    },
    [showRightClickMenu]
  );

  const handleMenuClick = useCallback(
    ({ key }) => {
      if (!rightClickNode) return;

      if (onRightClickAction) {
        onRightClickAction(key, rightClickNode);
      } else {
        if (key === "edit") {
          message.info(`ویرایش: ${rightClickNode[titleField]}`);
        } else if (key === "delete") {
          message.success(`حذف: ${rightClickNode[titleField]}`);
        }
      }
      setRightClickNode(null);
    },
    [onRightClickAction, rightClickNode, titleField]
  );

  const treeData = useMemo(() => {
    const transform = (dataList) => {
      if (!dataList || dataList.length === 0) return [];

      return dataList.map((item) => ({
        title: item[titleField],
        value: item[keyField],
        key: item[keyField],
        label: item[titleField],
        ...item,
        children: item[childrenField]
          ? transform(item[childrenField])
          : (item.hasChildren ? [] : undefined), 
        isLeaf: !item.hasChildren, 
      }));
    };
    return data ? transform(data) : [];
  }, [data, titleField, keyField, childrenField]);

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
        style={{ width: "100%" }}
        dropdownStyle={{
          maxHeight: 400,
          overflow: "auto",
          padding: "8px 0",
        }}
        className={className}
        treeNodeLabelProp="label"
        treeLine={showLine ? { showLeafIcon: false } : false}
        switcherIcon={<DownOutlined />}
        onChange={onChange}
        {...props}
      />
    );
  }

  return (
    <Dropdown
      menu={{ items: rightClickMenuItems, onClick: handleMenuClick }}
      open={!!rightClickNode}
      trigger={["contextMenu"]}
      onOpenChange={(open) => {
        if (!open) {
          setRightClickNode(null);
        }
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <AntTree
          expandAction="switcher"
          onRightClick={showRightClickMenu ? handleRightClick : undefined}
          treeData={treeData}
          showLine={showLine}
          checkable={checkable}
          onSelect={handleSelect}
          onCheck={handleCheck}
          onExpand={handleExpand}
          expandedKeys={currentExpandedKeys}
          checkedKeys={checkedKeys}
          loadData={loadData ? handleLoadData : undefined}
          className={className}
          {...props}
        />
      </div>
    </Dropdown>
  );
};

export default Tree;