import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  message,
  Popconfirm,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Switch,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FallOutlined,
  FileDoneOutlined,
  PlusOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import Modal from "../../../components/Modal";
import { useProductionPlanOne } from "../../../QueryServises/PlanQuery";
import { STATUS_OPTIONS } from "./plan.constants";
import { TableAntd } from "../../../components/TableAntd/TableAntd";
import { georgianDateToJalaliDate } from "../../../utils/timeTool";
import {
  MONTH_NAMES,
  QuantityTrendChart,
  VarianceTrendChart,
} from "./PlanPeriodsChart";
import PeriodModal from "./periodModal";
import PlanModal from "./PlanModal";
import ActualModal from "./actualModal";
import { METRIC_COLORS, getAchievementColor } from "../../../utils/chart.theme";

const faNum = (v) => (v ?? 0).toLocaleString("fa-IR");

const SectionTitle = ({ children }) => (
  <h3 className="text-base font-bold text-slate-800 mb-4">{children}</h3>
);

const PlanDetailModal = ({
  isOpen,
  modalData,
  closeModal,
  setModal,
  deleteActual,
  refetch,
}) => {
  const {
    data,
    isLoading,
    refetch: refetchPlan,
  } = useProductionPlanOne({
    productionPlanId: modalData?.id,
  });

  const [quickModal, setQuickModal] = useState(null); // "period" | "edit" | null
  const [actualModalState, setActualModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });

  // پیش‌فرض حتماً باید روی «تجمیعی» باشد
  const [viewMode, setViewMode] = useState("cumulative"); // "cumulative" | "period"
  const isCumulative = viewMode === "cumulative";

  const closeQuickModal = () => setQuickModal(null);

  const openActualModal = (mode, data) =>
    setActualModalState({ open: true, mode, data });

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

  const displayPeriods = useMemo(() => {
    const sorted = [...periods].sort(
      (a, b) => (a.period_month ?? 0) - (b.period_month ?? 0),
    );

    if (!isCumulative) return sorted;

    return sorted.map((p) => ({
      ...p,
      planned_quantity: p.cumulative_planned_quantity,
      total_quantity_produced: p.cumulative_total_quantity_produced,
      planed_weight: p.cumulative_planed_weight,
      produce_weight: p.cumulative_produce_weight,
    }));
  }, [periods, isCumulative]);

  const totalPlanned = periods.reduce(
    (s, p) => s + (p.planned_quantity ?? 0),
    0,
  );
  const totalProduced = periods.reduce(
    (s, p) => s + (p.total_quantity_produced ?? 0),
    0,
  );
  const totalVariance = totalProduced - totalPlanned;
  const achievement =
    totalPlanned > 0 ? Math.round((totalProduced / totalPlanned) * 100) : 0;

  const totalPlanedWeight = plan?.sum_of_planed_weight ?? 0;
  const totalProduceWeight = plan?.sum_of_produce_weight ?? 0;
  const totalWeightVariance = totalProduceWeight - totalPlanedWeight;
  const weightAchievement =
    totalPlanedWeight > 0
      ? Math.round((totalProduceWeight / totalPlanedWeight) * 100)
      : 0;

  const productTitle =
    plan?.product?.persian_title ?? plan?.product_name ?? "—";

  const colSuffix = isCumulative ? " (تجمیعی)" : "";

  const varianceOrPerformanceColumn = isCumulative
    ? {
        title: "درصد تحقق تجمیعی",
        dataIndex: "cumulative_performance",
        align: "center",
        render: (v) => {
          if (v == null) return "—";
          const rounded = Math.round(v * 100) / 100;
          const color =
            rounded >= 100 ? "success" : rounded >= 50 ? "warning" : "error";
          return <Tag color={color}>{`${faNum(rounded)}٪`}</Tag>;
        },
      }
    : {
        title: "انحراف",
        dataIndex: "variance",
        align: "center",
        render: (v) => {
          if (v == null) return "—";
          const color = v > 0 ? "success" : v < 0 ? "error" : "default";
          const sign = v > 0 ? "+" : "";
          return (
            <Tag color={color}>{`${sign}${v.toLocaleString("fa-IR")}`}</Tag>
          );
        },
      };

  const periodColumns = [
    {
      title: "ماه",
      dataIndex: "period_month",
      align: "center",
      width: 90,
      render: (m) => MONTH_NAMES[m - 1] ?? `ماه ${m}`,
    },
    {
      title: `برنامه${colSuffix}`,
      dataIndex: "planned_quantity",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: `تولید${colSuffix}`,
      dataIndex: "total_quantity_produced",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: `وزن برنامه‌ریزی‌شده${colSuffix}`,
      dataIndex: "planed_weight",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: `وزن محقق‌شده${colSuffix}`,
      dataIndex: "produce_weight",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    varianceOrPerformanceColumn,
    {
      title: "",
      key: "addActual",
      align: "center",
      width: 50,
      render: (_, record) => (
        <Tooltip title="ثبت تولید">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            className="text-emerald-600"
            onClick={() => openActualModal("add", record)}
          />
        </Tooltip>
      ),
    },
  ];

  const actualColumns = [
    {
      title: "تاریخ تولید",
      dataIndex: "production_date",
      align: "center",
      render: (d) => (d ? georgianDateToJalaliDate(d) : "—"),
    },
    {
      title: "مقدار تولید شده",
      dataIndex: "quantity_produced",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: "زمان ثبت",
      dataIndex: "recorded_at",
      align: "center",
      render: (d) => (d ? georgianDateToJalaliDate(d) : "—"),
    },
    {
      title: "عملیات",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 border border-green-600"
              onClick={() => openActualModal("edit", record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="حذف برنامه تولید"
            description="آیا از حذف این برنامه مطمئن هستید؟"
            okText="بله، حذف کن"
            cancelText="انصراف"
            okButtonProps={{ danger: true, loading: deleteActual.isPending }}
            onConfirm={() => {
              deleteActual
                .mutateAsync(record.id)
                .then(() => {
                  message.success("تولید با موفقیت حذف شد");
                  handleQuickModalRefetch();
                })
                .catch((error) => {
                  message.error("خطا در حذف تولید");
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

  const chartsTabContent = (
    <div
      className={`w-full grid gap-8 pt-2 ${
        isCumulative ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      <div>
        <SectionTitle>نمودار مقادیر (برنامه / تولید){colSuffix}</SectionTitle>
        <Card size="small" className="rounded-xl border-slate-200">
          <QuantityTrendChart periods={displayPeriods} />
        </Card>
      </div>
      {!isCumulative && (
        <div>
          <SectionTitle>انحراف از معیار</SectionTitle>
          <Card size="small" className="rounded-xl border-slate-200">
            <VarianceTrendChart periods={displayPeriods} />
          </Card>
        </div>
      )}
    </div>
  );

  const tableTabContent = (
    <div className="pt-2">
      <Card
        size="small"
        className="rounded-xl border-slate-200"
        styles={{ body: { padding: 0 } }}
      >
        <TableAntd
          rowKey="id"
          columns={periodColumns}
          dataSource={displayPeriods}
          pagination={false}
          expandable={{
            rowExpandable: (record) => !!record.actuals?.length,
            expandedRowRender: (record) => (
              <div className="py-2 px-2">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">
                  تولیدهای ثبت‌شده این دوره
                </h4>
                <TableAntd
                  rowKey="id"
                  size="small"
                  columns={actualColumns}
                  dataSource={record.actuals ?? []}
                  pagination={false}
                />
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );

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
          {/* ============ سوییچ نمایش تجمیعی / دوره‌ای ============ */}
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  {isCumulative
                    ? "نمایش تجمیعی (جمع از ابتدای سال تا هر ماه)"
                    : "نمایش دوره‌ای (مقدار هر ماه به‌تنهایی)"}
                </span>
                <Switch
                  checked={isCumulative}
                  onChange={(checked) =>
                    setViewMode(checked ? "cumulative" : "period")
                  }
                  checkedChildren="تجمیعی"
                  unCheckedChildren="دوره‌ای"
                />
              </div>

              {/* نمودارها */}
              <Card className="rounded-xl">{chartsTabContent}</Card>

              {/* جدول */}
              <Card title="جدول دوره ها" styles={{ body: { padding: 0 } }}>
                {tableTabContent}
              </Card>
            </div>
          )}

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
              <Descriptions.Item label="کد محصول">
                {plan?.product?.code ?? "—"}
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

              <Descriptions.Item label="وضعیت">
                <Tag color={statusMeta?.color ?? "default"}>
                  {statusMeta?.label ?? plan?.status ?? "—"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="مقدار کل برنامه‌ریزی شده">
                {plan?.total_planned_quantity?.toLocaleString("fa-IR") ?? "—"}
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
              <Descriptions.Item label="ایجاد کننده">
                {plan?.created_by
                  ? `${plan.created_by.name ?? ""} ${plan.created_by.last_name ?? ""}`.trim()
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

          {/* ============ آمار کلی ============ */}
          <div>
            <SectionTitle>آمار کلی دوره‌ها</SectionTitle>
            <Row gutter={[12, 12]}>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{ borderRightColor: METRIC_COLORS.planned }}
                >
                  <Statistic
                    title="مجموع مقدار برنامه‌ریزی"
                    value={totalPlanned}
                    formatter={faNum}
                    valueStyle={{ color: METRIC_COLORS.planned, fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{ borderRightColor: METRIC_COLORS.produced }}
                >
                  <Statistic
                    title="مجموع مقدار تولید"
                    value={totalProduced}
                    formatter={faNum}
                    valueStyle={{ color: METRIC_COLORS.produced, fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{ borderRightColor: METRIC_COLORS.plannedWeight }}
                >
                  <Statistic
                    title="مجموع وزن برنامه‌ریزی‌شده"
                    value={totalPlanedWeight}
                    formatter={faNum}
                    valueStyle={{
                      color: METRIC_COLORS.plannedWeight,
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{ borderRightColor: METRIC_COLORS.produceWeight }}
                >
                  <Statistic
                    title="مجموع وزن محقق‌شده"
                    value={totalProduceWeight}
                    formatter={faNum}
                    valueStyle={{
                      color: METRIC_COLORS.produceWeight,
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{ borderRightColor: getAchievementColor(achievement) }}
                >
                  <Statistic
                    title="درصد تحقق مقداری"
                    value={achievement}
                    formatter={faNum}
                    suffix="٪"
                    valueStyle={{
                      color: getAchievementColor(achievement),
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{
                    borderRightColor: getAchievementColor(weightAchievement),
                  }}
                >
                  <Statistic
                    title="درصد تحقق وزنی"
                    value={weightAchievement}
                    formatter={faNum}
                    suffix="٪"
                    valueStyle={{
                      color: getAchievementColor(weightAchievement),
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{
                    borderRightColor:
                      totalVariance >= 0
                        ? METRIC_COLORS.produced
                        : METRIC_COLORS.weightVariance,
                  }}
                >
                  <Statistic
                    title="انحراف کل مقداری"
                    value={totalVariance}
                    formatter={faNum}
                    prefix={
                      totalVariance >= 0 ? <RiseOutlined /> : <FallOutlined />
                    }
                    valueStyle={{
                      color:
                        totalVariance >= 0
                          ? METRIC_COLORS.produced
                          : METRIC_COLORS.weightVariance,
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center border-r-4"
                  style={{
                    borderRightColor:
                      totalWeightVariance >= 0
                        ? METRIC_COLORS.produced
                        : METRIC_COLORS.weightVariance,
                  }}
                >
                  <Statistic
                    title="انحراف کل وزنی"
                    value={totalWeightVariance}
                    formatter={faNum}
                    prefix={
                      totalWeightVariance >= 0 ? (
                        <RiseOutlined />
                      ) : (
                        <FallOutlined />
                      )
                    }
                    valueStyle={{
                      color:
                        totalWeightVariance >= 0
                          ? METRIC_COLORS.produced
                          : METRIC_COLORS.weightVariance,
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          <Divider className="!my-0" />
        </div>
      )}

      <PeriodModal
        isOpen={quickModal === "period"}
        modalData={plan}
        closeModal={closeQuickModal}
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
