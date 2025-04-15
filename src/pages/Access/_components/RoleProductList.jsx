import { Card, message, Spin, Typography } from 'antd';
import React, { useState } from 'react';
import { useAccessOfUserByIdList, useUnAccessOfUserByIdList } from '../../../QueryServises/accsessQuery';
import Tree from '../../../components/Tree';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RoleProductList = ({
    selectedUserId,
    setSelectedUserAndRoleId,
    selectedUserAndRoleId,
    setSelectedProducts,
    deleteAccessProducts,
    userRefetch
}) => {
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

    const [selectedNodeKey, setSelectedNodeKey] = useState(null);
    const [checkedKeys, setCheckedKeys] = useState([]);

    if (usersHasProductFetching || usersHasNotProductFetching) {
        return (
            <Card>
                <Spin size="small" />
            </Card>
        );
    }

    const handleCheck = (checkedKeysValue) => {
        setCheckedKeys(checkedKeysValue);

        const productIds = [];
        let roleId = null;

        checkedKeysValue.forEach(key => {
            if (typeof key === 'string' && key.startsWith('role-') && key.includes('-product-')) {
                const match = key.match(/role-(\d+)-product-(\d+)/);
                if (match) {
                    const [, rId, pId] = match;
                    roleId = parseInt(rId);
                    productIds.push(parseInt(pId));
                }
            }
        });

        if (roleId && selectedUserId) {
            setSelectedUserAndRoleId([roleId, selectedUserId]);
        }

        setSelectedProducts(productIds);
    };

    const handleClick = (node) => {
        const match = node.key.match(/^role-(\d+)$/);
        if (match) {
            const roleId = parseInt(match[1]);
            if (selectedNodeKey === node.key) {
                setSelectedNodeKey(null);
                setSelectedUserAndRoleId([]);
            } else {
                setSelectedNodeKey(node.key);
                setSelectedUserAndRoleId([roleId, selectedUserId]);
            }
        }
    };

    const transformAccessData = (data) => {
        if (!data) return [];

        return data.map(user => {
            const roleId = user.id;

            const children = user.access?.length > 0
                ? user.access.map(accessItem => {
                    const product = accessItem.product;
                    const productTitle = product?.persian_title || 'بدون عنوان';
                    const productId = product?.id;
                    const accessId = accessItem?.id;

                    return {
                        title: (
                            <div className="flex justify-between items-center">
                                <span>{productTitle}</span>
                                <DeleteOutlined
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAccessProducts(accessId);
                                        message.success("باموفقیت حذف شد")
                                        userRefetch()
                                    }}
                                />
                            </div>
                        ),
                        key: `access-${accessId}-role-${roleId}-product-${productId}`,
                    };
                })
                : [{ title: 'هیچ محصولی ندارد', key: `role-${roleId}-no-product` }];

            return {
                title: user.name,
                key: `role-${roleId}`,
                children,
            };
        });
    };


    const transformPermissionData = (data) => {
        if (!data) return [];
        return data.map(user => ({
            title: user.name,
            key: `role-${user.id}`,
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
                    checkable={true}
                    onNodeClick={handleClick}
                    onCheck={handleCheck}
                    selectedKeys={selectedNodeKey ? [selectedNodeKey] : []}
                    checkedKeys={checkedKeys}
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
