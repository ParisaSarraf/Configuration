import { Card, Spin, Typography } from 'antd';
import React, { useState } from 'react';
import { useAccessOfUserByIdList, useUnAccessOfUserByIdList } from '../../../QueryServises/accsessQuery';
import Tree from '../../../components/Tree';

const { Text } = Typography;

const RoleProductList = ({ selectedUserId, setSelectedUserAndRoleId, selectedUserAndRoleId }) => {
    const {
        data: usersWithAccess,
        isFetching: usersHasProductFetching,
        error: hasProductError
    } = useAccessOfUserByIdList(selectedUserId, {
        enabled: !!selectedUserId
    });

    const {
        data: usersWithoutAccess,
        isFetching: usersHasNotProductFetching,
        error: hasNotProductError
    } = useUnAccessOfUserByIdList(selectedUserId, {
        enabled: !!selectedUserId
    });

    const [selectedNodeKey, setSelectedNodeKey] = useState(null)

    if (usersHasProductFetching || usersHasNotProductFetching) {
        return (
            <Card>
                <Spin size="small" />
            </Card>
        );
    }

    const handleClick = (node) => {
        if (selectedNodeKey === node.key) {
            setSelectedNodeKey(null);
            setSelectedUserAndRoleId([]);
        } else {
            setSelectedNodeKey(node.key);
            const Ids = [node.key, selectedUserId];
            setSelectedUserAndRoleId(Ids);
        }
        // const Ids = [node.key, selectedUserId];
        // setSelectedUserAndRoleId(Ids);
    }

    const transformAccessData = (data) => {
        if (!data) return [];
        return data.map(user => ({
            title: user.name,
            key: user.id,
            children: user.access?.length > 0 ?
                user.access.map(accessItem => ({
                    title: accessItem.product?.persian_title || 'بدون عنوان',
                    key: `product-${accessItem.product?.id}`,


                })) :
                [{ title: 'هیچ محصولی ندارد', key: `no-product-${user.id}` }]
        }));
    };

    const transformPermissionData = (data) => {
        if (!data) return [];

        return data.map(user => ({
            title: user.name,
            key: user.id,
        }));
    };

    const accessTreeData = transformAccessData(usersWithAccess);
    const permissionTreeData = transformPermissionData(usersWithoutAccess);

    return (
        <Card className='w-full'>
            <div style={{ marginBottom: 16 }}>
                <Text strong>سمت های کاربر </Text>
                <Tree
                    data={accessTreeData}
                    isLoading={usersHasProductFetching}
                    isError={hasProductError}
                    showLine={true}
                    checkable={false}
                    onNodeClick={handleClick}
                    selectedKeys={selectedNodeKey ? [selectedNodeKey] : []}
                />
            </div>

            <div style={{ marginTop: 24, marginBottom: 16 }}>
                <Text strong>بقیه سمت ها</Text>
                <Tree
                    data={permissionTreeData}
                    isLoading={usersHasNotProductFetching}
                    isError={hasNotProductError}
                    showLine={true}
                    checkable={false}
                    onNodeClick={handleClick}
                    selectedKeys={selectedNodeKey ? [selectedNodeKey] : []}
                />
            </div>
        </Card>
    );
};

export default RoleProductList;