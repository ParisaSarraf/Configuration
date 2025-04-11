import { Button, Form, Select, Transfer, message } from 'antd';
import { useRoleList } from '../../../QueryServises/roleQuery';
import { usePermissionList } from '../../../QueryServises/PermissionQuery';
import { useState, useEffect } from 'react';
import { useCreateRolePermission, usePutRolePermission, useRolePermissionById } from '../../../QueryServises/role&permission';

const RoleTransfer = ({ refetch }) => {
    const [form] = Form.useForm();
    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const { data: roleData, isLoading: isFetchingRole } = useRoleList();
    const { data: permissionData, isLoading: isFetchingPermission } = usePermissionList();
    const {
        data: rolePermissionData,
        refetch: refetchRolePermission
    } = useRolePermissionById(selectedRoleId);

    const { mutateAsync: addPermissions, isLoading: isAdding } = useCreateRolePermission();
    const { mutateAsync: updatePermissions, isLoading: isUpdating } = usePutRolePermission();

    const formattedPermissions = permissionData?.map((permission) => ({
        key: permission.id.toString(),
        title: permission.name,
        description: permission.description || `دسترسی ${permission.name}`,
    })) || [];

    useEffect(() => {
        if (rolePermissionData?.permissions?.length > 0) {
            setIsEditing(true);
            const permissionIds = rolePermissionData.permissions.map(p => p.id.toString());
            setTargetKeys(permissionIds);
            form.setFieldsValue({
                permissions_ids: permissionIds
            });
        } else {
            setIsEditing(false);
            setTargetKeys([]);
            form.setFieldsValue({
                permissions_ids: []
            });
        }
    }, [rolePermissionData, form]);

    useEffect(() => {
        if (selectedRoleId) {
            form.setFieldsValue({
                roles_ids: selectedRoleId,
                permissions_ids: targetKeys
            });
        }
    }, [selectedRoleId, targetKeys, form]);

    const handleRoleChange = (roleId) => {
        setSelectedRoleId(roleId);
        refetchRolePermission();
    };

    const handleReset = () => {
        form.resetFields();
        setTargetKeys([]);
        setSelectedRoleId(null);
        setIsEditing(false);
    };

    const onFinish = async (values) => {
        try {
            if (isEditing) {
                console.log('Updating with:', values.permissions_ids);

                await updatePermissions({
                    roleId: values.roles_ids,
                    permission_ids: values.permissions_ids
                });
                message.success("دسترسی‌های سمت با موفقیت به‌روزرسانی شد");
            } else {
                const payload = {
                    roles_ids: [values.roles_ids],
                    permissions_ids: values.permissions_ids
                };
                console.log('Creating with:', payload);
                await addPermissions(payload);
                message.success("دسترسی‌های جدید با موفقیت اضافه شدند");
            }

            refetch();
            handleReset();
        } catch (error) {
            console.error("Error saving permissions:", error.response?.data || error.message);
            message.error("خطا در ذخیره دسترسی‌ها");
        }
    };


    return (
        <Form
            className='w-2/3'
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
                roles_ids: selectedRoleId,
                permissions_ids: targetKeys
            }}
        >
            <Form.Item
                label="نام سمت:"
                name="roles_ids"
                rules={[{ required: true, message: 'لطفا یک سمت انتخاب کنید' }]}
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
                    loading={isFetchingRole}
                />
            </Form.Item>

            <Form.Item
                name="permissions_ids"
                rules={[
                    {
                        required: true,
                        message: "حداقل یک دسترسی باید انتخاب شود",
                        type: 'array',
                        min: 1
                    }
                ]}
            >
                <Transfer
                    dataSource={formattedPermissions}
                    targetKeys={targetKeys}
                    onChange={(newTargetKeys) => {
                        setTargetKeys(newTargetKeys);
                        form.setFieldsValue({
                            permissions_ids: newTargetKeys
                        });
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
                    disabled={!selectedRoleId || isFetchingPermission}
                />
            </Form.Item>
            <div className="flex justify-end gap-4">
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isAdding || isUpdating}
                    disabled={!selectedRoleId}
                >
                    {isEditing ? 'به‌روزرسانی' : 'ذخیره'}
                </Button>
                <Button
                    htmlType="button"
                    onClick={handleReset}
                >
                    بازنشانی
                </Button>
            </div>
        </Form>
    );
};

export default RoleTransfer;