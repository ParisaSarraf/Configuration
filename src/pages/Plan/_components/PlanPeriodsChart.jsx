import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

  if (!payload.value) return <g transform={`translate(${x},${y})`} />;

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

const buildChartData = ({ periods = [], actuals = [] } = {}) => {
  const periodByMonth = new Map(periods.map((p) => [p.period_month, p]));
  const actualByMonth = new Map(actuals.map((a) => [a.production_month, a]));

  const hasData = periodByMonth.size > 0 || actualByMonth.size > 0;

  const months = MONTH_NAMES.map((name, idx) => {
    const monthNumber = idx + 1;
    const period = periodByMonth.get(monthNumber);
    const actual = actualByMonth.get(monthNumber);

    return {
      month: name,
      cumulativePerformance:
        actual?.cumulative_performance ?? period?.cumulative_performance ?? null,
      cumulative_planned_quantity:
        period?.cumulative_planned_quantity ?? null,
      cumulative_quantity_produced:
        actual?.cumulative_quantity_produced ?? null,
    };
  });

  if (!hasData) return months;

  // نقطه‌ی مبدأ (0,0) قبل از اولین ماه، تا خط همیشه از مبدأ شروع شود و
  // بدون کشیده‌شدن روی ماه‌های بدون داده، مستقیماً به اولین نقطه‌ی موجود وصل شود
  return [
    {
      month: "",
      cumulativePerformance: null,
      cumulative_planned_quantity: 0,
      cumulative_quantity_produced: 0,
    },
    ...months,
  ];
};

const baseAxisProps = {
  tick: { fontSize: 12, fill: "#64748b" },
  axisLine: false,
  tickLine: false,
};

export const QuantityTrendChart = ({ periods, actuals }) => {
  const chartData = buildChartData({ periods, actuals });
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
          tick={(props) => <MonthTick {...props} data={chartData} />}
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
          verticalAlign="bottom"
          wrapperStyle={{
            fontSize: 13,
            direction: "rtl",
            paddingTop: "20px",
          }}
        />
        <Line
          name="مقدار برنامه‌ریزی شده"
          dataKey="cumulative_planned_quantity"
          type="monotone"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
          connectNulls={true}
        />
        <Line
          name="مقدار تولید شده"
          dataKey="cumulative_quantity_produced"
          type="monotone"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
