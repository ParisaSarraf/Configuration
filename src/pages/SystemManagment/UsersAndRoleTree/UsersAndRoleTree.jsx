import { useMemo, useState } from "react";
import { usePutUsersRole, useUsersRoleList } from "../../../QueryServises/user&role";
import { Tree, Dropdown, Menu, Modal, Form, message, Button, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { DirectoryTree } = Tree;

const UsersAndRoleTree = () => {
    const { data: usersAndroles, isLoading, isError, refetch } = useUsersRoleList();
    const { mutate: updateUserRole } = usePutUsersRole();
    const [selectedNode, setSelectedNode] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isUserListModalVisible, setIsUserListModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [form] = Form.useForm();
    const [selectedUsers, setSelectedUsers] = useState([]);

    const transformDataToTreeFormat = (roles) => {
        return roles.map((role) => ({
            title: role.name,
            key: `role-${role.id}`,
            children: role.users.map((user) => ({
                title: `${user.name} ${user.last_name}`,
                key: `role-${role.id}-user-${user.id}`,
                isLeaf: true,
                userData: user,
            })),
        }));
    };

    const treeData = useMemo(() => {
        return usersAndroles ? transformDataToTreeFormat(usersAndroles) : [];
    }, [usersAndroles]);

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
        const roleId = Number(selectedRole.key.split('-')[1]);
        const payload = {
            role_id: roleId,
            users_ids: selectedUsers
        };
        try {
            updateUserRole(payload)
            message.success("با موفقیت اضافه شد.")
        } catch (error) {
            console.error(error)
            message.error("خطا در اعتبارسنجی فرم!");
        }
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

    const updatedTreeData = useMemo(() => {
        if (!treeData) return [];
        return treeData.map((role) => ({
            ...role,
            title: renderTitle(role),
            children: role.children.map((user) => ({
                ...user,
                title: renderTitle(user),
            })),
        }));
    }, [treeData]);

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
                title={`لیست کاربران ${selectedRole ? selectedRole.title : ''}`}
                open={isUserListModalVisible}
                onCancel={() => setIsUserListModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsUserListModalVisible(false)}>
                        انصراف
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleAddRemoveUsers}
                    >
                        ذخیره تغییرات
                    </Button>,
                ]}
                width={800}
            >
                {selectedRole && (
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="انتخاب کاربران"
                        value={selectedUsers}
                        onChange={setSelectedUsers}
                        options={selectedRole.children.map(user => ({
                            value: user.userData.id,
                            label: `${user.userData.name} ${user.userData.last_name}`,
                        }))}
                    />
                )}
            </Modal>
        </div>
    );
};

export default UsersAndRoleTree;