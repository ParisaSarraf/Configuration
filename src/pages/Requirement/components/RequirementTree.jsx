import { useMemo } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import { useRequirementList } from "../../../QueryServises/requirementQuery";
import useRequirementActions from "../hooks/useRequirementActions";
import { normalizeRequirements } from "../utils";

const RequirementTree = ({ setModal }) => {
    const { data: requirementList, isLoading, isError } = useRequirementList();
    const { handleEdit, handleDelete } = useRequirementActions({ setModal });

    const treeData = useMemo(() => normalizeRequirements(requirementList), [requirementList]);

    const rightClickMenu = [
        {
            key: "edit",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <EditOutlined />
                    <span>ویرایش شاخه</span>
                </div>
            ),
        },
        {
            key: "delete",
            label: (
                <div className="w-full flex flex-row items-center gap-2">
                    <DeleteOutlined />
                    <span>حذف شاخه</span>
                </div>
            ),
            danger: true,
        },
    ];

    const handleRightClickAction = (actionKey, node) => {
        if (actionKey === "delete") handleDelete(node);
        else if (actionKey === "edit") handleEdit(node);
    };

    // Keep the title/data untouched for edit dialogs; only decorate its display.
    const renderTitle = (node) => {
        const code = node.code == null ? "" : String(node.code).trim();
        return (
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", overflowWrap: "anywhere" }}>
                <span>{node.title}</span>
                {code !== "" && <bdi dir="ltr">({code})</bdi>}
            </span>
        );
    };

    return (
        <Tree
            mode="tree"
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            showLine={true}
            checkable={false}
            titleRender={renderTitle}
            rightClickMenuItems={rightClickMenu}
            onRightClickAction={handleRightClickAction}
        />
    );
};

export default RequirementTree;
