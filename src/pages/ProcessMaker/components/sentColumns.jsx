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
    title: "شناسه ارسال",
    dataIndex: "id",
    key: "id",
    width: 100,
    render: (value) => <Tag color="blue">#{value}</Tag>,
  },
  {
    title: "ارسال‌کننده",
    key: "submitter",
    render: (_value, record) =>
      record?.submitter?.name ||
      record?.submitter?.username ||
      (record?.submitter?.id ? `#${record.submitter.id}` : "—"),
  },
  {
    title: "تعداد فیلد تکمیل‌شده",
    key: "fieldCount",
    width: 160,
    render: (_value, record) =>
      Object.keys(record?.form_data ?? {}).length,
  },
  {
    title: "پیوست‌ها",
    key: "attachments",
    width: 100,
    render: (_value, record) =>
      Array.isArray(record?.file_attachments)
        ? record.file_attachments.length
        : 0,
  },
  {
    title: "زمان ارسال",
    dataIndex: "created_at",
    key: "created_at",
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
        record?.form_data && Object.keys(record.form_data).length,
      );
      return (
        <Tooltip title={hasData ? "" : "داده‌ای برای این ارسال موجود نیست"}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onView?.(record)}
          >
            مشاهده فرم ثبت‌شده
          </Button>
        </Tooltip>
      );
    },
  },
];

export default sentColumns;