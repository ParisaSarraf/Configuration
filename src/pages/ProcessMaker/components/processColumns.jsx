import { Button, Tooltip } from "antd";
import { EyeOutlined, PartitionOutlined } from "@ant-design/icons";

const processColumns = ({ page, pageSize = 8, onViewRequests, onViewPath }) => [
  {
    title: "ردیف",
    key: "index",
    width: 72,
    align: "center",
    render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
  },
  {
    title: "نام فرآیند",
    dataIndex: "name",
    key: "name",
    render: (value, record) => (
      <div className="flex flex-col">
        <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
          <PartitionOutlined className="text-slate-400" />
          {value || "بدون نام"}
        </span>
        {record?.description ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {record.description}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    title: "دسترسی سریع",
    key: "operations",
    width: 360,
    align: "center",
    render: (_value, record) => (
      <div className="flex flex-wrap justify-center gap-2">
        <Tooltip title="نمایش و پیگیری درخواست‌های جاری این فرایند">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewRequests?.(record)}
          >
            مشاهده درخواست‌ها
          </Button>
        </Tooltip>
        <Tooltip title="نمایش مسیر فرایند به‌صورت فقط‌خواندنی">
          <Button
            icon={<PartitionOutlined />}
            onClick={() => onViewPath?.(record)}
          >
            مشاهده مسیر
          </Button>
        </Tooltip>
      </div>
    ),
  },
];

export default processColumns;
