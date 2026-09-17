import { Button, Space, Tag, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const jalali = (value) => {
  if (!value) return "—";
  const text = georgianDateTimeToJalaliDateTime(String(value));
  return text && !String(text).includes("Invalid") ? text : "—";
};

const fullName = (user) => {
  if (!user) return "نامشخص";
  return (
    [user.name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    "نامشخص"
  );
};

const transitionLabel = (transition) => {
  const action = transition?.actions?.[0]?.action;
  const actionName = action?.name || action?.action_type?.name;
  const nextState = transition?.next_state?.name;
  if (actionName && nextState) return `${actionName} به ${nextState}`;
  return actionName || nextState || "ارجاع";
};

const processRequestColumns = ({ page = 1, pageSize = 8, onView, onReferral }) => [
  {
    title: "ردیف",
    key: "index",
    width: 64,
    align: "center",
    render: (_value, _record, index) => (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-200">
        {(page - 1) * pageSize + index + 1}
      </span>
    ),
  },
  {
    title: "درخواست",
    key: "request",
    width: 230,
    render: (_value, record) => (
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">
          {record.title || "بدون عنوان"}
        </span>
        <div className="flex flex-wrap gap-1">
          <Tag color="blue">درخواست #{record.requestId ?? "—"}</Tag>
          <Tag color="geekblue">ارسال #{record.submissionId ?? "—"}</Tag>
        </div>
      </div>
    ),
  },
  {
    title: "مسیر فعلی",
    key: "statePath",
    width: 260,
    render: (_value, record) => {
      const transition = record.transitions?.[0];
      return (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-l from-slate-50 to-white p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between gap-2">
            <Tag color="purple" className="m-0">{record.stateName || "—"}</Tag>
            {transition?.nextStateName ? (
              <>
                <ArrowLeftOutlined className="text-slate-400" />
                <Tag color="green" className="m-0">{transition.nextStateName}</Tag>
              </>
            ) : null}
          </div>
          {transition?.actionName ? (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              عملیات: {transition.actionName}
            </div>
          ) : null}
        </div>
      );
    },
  },
  {
    title: "ثبت‌کننده",
    key: "createdBy",
    width: 150,
    render: (_value, record) => fullName(record.createdBy),
  },
  {
    title: "ارسال‌کننده فرم",
    key: "submitter",
    width: 150,
    render: (_value, record) => fullName(record.submitter),
  },
  {
    title: "پیوست",
    key: "attachments",
    width: 90,
    align: "center",
    render: (_value, record) => {
      const count = record?.attachments?.length ?? 0;
      if (!count) return <span className="opacity-60">—</span>;
      return <Tag icon={<PaperClipOutlined />} color="blue">{count}</Tag>;
    },
  },
  {
    title: "تاریخ",
    key: "createdAt",
    width: 160,
    align: "center",
    render: (_value, record) => jalali(record?.createdAt),
  },
  {
    title: "مقادیر فرم",
    key: "formData",
    width: 220,
    render: (_value, record) => {
      const entries = Object.entries(record?.formData ?? {});
      if (!entries.length) return <span className="opacity-60">—</span>;
      return (
        <div className="flex max-w-[260px] flex-col gap-1 rounded-xl bg-slate-50 p-2 dark:bg-slate-800/70">
          {entries.slice(0, 3).map(([key, value]) => (
            <div key={key} className="truncate text-xs">
              <span className="font-semibold text-slate-500">{key}: </span>
              <span>{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
            </div>
          ))}
          {entries.length > 3 ? (
            <span className="text-xs opacity-60">+{entries.length - 3} مقدار دیگر</span>
          ) : null}
        </div>
      );
    },
  },
  {
    title: "عملیات",
    key: "actions",
    width: 270,
    fixed: "right",
    align: "center",
    render: (_value, record) => {
      const transitions = record.transitions || [];
      const firstTransition = transitions[0] ?? null;
      return (
        <Space size={8} wrap>
          <Tooltip title="نمایش فرم پرشده این درخواست">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
              disabled={!record?.submissionId}
            >
              فرم پرشده
            </Button>
          </Tooltip>
          <Tooltip
            title={
              firstTransition
                ? transitionLabel(firstTransition)
                : "برای وضعیت فعلی مسیر ارجاعی تعریف نشده است"
            }
          >
            <Button
              type="primary"
              size="small"
              className="!border-none !bg-gradient-to-l !from-blue-600 !to-sky-500 !font-bold shadow-md shadow-blue-500/20 hover:!from-blue-700 hover:!to-sky-600"
              icon={<SendOutlined />}
              onClick={() => onReferral?.(record, firstTransition)}
              disabled={!firstTransition}
            >
              ارجاع
            </Button>
          </Tooltip>
        </Space>
      );
    },
  },
];

export default processRequestColumns;
