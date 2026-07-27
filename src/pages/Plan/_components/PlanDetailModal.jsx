import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { FallOutlined, PlusOutlined, RiseOutlined } from "@ant-design/icons";
import Modal from "../../../components/Modal";
import { useProductionPlanOne } from "../../../QueryServises/PlanQuery";
import { STATUS_OPTIONS } from "./plan.constants";
import { TableAntd } from "../../../components/TableAntd/TableAntd";
import { georgianDateToJalaliDate } from "../../../utils/timeTool";
import {
  MONTH_NAMES,
  QuantityTrendChart,
  WeightTrendChart,
  VarianceTrendChart,
} from "./PlanPeriodsChart";

const faNum = (v) => (v ?? 0).toLocaleString("fa-IR");

const SectionTitle = ({ children }) => (
  <h3 className="text-base font-bold text-slate-800 mb-4">{children}</h3>
);

const PlanDetailModal = ({ isOpen, modalData, closeModal, setModal }) => {
  const { data, isLoading } = useProductionPlanOne({
    productionPlanId: modalData?.id,
  });

  const plan = Array.isArray(data) ? data[0] : data;
  const statusMeta = STATUS_OPTIONS.find((o) => o.value === plan?.status);
  const progress = plan?.year_progress_percent ?? 0;

  const periods = plan?.periods ?? [];

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

  const periodColumns = [
    {
      title: "ماه",
      dataIndex: "period_month",
      align: "center",
      width: 90,
      render: (m) => MONTH_NAMES[m - 1] ?? `ماه ${m}`,
    },
    {
      title: "برنامه",
      dataIndex: "planned_quantity",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: "تولید",
      dataIndex: "total_quantity_produced",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: "وزن برنامه‌ریزی‌شده",
      dataIndex: "planed_weight",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: "وزن محقق‌شده",
      dataIndex: "produce_weight",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: "انحراف",
      dataIndex: "variance",
      align: "center",
      render: (v) => {
        if (v == null) return "—";
        const color = v > 0 ? "success" : v < 0 ? "error" : "default";
        const sign = v > 0 ? "+" : "";
        return <Tag color={color}>{`${sign}${v.toLocaleString("fa-IR")}`}</Tag>;
      },
    },
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
            onClick={() =>
              setModal({ mode: "add", data: record, type: "actualModal" })
            }
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
  ];

  const chartsTabContent = (
    <div className="w-full grid grid-cols-3 gap-8 pt-2">
      <div>
        <SectionTitle>نمودار مقادیر (برنامه / تولید)</SectionTitle>
        <Card size="small" className="rounded-xl border-slate-200">
          <QuantityTrendChart periods={periods} />
        </Card>
      </div>
      <div>
        <SectionTitle>نمودار وزن (برنامه‌ریزی‌شده / محقق‌شده)</SectionTitle>
        <Card size="small" className="rounded-xl border-slate-200">
          <WeightTrendChart periods={periods} />
        </Card>
      </div>
      <div>
        <SectionTitle>انحراف از معیار</SectionTitle>
        <Card size="small" className="rounded-xl border-slate-200">
          <VarianceTrendChart periods={periods} />
        </Card>
      </div>
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
          dataSource={periods}
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
      title="جزئیات برنامه تولید"
      isOpen={isOpen}
      onClose={closeModal}
      footer={null}
      size={1300}
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
              <Descriptions.Item label="کد محصول">
                {plan?.product?.code ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="سال">
                {plan?.year != null ? faNum(plan.year) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="وزن">
                {plan?.weight != null ? faNum(plan.weight) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="شماره نسخه">
                {plan?.version_number ?? "—"}
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
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="مجموع مقدار برنامه‌ریزی"
                    value={totalPlanned}
                    formatter={faNum}
                    valueStyle={{ color: "#0ea5e9", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="مجموع مقدار تولید"
                    value={totalProduced}
                    formatter={faNum}
                    valueStyle={{ color: "#10b981", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="مجموع وزن برنامه‌ریزی‌شده"
                    value={totalPlanedWeight}
                    formatter={faNum}
                    valueStyle={{ color: "#6366f1", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="مجموع وزن محقق‌شده"
                    value={totalProduceWeight}
                    formatter={faNum}
                    valueStyle={{ color: "#f97316", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="درصد تحقق مقداری"
                    value={achievement}
                    formatter={faNum}
                    suffix="٪"
                    valueStyle={{
                      color: achievement >= 100 ? "#10b981" : "#f59e0b",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="درصد تحقق وزنی"
                    value={weightAchievement}
                    formatter={faNum}
                    suffix="٪"
                    valueStyle={{
                      color: weightAchievement >= 100 ? "#10b981" : "#f59e0b",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="انحراف کل مقداری"
                    value={totalVariance}
                    formatter={faNum}
                    prefix={
                      totalVariance >= 0 ? <RiseOutlined /> : <FallOutlined />
                    }
                    valueStyle={{
                      color: totalVariance >= 0 ? "#10b981" : "#ef4444",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
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
                      color: totalWeightVariance >= 0 ? "#10b981" : "#ef4444",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          <Divider className="!my-0" />

          {/* ============ دو تب: نمودارها / جدول ============ */}
          {periods.length === 0 ? (
            <Empty description="دوره‌ای برای این برنامه ثبت نشده است" />
          ) : (
            <Tabs
              defaultActiveKey="charts"
              items={[
                {
                  key: "charts",
                  label: "نمودارها",
                  children: chartsTabContent,
                },
                {
                  key: "table",
                  label: "جدول دوره‌ها",
                  children: tableTabContent,
                },
              ]}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default PlanDetailModal;
