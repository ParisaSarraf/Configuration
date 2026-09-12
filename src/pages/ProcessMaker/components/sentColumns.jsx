import { Button, Tag, Tooltip } from "antd";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import { EyeOutlined } from "@ant-design/icons";

const sentColumns = ({ page, pageSize = 8, onView }) => [
  {
    title: "ردیف",
    key: "index",
    width: 72,
    render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
  },
  {
    title: "فرایند",
    dataIndex: "processName",
    key: "processName",
    render: (value) => value || "—",
  },
  {
    title: "فرم",
    dataIndex: "formName",
    key: "formName",
    render: (value) => <Tag color="blue">{value || "—"}</Tag>,
  },
  {
    title: "ارسال‌کننده",
    key: "submitter",
    render: (_value, record) =>
      record?.submitterName ||
      (record?.submitterId ? `#${record.submitterId}` : "ادمین"),
  },
  {
    title: "ایستگاه شروع",
    dataIndex: "stateName",
    key: "stateName",
    render: (value) => (value ? <Tag color="green">{value}</Tag> : "—"),
  },
  {
    title: "تعداد فیلد تکمیل‌شده",
    dataIndex: "fieldCount",
    key: "fieldCount",
    width: 160,
  },
  {
    title: "زمان ارسال",
    dataIndex: "sentAt",
    key: "sentAt",
    render: (value) => (
      <Tag color="purple">
        {value ? georgianDateTimeToJalaliDateTime(value) : "—"}
      </Tag>
    ),
  },
  {
    title: "عملیات",
    key: "operations",
    width: 220,
    align: "left",
    render: (_value, record) => {
      const hasData = Boolean(
        record?.formData && Object.keys(record.formData).length,
      );

      return (
        <Tooltip
          title={hasData ? "" : "مقادیر این ارسال در این مرورگر ذخیره نشده است"}
        >
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onView?.(record)}
          >
            مشاهده فرم ثبت شده
          </Button>
        </Tooltip>
      );
    },
  },
];

export default sentColumns;
