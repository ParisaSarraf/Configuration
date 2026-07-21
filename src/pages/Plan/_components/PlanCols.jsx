import { Button, message, Popconfirm, Progress, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const PlanCols = ({ deletePlan, refetch }) => {
  const STATUS_OPTIONS = [
    { value: "draft", label: "پیش‌نویس" },
    { value: "approved", label: "تأیید شده" },
    { value: "active", label: "تکمیل شده" },
    { value: "revised", label: "لغو و بازبینی" },
    { value: "closed", label: "لغو و بسته" },
  ];

  return [
    {
      title: "محصول",
      key: "product",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">
            {record.product?.persian_title ?? "—"}
          </span>
          <span className="text-xs text-slate-400">
            کد: {record.product?.code ?? "—"}
          </span>
        </div>
      ),
    },
    { title: "شماره نسخه", dataIndex: "version_number", align: "center" },
    {
      title: "وضعیت",
      dataIndex: "status",
      align: "center",
      render: (s) => (
        <Tag
          color={STATUS_OPTIONS.find((o) => o.value === s)?.color ?? "default"}
        >
          {STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}
        </Tag>
      ),
    },
    {
      title: "مقدار برنامه‌ریزی شده",
      dataIndex: "total_planned_quantity",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR"),
    },
    {
      title: "پیشرفت سال",
      dataIndex: "year_progress_percent",
      align: "center",
      width: 140,
      render: (v) => <Progress percent={v ?? 0} size="small" />,
    },
    {
      title: "ایجاد کننده",
      dataIndex: "created_by",
      align: "center",
      render: (u) => (u ? `${u.name ?? ""} ${u.last_name ?? ""}`.trim() : "—"),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "created_at",
      align: "center",
      render: (d) => (d ? new Date(d).toLocaleDateString("fa-IR") : "—"),
    },
    {
      title: "توضیحات",
      dataIndex: "notes",
      ellipsis: true,
      //   render: () => {
      //     <Tooltip>{notes}</Tooltip>;
      //   },
    },
    {
      title: "عملیات",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 border border-green-600"
              onClick={() =>
                setModal({ mode: "edit", data: record, type: "addPlan" })
              }
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="حذف برنامه تولید"
            description="آیا از حذف این برنامه مطمئن هستید؟"
            okText="بله، حذف کن"
            cancelText="انصراف"
            okButtonProps={{ danger: true, loading: deletePlan.isPending }}
            onConfirm={() => {
              deletePlan
                .mutateAsync(record.id)
                .then(() => {
                  message.success("برنامه تولید با موفقیت حذف شد");
                  refetch();
                })
                .catch((error) => {
                  message.error("خطا در حذف برنامه تولید");
                  console.error(error);
                });
            }}
          >
            <Button
              type="text"
              className="border border-red-600"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];
};

export default PlanCols;
