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
                onRoleSelect(null); 
                refetch();
            })
            .catch(() => message.error("حذف ناموفق بود، دوباره امتحان کنید"));
    };

    const handleEditRole = (record) => {
        setModal({type: 'role', mode: 'edit', data: record});
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
        <div className="lg:col-span-1 theme-surface rounded-xl shadow-lg border theme-border h-fit">
            <div className="p-4 border-b theme-border flex items-center gap-2">
                <ApartmentOutlined className="theme-muted"/>
                <h2 className="text-base font-semibold theme-text">لیست سمت‌ها</h2>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
                <List
                    dataSource={roleData}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => onRoleSelect(item.id)}
                            className={`!p-2 !my-1 rounded-lg cursor-pointer transition-colors ${selectedRoleId === item.id ? 'theme-accent-soft' : 'hover:theme-canvas'}`}
                        >
                            <List.Item.Meta title={<span className="font-medium theme-text">{item.name}</span>}/>
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