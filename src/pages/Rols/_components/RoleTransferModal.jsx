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

    const { data: roleData, isLoading: isFetchingRole } = useRoleList();
    const { data: permissionData, isLoading: isFetchingPermission } = usePermissionList();

    const { mutateAsync: addPermissions, isLoading: isAdding } = useCreateRolePermission();
    const { mutateAsync: updatePermissions, isLoading: isUpdating } = usePutRolePermission();

    const formattedPermissions = permissionData?.map((permission) => ({
        key: permission.id.toString(),
        title: permission.name,
        description: permission.description || `دسترسی ${permission.name}`,
    })) || [];

    const handleRoleChange = (roleId) => {
        setSelectedRoleId(roleId);
        setTargetKeys([]);
        form.setFieldValue('permissions_ids', []);
    };

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            const initialPermissions = modalData.permissions?.map(p => p.id.toString()) || [];
            form.setFieldsValue({
                roles_ids: [modalData.roleId],
                permissions_ids: initialPermissions
            });
            setTargetKeys(initialPermissions);
            setSelectedRoleId(modalData.roleId);
        } else {
            form.resetFields();
            setTargetKeys([]);
            setSelectedRoleId(null);
        }
    }, [modalMode, modalData, form]);

    const onFinish = async (values) => {
        try {
            const payload = {
                roles_ids: values.roles_ids,
                permissions_ids: values.permissions_ids
            };
            console.log(payload);

            if (modalMode === "edit") {
                await updatePermissions({
                    roleId: values.roles_ids[0],
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
                    roles_ids: selectedRoleId ? [selectedRoleId] : [],
                    permissions_ids: targetKeys
                }}
            >
                <Form.Item
                    label="نام سمت:"
                    name="roles_ids" // Changed to match backend expectation
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
                        mode="multiple"
                        maxTagCount={1}
                    />
                </Form.Item>

                <Form.Item
                    name="permissions_ids" 
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
                            form.setFieldValue('permissions_ids', newTargetKeys);
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