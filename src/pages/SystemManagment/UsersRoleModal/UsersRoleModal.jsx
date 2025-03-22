import { Button, Form, message, Modal, Select, Spin } from "antd";
import { useRoleList } from "../../../QueryServises/roleQuery";
import { useCreateUsersRoles, usePutUsersRole } from "../../../QueryServises/user&role";
import { useUserList } from "../../../QueryServises/userQuery";

const UsersRoleModal = ({ isOpen, modalMode, modalData, closeModal, setModal }) => {
    const { isPending: isCreating, mutateAsync: createUserandRole } = useCreateUsersRoles();
    const { isPending: isUpdating, mutateAsync: updateUserandRole } = usePutUsersRole();
    const { isFetching: userFetching, data: userData } = useUserList();
    const { isFetching: roleFetching, data: roleData } = useRoleList();
    const [form] = Form.useForm();

    const selectRoleOptions = roleData ? roleData.map(user => ({
        value: user.id,
        label: user.name
    })) : [];
    const selectUserOptions = userData ? userData.map(user => ({
        value: user.id,
        label: user.username
    })) : [];

    const onFinish = async (values) => {
        const payload = {
            users_ids: values.users,
            roles_ids: values.roles,
        }
        try {
            if (modalMode === "edit") {
                await updateUserandRole({ id: modalData.id, ...payload });
                message.success("با موفقیت ویرایش شد.")
            } else {
                await createUserandRole(payload);
                message.success("با موفقیت اضافه شد.")
            }
            closeModal();
        } catch (error) {
            console.error("خطا در ارسال فرم:", error);
        }
    };

    return (
        <Modal
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"}`}
            open={isOpen}
            onCancel={closeModal}
            footer={[
                <Button key="back" onClick={closeModal}>
                    انصراف
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isCreating || isUpdating}
                    onClick={() => form.submit()}
                >
                    {modalMode === "edit" ? "به‌روزرسانی" : "تایید"}
                </Button>,
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={modalData || {}}
                className="w-full"
                layout="vertical"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {roleFetching ? (
                        <Spin size="large" className="w-full md:w-48" />
                    ) : (
                        <Form.Item
                            className="w-full md:w-48"
                            name="roles"
                            label="سمت‌ها"
                            rules={[{ required: true, message: "لطفاً سمت‌ها را انتخاب کنید" }]}
                        >
                            <Select
                                mode="multiple"
                                className="w-full"
                                options={selectRoleOptions}
                                placeholder="انتخاب سمت"
                            />
                        </Form.Item>
                    )}
                    {userFetching ? (
                        <Spin size="large" className="w-full md:w-48" />
                    ) : (
                        <Form.Item
                            className="w-full md:w-48"
                            name="users"
                            label="کاربران"
                            rules={[{ required: true, message: "لطفاً کاربران را انتخاب کنید" }]}
                        >
                            <Select
                                mode="multiple"
                                className="w-full"
                                options={selectUserOptions}
                                placeholder="انتخاب کاربران"
                            />
                        </Form.Item>
                    )}
                </div>
            </Form>
        </Modal>
    );
};

export default UsersRoleModal;