import { useMemo } from "react";
import Tree from "../../../components/Tree";
import { usePermissionList } from "../../../QueryServises/PermissionQuery";

const PermissionsTree = ({ onChange, checkedKeys }) => {
    const { data: permissions, isLoading, isError } = usePermissionList();

    const transformDataToTreeFormat = (permissions) => {
        return permissions?.map((permission) => ({
            title: permission.name,
            key: `permission-${permission.id}`,
        }));
    };

    const treeData = useMemo(() => {
        return transformDataToTreeFormat(permissions);
    }, [permissions]);

    return (
        <Tree
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            onChange={onChange}
            checkedKeys={checkedKeys}
            showLine={true}
            checkable={true}
            showRightClickMenu={false}
        />
    );
};

export default PermissionsTree;