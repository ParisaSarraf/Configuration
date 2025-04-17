import { Card, message, Spin, Typography } from 'antd';
import React, { useState } from 'react';
import { useAccessOfUserByIdList, useUnAccessOfUserByIdList } from '../../../QueryServises/accsessQuery';
import Tree from '../../../components/Tree';
import { DeleteOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

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
        console.log(checkedKeysValue);
        setCheckedKeys(checkedKeysValue);
        const productIds = [];
        let roleId = null;
        checkedKeysValue.forEach(key => {
            if (typeof key === 'string' && key.includes('-product-')) {
                const match = key.match(/role-(\d+).*?-product-(\d+)/);
                if (match) {
                    const [, rId, pId] = match;
                    roleId = parseInt(rId);
                    productIds.push(parseInt(pId));
                }
            }
        })
        if (roleId && selectedUserId) {
            setSelectedUserAndRoleId([roleId, selectedUserId]);
        }
        setSelectedProducts(productIds);
    };

    const handleClick = (node) => {
        const roleId = node.roleId;
        console.log(roleId);
        if (roleId) {
            if (selectedNodeKey === roleId) {
                setSelectedNodeKey(null);
                setSelectedUserAndRoleId([]);
            } else {
                setSelectedNodeKey(roleId);
                setSelectedUserAndRoleId([roleId, selectedUserId]);
            }
        }
    };

    const transformAccessData = (data) => {
        if (!data) return [];
        return data.map(role => {
            const roleId = role.id;
            const hasAccess = role.access?.length > 0;
            
            const children = hasAccess
                ? role.access.map(accessItem => {
                    const product = accessItem.product;
                    const productTitle = product?.persian_title || 'بدون عنوان';
                    const productId = product?.id;
                    const accessId = accessItem?.id;
    
                    return {
                        title: (
                            <div className="w-full flex justify-between">
                                <span>{productTitle}</span>
                                <DeleteOutlined
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            await deleteAccessProducts(accessId);
                                            message.success("با موفقیت حذف شد");
                                            userRefetch();
                                        } catch (error) {
                                            message.error("خطا در حذف آیتم");
                                            console.error("Delete error:", error);
                                        }
                                    }}
                                />
                            </div>
                        ),
                        key: `access-${accessId}`,
                    };
                })
                : [];
    
            return {
                title: role.name,
                key: `role-${roleId}`,
                roleId: roleId,
                children: children.length > 0 ? children : [],
                isFormerRole: !hasAccess,
            };
        });
    };
    
    
    const transformUnAccessTreeData = (data) => {
        if (!data) return [];
        return data.map(role => ({
            title: role.name,
            key: `role-${role.id}`,
            roleId: role.id,
        }));
    };
    

    const accessTreeData = transformAccessData(usersWithAccess);
    const unAccessTreeData = transformUnAccessTreeData(usersWithoutAccess);


    console.log(checkedKeys);

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
                    selectedKeys={selectedNodeKey ? [`role-${selectedNodeKey}`] : []}
                    checkedKeys={checkedKeys}
                />
            </div>

            <div style={{ marginTop: 24, marginBottom: 16 }}>
                <Text strong>بقیه سمت ها</Text>
                <Tree
                    data={unAccessTreeData}
                    isLoading={usersHasNotProductFetching}
                    isError={hasNotProductError}
                    showLine={true}
                    checkable={true}
                    onNodeClick={handleClick}
                    selectedKeys={selectedNodeKey ? [`role-${selectedNodeKey}`] : []}
                    checkedKeys={checkedKeys}

                />
            </div>
        </Card>
    );
};

export default RoleProductList;
