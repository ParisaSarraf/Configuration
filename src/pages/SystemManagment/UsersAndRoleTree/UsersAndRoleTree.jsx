import { useMemo, useState } from "react";
import { usePutUsersRole, useUsersRoleList } from "../../../QueryServises/user&role";
import { Tree, Dropdown, Menu, Modal, Form, message, Button, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { DirectoryTree } = Tree;

const UsersAndRoleTree = () => {
    const { data: usersAndroles, isLoading, isError, refetch } = useUsersRoleList();
    const { mutate: updateUserRole, isLoading: isUpdating } = usePutUsersRole();
    const [selectedNode, setSelectedNode] = useState(null);
    const [isUserListModalVisible, setIsUserListModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [form] = Form.useForm();
    const [selectedUsers, setSelectedUsers] = useState([]);

    const transformDataToTreeFormat = (roles) => {
        return roles?.map((role) => ({
            title: role.name,
            key: `role-${role.id}`,
            children: role.users?.map((user) => ({
                title: `${user.name} ${user.last_name}`,
                key: `role-${role.id}-user-${user.id}`,
                isLeaf: true,
                userData: user,
            })) || [],
        })) || [];
    };

    const treeData = useMemo(() => transformDataToTreeFormat(usersAndroles), [usersAndroles]);

    const handleEdit = (node) => {
        if (node.userData) {
            setSelectedNode(node);
            form.setFieldsValue({
                name: node.userData.name,
                last_name: node.userData.last_name,
            });
            setIsEditModalVisible(true);
        }
    };

    const handleShowUserList = (role) => {
        setSelectedRole(role);
        setSelectedUsers(role.children.map(user => user.userData.id));
        setIsUserListModalVisible(true);
    };

    const handleAddRemoveUsers = async () => {
        if (!selectedRole) return;

        const roleId = Number(selectedRole.key.split('-')[1]);
        const payload = {
            role_id: roleId,
            users_ids: selectedUsers
        };

        updateUserRole(payload, {
            onSuccess: () => {
                message.success("تغییرات با موفقیت ذخیره شد");
                refetch();
                setIsUserListModalVisible(false);
            },
            onError: () => {
                message.error("خطا در ذخیره تغییرات");
            }
        });
    };

    const contextMenu = (node) => {
        if (node.userData) {
            return (
                <Menu>
                    <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(node)}>
                        ویرایش
                    </Menu.Item>
                </Menu>
            );
        }
        return null;
    };

    const renderTitle = (node) => (
        <Dropdown menu={contextMenu(node)} trigger={["contextMenu"]}>
            <span onDoubleClick={() => !node.isLeaf && handleShowUserList(node)}>
                {node.title}
            </span>
        </Dropdown>
    );

    const updatedTreeData = useMemo(() => (
        treeData.map((role) => ({
            ...role,
            title: renderTitle(role),
            children: role.children.map((user) => ({
                ...user,
                title: renderTitle(user),
            })),
        }))
    ), [treeData]);

    if (isLoading) return <div className="text-center py-8">در حال بارگذاری...</div>;
    if (isError) return <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>;

    return (
        <div>
            <DirectoryTree
                className="custom-tree"
                treeData={updatedTreeData}
                showLine
                blockNode={false}
            />

            <Modal
                title={`لیست کاربران ${selectedRole?.title || ''}`}
                open={isUserListModalVisible}
                onCancel={() => setIsUserListModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsUserListModalVisible(false)}>
                        انصراف
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isUpdating}
                        onClick={handleAddRemoveUsers}
                    >
                        ذخیره تغییرات
                    </Button>,
                ]}
                width={800}
            >
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="انتخاب کاربران"
                    value={selectedUsers}
                    onChange={setSelectedUsers}
                    options={selectedRole?.children?.map(user => ({
                        value: user.userData.id,
                        label: `${user.userData.name} ${user.userData.last_name}`,
                    })) || []}
                />
            </Modal>
        </div>
    );
};

export default UsersAndRoleTree;