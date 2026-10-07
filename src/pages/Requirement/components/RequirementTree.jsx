import { useMemo } from "react";
import { Button, Tooltip } from "antd";
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

    // action buttons shown beside each node
    const renderTitle = (node) => (
        <span className="inline-flex items-center gap-2">
            <span>{node.title}</span>
            <span className="inline-flex items-center">
                <Tooltip title="ویرایش">
                    <Button
                        type="text"
                        size="small"
                        className="text-green-700"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(node);
                        }}
                    />
                </Tooltip>
                <Tooltip title="حذف">
                    <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(node);
                        }}
                    />
                </Tooltip>
            </span>
        </span>
    );

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
