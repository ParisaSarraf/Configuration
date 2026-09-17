import { Button, Tag, Tooltip } from "antd";
import { EyeOutlined, PaperClipOutlined } from "@ant-design/icons";
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

const processRequestColumns = ({ page = 1, pageSize = 8, onView }) => [
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
    title: "تاریخ درخواست",
    key: "createdAt",
    width: 170,
    align: "center",
    render: (_value, record) => jalali(record?.createdAt),
  },
  {
    title: "عملیات",
    key: "actions",
    width: 170,
    align: "center",
    render: (_value, record) => (
      <Tooltip title="نمایش فرم پرشده این درخواست">
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView?.(record)}
          disabled={!record?.submissionId}
        >
          مشاهده فرم پرشده
        </Button>
      </Tooltip>
    ),
  },
];

export default processRequestColumns;
