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

  // درصد انحراف = (محقق‌شده − برنامه‌ریزی‌شده) ÷ برنامه‌ریزی‌شده
  // مقادیر از همان ردیف نمودار خوانده می‌شود، پس با حالت تجمیعی/دوره‌ای هماهنگ است.
  const row = payload[0]?.payload ?? {};
  const planned = row.planedWeight;
  const produced = row.produceWeight;
  const hasDeviation =
    planned != null && produced != null && Number(planned) !== 0;
  const deviation = hasDeviation
    ? ((produced - planned) / planned) * 100
    : null;

  return (
    <div
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

      {hasDeviation ? (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <span className="text-slate-500">درصد انحراف:</span>
          <span
            className={`font-bold ${
              deviation > 0
                ? "text-emerald-600"
                : deviation < 0
                  ? "text-rose-600"
                  : "text-slate-800"
            }`}
          >
            {fa(Number(deviation.toFixed(1)))}٪
          </span>
        </div>
      ) : null}
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
  isFetching,
}) => {
  const [yearInput, setYearInput] = useState(searchParams?.year ?? "");
  const [chartType, setChartType] = useState("line");

  const [viewMode, setViewMode] = useState("cumulative"); // "cumulative" | "period"
  const isCumulative = viewMode === "cumulative";

  console.log(`${yearPercentageOfPerformanceList} : year:`);
  

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

  const rawData = yearPercentageOfPerformanceList ?? {};

  const chartData = MONTH_NAMES.map((name, idx) => {
    const monthNumber = idx + 1;
    const p = rawData[monthNumber];

    if (!p) {
      return {
        month: name,
        cumulativePerformance: null,
        planedWeight: null,
        produceWeight: null,
      };
    }

    const hasPlannedData = !!p.sum_of_planed_weight;
    const hasProduceData = !!p.sum_of_produce_weight;

    return {
      month: name,

      cumulativePerformance:
        p.cumulative_performance !== null &&
        p.cumulative_performance !== undefined
          ? p.cumulative_performance
          : null,

      planedWeight: !hasPlannedData
        ? null
        : isCumulative
          ? (p.cumulative_planed_weight ?? null)
          : (p.sum_of_planed_weight ?? null),

      produceWeight: !hasProduceData
        ? null
        : isCumulative
          ? (p.cumulative_produce_weight ?? null)
          : (p.sum_of_produce_weight ?? null),
    };
  });

  const lastPerformancePoint = [...chartData]
    .reverse()
    .find(
      (item) =>
        item.cumulativePerformance !== null &&
        item.cumulativePerformance !== undefined,
    );

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
      <SectionTitle>
        گزارش عملکرد سالانه
        {lastPerformancePoint ? (
          <span className="inline-flex items-center gap-1.5 align-middle ms-3 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-medium text-slate-500">
            <span>درصد عملکرد {lastPerformancePoint.month}:</span>
            <span className="text-base font-extrabold text-sky-700">
              {fa(lastPerformancePoint.cumulativePerformance)}٪
            </span>
          </span>
        ) : null}
      </SectionTitle>

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
      ) : Object.keys(rawData).length === 0 ? (
        <Empty description="برای مشاهده گزارش، سال مورد نظر را جستجو کنید" />
      ) : (
        <div>
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
