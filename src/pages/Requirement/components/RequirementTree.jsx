import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import { useDeleteRequirement, useRequirementList } from "../../../QueryServises/requirementQuery";

const RequirementTree = ({ setModal }) => {
    const { data: requirementList, isLoading, isError, refetch } = useRequirementList();
    const { mutate: deleteProductDocument } = useDeleteRequirement();

    const transformDataToTreeView = (requirementList) => {
        if (!requirementList) return [];

        const transformNode = (node) => ({
            title: node.persian_title,
            english_title: node.english_title,
            id: node.id,
            is_definable: node.is_definable,
            code: node.code,
            // parent_id : node.
            life_cycle: node.life_cycle,
            children: node.children && node.children.length > 0
                ? node.children.map(child => transformNode(child))
                : undefined,
        });

        const productDoc = Array.isArray(requirementList) ? requirementList : [requirementList];
        return productDoc.map((document) => transformNode(document));
    };

    const treeData = transformDataToTreeView(requirementList);

    const rightClickMenu = [
        {
            key: 'edit',
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <EditOutlined />
                    <span>ویرایش شاخه</span>
                </div>
            )
        }, {
            key: "delete",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <DeleteOutlined />
                    <span>حذف شاخه</span>
                </div>
            ),
            danger: true
        }
    ];

    const handleRightClickAction = (actionKey, node) => {
        const documentProductId = node.id;
        if (actionKey === 'delete') {
            Modal.confirm({
                title: "حذف سند",
                content: "از حذف این سند مطمئن هستید؟",
                okText: "بله ، مطمئنم",
                cancelText: "خیر ، منصرف شدم.",
                onOk() {
                    try {
                        deleteProductDocument(documentProductId);
                        message.success("سند با موفقیت حذف شد");
                        refetch();
                    } catch (error) {
                        message.error(error?.detail);
                        console.error(error);
                    }
                },
                onCancel() {
                    message.warning("عملیات حذف لغو شد");
                }
            });
        } else if (actionKey === 'edit') {
            setModal({
                mode: 'edit',
                data: {
                    title: node.title,
                    id: node.id,
                    is_definable: node.is_definable,
                    code: node.code,
                    life_cycle: node.life_cycle,
                    persian_title: node.persian_title,
                    english_title: node.english_title
                },
                type: 'add'
            });
        }
    };

    return (
        <Tree
            mode="tree"
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            showLine={true}
            checkable={true}
            rightClickMenuItems={rightClickMenu}
            onRightClickAction={handleRightClickAction}
        />
    );
}

export default RequirementTree;