import { Form, Select, Transfer, message } from 'antd';
import Modal from '../../../components/Modal';
import { useRoleList } from '../../../QueryServises/roleQuery';
import { usePermissionList } from '../../../QueryServises/PermissionQuery';
import { useEffect, useState } from 'react';
import { useCreateRolePermission, usePutRolePermission } from '../../../QueryServises/role&permission';

const RoleTransferModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
    refetch
}) => {
    const [form] = Form.useForm();
    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);

    // Query hooks
    const { data: roleData, isLoading: isFetchingRole } = useRoleList();
    const { data: permissionData, isLoading: isFetchingPermission } = usePermissionList();

    // Mutation hooks
    const { mutateAsync: addPermissions, isLoading: isAdding } = useCreateRolePermission();
    const { mutateAsync: updatePermissions, isLoading: isUpdating } = usePutRolePermission();

    // Format permissions for Transfer component
    const formattedPermissions = permissionData?.map((permission) => ({
        key: permission.id.toString(),
        title: permission.name,
        description: permission.description || `دسترسی ${permission.name}`,
    })) || [];

    // Handle role selection change
    const handleRoleChange = (roleId) => {
        setSelectedRoleId(roleId);
        // Reset permissions when role changes
        setTargetKeys([]);
        form.setFieldValue('permissions', []);
    };

    // Initialize form for edit mode
    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            const initialPermissions = modalData.permissions?.map(p => p.id.toString()) || [];
            form.setFieldsValue({
                role_id: modalData.roleId,
                permissions: initialPermissions
            });
            setTargetKeys(initialPermissions);
            setSelectedRoleId(modalData.roleId);
        } else {
            form.resetFields();
            setTargetKeys([]);
            setSelectedRoleId(null);
        }
    }, [modalMode, modalData, form]);

    // Handle form submission
    const onFinish = async (values) => {
        try {
            const payload = {
                role_id: values.role_id,
                permission_ids: values.permissions.map(id => parseInt(id))
            };
            console.log(payload);

            if (modalMode === "edit") {
                await updatePermissions({
                    roleId: values.role_id,
                    permissions: payload
                });
                message.success("دسترسی‌های سمت با موفقیت به‌روزرسانی شد");
            } else {
                await addPermissions(payload);
                message.success("دسترسی‌های جدید با موفقیت اضافه شدند");
            }

            closeModal();
            refetch?.();
        } catch (error) {
            console.error("Error saving permissions:", error);
            message.error("خطا در ذخیره دسترسی‌ها");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} دسترسی‌های سمت`}
            size={800}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
            loading={isFetchingPermission || isFetchingRole || isAdding || isUpdating}
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                initialValues={{
                    role_id: selectedRoleId,
                    permissions: targetKeys
                }}
            >
                <Form.Item
                    label="نام سمت:"
                    name="role_id"
                    rules={[{ required: true, message: "انتخاب سمت الزامی است" }]}
                >
                    <Select
                        showSearch
                        placeholder="سمت مورد نظر را انتخاب کنید"
                        optionFilterProp="label"
                        options={roleData?.map(role => ({
                            label: role.name,
                            value: role.id
                        }))}
                        onChange={handleRoleChange}
                        allowClear
                        disabled={modalMode === "edit"}
                    />
                </Form.Item>

                <Form.Item
                    name="permissions"
                    rules={[
                        {
                            required: true,
                            message: "حداقل یک دسترسی باید انتخاب شود",
                            validator: (_, value) =>
                                value?.length > 0 ? Promise.resolve() : Promise.reject()
                        }
                    ]}
                >
                    <Transfer
                        dataSource={formattedPermissions}
                        targetKeys={targetKeys}
                        onChange={(newTargetKeys) => {
                            setTargetKeys(newTargetKeys);
                            form.setFieldValue('permissions', newTargetKeys);
                        }}
                        render={item => item.title}
                        titles={['لیست دسترسی‌ها', 'دسترسی‌های انتخاب شده']}
                        listStyle={{
                            width: '100%',
                            height: 400,
                        }}
                        locale={{
                            itemUnit: 'مورد',
                            itemsUnit: 'موارد',
                            searchPlaceholder: 'جستجو',
                            notFoundContent: 'موردی یافت نشد',
                        }}
                        className="[&_.ant-transfer-operation]:rotate-180"
                        showSearch
                        filterOption={(inputValue, option) =>
                            option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
                            option.description.toLowerCase().includes(inputValue.toLowerCase())
                        }
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoleTransferModal;