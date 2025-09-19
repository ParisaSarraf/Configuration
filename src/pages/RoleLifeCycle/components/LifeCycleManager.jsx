import {Button, Empty, Form, message, Transfer} from 'antd';
import {useRoleList} from '../../../QueryServises/roleQuery';
import {useEffect, useState} from 'react';
import {
    useCreateRoleLifeCycle,
    usePutRoleLifeCycle,
    useRoleLifeCycleById
} from '../../../QueryServises/roleLifecycleQuery';
import {useLifeCycleList} from '../../../QueryServises/lifeCycleQuery';
import {SafetyCertificateOutlined} from "@ant-design/icons";

const LifeCycleManager = ({selectedRoleId, refetch}) => {
    const [form] = Form.useForm();
    const [targetKeys, setTargetKeys] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const {data: roleData} = useRoleList();
    const {data: lifeCycleData, isLoading: isFetchingLifecycle} = useLifeCycleList();

    const {
        data: roleLifeCycleData,
        refetch: refetchRoleLifeCycle
    } = useRoleLifeCycleById(selectedRoleId, {enabled: !!selectedRoleId});

    const {mutateAsync: addRoleLifecycle, isLoading: isAdding} = useCreateRoleLifeCycle();
    const {mutateAsync: updateRoleLifecycle, isLoading: isUpdating} = usePutRoleLifeCycle();

    const selectedRoleName = roleData?.find(r => r.id === selectedRoleId)?.name || '';
    const formattedLifeCycle = lifeCycleData?.map((lc) => ({key: lc.id.toString(), title: lc.title})) || [];

    useEffect(() => {
        if (selectedRoleId) {
            refetchRoleLifeCycle();
        } else {
            setTargetKeys([]);
            setIsEditing(false);
        }
    }, [selectedRoleId, refetchRoleLifeCycle]);

    useEffect(() => {
        if (roleLifeCycleData?.role_life_cycle?.length > 0) {
            setIsEditing(true);
            const lifeCycleIds = roleLifeCycleData.role_life_cycle.map(rlc => rlc.life_cycle.id.toString());
            setTargetKeys(lifeCycleIds);
            form.setFieldsValue({life_cycles: lifeCycleIds});
        } else {
            setIsEditing(false);
            setTargetKeys([]);
            form.setFieldsValue({life_cycles: []});
        }
    }, [roleLifeCycleData, form]);

    const onFinish = async (values) => {
        try {
            const payload = {role_id: selectedRoleId, life_cycle_ids: values.life_cycles};
            if (isEditing) {
                await updateRoleLifecycle({roleId: selectedRoleId, life_cycle_ids: values.life_cycles});
                message.success("چرخه عمر با موفقیت به‌روزرسانی شد");
            } else {
                await addRoleLifecycle(payload);
                message.success("چرخه عمر با موفقیت اضافه شد");
            }
            refetch();
        } catch (error) {
            message.error("خطا در ذخیره‌سازی");
        }
    };

    if (!selectedRoleId) {
        return (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                    <SafetyCertificateOutlined className="text-slate-500"/>
                    <h2 className="text-base font-semibold text-slate-800">مدیریت چرخه عمر</h2>
                </div>
                <div className="flex-1 flex justify-center items-center p-4">
                    <Empty description="لطفا برای مدیریت چرخه عمر، یک سمت را از لیست انتخاب کنید."/>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-slate-500"/>
                <h2 className="text-base font-semibold text-slate-800">چرخه عمرهای سمت: <span
                    className="text-sky-600">{selectedRoleName}</span></h2>
            </div>
            <div className="p-4 flex-1">
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item name="life_cycles">
                        <Transfer
                            dataSource={formattedLifeCycle}
                            targetKeys={targetKeys}
                            onChange={setTargetKeys}
                            render={item => item.title}
                            titles={['لیست چرخه عمر', 'چرخه‌های عمر انتخاب شده']}
                            listStyle={{width: '100%', height: 'calc(60vh - 120px)'}}
                            locale={{itemUnit: 'مورد', itemsUnit: 'موارد', searchPlaceholder: 'جستجو'}}
                            className="[&_.ant-transfer-operation]:rotate-180"
                            showSearch
                            filterOption={(input, option) => option.title.toLowerCase().includes(input.toLowerCase())}
                            loading={isFetchingLifecycle}
                        />
                    </Form.Item>
                    <div className="flex justify-end gap-4 mt-4">
                        <Button type="primary" htmlType="submit" loading={isAdding || isUpdating}>
                            {isEditing && targetKeys.length > 0 ? 'به‌روزرسانی' : 'ذخیره'}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default LifeCycleManager;