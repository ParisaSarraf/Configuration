import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Space, Spin, Tag } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  FileDoneOutlined,
  ImportOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Tree from "../../../components/Tree";
import RequirementDescription from "./RequirementDescription";
import { buildRequirementTree, canDeleteRequirement, canAddRequirementEdition, canExportRequirementEdition, getRequirementState, getSelectedEdition } from "../utils/requirementTree";
import { canRunRequirementWorkflow } from "../utils/requirementWorkflow";

export default function RequirementTreeView({
  data,
  productId,
  focusEditionId,
  isLoading,
  isError,
  onRetry,
  onDelete,
  onAcknowledge,
  onEdition,
  onSelectEdition,
  onShowEdition,
  onWorkflow,
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

  // When arriving from an acceptor, reveal the selected edition in its product tree.
  useEffect(() => {
    if (focusEditionId == null || !data) return;
    const findParents = (nodes, parents = []) => {
      for (const node of nodes) {
        if (node.kind === "edition" && String(node.edition?.id) === String(focusEditionId)) return parents;
        const found = findParents(node.children, [...parents, node.key]);
        if (found) return found;
      }
      return null;
    };
    const parents = findParents(buildRequirementTree(data));
    if (parents) setExpansion((previous) => ({
      scope: storageKey,
      keys: [...new Set([...(previous.scope === storageKey ? previous.keys : []), ...parents])],
    }));
  }, [data, focusEditionId, storageKey]);

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
                <bdi dir="ltr">{node.label}</bdi>{" "}
                {focusEditionId != null && String(node.edition.id) === String(focusEditionId) && <Tag color="purple">نسخه انتخاب‌شده</Tag>}
                {node.isImported && (
                  <Tag color="blue" icon={<ImportOutlined />} title="این نسخه به محصول جاری وارد شده است">
                    واردشده
                  </Tag>
                )} {" "}
                <FiberManualRecordIcon
                  fontSize="small"
                  style={{ color: getRequirementState(node.edition.state).color }}
                />
                <RequirementDescription value={node.edition} />
              </span>
            ) : (
              <span>{node.label}{node.kind === "requirement" && <RequirementDescription value={node.requirement} />}</span>
            )}
            {node.kind === "requirement" && (
              <Space>
                {canDeleteRequirement(node.requirement) && (
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
                )}

                {canAddRequirementEdition(node.requirement) && <Button
                  size="small"
                  type="text"
                  icon={<PlusOutlined />}
                  title="تعریف الزام"
                  aria-label="تعریف الزام"
                  className="text-green-500 hover:text-green-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdition?.(node.requirement);
                  }}
                />}
              </Space>
            )}
            {node.kind === "edition" && (
              <Space>
                {(canRunRequirementWorkflow(node.requirement, node.edition) || (node.requirement?.imported === true && node.edition?.id != null)) && (
                  <Button size="small" type="text" icon={<FileDoneOutlined />}
                    title="روال الزام" aria-label="روال الزام"
                    className="text-purple-500 hover:text-purple-700"
                    onClick={(event) => { event.stopPropagation(); onWorkflow?.(node); }} />
                )}
                {canExportRequirementEdition(node.requirement, node.edition) && (
                <Button
                  size="small"
                  type="text"
                  icon={<RightOutlined />}
                  title="ارسال نسخه به زیرمحصول"
                  aria-label="ارسال نسخه به زیرمحصول"
                  className="text-blue-500 hover:text-blue-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAcknowledge?.(node);
                  }}
                />
                )}
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
  }, [data, focusEditionId, onDelete, onAcknowledge, onEdition, onShowEdition, onWorkflow]);

  return isLoading ? (
    <div
      role="status"
      className="flex justify-center items-center min-h-[160px]"
    >
      <Spin tip="در حال بارگذاری الزامات..." size="large">
        <div style={{ minWidth: 180, minHeight: 80 }} />
      </Spin>
    </div>
  ) : isError ? (
    <Alert
      type="error"
      showIcon
      message="خطا در بارگذاری الزامات"
      action={<Button onClick={() => onRetry?.()}>تلاش دوباره</Button>}
    />
  ) : !treeData.length ? (
    <Empty description="الزامی برای این محصول ثبت نشده است" />
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
        onSelectEdition?.(getSelectedEdition(node, selected));
      }}
      onDoubleClick={(_, node) => {
        if (node.kind === "edition") onShowEdition?.(node);
      }}
    />
  );
}
