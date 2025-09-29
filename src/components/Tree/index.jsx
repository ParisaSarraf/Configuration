import {useMemo, useState} from "react";
import {Dropdown, Menu, message, Tree as AntTree, TreeSelect} from "antd";
import {DownOutlined} from '@ant-design/icons';

const {DirectoryTree} = AntTree;

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
                  loadData,
                  showRightClickMenu = true,
                  rightClickMenuItems = [
                      {key: "edit", label: "ویرایش"},
                      {key: "delete", label: "حذف"},
                  ],
                  onRightClickAction,
                  onSelect = () => {
                  },
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
    const [dropdownPosition, setDropdownPosition] = useState({x: 0, y: 0});
    const [expandedKeys, setExpandedKeys] = useState([]); // اضافه کردن state برای expanded keys

    const handleSelect = (selectedKeys, info) => {
        onSelect(selectedKeys, info);
        if (info.selected && onNodeClick) {
            onNodeClick(info.node);
        }
    };

    const onCheck = (checkedKeys, info) => {
        onChange && onChange(checkedKeys);
    };

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
    };

    const onRightClick = ({event, node}) => {
        if (!showRightClickMenu) return;

        event.preventDefault();
        setRightClickNode(node);
        setDropdownPosition({x: event.clientX, y: event.clientY});
    };

    const handleMenuClick = ({key}) => {
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

    const handleCloseContextMenu = (e) => {
        if (!e.target.closest('.ant-tree-node-content-wrapper') &&
            !e.target.closest('.ant-tree-switcher')) {
            setRightClickNode(null);
        }
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
                <div>
                    {item[titleField]}
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
                style={{width: '100%'}}
                dropdownStyle={{
                    maxHeight: 400,
                    overflow: 'auto',
                    padding: '8px 0'
                }}
                className={className}
                treeNodeLabelProp="label"
                treeLine={{
                    showLeafIcon: false
                }}
                switcherIcon={<DownOutlined/>}
                onChange={(value) => onChange && onChange(value)}
                {...props}
            />
        );
    }

    return (
        <div onClick={handleCloseContextMenu} style={{width: '100%', height: '100%'}}>
            <Dropdown
                overlay={menu}
                open={!!rightClickNode}
                trigger={['contextMenu']}
                onOpenChange={(open) => {
                    if (!open) {
                        setRightClickNode(null);
                    }
                }}
            >
                <div style={{width: '100%', height: '100%'}}>
                    <DirectoryTree
                        onRightClick={showRightClickMenu ? onRightClick : undefined}
                        treeData={treeData}
                        showLine={showLine}
                        checkable={checkable}
                        onSelect={handleSelect}
                        onCheck={onCheck}
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        checkedKeys={checkedKeys}
                        {...props}
                        loadData={loadData}
                        className={className}
                    />
                </div>
            </Dropdown>
        </div>
    );
};

export default Tree;