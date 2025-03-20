import { Tree, Dropdown, Menu, message } from "antd";
import React, { useState, useMemo } from "react";
import { useRoleList } from '../../../QueryServises/roleQuery';


const { DirectoryTree } = Tree;

const RoleListTree = () => {
    const { data: roles, isLoading, isError } = useRoleList();
    const [rightClickNode, setRightClickNode] = useState(null);
    const [showDropDown, setShowDropDown] = useState(false);

    const transformDataToTreeFormat = (roles) => {
        return roles.map((role) => ({
            title: role.name,
            key: `role-${role.id}`,
        }));
    };

    const onRightClick = ({ event, node }) => {
        setRightClickNode({ ...node, x: event.pageX, y: event.pageY });
        setShowDropDown(true);
    };

    const handleMenuClick = ({ key }) => {
        if (!rightClickNode) return;

        if (key === "edit") {
            message.info(`ویرایش: ${rightClickNode.title}`);
        } else if (key === "delete") {
            message.success(`حذف: ${rightClickNode.title}`);
        }

        setRightClickNode(null);
        setShowDropDown(false);
    };

    const itemsMenu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="edit">ویرایش</Menu.Item>
            <Menu.Item key="delete">حذف</Menu.Item>
        </Menu>
    );

    const treeData = useMemo(() => {
        return roles && transformDataToTreeFormat(roles);
    }, [roles]);

    if (isLoading) return <div className="text-center py-8">در حال بارگذاری...</div>;
    if (isError) return <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>;


    return (
        <div >
            <DirectoryTree
                // className="custom-tree"
                onRightClick={onRightClick}
                treeData={treeData}
                showLine
                checkable
            />

            {rightClickNode && showDropDown && (
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
}

export default RoleListTree
