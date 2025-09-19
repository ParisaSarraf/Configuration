import {EditOutlined} from "@ant-design/icons";
import Tree from "../../../components/Tree";


const UsersAndRoleTree = ({usersAndroles, isLoading, isError, setModal, modalData, modalMode}) => {

    const transformDataToTreeFormat = (data) => {
        if (!Array.isArray(data)) return [];
        return data.map(role => ({
            title: role.name || "بدون عنوان",
            key: `role-${Math.random()}-${role.id}`,
            id: role.id,
            isLeaf: false,
            userAndRoleData: role,
            children: (role.users || []).map(user => ({
                title: `${user.name} ${user.last_name || ''} (${user.username})`,
                key: `user-${user.id}`,
                id: user.id,
                isLeaf: true,
            }))
        }));
    };

    const rightClickMenuItems = [
        {
            key: "edit",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <EditOutlined/>
                    <span>ویرایش کاربران مرتبط با سمت</span>
                </div>
            )
        },
    ];

    const handleRightClickAction = (actionKey, node) => {
        if (actionKey === "edit") {
            setModal({
                mode: "edit",
                id: node.id,
                data: node.userAndRoleData,
            });
        }
    };

    const treeData = transformDataToTreeFormat(usersAndroles);

    if (isLoading) return <div className="text-center py-8">در حال بارگذاری...</div>;
    if (isError) return <div className="text-center py-8 text-red-500">خطا در دریافت اطلاعات!</div>;

    return (
        <div>
            <Tree
                treeData={treeData}
                showLine
                blockNode={true}
                rightClickMenuItems={rightClickMenuItems}
                onRightClickAction={handleRightClickAction}
            />
        </div>
    );
};

export default UsersAndRoleTree;
