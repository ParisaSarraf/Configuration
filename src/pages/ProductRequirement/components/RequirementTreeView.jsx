import { useEffect, useMemo, useState } from "react";
import { Button, Space } from "antd";
import { DeleteOutlined, EyeOutlined, RightOutlined } from "@ant-design/icons";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Tree from "../../../components/Tree";
import { buildRequirementTree } from "../utils/requirementTree";

export default function RequirementTreeView({
  data,
  productId,
  isLoading,
  isError,
  onDelete,
  onAcknowledge,
  onSelectRequirement,
  onShowEdition,
}) {
  const storageKey = `productRequirementTreeExpandedKeys:${productId}`;
  const [expansion, setExpansion] = useState({ scope: null, keys: [] });

  useEffect(() => {
    let keys = [];
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (
        Array.isArray(stored) &&
        stored.every((key) => typeof key === "string")
      )
        keys = stored;
    } catch {
      /* Continue normally when storage is unavailable. */
    }
    setExpansion({ scope: storageKey, keys });
  }, [storageKey]);

  const handleExpand = (keys) => {
    setExpansion({ scope: storageKey, keys });
    try {
      localStorage.setItem(storageKey, JSON.stringify(keys));
    } catch {
      /* Optional persistence. */
    }
  };

  const treeData = useMemo(() => {
    const transform = (nodes) =>
      nodes.map((node) => ({
        ...node,
        title: (
          <div className="flex flex-row justify-between items-center w-full">
            {node.kind === "edition" ? (
              <span className="w-full gap-2">
                <bdi dir="ltr">{node.label}</bdi> -
                <FiberManualRecordIcon
                  fontSize="small"
                  className={
                    node.edition.state === 10
                      ? "text-[#f5222d]"
                      : node.edition.state === 20
                        ? "text-[#faad14]"
                        : node.edition.state === 30
                          ? "text-[#52c41a]"
                          : node.edition.state === 40
                            ? "text-[#722ed1]"
                            : "text-[#faad14]"
                  }
                />
                {node.edition.description}
              </span>
            ) : (
              <span>{node.label}</span>
            )}
            {node.kind === "requirement" && (
              <Space>
                <Button
                  size="small"
                  type="text"
                  icon={<DeleteOutlined />}
                  title="حذف الزام محصول"
                  aria-label="حذف الزام محصول"
                  className="text-red-500 hover:text-red-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete?.(node.requirement);
                  }}
                />
                <Button
                  size="small"
                  type="text"
                  icon={<RightOutlined />}
                  title="تصدیق الزام"
                  aria-label="تصدیق الزام"
                  className="text-sky-500 hover:text-sky-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAcknowledge?.(node.requirement);
                  }}
                />
              </Space>
            )}
            {node.kind === "edition" && (
              <Space>
                <Button
                  size="small"
                  type="text"
                  icon={<EyeOutlined />}
                  title="جزئیات نسخه"
                  aria-label="جزئیات نسخه"
                  className="text-sky-500 hover:text-sky-700"
                  onDoubleClick={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onShowEdition?.(node);
                  }}
                />
              </Space>
            )}
          </div>
        ),
        children: transform(node.children),
      }));
    return transform(buildRequirementTree(data));
  }, [data, onDelete, onAcknowledge, onShowEdition]);

  return isLoading || isError ? (
    <div className="flex justify-center items-center min-h-[160px]">
      {isLoading ? (
        <span className="text-slate-500">در حال بارگذاری...</span>
      ) : (
        <span className="text-red-500">خطا در بارگذاری داده‌ها</span>
      )}
    </div>
  ) : (
    <Tree
      className="custom-product-tree"
      data={treeData}
      isLoading={isLoading}
      isError={isError}
      showLine={true}
      checkable={false}
      showIcon={false}
      blockNode
      showRightClickMenu={false}
      expandedKeys={expansion.scope === storageKey ? expansion.keys : []}
      onExpand={handleExpand}
      onSelect={(_, { node, selected }) => {
        onSelectRequirement?.(
          selected && node.requirement ? node.requirement.id : null,
        );
      }}
      onDoubleClick={(_, node) => {
        if (node.kind === "edition") onShowEdition?.(node);
      }}
    />
  );
}
