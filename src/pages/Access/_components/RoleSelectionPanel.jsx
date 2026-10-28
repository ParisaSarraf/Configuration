import {Button, Divider, Empty, Popconfirm, Spin, Typography} from 'antd';
import {DeleteOutlined} from '@ant-design/icons';
import {useAccessOfUserByIdList, useUnAccessOfUserByIdList} from '../../../QueryServises/accsessQuery';

const {Text} = Typography;

const RoleSelectionPanel = ({selectedUserId, selectedRoleId, onSelectRole, onDeleteAccess}) => {
    const {
        data: assignedRoles,
        isLoading: isLoadingAssigned
    } = useAccessOfUserByIdList(selectedUserId, {enabled: !!selectedUserId});
    const {
        data: unassignedRoles,
        isLoading: isLoadingUnassigned
    } = useUnAccessOfUserByIdList(selectedUserId, {enabled: !!selectedUserId});

    const handleSelectRole = (roleId) => {
        onSelectRole(roleId === selectedRoleId ? null : roleId);
    };


    if (!selectedUserId) {
        return (
            <div className="theme-surface rounded-xl shadow-lg border theme-border flex flex-col h-full">
                <div className="p-4 border-b theme-border"><h2 className="text-base font-semibold theme-text">۲.
                    انتخاب سمت</h2></div>
                <div className="flex-1 flex justify-center items-center"><Empty
                    description="ابتدا یک کاربر را انتخاب کنید."/></div>
            </div>
        );
    }

    if (isLoadingAssigned || isLoadingUnassigned) {
        return <div
            className="theme-surface rounded-xl shadow-lg border theme-border flex justify-center items-center h-full">
            <Spin/>
        </div>;
    }

    return (
        <div className="theme-surface rounded-xl shadow-lg border theme-border flex flex-col h-full">
            <div className="p-4 border-b theme-border"><h2 className="text-base font-semibold theme-text">۲.
                انتخاب سمت</h2></div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div>
                    <Text strong>سمت‌های اختصاص داده شده</Text>
                    {assignedRoles?.length > 0 ? assignedRoles.map(role => (
                        <div key={`role-${role.id}`}
                             className={`p-3 my-2 rounded-lg border transition-colors ${selectedRoleId === role.id ? 'theme-accent-soft theme-accent-border' : 'theme-surface theme-border'}`}>
                            <div className="font-semibold theme-text cursor-pointer"
                                 onClick={() => handleSelectRole(role.id)}>{role.name}</div>
                            {role.access?.length > 0 && (
                                <ul className="mt-2 pr-4 space-y-1">
                                    {role.access.map(acc => (
                                        <li key={`acc-${acc.id}`}
                                            className="flex justify-between items-center text-sm theme-muted">
                                            <span>- {acc.product?.persian_title || 'محصول بدون نام'}</span>
                                            <Popconfirm title="آیا از حذف این دسترسی مطمئنید؟"
                                                        onConfirm={() => onDeleteAccess(acc.id)}>
                                                <Button type="text" danger size="small" icon={<DeleteOutlined/>}/>
                                            </Popconfirm>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="سمتی اختصاص داده نشده"/>}
                </div>

                <Divider/>

                <div>
                    <Text strong>سمت‌های قابل انتخاب</Text>
                    {unassignedRoles?.length > 0 ? unassignedRoles.map(role => (
                        <div key={`unassigned-role-${role.id}`} onClick={() => handleSelectRole(role.id)}
                             className={`p-3 my-2 rounded-lg border cursor-pointer transition-colors ${selectedRoleId === role.id ? 'theme-accent-soft theme-accent-border' : 'theme-canvas hover:theme-panel'}`}>
                            {role.name}
                        </div>
                    )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="سمت جدیدی یافت نشد"/>}
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPanel;