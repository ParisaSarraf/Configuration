import React from 'react';
import Tree from '../../../components/Tree';
import { useRoleList } from '../../../QueryServises/roleQuery';

const transformRoleDataToTreeFormat = (roleData) => {
    if (!roleData) return [];

    const roles = Array.isArray(roleData) ? roleData : [roleData];

    return roles.map((role) => ({
        title: role.name,
        key: `role-${role.id}`,
        id: role.id,
        name: role.name,
        permissions: role.permissions,
        children: Array.isArray(role.role_life_cycle)
            ? role.role_life_cycle.map((lifeCycle) => ({
                title: lifeCycle.life_cycle?.title || 'بدون عنوان',
                key: `lifecycle-${lifeCycle.id}-${role.id}`,
                id: lifeCycle.id,
                life_cycle: lifeCycle.life_cycle,
                isLeaf: true,
                permission: true
            }))
            : [],
        isLeaf: role.role_life_cycle?.length === 0
    }));
};

const RoleLifeCycleTree = ({ setModal, refetch }) => {
    const { isFetching, data: roleData } = useRoleList();


    const treeData = transformRoleDataToTreeFormat(roleData);

    return (
        <Tree
            data={treeData}
            loading={isFetching}
            titleField="title"
            keyField="key"
            childrenField="children"
            showRightClickMenu={(node) => !node.permission}
        />
    );
};

export default RoleLifeCycleTree;