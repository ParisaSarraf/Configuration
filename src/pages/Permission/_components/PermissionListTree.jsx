import { Tree, Dropdown, Menu, message } from "antd";
import React, { useState, useMemo } from "react";
import { usePermissionList } from "../../../QueryServises/PermissionQuery";

const { DirectoryTree } = Tree;

const PermissionsTree = ({ onChange ,checkedKeys  }) => {
    const { data: permissions, isLoading, isError } = usePermissionList();
    const [rightClickNode, setRightClickNode] = useState(null);
    const [showDropDown, setShowDropDown] = useState(false);

    const permissionTranslations = {
        add_document: "می‌تواند سند اضافه کند",
        change_document: "می‌تواند سند را تغییر دهد",
        delete_document: "می‌تواند سند را حذف کند",
        view_document: "می‌تواند سند را مشاهده کند",
        add_logentry: "می‌تواند لاگ اضافه کند",
        change_logentry: "می‌تواند لاگ را تغییر دهد",
        delete_logentry: "می‌تواند لاگ را حذف کند",
        view_logentry: "می‌تواند لاگ را مشاهده کند",
        add_group: "می‌تواند گروه اضافه کند",
        change_group: "می‌تواند گروه را تغییر دهد",
        delete_group: "می‌تواند گروه را حذف کند",
        view_group: "می‌تواند گروه را مشاهده کند",
        add_permission: "می‌تواند دسترسی اضافه کند",
        change_permission: "می‌تواند دسترسی را تغییر دهد",
        delete_permission: "می‌تواند دسترسی را حذف کند",
        view_permission: "می‌تواند دسترسی را مشاهده کند",
        add_token: "می‌تواند توکن اضافه کند",
        change_token: "می‌تواند توکن را تغییر دهد",
        delete_token: "می‌تواند توکن را حذف کند",
        view_token: "می‌تواند توکن را مشاهده کند",
        add_tokenproxy: "می‌تواند توکن پروکسی اضافه کند",
        change_tokenproxy: "می‌تواند توکن پروکسی را تغییر دهد",
        delete_tokenproxy: "می‌تواند توکن پروکسی را حذف کند",
        view_tokenproxy: "می‌تواند توکن پروکسی را مشاهده کند",
        add_contenttype: "می‌تواند نوع محتوا اضافه کند",
        change_contenttype: "می‌تواند نوع محتوا را تغییر دهد",
        delete_contenttype: "می‌تواند نوع محتوا را حذف کند",
        view_contenttype: "می‌تواند نوع محتوا را مشاهده کند",
        add_session: "می‌تواند session اضافه کند",
        change_session: "می‌تواند session را تغییر دهد",
        delete_session: "می‌تواند session را حذف کند",
        view_session: "می‌تواند session را مشاهده کند",
        add_profile: "می‌تواند پروفایل اضافه کند",
        change_profile: "می‌تواند پروفایل را تغییر دهد",
        delete_profile: "می‌تواند پروفایل را حذف کند",
        view_profile: "می‌تواند پروفایل را مشاهده کند",
        add_request: "می‌تواند درخواست اضافه کند",
        change_request: "می‌تواند درخواست را تغییر دهد",
        delete_request: "می‌تواند درخواست را حذف کند",
        view_request: "می‌تواند درخواست را مشاهده کند",
        add_response: "می‌تواند پاسخ اضافه کند",
        change_response: "می‌تواند پاسخ را تغییر دهد",
        delete_response: "می‌تواند پاسخ را حذف کند",
        view_response: "می‌تواند پاسخ را مشاهده کند",
        add_sqlquery: "می‌تواند کوئری SQL اضافه کند",
        change_sqlquery: "می‌تواند کوئری SQL را تغییر دهد",
        delete_sqlquery: "می‌تواند کوئری SQL را حذف کند",
        view_sqlquery: "می‌تواند کوئری SQL را مشاهده کند",
        add_blacklistedtoken: "می‌تواند توکن مسدود شده اضافه کند",
        change_blacklistedtoken: "می‌تواند توکن مسدود شده را تغییر دهد",
        delete_blacklistedtoken: "می‌تواند توکن مسدود شده را حذف کند",
        view_blacklistedtoken: "می‌تواند توکن مسدود شده را مشاهده کند",
        add_outstandingtoken: "می‌تواند توکن outstanding اضافه کند",
        change_outstandingtoken: "می‌تواند توکن outstanding را تغییر دهد",
        delete_outstandingtoken: "می‌تواند توکن outstanding را حذف کند",
        view_outstandingtoken: "می‌تواند توکن outstanding را مشاهده کند",
        add_configurationusermodel: "می‌تواند مدل کاربر پیکربندی اضافه کند",
        change_configurationusermodel: "می‌تواند مدل کاربر پیکربندی را تغییر دهد",
        delete_configurationusermodel: "می‌تواند مدل کاربر پیکربندی را حذف کند",
        view_configurationusermodel: "می‌تواند مدل کاربر پیکربندی را مشاهده کند",
    };

    const transformDataToTreeFormat = (permissions) => {
        return permissions.map((permission) => ({
            title: permissionTranslations[permission.codename] || permission.name,
            key: `permission-${permission.id}`,

        }));
    };

    const onSelect = (selectedKeys, info) => {
        console.log(info.node);
    };

    const onCheck = (checkedKeys, info) => {
        onChange(checkedKeys);
    }


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
        return permissions && transformDataToTreeFormat(permissions);
    }, [permissions]);

    if (isLoading) return <div className="text-center py-8">در حال بارگذاری...</div>;
    if (isError) return <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>;

    return (
        <div >
            <DirectoryTree
                onRightClick={onRightClick}
                treeData={treeData}
                showLine
                checkable
                onSelect={onSelect}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
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
};

export default PermissionsTree;