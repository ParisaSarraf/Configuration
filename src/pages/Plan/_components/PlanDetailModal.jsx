import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Progress,
  Row,
  Segmented,
  Skeleton,
  Statistic,
  Tag,
  Tooltip,
} from "antd";
import {
  BarChartOutlined,
  FallOutlined,
  PlusOutlined,
  RiseOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import Modal from "../../../components/Modal";
import { useProductionPlanOne } from "../../../QueryServises/PlanQuery";
import { STATUS_OPTIONS } from "./plan.constants";
import { TableAntd } from "../../../components/TableAntd/TableAntd";
import { georgianDateToJalaliDate } from "../../../utils/timeTool";
import PlanPeriodsChart, { MONTH_NAMES } from "./PlanPeriodsChart";

const faNum = (v) => (v ?? 0).toLocaleString("fa-IR");

const PlanDetailModal = ({ isOpen, modalData, closeModal }) => {
  const [reportView, setReportView] = useState("chart");

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
      title: "ماه دوره",
      dataIndex: "period_month",
      align: "center",
      width: 110,
      render: (m) => MONTH_NAMES[m - 1] ?? `ماه ${m}`,
    },
    {
      title: "مقدار برنامه‌ریزی شده",
      dataIndex: "planned_quantity",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR") ?? "—",
    },
    {
      title: "مجموع تولید شده",
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
    {
      title: "توضیحات",
      dataIndex: "notes",
      ellipsis: true,
      render: (v) => v || "—",
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 m-0">
                گزارش دوره‌های تولید
              </h3>
              <Segmented
                value={reportView}
                onChange={setReportView}
                options={[
                  {
                    value: "chart",
                    label: "نمودار",
                    icon: <BarChartOutlined />,
                  },
                  { value: "table", label: "جدول", icon: <TableOutlined /> },
                ]}
              />
            </div>

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

            {/* نمودار یا جدول */}
            {periods.length === 0 ? (
              <Empty description="دوره‌ای برای این برنامه ثبت نشده است" />
            ) : reportView === "chart" ? (
              <Card size="small" className="rounded-xl border-slate-200">
                <PlanPeriodsChart periods={periods} />
              </Card>
            ) : (
              <TableAntd
                rowKey="id"
                size="small"
                columns={periodColumns}
                dataSource={periods}
                pagination={false}
                expandable={{
                  rowExpandable: (record) => !!record.actuals?.length,
                  expandedRowRender: (record) => (
                    <div className="py-2">
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
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PlanDetailModal;
