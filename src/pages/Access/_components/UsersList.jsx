import { useUserList } from '../../../QueryServises/userQuery';
import { Avatar, Card, Spin, Empty } from 'antd';
import { BASEURL } from '../../../utils/Api';
import { useState } from 'react';
import Tree from '../../../components/Tree';

const UsersList = ({ refetch, selectedUserId, setSelectedUserId }) => {
    const { data: usersList, refetch: queryRefetch, isFetching, error } = useUserList();
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
            title:
            //  (
                // <div className='w-full fle x'>
                    // {/* <Avatar
                    //     src={user.temp_image ? `${BASEURL.replace("/api/v1", "")}${user.temp_image}` : null}
                    //     alt={`${user.name} ${user.last_name}`}
                    //     className=" w-6 h-6"
                    // >
                    //     {user.name.charAt(0)}
                    // // </Avatar> */}
                    // <span>{`${
                        `${user.name} ${user.last_name}`
                        // } ${user.last_name}`}</span>
                // </div>
            // )
            ,
            key: user.id,
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