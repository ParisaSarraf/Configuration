import { useId } from "react";
import { Popover } from "antd";
import { BASEURL } from "@/Services/axiosInstance.js";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const getWorkflowUserName = (user) =>
  [user?.name, user?.last_name].filter(Boolean).join(" ") ||
  user?.username ||
  "کاربر نامشخص";

const getWorkflowUserImage = (user) => {
  const path = user?.signature_image || user?.temp_image;
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${BASEURL.replace("/api/v1", "")}${path.startsWith("/") ? "" : "/"}${path}`;
};

const WorkflowUserAvatar = ({ user, tone = "blue", size = "small" }) => {
  const name = getWorkflowUserName(user);
  const image = getWorkflowUserImage(user);
  const dimension = size === "large" ? "h-8 w-8" : "h-6 w-6";
  return image ? (
    <img
      src={image}
      alt={name}
      className={`${dimension} shrink-0 rounded-full border-2 border-white object-cover shadow-sm`}
    />
  ) : (
    <span
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
        tone === "orange" ? "bg-orange-500" : "bg-blue-600"
      }`}
    >
      {name.slice(0, 1)}
    </span>
  );
};

export default function WorkflowGraph({ steps, currentState, logs, subject = "سند" }) {
  const markerId = useId().replace(/:/g, "");
  const width = Math.max(780, 195 * (steps.length - 1) + 195);
  const height = 220;
  const nodeWidth = 120;
  const nodeHeight = 56;
  const nodeY = 120;
  const startX = width - 80;
  const spacing = 195;
  const point = (index) => startX - index * spacing;

  const indexByValue = new Map(
    steps.map((step, index) => [Number(step.value), index]),
  );

  // رفت‌وبرگشت‌های تکراری بین یک مبدأ و مقصد در یک مسیر تجمیع می‌شوند؛
  // به‌جای چند خط روی هم، فقط آخرین کاربر و تعداد تغییرها دیده می‌شود.
  const groupedRoutes = new Map();
  logs.forEach((log) => {
    const fromIndex = indexByValue.get(Number(log.from_state));
    const toIndex = indexByValue.get(Number(log.to_state));
    if (fromIndex == null || toIndex == null || fromIndex === toIndex) return;
    const key = `${fromIndex}-${toIndex}`;
    if (!groupedRoutes.has(key)) {
      groupedRoutes.set(key, {
        key,
        fromIndex,
        toIndex,
        isReturn: toIndex < fromIndex,
        items: [],
      });
    }
    groupedRoutes.get(key).items.push(log);
  });

  const routes = Array.from(groupedRoutes.values()).map((route) => {
    const items = [...route.items].sort(
      (a, b) =>
        new Date(a.changed_at || 0).getTime() -
        new Date(b.changed_at || 0).getTime(),
    );
    const sourceX = point(route.fromIndex);
    const targetX = point(route.toIndex);
    const direction = targetX > sourceX ? 1 : -1;
    const start = sourceX + direction * (nodeWidth / 2 + 5);
    const end = targetX - direction * (nodeWidth / 2 + 8);
    const middle = (start + end) / 2;
    const distance = Math.abs(route.toIndex - route.fromIndex);
    const curve = 82 + Math.max(0, distance - 1) * 14;
    const controlY = route.isReturn ? nodeY + curve : nodeY - curve;
    const labelY = (nodeY + controlY) / 2;

    return {
      ...route,
      items,
      latest: items[items.length - 1],
      path: `M ${start} ${nodeY} Q ${middle} ${controlY} ${end} ${nodeY}`,
      labelX: middle,
      labelY,
    };
  });

  const renderRouteDetails = (route, fromLabel, toLabel) => (
    <div dir="rtl" className="w-72 max-w-[75vw]">
      <div className="mb-2 border-b border-slate-100 pb-2">
        <div className="text-xs font-bold text-slate-700">
          {fromLabel} ← {toLabel}
        </div>
        <div
          className={`mt-1 text-[10px] font-medium ${
            route.isReturn ? "text-orange-600" : "text-blue-600"
          }`}
        >
          {route.isReturn ? "مسیر برگشت" : "مسیر رفت"} ·{" "}
          {route.items.length.toLocaleString("fa-IR")} بار
        </div>
      </div>
      <div className="max-h-56 space-y-2 overflow-y-auto pl-1">
        {[...route.items].reverse().map((item, index) => {
          const person = getWorkflowUserName(item.changed_by);
          const role =
            item.changed_by?.role?.name ||
            item.changed_by?.username ||
            item.changed_by?.email;
          return (
            <div
              key={item.id ?? `${item.changed_at}-${index}`}
              className="flex gap-2 rounded-lg bg-slate-50 p-2"
            >
              <WorkflowUserAvatar
                user={item.changed_by}
                tone={route.isReturn ? "orange" : "blue"}
                size="large"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold text-slate-700">
                  {person}
                </div>
                {/* {role ? (
                  <div className="truncate text-[9px] text-slate-400">
                    {role}
                  </div>
                ) : null} */}
                <div className="mt-1 text-[9px] text-slate-500" dir="ltr">
                  {item.changed_at
                    ? georgianDateTimeToJalaliDateTime(item.changed_at)
                    : "زمان نامشخص"}
                </div>
                {item.comment ? (
                  <div className="mt-1 rounded bg-white px-1.5 py-1 text-[9px] leading-4 text-slate-600">
                    {item.comment}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">
            نمودار گردش {subject}
          </div>
          <div className="text-[10px] text-slate-400">
            آخرین کاربر روی مسیر دیده می‌شود؛ برای تاریخچه کامل روی آن کلیک کنید
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-blue-600">
            <span className="h-0.5 w-5 bg-blue-500" /> رفت
          </span>
          <span className="flex items-center gap-1 text-orange-600">
            <span className="h-0.5 w-5 bg-orange-500" /> برگشت
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="h-0.5 w-5 border-t border-dashed border-slate-400" />{" "}
            مسیر مراحل
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] min-w-[720px] w-full"
          role="img"
          aria-label={`نمودار رفت و برگشت مراحل ${subject}`}
          dir="ltr"
        >
          <defs>
            <marker
              id={`document-flow-base-arrow-${markerId}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
            </marker>
            <marker
              id={`document-flow-forward-arrow-${markerId}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
            </marker>
            <marker
              id={`document-flow-return-arrow-${markerId}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
            </marker>
            <filter
              id={`document-current-shadow-${markerId}`}
              x="-30%"
              y="-40%"
              width="160%"
              height="180%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#2563eb"
                floodOpacity="0.18"
              />
            </filter>
          </defs>

          {steps.slice(0, -1).map((step, index) => {
            const start = point(index) - nodeWidth / 2 - 5;
            const end = point(index + 1) + nodeWidth / 2 + 8;
            return (
              <path
                key={`base-${step.value}`}
                d={`M ${start} ${nodeY} L ${end} ${nodeY}`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                markerEnd={`url(#document-flow-base-arrow-${markerId})`}
              />
            );
          })}

          {routes.map((route) => {
            const color = route.isReturn ? "#ea580c" : "#2563eb";
            const fromLabel =
              steps[route.fromIndex]?.label || route.latest.from_state;
            const toLabel =
              steps[route.toIndex]?.label || route.latest.to_state;
            const person = getWorkflowUserName(route.latest.changed_by);
            const actionTime = route.latest.changed_at
              ? georgianDateTimeToJalaliDateTime(route.latest.changed_at)
              : "زمان نامشخص";

            return (
              <g key={route.key}>
                <path
                  d={route.path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd={
                    route.isReturn
                      ? `url(#document-flow-return-arrow-${markerId})`
                      : `url(#document-flow-forward-arrow-${markerId})`
                  }
                />
                <foreignObject
                  x={route.labelX - 57}
                  y={route.labelY - 15}
                  width="114"
                  height="32"
                  style={{ overflow: "visible" }}
                >
                  <div xmlns="http://www.w3.org/1999/xhtml" dir="rtl">
                    <Popover
                      trigger="click"
                      placement={route.isReturn ? "bottom" : "top"}
                      content={renderRouteDetails(route, fromLabel, toLabel)}
                    >
                      <button
                        type="button"
                        className={`flex h-[30px] w-28 cursor-pointer items-center gap-1 rounded-full border bg-white/95 px-1 shadow-sm transition hover:shadow-md ${
                          route.isReturn
                            ? "border-orange-300 hover:border-orange-500"
                            : "border-blue-300 hover:border-blue-500"
                        }`}
                        title={`${person} · ${actionTime}`}
                      >
                        <WorkflowUserAvatar
                          user={route.latest.changed_by}
                          tone={route.isReturn ? "orange" : "blue"}
                        />
                        <span className="min-w-0 flex-1 text-right">
                          <span className="block truncate text-[8px] font-bold text-slate-700">
                            {person}
                          </span>
                          <span
                            className="block truncate text-[7px] text-slate-400"
                            dir="ltr"
                          >
                            {actionTime}
                          </span>
                        </span>
                        {route.items.length > 1 ? (
                          <span
                            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[8px] font-bold text-white ${
                              route.isReturn ? "bg-orange-500" : "bg-blue-600"
                            }`}
                            title={`${route.items.length} بار جابه‌جایی`}
                          >
                            {route.items.length.toLocaleString("fa-IR")}
                          </span>
                        ) : null}
                      </button>
                    </Popover>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {steps.map((step, index) => {
            const x = point(index);
            const isCurrent = Number(step.value) === Number(currentState);
            return (
              <g key={step.value}>
                <rect
                  x={x - nodeWidth / 2}
                  y={nodeY - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx="12"
                  fill={isCurrent ? "#eff6ff" : "#ffffff"}
                  stroke={isCurrent ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={isCurrent ? "2.5" : "1.5"}
                  filter={
                    isCurrent ? `url(#document-current-shadow-${markerId})` : undefined
                  }
                />
                <circle
                  cx={x}
                  cy={nodeY - nodeHeight / 2}
                  r={isCurrent ? "6" : "4.5"}
                  fill={isCurrent ? "#2563eb" : "#94a3b8"}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={nodeY - 2}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={isCurrent ? "#1d4ed8" : "#334155"}
                  direction="rtl"
                >
                  {step.label}
                </text>
                <text
                  x={x}
                  y={nodeY + 15}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={isCurrent ? "#2563eb" : "#94a3b8"}
                  direction="rtl"
                >
                  {isCurrent
                    ? "وضعیت فعلی"
                    : `مرحله ${(index + 1).toLocaleString("fa-IR")}`}
                </text>
              </g>
            );
          })}

          {!routes.length ? (
            <text
              x={width / 2}
              y="200"
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
              direction="rtl"
            >
              هنوز رفت‌وبرگشتی برای این {subject} ثبت نشده است
            </text>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
