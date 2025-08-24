import {useUserList} from '../../../QueryServises/userQuery';
import {Empty, Spin, Tree} from 'antd';

const UsersList = ({selectedUserId, onSelectUser}) => {
    const {data: users, isLoading, isError} = useUserList();

    const handleSelect = (selectedKeys) => {
        const newUserId = selectedKeys.length > 0 ? Number(selectedKeys[0].replace('user-', '')) : null;
        onSelectUser(newUserId);
    };

    const transformToTreeData = (users) => {
        if (!users) return [];
        return users.map(user => ({
            title: `${user.name} ${user.last_name}`,
            key: `user-${user.id}`,
            isLeaf: true,
        }));
    };

    if (isLoading) return <Spin/>;
    if (isError) return <div className="text-red-500">خطا در بارگذاری کاربران</div>;
    if (!users || users.length === 0) return <Empty description="هیچ کاربری یافت نشد"/>;

    return (
        <Tree
            blockNode
            onSelect={handleSelect}
            treeData={transformToTreeData(users)}
            selectedKeys={selectedUserId ? [`user-${selectedUserId}`] : []}
        />
    );
};

export default UsersList;