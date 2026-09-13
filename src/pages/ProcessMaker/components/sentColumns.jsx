import { Button, Tag, Tooltip } from "antd";
import { EyeOutlined, PaperClipOutlined } from "@ant-design/icons";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const jalali = (value) => {
  if (!value) return "—";
  const text = georgianDateTimeToJalaliDateTime(String(value));
  return text && !String(text).includes("Invalid") ? text : "—";
};

/**
 * ستون‌های جدول «ارسال‌شده‌ها».
 * ردیف‌ها خروجی sentRowsFromRequests / sentRowsFromSubmissions هستند
 * (هر دو مستقیماً از سرور).
 */
const sentColumns = ({ page = 1, pageSize = 8, onView }) => [
  {
    title: "ردیف",
    key: "index",
    width: 64,
    align: "center",
    render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
  },
  {
    title: "فرایند",
    key: "process",
    render: (_value, record) =>
      record?.processName ? (
        <div className="flex flex-col">
          <span className="font-semibold">{record.processName}</span>
          {record?.title ? (
            <span className="text-xs opacity-70">{record.title}</span>
          ) : null}
        </div>
      ) : (
        <span className="opacity-60">بدون فرایند</span>
      ),
  },
  {
    title: "ایستگاه جاری",
    key: "state",
    width: 150,
    align: "center",
    render: (_value, record) =>
      record?.stateName ? (
        <Tag color="purple">{record.stateName}</Tag>
      ) : (
        <span className="opacity-60">—</span>
      ),
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
    title: "ارسال‌کننده",
    key: "submitter",
    width: 160,
    render: (_value, record) =>
      record?.submitter?.name || record?.submitter?.username || "نامشخص",
  },
  {
    title: "فیلد تکمیل‌شده",
    dataIndex: "fieldCount",
    key: "fieldCount",
    width: 130,
    align: "center",
    render: (value) => value ?? 0,
  },
  {
    title: "پیوست‌ها",
    key: "attachments",
    width: 110,
    align: "center",
    render: (_value, record) => {
      const count = record?.attachments?.length ?? 0;
      if (!count) return <span className="opacity-60">—</span>;
      return (
        <Tag icon={<PaperClipOutlined />} color="gold">
          {count}
        </Tag>
      );
    },
  },
  {
    title: "زمان ارسال",
    key: "createdAt",
    width: 170,
    align: "center",
    render: (_value, record) => jalali(record?.createdAt),
  },
  {
    title: "عملیات",
    key: "actions",
    width: 190,
    align: "center",
    render: (_value, record) => (
      <Tooltip title="همان فرم با مقادیر ثبت‌شده نمایش داده می‌شود">
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView?.(record)}
        >
          مشاهدهٔ فرم پرشده
        </Button>
      </Tooltip>
    ),
  },
];

export default sentColumns;
