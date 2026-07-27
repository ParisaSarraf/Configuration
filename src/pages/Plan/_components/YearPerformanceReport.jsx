import { useState } from "react";
import { Button, Card, Empty, Input, Skeleton, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTH_NAMES } from "./PlanPeriodsChart";
import { TableAntd } from "../../../components/TableAntd/TableAntd";

const fa = (v) => (v ?? 0).toLocaleString("fa-IR");

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-100 px-4 py-3 text-sm"
    >
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: item.color ?? item.stroke }}
          />
          <span className="text-slate-500">{item.name}:</span>
          <span className="font-semibold text-slate-800">{fa(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

const baseAxisProps = {
  tick: { fontSize: 12, fill: "#64748b" },
  axisLine: false,
  tickLine: false,
};

const SectionTitle = ({ children }) => (
  <h3 className="text-base font-bold text-slate-800 mb-4">{children}</h3>
);

const YearPerformanceReport = ({
  yearPercentageOfPerformanceList,
  searchParams,
  setSearchParams,
  onSearch,
  isFetching,
}) => {
  const [yearInput, setYearInput] = useState(searchParams?.year ?? "");

  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, year: yearInput }));
    onSearch?.();
  };

  const rawData = yearPercentageOfPerformanceList ?? [];

  const chartData = [...rawData]
    .sort((a, b) => a.period_month - b.period_month)
    .map((p) => ({
      month: MONTH_NAMES[p.period_month - 1] ?? `ماه ${p.period_month}`,
      planned: p.planned_quantity ?? 0,
      actual: p.actual_quantity ?? 0,
      planedWeight: p.sum_of_planed_weight ?? 0,
      produceWeight: p.sum_of_produce_weight ?? 0,
      performance: p.performance ?? 0,
    }));

  const tableColumns = [
    {
      title: "ماه",
      dataIndex: "period_month",
      align: "center",
      width: 100,
      render: (m) => MONTH_NAMES[m - 1] ?? `ماه ${m}`,
    },
    {
      title: "مقدار برنامه‌ریزی",
      dataIndex: "planned_quantity",
      align: "center",
      render: (v) => fa(v),
    },
    {
      title: "مقدار واقعی",
      dataIndex: "actual_quantity",
      align: "center",
      render: (v) => fa(v),
    },
    {
      title: "وزن برنامه‌ریزی‌شده",
      dataIndex: "sum_of_planed_weight",
      align: "center",
      render: (v) => fa(v),
    },
    {
      title: "وزن محقق‌شده",
      dataIndex: "sum_of_produce_weight",
      align: "center",
      render: (v) => fa(v),
    },
    {
      title: "درصد عملکرد",
      dataIndex: "performance",
      align: "center",
      render: (v) => {
        if (v == null) return "—";
        const color = v >= 100 ? "success" : v > 0 ? "warning" : "default";
        return <Tag color={color}>{`${fa(Math.round(v * 100) / 100)}٪`}</Tag>;
      },
    },
  ];

  return (
    <Card
      className="rounded-2xl shadow-sm border-slate-200 mt-6"
      styles={{ body: { padding: 20 } }}
    >
      <SectionTitle>گزارش عملکرد سالانه</SectionTitle>

      <div className="flex items-center gap-2 mb-6 max-w-xs">
        <Input
          placeholder="سال (مثلاً 1405)"
          value={yearInput}
          onChange={(e) => setYearInput(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={isFetching}
        >
          جستجو
        </Button>
      </div>

      {isFetching ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : rawData.length === 0 ? (
        <Empty description="برای مشاهده گزارش، سال مورد نظر را جستجو کنید" />
      ) : (
        <div className="flex flex-col gap-8">
          {/* نمودار مقادیر */}
          <div>
            <SectionTitle>نمودار مقادیر (برنامه / واقعی)</SectionTitle>
            <Card size="small" className="rounded-xl border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis dataKey="month" reversed {...baseAxisProps} />
                  <YAxis
                    orientation="right"
                    tickFormatter={fa}
                    width={50}
                    {...baseAxisProps}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 13, direction: "rtl" }}
                  />
                  <Line
                    name="مقدار برنامه‌ریزی"
                    dataKey="planned"
                    type="monotone"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#0ea5e9",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    name="مقدار واقعی"
                    dataKey="actual"
                    type="monotone"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#10b981",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* نمودار وزن */}
          <div>
            <SectionTitle>نمودار وزن (برنامه‌ریزی‌شده / محقق‌شده)</SectionTitle>
            <Card size="small" className="rounded-xl border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis dataKey="month" reversed {...baseAxisProps} />
                  <YAxis
                    orientation="right"
                    tickFormatter={fa}
                    width={50}
                    {...baseAxisProps}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 13, direction: "rtl" }}
                  />
                  <Line
                    name="وزن برنامه‌ریزی‌شده"
                    dataKey="planedWeight"
                    type="monotone"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#6366f1",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    name="وزن محقق‌شده"
                    dataKey="produceWeight"
                    type="monotone"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#f97316",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* نمودار درصد عملکرد */}
          <div>
            <SectionTitle>نمودار درصد عملکرد</SectionTitle>
            <Card size="small" className="rounded-xl border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis dataKey="month" reversed {...baseAxisProps} />
                  <YAxis
                    orientation="right"
                    tickFormatter={(v) => `${fa(v)}٪`}
                    width={60}
                    {...baseAxisProps}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 13, direction: "rtl" }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                  />
                  <Line
                    name="درصد عملکرد"
                    dataKey="performance"
                    type="monotone"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#a855f7",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* جدول دیتای خام */}
          <div>
            <SectionTitle>جدول عملکرد ماهانه</SectionTitle>
            <Card
              size="small"
              className="rounded-xl border-slate-200"
              styles={{ body: { padding: 0 } }}
            >
              <TableAntd
                rowKey="period_month"
                columns={tableColumns}
                dataSource={rawData}
                pagination={false}
              />
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
};

export default YearPerformanceReport;
