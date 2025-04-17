import { useUserList } from '../../../QueryServises/userQuery';
import { Avatar, Card, Spin, Empty } from 'antd';
import { BASEURL } from '../../../utils/Api';
import { useState } from 'react';
import Tree from '../../../components/Tree';

const UsersList = ({ refetch, selectedUserId, setSelectedUserId }) => {
    const { data: usersList, isFetching, error } = useUserList();
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const handleSelectUser = (selectedKeys, { node }) => {
        setSelectedUserId(node.userId === selectedUserId ? null : node.userId);
    };

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const transformUsersToTreeData = (users) => {
        if (!users) return [];

        return users.map(user => ({
            title: `${user.name} ${user.last_name}`,
            key: `user-${user.id}`,
            isLeaf: true,
            userId: user.id,
            style: {
                backgroundColor: user.id === selectedUserId ? '#e6f7ff' : 'transparent',
            },
            className: user.id === selectedUserId ? 'selected-user' : ''
        }));
    };

    if (isFetching) {
        return (
            <Card>
                <Spin size="small" />
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="text-red-500">خطا در بارگذاری داده‌ها</div>
            </Card>
        );
    }

    if (!usersList || usersList.length === 0) {
        return (
            <Card>
                <Empty description="هیچ کاربری یافت نشد" />
            </Card>
        );
    }

    return (
        <Card className='w-full'>
            <Tree
                multiple
                onSelect={handleSelectUser}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={transformUsersToTreeData(usersList)}
                selectedKeys={selectedUserId ? [`user-${selectedUserId}`] : []}
                className="user-tree"
            />
        </Card>
    );
};

export default UsersList;