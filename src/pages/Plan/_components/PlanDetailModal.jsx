import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  message,
  Popconfirm,
  Progress,
  Skeleton,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Modal from "../../../components/Modal";
import {
  useDeleteProductionActual,
  useDeleteProductionPlanPeriod,
  useProductionPlanOne,
} from "../../../QueryServises/PlanQuery";
import { STATUS_OPTIONS } from "./plan.constants";
import { TableAntd } from "../../../components/TableAntd/TableAntd";
import { georgianDateToJalaliDate } from "../../../utils/timeTool";
import { MONTH_NAMES, QuantityTrendChart } from "./PlanPeriodsChart";
import PeriodModal from "./periodModal";
import PlanModal from "./PlanModal";
import ActualModal from "./actualModal";

const faNum = (v) => (v ?? 0).toLocaleString("fa-IR");

const SectionTitle = ({ children }) => (
  <h3 className="text-base font-bold text-slate-800 mb-4">{children}</h3>
);

const PlanDetailModal = ({ isOpen, modalData, closeModal, refetch }) => {
  const {
    data,
    isLoading,
    refetch: refetchPlan,
  } = useProductionPlanOne({
    productionPlanId: modalData?.id,
  });

  const [quickModal, setQuickModal] = useState(null); // "period" | "edit" | null
  const [periodModalState, setPeriodModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });
  const [actualModalState, setActualModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });

  const deleteActual = useDeleteProductionActual();
  const deletePeriod = useDeleteProductionPlanPeriod();

  const closeQuickModal = () => setQuickModal(null);

  const openPeriodModal = (mode, data) =>
    setPeriodModalState({ open: true, mode, data });

  const closePeriodModal = () =>
    setPeriodModalState((prev) => ({ ...prev, open: false }));

  const openActualModal = (mode, data) =>
    setActualModalState({
      open: true,
      mode,
      data: mode === "add" ? { ...data, production_plan_id: plan?.id } : data,
    });

  const closeActualModal = () =>
    setActualModalState((prev) => ({ ...prev, open: false }));

  const handleQuickModalRefetch = () => {
    refetchPlan();
    refetch?.();
  };

  const plan = Array.isArray(data) ? data[0] : data;
  const statusMeta = STATUS_OPTIONS.find((o) => o.value === plan?.status);
  const progress = plan?.year_progress_percent ?? 0;

  const periods = plan?.periods ?? [];
  const actuals = plan?.actuals ?? [];

  const tableRows = useMemo(() => {
    const periodByMonth = new Map(periods.map((p) => [p.period_month, p]));
    const actualByMonth = new Map(actuals.map((a) => [a.production_month, a]));

    const months = new Set([...periodByMonth.keys(), ...actualByMonth.keys()]);

    return [...months]
      .sort((a, b) => a - b)
      .map((month) => {
        const period = periodByMonth.get(month);
        const actual = actualByMonth.get(month);
        return {
          ...period,
          period_id: period?.id,
          actual_id: actual?.id,
          period_month: month,
          production_month: actual?.production_month ?? null,
          produced_weight: actual?.produced_weight ?? null,
          quantity_produced: actual?.quantity_produced ?? null,
        };
      });
  }, [periods, actuals]);

  const productTitle =
    plan?.product?.persian_title ?? plan?.product_name ?? "—";

  const columns = [
    {
      title: "ماه",
      dataIndex: "period_month",
      align: "center",
      width: 120,
      render: (m) => MONTH_NAMES[m - 1] ?? `ماه ${m}`,
    },
    {
      title: "مقدار برنامه‌ریزی‌شده",
      dataIndex: "planned_quantity",
      align: "center",
      render: (v) => (v != null ? v.toLocaleString("fa-IR") : "—"),
    },
    {
      title: "مقدار تولید شده",
      dataIndex: "quantity_produced",
      align: "center",
      render: (v) => (v != null ? v.toLocaleString("fa-IR") : "—"),
    },
    {
      title: "وزن برنامه‌ریزی‌شده",
      dataIndex: "planed_weight",
      align: "center",
      render: (v) => (v != null ? v.toLocaleString("fa-IR") : "—"),
    },
    {
      title: "وزن تولید شده",
      dataIndex: "produced_weight",
      align: "center",
      render: (v) => (v != null ? v.toLocaleString("fa-IR") : "—"),
    },
    {
      title: "عملیات",
      key: "actions",
      align: "center",
      width: 170,
      render: (_, record) => (
        <div
          className="flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {record.period_id != null ? (
            <>
              <Tooltip title="ویرایش دوره">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  className="text-sky-600 border border-sky-600"
                  onClick={() => openPeriodModal("edit", record)}
                >
                  ویرایش دوره
                </Button>
              </Tooltip>
              <Popconfirm
                title="حذف دوره تولید"
                description="آیا از حذف این دوره مطمئن هستید؟"
                okText="بله، حذف کن"
                cancelText="انصراف"
                okButtonProps={{
                  danger: true,
                  loading: deletePeriod.isPending,
                }}
                onConfirm={() => {
                  deletePeriod
                    .mutateAsync(record.period_id)
                    .then(() => {
                      message.success("دوره تولید با موفقیت حذف شد");
                      handleQuickModalRefetch();
                    })
                    .catch((error) => {
                      message.error("خطا در حذف دوره تولید");
                      console.error(error);
                    });
                }}
              >
                <Tooltip title="حذف دوره">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          ) : (
            <Tooltip title="افزودن دوره">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                className="text-sky-600 border border-sky-600"
                onClick={() =>
                  openPeriodModal("add", { ...record, id: plan?.id })
                }
              >
                ایجاد دوره
              </Button>
            </Tooltip>
          )}

          {record.actual_id != null ? (
            <>
              <Tooltip title="ویرایش تولید واقعی">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  className="text-green-600 border border-green-600"
                  onClick={() => openActualModal("edit", record)}
                >
                  ویرایش تولید
                </Button>
              </Tooltip>
              <Popconfirm
                title="حذف تولید واقعی"
                description="آیا از حذف این تولید مطمئن هستید؟"
                okText="بله، حذف کن"
                cancelText="انصراف"
                okButtonProps={{
                  danger: true,
                  loading: deleteActual.isPending,
                }}
                onConfirm={() => {
                  deleteActual
                    .mutateAsync(record.actual_id)
                    .then(() => {
                      message.success("تولید واقعی با موفقیت حذف شد");
                      handleQuickModalRefetch();
                    })
                    .catch((error) => {
                      message.error("خطا در حذف تولید واقعی");
                      console.error(error);
                    });
                }}
              >
                <Tooltip title="حذف تولید واقعی">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          ) : (
            <Tooltip title="ثبت تولید واقعی">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                className="text-emerald-600 border border-emerald-600"
                onClick={() => openActualModal("add", record)}
              >
                ثبت تولید
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const finalPlanInfoItems = [
    { label: "نام محصول", value: productTitle },
    { label: "سال", value: plan?.year != null ? plan.year : "—" },
    { label: "وزن", value: plan?.weight != null ? faNum(plan.weight) : "—" },
    {
      label: "مقدار کل برنامه‌ریزی شده",
      value: plan?.total_planned_quantity?.toLocaleString("fa-IR") ?? "—",
    },
    {
      label: "درصد پیشرفت سال",
      value: (
        <Progress
          percent={Math.min(progress, 100)}
          size="small"
          status={progress > 100 ? "success" : undefined}
          format={() => `${progress.toLocaleString("fa-IR")}٪`}
          className="!m-0 max-w-[160px]"
        />
      ),
    },
    {
      label: "مجموع وزن برنامه‌ریزی‌شده",
      value:
        plan?.sum_of_planed_weight != null
          ? faNum(plan.sum_of_planed_weight)
          : "—",
    },
    {
      label: "مجموع وزن محقق‌شده",
      value:
        plan?.sum_of_produce_weight != null
          ? faNum(plan.sum_of_produce_weight)
          : "—",
    },
    {
      label: "وضعیت",
      value: (
        <Tag color={statusMeta?.color ?? "default"}>
          {statusMeta?.label ?? plan?.status ?? "—"}
        </Tag>
      ),
    },
    {
      label: "توضیحات",
      value: plan?.notes || "—",
    },
    {
      label: "تاریخ ایجاد",
      value: plan?.created_at ? georgianDateToJalaliDate(plan.created_at) : "—",
    },
    {
      label: "آخرین بروزرسانی",
      value: plan?.updated_at ? georgianDateToJalaliDate(plan.updated_at) : "—",
    },
  ];

  return (
    <Modal
      className={"scroll-modal"}
      title={
        <div className="flex items-center justify-between gap-3 pl-8">
          <span>
            جزئیات برنامه تولید
            {productTitle && productTitle !== "—" ? ` — ${productTitle}` : ""}
          </span>
          {!isLoading && plan && (
            <div className="flex items-center gap-2">
              <Button
                size="small"
                icon={<PlusOutlined />}
                className="text-emerald-600 border border-emerald-600"
                onClick={() => openActualModal("add", {})}
              >
                ثبت تولید
              </Button>
              <Button
                size="small"
                icon={<FileDoneOutlined />}
                className="text-purple-600 border border-purple-600"
                onClick={() => setQuickModal("period")}
              >
                افزودن دوره
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                className="text-green-600 border border-green-600"
                onClick={() => setQuickModal("edit")}
              >
                ویرایش برنامه
              </Button>
            </div>
          )}
        </div>
      }
      isOpen={isOpen}
      onClose={closeModal}
      footer={null}
      size={1500}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="flex flex-col gap-8">
          {/* ============ اطلاعات کلی ============ */}
          <div>
            <SectionTitle>اطلاعات کلی</SectionTitle>
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 2 }}
              labelStyle={{ fontWeight: 600, whiteSpace: "nowrap" }}
            >
              <Descriptions.Item label="محصول">
                {productTitle}
              </Descriptions.Item>
              <Descriptions.Item label="سال">
                {plan?.year != null ? plan.year : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="وزن">
                {plan?.weight != null ? faNum(plan.weight) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="نام کارفرما">
                {plan?.contractor?.name ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="ایجاد کننده">
                {plan?.created_by
                  ? `${plan.created_by.name ?? ""} ${plan.created_by.last_name ?? ""}`.trim()
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="وضعیت">
                <Tag color={statusMeta?.color ?? "default"}>
                  {statusMeta?.label ?? plan?.status ?? "—"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="مقدار کل برنامه‌ریزی شده">
                {plan?.total_planned_quantity ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="مقدار کل تولید شده">
                {plan?.total_actual_quantity ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="پیشرفت سال">
                <Progress
                  percent={Math.min(progress, 100)}
                  size="small"
                  status={progress > 100 ? "success" : undefined}
                  format={() => `${progress.toLocaleString("fa-IR")}٪`}
                  className="!m-0 max-w-[160px]"
                />
              </Descriptions.Item>
              <Descriptions.Item label="مجموع وزن برنامه‌ریزی‌شده">
                {plan?.sum_of_planed_weight != null
                  ? faNum(plan.sum_of_planed_weight)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="مجموع وزن محقق‌شده">
                {plan?.sum_of_produce_weight != null
                  ? faNum(plan.sum_of_produce_weight)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="تاریخ ایجاد">
                {plan?.created_at
                  ? georgianDateToJalaliDate(plan.created_at)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="آخرین بروزرسانی">
                {plan?.updated_at
                  ? georgianDateToJalaliDate(plan.updated_at)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="توضیحات" span={2}>
                {plan?.notes || "—"}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <Divider className="!my-0" />

          {/* ============ نمودار ============ */}
          <div>
            <SectionTitle>نمودار مقادیر (برنامه / تولید)</SectionTitle>
            <Card size="small" className="rounded-xl border-slate-200">
              <QuantityTrendChart periods={periods} actuals={actuals} />
            </Card>
          </div>

          <Divider className="!my-0" />

          {/* ============ جدول دوره‌ها ============ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>جدول دوره‌ها</SectionTitle>
            </div>
            {periods.length === 0 ? (
              <Empty description="دوره‌ای برای این برنامه ثبت نشده است">
                <Button
                  type="primary"
                  icon={<FileDoneOutlined />}
                  onClick={() => setQuickModal("period")}
                >
                  افزودن اولین دوره
                </Button>
              </Empty>
            ) : (
              <Card
                size="small"
                className="rounded-xl border-slate-200"
                styles={{ body: { padding: 0 } }}
              >
                <TableAntd
                  rowKey="period_id"
                  columns={columns}
                  dataSource={tableRows}
                  pagination={false}
                />
              </Card>
            )}
          </div>

          <Divider className="!my-0" />

          {/* ============ اطلاعات نهایی برنامه ============ */}
          <div>
            <SectionTitle>اطلاعات نهایی برنامه</SectionTitle>
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 2 }}
              labelStyle={{ fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {finalPlanInfoItems.map((item, index) => (
                <Descriptions.Item
                  key={index}
                  label={item.label}
                  span={item.label === "توضیحات" ? 2 : undefined}
                >
                  {item.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        </div>
      )}

      <PeriodModal
        isOpen={quickModal === "period" || periodModalState.open}
        modalMode={periodModalState.open ? periodModalState.mode : "add"}
        modalData={periodModalState.open ? periodModalState.data : plan}
        closeModal={periodModalState.open ? closePeriodModal : closeQuickModal}
        refetch={handleQuickModalRefetch}
      />
      <PlanModal
        isOpen={quickModal === "edit"}
        modalMode="edit"
        modalData={plan}
        closeModal={closeQuickModal}
        refetch={handleQuickModalRefetch}
      />
      <ActualModal
        isOpen={actualModalState.open}
        modalMode={actualModalState.mode}
        modalData={actualModalState.data}
        closeModal={closeActualModal}
        refetch={handleQuickModalRefetch}
      />
    </Modal>
  );
};

export default PlanDetailModal;
