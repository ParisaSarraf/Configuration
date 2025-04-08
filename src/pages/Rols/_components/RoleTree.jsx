import React from 'react'
import Tree from '../../../components/Tree';
import { useDeleteRole, useRoleList } from '../../../QueryServises/roleQuery';
import { message } from 'antd';

const RoleTree = () => {
    const { isFetching, data: roleData, refetch } = useRoleList();
    const { mutateAsync: deleteRole } = useDeleteRole();

    const handleDeleteRole = (record) => {
        deleteRole(record.id)
            .then(() => {
                message.success("سمت با موفقیت حذف شد");
                refetch();
            })
            .catch((error) => {
                message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
                console.error(error);
            });
    };

    return (
        <Tree
            data={roleData}
            loading={isFetching}
            titleField="name"
            keyField="id"
            childrenField="children"
            onNodeClick={(node) => console.log('Node clicked', node)}
            rightClickMenuItems={[
                { key: 'edit', label: 'ویرایش' },
                { key: 'delete', label: 'حذف' },
            ]}
            onRightClickAction={(action, node) => {
                if (action === 'edit') handleEditRole(node);
                if (action === 'delete') handleDeleteRole(node);
            }}
        />
    )
}

export default RoleTree
