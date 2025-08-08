import React from 'react'
import Tree from '../../../components/Tree';
import {useRoleList} from '../../../QueryServises/roleQuery';

const RolePermissionsTree = () => {
    const {isFetching, data: roleData, refetch} = useRoleList();

    return (
        <Tree
            data={roleData}
            loading={isFetching}
            titleField="name"
            keyField="id"
            childrenField="children"
            rightClickMenuItems={[
                {key: 'edit', label: 'ویرایش'},
                {key: 'delete', label: 'حذف'},
            ]}
            onRightClickAction={(action, node) => {
                if (action === 'edit') handleEditRole(node);
                if (action === 'delete') handleDeleteRole(node);
            }}
        />
    )
}

export default RolePermissionsTree
