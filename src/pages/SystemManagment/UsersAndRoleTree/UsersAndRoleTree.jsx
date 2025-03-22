import { useMemo } from "react";
import { useUsersRoleList } from "../../../QueryServises/user&role";
import { Tree } from "antd";

const { DirectoryTree } = Tree;

const UsersAndRoleTree = () => {
    const { data: usersAndroles, isLoading, isError } = useUsersRoleList();

    const transformDataToTreeFormat = (roles) => {
        return roles.map((role) => ({
            title: role.name,
            key: `role-${role.id}`,
            children: role.users.map((user) => ({
                title: `${user.name} ${user.last_name}`,
                key: `role-${role.id}-user-${user.id}`,
                isLeaf: true,
            })),
        }));
    };

    const treeData = useMemo(() => {
        return usersAndroles && transformDataToTreeFormat(usersAndroles);
    }, [usersAndroles]);

    if (isLoading) return <div className="text-center py-8">در حال بارگذاری...</div>;
    if (isError) return <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>;

    return (
        <div>   
            <DirectoryTree
                treeData={treeData}
                showLine
                // checkable
            />
        </div>
    );
}

export default UsersAndRoleTree;