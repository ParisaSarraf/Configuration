import { Tag } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const jalali = (value) => {
  if (!value) return "—";
  const text = georgianDateTimeToJalaliDateTime(String(value));
  return text && !String(text).includes("Invalid") ? text : "—";
};

const fullName = (user) => {
  if (!user) return "نامشخص";
  return [user.name, user.last_name].filter(Boolean).join(" ").trim() || user.username || "نامشخص";
};

const processRequestColumns = ({ page = 1, pageSize = 8 }) => [
  {
    title: "ردیف",
    key: "index",
    width: 64,
    align: "center",
    render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
  },
  {
    title: "فرایند",
    key: "processName",
    width: 180,
    render: (_value, record) => (
      <div className="flex flex-col">
        <span className="font-semibold">{record.processName || "—"}</span>
        {record.formDefinitionId ? (
          <span className="text-xs opacity-70">فرم #{record.formDefinitionId}</span>
        ) : null}
      </div>
    ),
  },
  {
    title: "درخواست",
    key: "request",
    render: (_value, record) => (
      <div className="flex flex-col">
        <span className="font-semibold">{record.title || "بدون عنوان"}</span>
        <span className="text-xs opacity-70">درخواست #{record.requestId ?? "—"}</span>
      </div>
    ),
  },
  {
    title: "ایستگاه جاری",
    key: "state",
    width: 150,
    align: "center",
    render: (_value, record) =>
      record?.stateName ? <Tag color="purple">{record.stateName}</Tag> : <span className="opacity-60">—</span>,
  },
  {
    title: "ثبت‌کننده",
    key: "createdBy",
    width: 160,
    render: (_value, record) => fullName(record.createdBy),
  },
  {
    title: "شناسهٔ ارسال",
    dataIndex: "submissionId",
    key: "submissionId",
    width: 110,
    align: "center",
    render: (value) => <Tag color="blue">#{value ?? "—"}</Tag>,
  },
  {
    title: "ارسال‌کننده فرم",
    key: "submitter",
    width: 160,
    render: (_value, record) => fullName(record.submitter),
  },
  {
    title: "فیلدها",
    dataIndex: "fieldCount",
    key: "fieldCount",
    width: 90,
    align: "center",
    render: (value) => value ?? 0,
  },
  {
    title: "پیوست‌ها",
    key: "attachments",
    width: 100,
    align: "center",
    render: (_value, record) => {
      const count = record?.attachments?.length ?? 0;
      if (!count) return <span className="opacity-60">—</span>;
      return <Tag icon={<PaperClipOutlined />} color="gold">{count}</Tag>;
    },
  },
  {
    title: "تاریخ درخواست",
    key: "createdAt",
    width: 170,
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
        <div className="flex max-w-[260px] flex-col gap-1">
          {entries.slice(0, 3).map(([key, value]) => (
            <div key={key} className="truncate text-xs">
              <span className="font-semibold">{key}: </span>
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
];

export default processRequestColumns;
