import { Button, Tag, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const todoColumns = ({ page, setActiveProcess, pageSize = 8 }) => [
  {
    title: "ردیف",
    key: "index",
    width: 72,
    render: (_value, _record, index) => (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {(page - 1) * pageSize + index + 1}
      </span>
    ),
  },
  {
    title: "نام فرم",
    dataIndex: "name",
    key: "name",
    render: (value, record) => (
      <Tooltip title={record?.description || ""}>
        <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
          <FileTextOutlined className="text-slate-400" />
          {value || "بدون نام"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "دسته‌بندی",
    key: "category",
    render: (_value, record) =>
      record?.category?.name ? (
        <Tag color="geekblue">{record.category.name}</Tag>
      ) : (
        "—"
      ),
  },
  {
    title: "سازنده",
    key: "created_by",
    render: (_value, record) => {
      const u = record?.created_by;
      if (!u) return "—";
      const full = [u.name, u.last_name].filter(Boolean).join(" ").trim();
      return full || u.username || "—";
    },
  },
  {
    title: "وضعیت",
    dataIndex: "is_active",
    key: "is_active",
    width: 110,
    render: (value) =>
      value ? (
        <Tag icon={<CheckCircleOutlined />} color="green">
          فعال
        </Tag>
      ) : (
        <Tag icon={<CloseCircleOutlined />} color="default">
          غیرفعال
        </Tag>
      ),
  },
  {
    title: "نسخه",
    dataIndex: "version",
    key: "version",
    width: 80,
    render: (value) => <Tag color="blue">v{value ?? "—"}</Tag>,
  },
  {
    title: "حداکثر ارسال",
    dataIndex: "max_submissions",
    key: "max_submissions",
    width: 120,
    render: (value) => (value == null ? "نامحدود" : value),
  },
  {
    title: "ذخیره خودکار",
    dataIndex: "enable_auto_save",
    key: "enable_auto_save",
    width: 140,
    render: (value, record) =>
      value ? (
        <Tag color="cyan">هر {record.auto_save_interval ?? "?"} ثانیه</Tag>
      ) : (
        <Tag color="default">خاموش</Tag>
      ),
  },
  {
    title: "تاریخ ایجاد",
    dataIndex: "created_at",
    key: "created_at",
    width: 180,
    render: (value) =>
      value ? (
        <Tag color="purple">{georgianDateTimeToJalaliDateTime(value)}</Tag>
      ) : (
        "—"
      ),
  },
  {
    title: "عملیات",
    key: "operations",
    width: 220,
    align: "left",
    render: (_value, record) => (
      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={() => setActiveProcess(record)}
      >
        مشاهده و تکمیل فرم
      </Button>
    ),
  },
];

export default todoColumns;