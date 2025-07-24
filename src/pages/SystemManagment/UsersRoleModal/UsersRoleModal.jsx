import { Col, Form, message, Modal, Row, Select, Spin } from "antd";
import { useRoleList } from "../../../QueryServises/roleQuery";
import { useCreateUsersRoles, usePutUsersRole } from "../../../QueryServises/user&role";
import { useUserList } from "../../../QueryServises/userQuery";
import { useEffect } from "react";

const UsersRoleModal = ({ isOpen, modalMode, modalData, closeModal, refetch }) => {
    const { isPending: isCreating, mutateAsync: createUserandRole } = useCreateUsersRoles();
    const { isPending: isUpdating, mutateAsync: updateUserandRole } = usePutUsersRole();
    const { isFetching: userFetching, data: userData } = useUserList();
    const { isFetching: roleFetching, data: roleData } = useRoleList();
    const [form] = Form.useForm();

    const selectRoleOptions = roleData?.map(role => ({
        value: role.id,
        label: role.name
    })) || [];

    const selectUserOptions = userData?.map(user => ({
        value: user.id,
        label: user.username
    })) || [];

    useEffect(() => {
        console.log(modalData);
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                roles: modalData?.roles?.map(r => r.id),
                users: modalData?.users?.map(u => u.id),
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData]);

    const onFinish = async (values) => {
        const payload = {
            users_ids: values.users,
            roles_ids: values.roles,
        };
        try {
            if (modalMode === "edit") {
                await updateUserandRole({ id: modalData.id, ...payload });
                message.success("با موفقیت ویرایش شد.");
            } else {
                await createUserandRole(payload);
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
        >
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
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
                    <Col span={12}>
                        {userFetching ? (
                            <Spin />
                        ) : (
                            <Form.Item
                                name="users"
                                label="کاربران"
                                rules={[{ required: true, message: "لطفاً کاربران را انتخاب کنید" }]}
                            >
                                <Select
                                    mode="multiple"
                                    options={selectUserOptions}
                                    placeholder="انتخاب کاربران"
                                />
                            </Form.Item>
                        )}
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default UsersRoleModal;
