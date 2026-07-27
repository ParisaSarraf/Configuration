import { Button, message, Popconfirm, Progress, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileDoneOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { STATUS_OPTIONS } from "./plan.constants";

const PlanCols = ({ deletePlan, refetch, setModal, getColumnSearchProps }) => {
  return [
    {
      title: "محصول",
      key: "product_name",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">
            {record.product_name ?? "—"}
          </span>
          <span className="text-xs text-slate-400">
            کد: {record.product?.code ?? "—"}
          </span>
        </div>
      ),
    },
    {
      title: "سال",
      dataIndex: "year",
      align: "center",
      ...getColumnSearchProps("year", " سال"),
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      align: "center",
      render: (s) => {
        const meta = STATUS_OPTIONS.find((o) => o.value === s);
        return <Tag color={meta?.color ?? "default"}>{meta?.label ?? s}</Tag>;
      },
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
      ellipsis: { showTitle: false },
      render: (notes) =>
        notes ? (
          <Tooltip placement="topRight" title={notes}>
            <span>{notes}</span>
          </Tooltip>
        ) : (
          "—"
        ),
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
          <Tooltip title="پیش بینی">
            <Button
              type="text"
              icon={<NumberOutlined />}
              className="text-yellow-600 border border-yellow-600"
              onClick={() =>
                setModal({ mode: "actual", data: record, type: "actualModal" })
              }
              size="small"
            />
          </Tooltip>
          <Tooltip title="انجام شده">
            <Button
              type="text"
              icon={<FileDoneOutlined />}
              className="text-purple-600 border border-purple-600"
              onClick={() =>
                setModal({ mode: "period", data: record, type: "periodModal" })
              }
              size="small"
            />
          </Tooltip>
          <Tooltip title="جزئیات">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-sky-600 border border-sky-600"
              onClick={() =>
                setModal({ mode: "show", data: record, type: "showDetail" })
              }
              size="small"
            />
          </Tooltip>
        </div>
      ),
    },
  ];
};

export default PlanCols;
