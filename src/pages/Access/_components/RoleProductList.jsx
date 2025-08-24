import {Button, Divider, Empty, Spin, Tree, Typography} from 'antd';
import {DeleteOutlined} from '@ant-design/icons';
import {useAccessOfUserByIdList, useUnAccessOfUserByIdList} from '../../../QueryServises/accsessQuery';

const {Text, Title} = Typography;

const RoleProductList = ({selectedUserId, selectedRoleId, onSelectRole, onDeleteAccess}) => {
    const {
        data: assignedRoles,
        isLoading: isLoadingAssigned,
        isError: isErrorAssigned
    } = useAccessOfUserByIdList(selectedUserId, {
        enabled: !!selectedUserId,
    });

    const {
        data: unassignedRoles,
        isLoading: isLoadingUnassigned,
        isError: isErrorUnassigned
    } = useUnAccessOfUserByIdList(selectedUserId, {
        enabled: !!selectedUserId,
    });

    const handleSelect = (selectedKeys) => {
        const newRoleId = selectedKeys.length > 0 ? Number(selectedKeys[0].replace('role-', '')) : null;
        if (newRoleId === selectedRoleId) {
            onSelectRole(null);
        } else {
            onSelectRole(newRoleId);
        }
    };

    const transformAssignedData = (data) => {
        if (!data) return [];
        return data.map(role => ({
            key: `role-${role.id}`,
            title: <Text strong>{role.name}</Text>,
            children: role.access?.map(acc => ({
                key: `access-${acc.id}`,
                title: (
                    <div className="flex justify-between items-center w-full">
                        <span>{acc.product?.persian_title || 'محصول بدون نام'}</span>
                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined/>}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAccess(acc.id);
                            }}
                        />
                    </div>
                ),
            })),
        }));
    };

    const transformUnassignedData = (data) => {
        if (!data) return [];
        return data.map(role => ({
            key: `role-${role.id}`,
            title: role.name,
            isLeaf: true,
        }));
    };

    if (!selectedUserId) {
        return <Empty description="ابتدا یک کاربر را انتخاب کنید."/>;
    }

    if (isLoadingAssigned || isLoadingUnassigned) return <Spin/>;
    if (isErrorAssigned || isErrorUnassigned) return <div className="text-red-500">خطا در بارگذاری سمت‌ها</div>;

    return (
        <div className="flex flex-col h-full">
            <div>
                <Title level={5}>سمت‌های اختصاص داده شده</Title>
                <Tree
                    blockNode
                    showLine
                    treeData={transformAssignedData(assignedRoles)}
                    onSelect={handleSelect}
                    selectedKeys={selectedRoleId ? [`role-${selectedRoleId}`] : []}
                    defaultExpandAll
                />
            </div>

            <Divider/>

            <div className="flex-grow">
                <Title level={5}>سمت‌های قابل انتخاب</Title>
                <Tree
                    blockNode
                    treeData={transformUnassignedData(unassignedRoles)}
                    onSelect={handleSelect}
                    selectedKeys={selectedRoleId ? [`role-${selectedRoleId}`] : []}
                />
            </div>
        </div>
    );
};

export default RoleProductList;