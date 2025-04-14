import { useUserList } from '../../../QueryServises/userQuery';
import { List, Avatar, Skeleton, Card, Spin } from 'antd';
import { BASEURL } from '../../../utils/Api';
import { useState } from 'react';

const UsersList = ({ refetch, selectedUserId, setSelectedUserId }) => {
    const { data: usersList, refetch: queryRefetch, isFetching } = useUserList();

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId === selectedUserId ? null : userId);
    };

    if (isFetching) {
        return (
            <Card>
                <Spin size="small" />
            </Card>
        );
    }

    return (
        <Card className='w-full'>
            <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                size='small'
                dataSource={usersList}
                renderItem={user => (
                    <List.Item
                        onClick={() => handleSelectUser(user.id)}
                        style={{
                            backgroundColor: user.id === selectedUserId ? '#e6f7ff' : 'transparent',
                            cursor: 'pointer',
                            padding: '12px 24px'
                        }}
                    >
                        <Skeleton avatar title={false} loading={false} active>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        src={`${BASEURL.replace("/api/v1", "")}${user.temp_image}`}
                                        alt={`${user.name} ${user.last_name}`}
                                    />
                                }
                                title={<a href="#">{`${user.name} ${user.last_name}`}</a>}
                            />
                        </Skeleton>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default UsersList;