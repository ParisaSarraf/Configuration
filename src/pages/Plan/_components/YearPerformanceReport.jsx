import { useEffect, useState } from "react";
import { Button, Card, Empty, Input, Segmented, Skeleton, Switch } from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTH_NAMES, MonthTick } from "./PlanPeriodsChart";
import { METRIC_COLORS, dotStyle } from "../../../utils/chart.theme";
import { getCurrentJalaliYear } from "./plan.utils";

const fa = (v) => (v ?? 0).toLocaleString("fa-IR");

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const visible = payload.filter((item) => item.value != null);
  if (!visible.length) return null;
  return (
    <div
      dir="rtl"
      className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-100 px-4 py-3 text-sm"
    >
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      {visible.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: item.color ?? item.fill ?? item.stroke }}
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

const CHART_TYPE_OPTIONS = [
  { value: "line", icon: <LineChartOutlined />, label: "خطی" },
  { value: "bar", icon: <BarChartOutlined />, label: "میله‌ای" },
];

const SectionTitle = ({ children }) => (
  <h3 className="text-base font-bold text-slate-800 mb-4">{children}</h3>
);

const renderSeries = (chartType, series) =>
  series.map((s) =>
    chartType === "bar" ? (
      <Bar
        key={s.dataKey}
        name={s.name}
        dataKey={s.dataKey}
        fill={s.color}
        radius={[6, 6, 0, 0]}
        maxBarSize={15}
      />
    ) : (
      <Line
        key={s.dataKey}
        name={s.name}
        dataKey={s.dataKey}
        type="monotone"
        stroke={s.color}
        strokeWidth={2.5}
        connectNulls={true}
        dot={dotStyle(s.color)}
      />
    ),
  );

const YearPerformanceReport = ({
  yearPercentageOfPerformanceList,
  searchParams,
  setSearchParams,
  onSearch,
  isFetching,
}) => {
  const [yearInput, setYearInput] = useState(searchParams?.year ?? "");
  const [chartType, setChartType] = useState("line");

  const [viewMode, setViewMode] = useState("cumulative"); // "cumulative" | "period"
  const isCumulative = viewMode === "cumulative";

  const handleSearch = (yearOverride) => {
    const year = yearOverride ?? yearInput;
    setSearchParams((prev) => ({ ...prev, year }));
  };

  useEffect(() => {
    if (!searchParams?.year) {
      const currentYear = getCurrentJalaliYear();
      if (currentYear) {
        setYearInput(currentYear);
        handleSearch(currentYear);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawData = Array.isArray(yearPercentageOfPerformanceList)
    ? yearPercentageOfPerformanceList
    : Object.values(yearPercentageOfPerformanceList || {});
  const byMonth = new Map(rawData.map((p) => [p.period_month, p]));
  const chartData = MONTH_NAMES.map((name, idx) => {
    const monthNumber = idx + 1;
    const p = byMonth.get(monthNumber);

    if (!p) {
      return {
        month: name,
        cumulativePerformance: null,
        planedWeight: null,
        produceWeight: null,
      };
    }

    return {
      month: name,
      cumulativePerformance: p.cumulative_performance ?? null,

      planedWeight: isCumulative
        ? (p.cumulative_planed_weight ?? 0)
        : (p.sum_of_planed_weight ?? 0),

      produceWeight: isCumulative
        ? (p.cumulative_produce_weight ?? 0)
        : (p.sum_of_produce_weight ?? 0),
    };
  });

  const weightSeries = [
    {
      dataKey: "planedWeight",
      name: "وزن برنامه‌ریزی‌شده",
      color: METRIC_COLORS.plannedWeight,
    },
    {
      dataKey: "produceWeight",
      name: "وزن محقق‌شده",
      color: METRIC_COLORS.produceWeight,
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
          onPressEnter={() => handleSearch()}
          allowClear
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleSearch()}
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
        <div>
          {/* سوییچ تجمیعی / دوره‌ای */}
          <div className="flex items-center justify-between mb-2">
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

          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <SectionTitle>
              نمودار وزن (برنامه‌ریزی‌شده / محقق‌شده)
              {isCumulative ? " (تجمیعی)" : ""}
            </SectionTitle>
            <Segmented
              size="small"
              value={chartType}
              onChange={setChartType}
              options={CHART_TYPE_OPTIONS}
            />
          </div>

          <Card size="small" className="rounded-xl border-slate-200">
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  reversed
                  {...baseAxisProps}
                  tick={(props) => <MonthTick {...props} data={chartData} />}
                />
                <YAxis
                  orientation="right"
                  tickFormatter={fa}
                  width={50}
                  {...baseAxisProps}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Legend
                  iconType="circle"
                  verticalAlign="bottom"
                  wrapperStyle={{
                    fontSize: 13,
                    direction: "rtl",
                    paddingTop: "20px",
                  }}
                />
                {renderSeries(chartType, weightSeries)}
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default YearPerformanceReport;
