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

export const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

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
            style={{ background: item.color ?? item.stroke }}
          />
          <span className="text-slate-500">{item.name}:</span>
          <span className="font-semibold text-slate-800">{fa(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const MonthTick = ({ x, y, payload, data }) => {
  const item = data?.find((d) => d.month === payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#64748b"
        fontSize={12}
      >
        {payload.value}
      </text>

      {item?.cumulativePerformance != null && (
        <text
          x={0}
          y={0}
          dy={34}
          textAnchor="middle"
          fill="#0f172a"
          fontSize={11}
          fontWeight="600"
        >
          ({fa(item.cumulativePerformance)}٪)
        </text>
      )}
    </g>
  );
};

const buildChartData = (periods) => {
  const byMonth = new Map((periods ?? []).map((p) => [p.period_month, p]));

  return MONTH_NAMES.map((name, idx) => {
    const monthNumber = idx + 1;
    const p = byMonth.get(monthNumber);

    if (!p) {
      return {
        month: name,
        planned: null,
        produced: null,
        variance: null,
        planedWeight: null,
        produceWeight: null,
        weightVariance: null,
      };
    }

    return {
      month: name,
      cumulativePerformance: p.cumulative_performance ?? null,
      planned: p.planned_quantity ?? 0,
      produced: p.total_quantity_produced ?? 0,
      variance: p.variance ?? 0,
      planedWeight: p.planed_weight ?? 0,
      produceWeight: p.produce_weight ?? 0,
      weightVariance: (p.produce_weight ?? 0) - (p.planed_weight ?? 0),
    };
  });
};

const baseAxisProps = {
  tick: { fontSize: 12, fill: "#64748b" },
  axisLine: false,
  tickLine: false,
};

export const QuantityTrendChart = ({ periods }) => {
  const chartData = buildChartData(periods);
  return (
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
        <XAxis
          dataKey="month"
          reversed
          {...baseAxisProps}
          tick={<MonthTick />}
        />
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
          name="مقدار برنامه‌ریزی شده"
          dataKey="planned"
          type="monotone"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
        />
        <Line
          name="مقدار تولید شده"
          dataKey="produced"
          type="monotone"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const WeightTrendChart = ({ periods }) => {
  const chartData = buildChartData(periods);
  return (
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
        <XAxis
          dataKey="month"
          reversed
          {...baseAxisProps}
          tick={(props) => (
            <MonthTick
              {...props}
              data={chartData}
            />
          )}
        />{" "}
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
          dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
        />
        <Line
          name="وزن محقق‌شده"
          dataKey="produceWeight"
          type="monotone"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const VarianceTrendChart = ({ periods }) => {
  const chartData = buildChartData(periods);
  return (
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
        <XAxis
          dataKey="month"
          reversed
          {...baseAxisProps}
          tick={<MonthTick />}
        />{" "}
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
        <ReferenceLine y={0} stroke="#cbd5e1" />
        <Line
          name="انحراف مقداری"
          dataKey="variance"
          type="monotone"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
        />
        <Line
          name="انحراف وزنی"
          dataKey="weightVariance"
          type="monotone"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
