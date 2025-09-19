import {useDeleteRole, useRoleList} from '../../../QueryServises/roleQuery';
import {Button, Dropdown, Empty, List, message, Spin} from 'antd';
import {ApartmentOutlined, MoreOutlined} from "@ant-design/icons";

const RoleListPanel = ({selectedRoleId, onRoleSelect, setModal, refetch}) => {
    const {isFetching, data: roleData} = useRoleList();
    const {mutateAsync: deleteRole} = useDeleteRole();

    const handleDeleteRole = (roleId) => {
        deleteRole(roleId)
            .then(() => {
                message.success("سمت با موفقیت حذف شد");
                if (selectedRoleId === roleId) {
                    onRoleSelect(null);
                }
                refetch();
            })
            .catch(() => message.error("حذف ناموفق بود، دوباره امتحان کنید"));
    };

    const handleEditRole = (record) => {
        setModal({mode: 'edit', data: record});
    };

    const menuItems = (record) => ([
        {key: 'edit', label: 'ویرایش سمت', onClick: () => handleEditRole(record)},
        {key: 'delete', label: 'حذف سمت', danger: true, onClick: () => handleDeleteRole(record.id)},
    ]);

    if (isFetching) {
        return <div className="flex justify-center items-center h-48"><Spin/></div>;
    }

    if (!roleData || roleData.length === 0) {
        return <Empty description="هیچ سمتی یافت نشد."/>;
    }

    return (
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-slate-200 h-fit">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <ApartmentOutlined className="text-slate-500"/>
                <h2 className="text-base font-semibold text-slate-800">لیست سمت‌ها</h2>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
                <List
                    dataSource={roleData}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => onRoleSelect(item.id)}
                            className={`!p-3 !my-1 rounded-lg cursor-pointer transition-colors ${selectedRoleId === item.id ? 'bg-sky-100' : 'hover:bg-slate-50'}`}
                        >
                            <List.Item.Meta title={<span className="font-medium text-slate-700">{item.name}</span>}/>
                            <Dropdown menu={{items: menuItems(item)}} trigger={['click']}>
                                <Button type="text" shape="circle" icon={<MoreOutlined/>}
                                        onClick={(e) => e.stopPropagation()}/>
                            </Dropdown>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default RoleListPanel;