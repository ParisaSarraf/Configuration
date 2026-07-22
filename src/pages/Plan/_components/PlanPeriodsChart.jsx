import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

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

const PlanPeriodsChart = ({ periods }) => {
  const chartData = [...(periods ?? [])]
    .sort((a, b) => a.period_month - b.period_month)
    .map((p) => ({
      month: MONTH_NAMES[p.period_month - 1] ?? `ماه ${p.period_month}`,
      planned: p.planned_quantity ?? 0,
      produced: p.total_quantity_produced ?? 0,
      variance: p.variance ?? 0,
    }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="producedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          reversed 
        />
        <YAxis
          orientation="right"
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={fa}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9" }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13, direction: "rtl" }} />
        <ReferenceLine y={0} stroke="#cbd5e1" />

        <Bar
          name="برنامه‌ریزی شده"
          dataKey="planned"
          fill="url(#plannedGrad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          name="تولید شده"
          dataKey="produced"
          fill="url(#producedGrad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
        <Line
          name="انحراف"
          dataKey="variance"
          type="monotone"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#f59e0bff", strokeWidth: 2, stroke: "#fff" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PlanPeriodsChart;