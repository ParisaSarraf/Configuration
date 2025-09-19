import {Button, Empty, Form, message, Transfer} from 'antd';
import {useRoleList} from '../../../QueryServises/roleQuery';
import {usePermissionList} from '../../../QueryServises/PermissionQuery';
import {useEffect, useState} from 'react';
import {
    useCreateRolePermission,
    usePutRolePermission,
    useRolePermissionById
} from '../../../QueryServises/role&permission';
import {SafetyCertificateOutlined} from "@ant-design/icons";

const PermissionManager = ({selectedRoleId, refetch}) => {
    const [form] = Form.useForm();
    const [targetKeys, setTargetKeys] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const {data: roleData} = useRoleList();
    const {data: permissionData, isLoading: isFetchingPermission} = usePermissionList();
    const {
        data: rolePermissionData,
        refetch: refetchRolePermission
    } = useRolePermissionById(selectedRoleId, {enabled: !!selectedRoleId});

    const {mutateAsync: addPermissions, isLoading: isAdding} = useCreateRolePermission();
    const {mutateAsync: updatePermissions, isLoading: isUpdating} = usePutRolePermission();

    const formattedPermissions = permissionData?.map((p) => ({key: p.id.toString(), title: p.name})) || [];
    const selectedRoleName = roleData?.find(r => r.id === selectedRoleId)?.name || '';

    useEffect(() => {
        if (selectedRoleId) {
            refetchRolePermission();
        }
    }, [selectedRoleId, refetchRolePermission]);

    useEffect(() => {
        if (rolePermissionData?.permissions?.length > 0) {
            setIsEditing(true);
            const permissionIds = rolePermissionData.permissions.map(p => p.id.toString());
            setTargetKeys(permissionIds);
            form.setFieldsValue({permissions_ids: permissionIds});
        } else {
            setIsEditing(false);
            setTargetKeys([]);
            form.setFieldsValue({permissions_ids: []});
        }
    }, [rolePermissionData, form]);

    const handleReset = () => {
        form.resetFields();
        setTargetKeys([]);
        setIsEditing(false);
    };

    const onFinish = async (values) => {
        try {
            if (isEditing) {
                await updatePermissions({roleId: selectedRoleId, permission_ids: values.permissions_ids});
                message.success("دسترسی‌ها با موفقیت به‌روزرسانی شد");
            } else {
                await addPermissions({roles_ids: [selectedRoleId], permissions_ids: values.permissions_ids});
                message.success("دسترسی‌ها با موفقیت اضافه شدند");
            }
            refetch();
        } catch (error) {
            message.error("خطا در ذخیره دسترسی‌ها");
        }
    };

    if (!selectedRoleId) {
        return (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                    <SafetyCertificateOutlined className="text-slate-500"/>
                    <h2 className="text-base font-semibold text-slate-800">مدیریت مجوزها</h2>
                </div>
                <div className="flex-1 flex justify-center items-center p-4">
                    <Empty description="لطفا برای مدیریت مجوزها، یک سمت را از لیست انتخاب کنید."/>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-slate-500"/>
                <h2 className="text-base font-semibold text-slate-800">مجوزهای سمت: <span
                    className="text-sky-600">{selectedRoleName}</span></h2>
            </div>
            <div className="p-4 flex-1">
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item name="permissions_ids">
                        <Transfer
                            dataSource={formattedPermissions}
                            targetKeys={targetKeys}
                            onChange={setTargetKeys}
                            render={item => item.title}
                            titles={['لیست دسترسی‌ها', 'دسترسی‌های انتخاب شده']}
                            listStyle={{width: '100%', height: 'calc(60vh - 120px)'}}
                            locale={{itemUnit: 'مورد', itemsUnit: 'موارد', searchPlaceholder: 'جستجو'}}
                            className="[&_.ant-transfer-operation]:rotate-180"
                            showSearch
                            filterOption={(input, option) => option.title.toLowerCase().includes(input.toLowerCase())}
                            loading={isFetchingPermission}
                        />
                    </Form.Item>
                    <div className="flex justify-end gap-4 mt-4">
                        <Button type="primary" htmlType="submit" loading={isAdding || isUpdating}>
                            {isEditing ? 'به‌روزرسانی' : 'ذخیره'}
                        </Button>
                        <Button htmlType="button" onClick={handleReset}>بازنشانی</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default PermissionManager;