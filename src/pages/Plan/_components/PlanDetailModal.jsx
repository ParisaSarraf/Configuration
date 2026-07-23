import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Tooltip,
} from "antd";
import { FallOutlined, PlusOutlined, RiseOutlined } from "@ant-design/icons";
import Modal from "../../../components/Modal";
import { useProductionPlanOne } from "../../../QueryServises/PlanQuery";
import { STATUS_OPTIONS } from "./plan.constants";
import { TableAntd } from "../../../components/TableAntd/TableAntd";
import { georgianDateToJalaliDate } from "../../../utils/timeTool";
import PlanPeriodsChart, { MONTH_NAMES } from "./PlanPeriodsChart";

const faNum = (v) => (v ?? 0).toLocaleString("fa-IR");

const PlanDetailModal = ({ isOpen, modalData, closeModal , setModal }) => {
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

  return (
    <Modal
      title="جزئیات برنامه تولید"
      isOpen={isOpen}
      onClose={closeModal}
      footer={null}
      size={1600}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="flex flex-col gap-6">
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 2 }}
            labelStyle={{ fontWeight: 600, whiteSpace: "nowrap" }}
          >
            <Descriptions.Item label="محصول">
              {plan?.product?.persian_title ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="کد محصول">
              {plan?.product?.code ?? "—"}
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

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-4">
              گزارش دوره‌های تولید
            </h3>

            <Row gutter={[12, 12]} className="mb-4">
              <Col xs={12} md={6}>
                <Card
                  size="small"
                  className="rounded-xl border-slate-200 text-center"
                >
                  <Statistic
                    title="مجموع برنامه‌ریزی"
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
                    title="مجموع تولید"
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
                    title="انحراف کل"
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
                    title="درصد تحقق"
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
            </Row>

            {periods.length === 0 ? (
              <Empty description="دوره‌ای برای این برنامه ثبت نشده است" />
            ) : (
              <Row gutter={[12, 12]} align="stretch">
                <Col xs={24} lg={12}>
                  <Card
                    size="small"
                    title="نمودار برنامه و تولید"
                    className="rounded-xl border-slate-200 h-full"
                  >
                    <PlanPeriodsChart periods={periods} />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card
                    size="small"
                    title="جدول دوره‌ها"
                    className="rounded-xl border-slate-200 h-full"
                    styles={{ body: { padding: 0 } }}
                  >
                    <TableAntd
                      rowKey="id"
                      columns={periodColumns}
                      dataSource={periods}
                      scroll={{ y: 260 }}
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
                </Col>
              </Row>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PlanDetailModal;
