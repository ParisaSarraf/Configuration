import { Empty, Tag } from "antd";
import { ArrowDownOutlined, LockOutlined } from "@ant-design/icons";
import {
  graphBounds,
  layoutGraph,
} from "../ProcessBuilder/processGraph";
import { getStateType } from "../ProcessBuilder/processSchema";

const NODE_WIDTH = 184;
const NODE_HEIGHT = 76;

const ProcessFlowOverview = ({
  graph,
  selectedRoleId = null,
  stateCounts = new Map(),
}) => {
  if (!graph?.nodes?.length)
    return <Empty description="هنوز ایستگاهی برای این فرایند ساخته نشده است" />;

  const laidOut = layoutGraph(graph);
  const bounds = graphBounds(laidOut.nodes);
  const width = Math.max(620, bounds.maxX + 48);
  const height = Math.max(240, bounds.maxY + 48);
  const nodesById = new Map(
    laidOut.nodes.map((node) => [String(node.id), node]),
  );

  return (
    <div className="overflow-x-auto rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
      <div
        className="relative mx-auto"
        style={{ width, height }}
        aria-label="نمای مسیر فرایند"
      >
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={height}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="dashboard-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
            </marker>
          </defs>
          {laidOut.edges.map((edge) => {
            const source = nodesById.get(String(edge.source));
            const target = nodesById.get(String(edge.target));
            if (!source || !target) return null;
            const x1 = source.x + NODE_WIDTH / 2;
            const y1 = source.y + NODE_HEIGHT;
            const x2 = target.x + NODE_WIDTH / 2;
            const y2 = target.y;
            const middleY = (y1 + y2) / 2;
            return (
              <path
                key={edge.id ?? `${edge.source}-${edge.target}`}
                d={`M ${x1} ${y1} C ${x1} ${middleY}, ${x2} ${middleY}, ${x2} ${y2 - 5}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#dashboard-arrow)"
              />
            );
          })}
        </svg>

        {laidOut.nodes.map((node) => {
          const type = getStateType(node.stateTypeId);
          const TypeIcon = type.Icon;
          const roleIsAllowed =
            !selectedRoleId ||
            (node.permissions ?? []).some(
              (permission) =>
                String(permission.groupId) === String(selectedRoleId),
            );
          const requestCount = Number(
            stateCounts.get(String(node.id)) ?? 0,
          );
          return (
            <div
              key={node.id}
              className={`absolute flex h-[76px] w-[184px] flex-col justify-center rounded-2xl border bg-white px-4 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900 ${
                roleIsAllowed
                  ? "opacity-100"
                  : "scale-[0.98] opacity-25 grayscale"
              }`}
              style={{
                left: node.x,
                top: node.y,
                borderColor: `${type.stroke}55`,
              }}
            >
              <div className="flex items-center gap-2">
                <TypeIcon style={{ color: type.stroke }} />
                <span className="min-w-0 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                  {node.name || "ایستگاه بدون نام"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Tag bordered={false} className="m-0 text-[10px]">
                    {type.shortLabel}
                  </Tag>
                  {requestCount > 0 ? (
                    <Tag color="geekblue" className="m-0 text-[10px]">
                      {requestCount.toLocaleString("fa-IR")} درخواست
                    </Tag>
                  ) : null}
                </span>
                {node.lockedFieldIds?.length ? (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600">
                    <LockOutlined />
                    {node.lockedFieldIds.length} فیلد
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ArrowDownOutlined />
        جهت حرکت درخواست از بالا به پایین است
      </div>
    </div>
  );
};

export default ProcessFlowOverview;