import { Button, Form, Select, Transfer, message } from 'antd';
import { useRoleList } from '../../../QueryServises/roleQuery';
import { useState, useEffect } from 'react';
import { useCreateRoleLifeCycle, usePutRoleLifeCycle, useRoleLifeCycleById } from '../../../QueryServises/roleLifecycleQuery';
import { useLifeCycleList } from '../../../QueryServises/lifeCycleQuery';

const RoleLifeCycleTransfer = ({ refetch }) => {
    const [form] = Form.useForm();
    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const { data: roleData, isLoading: isFetchingRole } = useRoleList();
    const { data: lifeCycleData, isLoading: isFetchingLifecycle } = useLifeCycleList();

    const {
        data: rolelifeCycleData,
        refetch: refetchRoleLifeCycle
    } = useRoleLifeCycleById(selectedRoleId);

    const { mutateAsync: addRoleLifecycle, isLoading: isAdding } = useCreateRoleLifeCycle();
    const { mutateAsync: updateRoleLifecycle, isLoading: isUpdating } = usePutRoleLifeCycle();

    const formattedLifeCycle = lifeCycleData?.map((roleLifeCycle) => ({
        key: roleLifeCycle.id.toString(),
        title: roleLifeCycle.title,
    })) || [];

    useEffect(() => {
        if (rolelifeCycleData?.role_life_cycle?.length > 0) {
            setIsEditing(true);
            const roleLifecycleIds = rolelifeCycleData.role_life_cycle.map(p => p.life_cycle.id.toString());
            setTargetKeys(roleLifecycleIds);
            form.setFieldsValue({
                life_cycles: roleLifecycleIds
            });
        } else {
            setIsEditing(false);
            setTargetKeys([]);
            form.setFieldsValue({
                life_cycles: []
            });
        }
    }, [rolelifeCycleData, form]);

    useEffect(() => {
        if (selectedRoleId) {
            form.setFieldsValue({
                roles_ids: selectedRoleId,
                life_cycles: targetKeys
            });
        }
    }, [selectedRoleId, targetKeys, form]);

    const handleRoleChange = (roleId) => {
        setSelectedRoleId(roleId);
        refetchRoleLifeCycle();
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
                await updateRoleLifecycle({
                    lifeCycleId: selectedRoleId,
                    life_cycles: values.life_cycles
                });
                message.success("چرخه حیات های سمت با موفقیت به‌روزرسانی شد");
            } else {
                const requests = values.life_cycles.map(life_cycle_id =>
                    addRoleLifecycle({
                        role_id: selectedRoleId,
                        life_cycle_id: parseInt(life_cycle_id)
                    })
                );

                await Promise.all(requests);
                message.success("چرخه حیات های جدید با موفقیت اضافه شدند");
            }
            refetch();
            handleReset();
        } catch (error) {
            console.error("Error saving life cycles:", error.response?.data || error.message);
            // message.error("خطا در ذخیره چرخه حیات ها");
        }
    };


    return (
        <Form
            className='w-2/3'
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
                role_id: selectedRoleId,
                life_cycles: targetKeys
            }}
        >
            <Form.Item
                label="نام سمت:"
                name="role_id"
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
                name="life_cycles"
            >
                <Transfer
                    dataSource={formattedLifeCycle}
                    targetKeys={targetKeys}
                    onChange={(newTargetKeys) => {
                        setTargetKeys(newTargetKeys);
                        form.setFieldsValue({
                            life_cycles: newTargetKeys
                        });
                    }}
                    render={item => item.title}
                    titles={['لیست چرخه حیات', 'چرخه حیات های انتخاب شده']}
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
                    disabled={!selectedRoleId || isFetchingLifecycle}
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

export default RoleLifeCycleTransfer;