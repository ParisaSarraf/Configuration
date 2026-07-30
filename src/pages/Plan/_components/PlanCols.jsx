import { Button, message, Popconfirm, Progress, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { STATUS_OPTIONS } from "./plan.constants";
import {
  getAchievementColor,
  getAchievementStatus,
  truncateWords,
} from "../../../utils/chart.theme";

const PlanCols = ({
  plans,
  deletePlan,
  refetch,
  setModal,
  getColumnSearchProps,
}) => {
  const totalWeight = (plans ?? []).reduce(
    (sum, item) => sum + (Number(item?.weight) || 0),
    0,
  );

  return [
    {
      title: "محصول",
      key: "product",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">
            {record.product?.persian_title || record.product_name || "—"}
          </span>

          {record.product?.code && (
            <span className="text-xs text-slate-400">
              کد: {record.product.code}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "سال",
      dataIndex: "year",
      align: "center",
      sorter: (a, b) => (a.year ?? 0) - (b.year ?? 0),
      ...getColumnSearchProps("year", " سال"),
    },
    {
      title: "نام کارفرما",
      dataIndex: ["contractor", "name"],
      align: "center",
      sorter: (a, b) => (a.contractor?.name ?? 0) - (b.contractor?.name ?? 0),
      ...getColumnSearchProps("contractor.name", " نام کارفرما"),
    },
    {
      title: `وزن (${totalWeight})`,
      dataIndex: "weight",
      align: "center",
      sorter: (a, b) => (a.weight ?? 0) - (b.weight ?? 0),
      ...getColumnSearchProps("weight", "وزن"),
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      align: "center",
      filters: STATUS_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.status === value,
      render: (s) => {
        const meta = STATUS_OPTIONS.find((o) => o.value === s);
        return <Tag color={meta?.color ?? "default"}>{meta?.label ?? s}</Tag>;
      },
    },
    {
      title: "مقدار برنامه‌ریزی شده",
      dataIndex: "total_planned_quantity",
      align: "center",
      sorter: (a, b) =>
        (a.total_planned_quantity ?? 0) - (b.total_planned_quantity ?? 0),
      render: (v) => (
        <span className="tabular-nums">
          {v?.toLocaleString("fa-IR") ?? "—"}
        </span>
      ),
    },
    {
      title: "پیشرفت سال",
      dataIndex: "year_progress_percent",
      align: "center",
      width: 140,
      sorter: (a, b) =>
        (a.year_progress_percent ?? 0) - (b.year_progress_percent ?? 0),
      render: (v) => (
        <Progress
          percent={v ?? 0}
          size="small"
          status={getAchievementStatus(v)}
          strokeColor={getAchievementColor(v)}
        />
      ),
    },
    {
      title: "توضیحات",
      dataIndex: "notes",
      ellipsis: { showTitle: false },
      render: (notes) =>
        notes ? (
          <Tooltip title={notes || "—"}>
            <span>{truncateWords(notes, 5)}</span>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "عملیات",
      key: "actions",
      align: "center",
      width: 130,
      render: (_, record) => (
        <div
          className="flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600"
              onClick={() =>
                setModal({ mode: "edit", data: record, type: "addPlan" })
              }
              size="small"
            />
          </Tooltip>

          <Tooltip title="جزئیات">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-sky-600"
              onClick={() =>
                setModal({ mode: "show", data: record, type: "showDetail" })
              }
              size="small"
            />
          </Tooltip>

          <Tooltip title="افزودن دوره تولید">
            <Button
              type="text"
              icon={<FileDoneOutlined />}
              className="text-purple-600"
              onClick={() =>
                setModal({ mode: "period", data: record, type: "periodModal" })
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
            <Tooltip title="حذف">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];
};

export default PlanCols;
