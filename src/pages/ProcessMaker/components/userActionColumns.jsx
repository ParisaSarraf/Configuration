import { Button, Tag } from "antd";
import { EditOutlined, PartitionOutlined } from "@ant-design/icons";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const jalali = (value) => {
  if (!value) return "—";
  const text = georgianDateTimeToJalaliDateTime(String(value));
  return text && !String(text).includes("Invalid") ? text : "—";
};

const userActionColumns = ({ page = 1, pageSize = 8, onComplete }) => [
  {
    title: "ردیف",
    key: "index",
    width: 68,
    align: "center",
    render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
  },
  {
    title: "فرایند و درخواست",
    key: "process",
    render: (_value, record) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <PartitionOutlined className="text-blue-500" />
          <span className="truncate">{record.processName || "بدون نام"}</span>
        </div>
        <div className="mt-1 truncate text-xs text-slate-400">
          {record.title || "درخواست فرایند"}
        </div>
      </div>
    ),
  },
  {
    title: "مرحله فعلی",
    key: "state",
    width: 190,
    align: "center",
    render: (_value, record) => (
      <Tag color="processing" className="!px-3 !py-1 !font-semibold">
        {record.stateName || "بدون مرحله"}
      </Tag>
    ),
  },
  {
    title: "زمان ورود",
    key: "createdAt",
    width: 180,
    align: "center",
    render: (_value, record) => jalali(record.createdAt),
  },
  {
    title: "اقدام",
    key: "action",
    width: 220,
    align: "center",
    render: (_value, record) => (
      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={() => onComplete?.(record)}
      >
        تکمیل فرم و اقدام
      </Button>
    ),
  },
];

export default userActionColumns;
