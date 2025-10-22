import { Col, Form, message, Modal, Row, Select, Spin, Table } from "antd";
import { useRoleList } from "../../../QueryServises/roleQuery";
import { useCreateUsersRoles, usePutUsersRole } from "../../../QueryServises/user&role";
import { useUserList } from "../../../QueryServises/userQuery";
import { useEffect, useState } from "react";

const UserColumns = [
    {
        title: 'نام کاربری',
        dataIndex: 'label',
        key: 'label',
    },
    {
        title: 'نام کاربر',
        dataIndex: 'name',
        key: 'name',
    }, {
        title: 'نام خانوادگی',
        dataIndex: 'lastName',
        key: 'lastName',
    },
];

const UsersRoleModal = ({ isOpen, modalMode, modalData, closeModal, refetch }) => {
    const { isPending: isCreating, mutateAsync: createUserAndRole } = useCreateUsersRoles();
    const { isPending: isUpdating, mutateAsync: updateUserAndRole } = usePutUsersRole();
    const { isFetching: userFetching, data: userData } = useUserList();
    const { isFetching: roleFetching, data: roleData } = useRoleList();
    const [form] = Form.useForm();
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const selectRoleOptions = roleData?.map(role => ({
        value: role.id,
        label: role.name
    })) || [];

    const selectUserOptions = userData?.map(user => ({
        value: user.id,
        label: user.username,
        name: user.name,
        lastName : user.last_name,
        key: user.id
    })) || [];

    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            const initialUserIds = modalData?.users?.map(u => u.id) || [];
            setSelectedUserIds(initialUserIds);
            form.setFieldsValue({
                roles: modalData?.roles || modalData?.name,
                users: initialUserIds,
            });
        } else {
            setSelectedUserIds([]);
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const rowSelection = {
        selectedRowKeys: selectedUserIds,
        onChange: (selectedRowKeys) => {
            setSelectedUserIds(selectedRowKeys);
            form.setFieldsValue({ users: selectedRowKeys });
        },
        type: 'checkbox',
    };

    const onFinish = async (values) => {
        const payload = {
            users_ids: values.users || selectedUserIds,
            roles_ids: values.roles,
        };

        try {
            if (modalMode === "edit") {
                await updateUserAndRole({
                    roleId: modalData.id,
                    ...payload
                });
                message.success("با موفقیت ویرایش شد.");
            } else {
                await createUserAndRole(payload);
                message.success("با موفقیت اضافه شد.");
            }
            await refetch();
            closeModal();
        } catch (error) {
            console.error("خطا در ارسال فرم:", error);
            message.error("عملیات با خطا مواجه شد.");
        }
    };

    return (
        <Modal
            open={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سمت`}
            onCancel={closeModal}
            onOk={() => form.submit()}
            confirmLoading={isCreating || isUpdating}
            okText='ثبت'
            cancelText='لغو'
            width={800}
        >
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        {roleFetching ? (
                            <Spin />
                        ) : (
                            <Form.Item
                                name="roles"
                                label="سمت‌ها"
                                rules={[{ required: true, message: "لطفاً سمت‌ها را انتخاب کنید" }]}
                            >
                                <Select
                                    mode="multiple"
                                    options={selectRoleOptions}
                                    placeholder="انتخاب سمت"
                                />
                            </Form.Item>
                        )}
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="users"
                            label="کاربران"
                            rules={[{
                                required: true,
                                validator: (_, value) =>
                                    (value && value.length > 0) ?
                                        Promise.resolve() :
                                        Promise.reject(new Error('لطفاً حداقل یک کاربر انتخاب کنید'))
                            }]}
                        >
                            {userFetching ? (
                                <Spin />
                            ) : (
                                <Table
                                    dataSource={selectUserOptions}
                                    columns={UserColumns}
                                    rowSelection={rowSelection}
                                    rowKey="value"
                                    pagination={{
                                        defaultPageSize: 5,
                                        pageSizeOptions: [10, 20, 45,100],
                                        size: "small",
                                        showSizeChanger: true,
                                    }}
                                    size="small"
                                    bordered
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default UsersRoleModal;