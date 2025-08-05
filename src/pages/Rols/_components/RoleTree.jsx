import Tree from '../../../components/Tree';
import { useDeleteRole } from '../../../QueryServises/roleQuery';
import { message } from 'antd';
import { useRolePermissionList } from '../../../QueryServises/role&permission';

const RoleTree = ({ setModal, refetch }) => {
    const { isFetching, data: roleData } = useRolePermissionList();
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


    const handleEditRole = (record) => {
        setModal({ type: 'role', mode: 'edit', data: record });
    };


    return (
        <div className='max-h-[490px] overflow-y-auto'>
            <Tree
                data={roleData}
                loading={isFetching}
                titleField="name"
                keyField="id"
                childrenField="permissions"
                rightClickMenuItems={[
                    { key: 'edit', label: 'ویرایش سمت ' },
                    { key: 'delete', label: 'حذف' },
                ]}
                onRightClickAction={(action, node) => {
                    if (action === 'edit' && !node.permission) handleEditRole(node);
                    if (action === 'delete' && !node.permission) handleDeleteRole(node);
                }}
                showRightClickMenu={(node) => !node.permission}
            />
        </div>
    )
}

export default RoleTree