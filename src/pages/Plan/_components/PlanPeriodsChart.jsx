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

const fa = (v) => Number(v ?? 0).toLocaleString("fa-IR");

const toNum = (v) =>
  v === undefined || v === null || v === "" || Number.isNaN(Number(v))
    ? null
    : Number(v);

const SERIES = [
  {
    key: "cumulative_planned_quantity",
    realFlag: "plannedReal",
    name: "مقدار برنامه‌ریزی شده",
    color: "#0ea5e9",
  },
  {
    key: "cumulative_quantity_produced",
    realFlag: "producedReal",
    name: "مقدار تولید شده",
    color: "#10b981",
  },
];

const REAL_FLAG_BY_KEY = SERIES.reduce((acc, s) => {
  acc[s.key] = s.realFlag;
  return acc;
}, {});

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  if (!label) return null; 

  const visible = payload.filter((item) => item.value != null);
  if (!visible.length) return null;

  return (
    <div
      dir="rtl"
      className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-100 px-4 py-3 text-sm"
    >
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      {visible.map((item) => {
        const isReal = item.payload?.[REAL_FLAG_BY_KEY[item.dataKey]];
        return (
          <div key={item.dataKey} className="flex items-center gap-2 py-0.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: item.color ?? item.stroke }}
            />
            <span className="text-slate-500">{item.name}:</span>
            <span className="font-semibold text-slate-800">{fa(item.value)}</span>
            {!isReal && (
              <span className="text-xs text-slate-400">(بدون ثبت)</span>
            )}
          </div>
        );
      })}
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

const SeriesDot = ({ cx, cy, payload, realFlag, color }) => {
  if (cx == null || cy == null) return null;
  if (!payload?.[realFlag]) return null;
  return (
    <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
  );
};


const normalizeSeries = (rows, key) => {
  const firstIndex = rows.findIndex((row) => row[key] != null);
  if (firstIndex === -1) return false; 

  let lastIndex = firstIndex;
  rows.forEach((row, i) => {
    if (row[key] != null) lastIndex = i;
  });

  let carried = 0;
  rows.forEach((row, i) => {
    if (i < firstIndex) {
      row[key] = 0; 
      return;
    }
    if (i > lastIndex) {
      row[key] = null;
      return;
    }
    if (row[key] == null) {
      row[key] = carried; 
    } else {
      carried = row[key];
    }
  });

  return true;
};

const buildChartData = ({ periods = [], actuals = [] } = {}) => {
  const periodByMonth = new Map(periods.map((p) => [p.period_month, p]));
  const actualByMonth = new Map(actuals.map((a) => [a.production_month, a]));

  const rows = MONTH_NAMES.map((name, idx) => {
    const monthNumber = idx + 1;
    const period = periodByMonth.get(monthNumber);
    const actual = actualByMonth.get(monthNumber);

    const planned = toNum(period?.cumulative_planned_quantity);
    const produced = toNum(actual?.cumulative_quantity_produced);

    return {
      month: name,
      cumulativePerformance: toNum(
        actual?.cumulative_performance ?? period?.cumulative_performance
      ),
      cumulative_planned_quantity: planned,
      cumulative_quantity_produced: produced,
      plannedReal: planned != null,
      producedReal: produced != null,
    };
  });

  const hasPlanned = normalizeSeries(rows, "cumulative_planned_quantity");
  const hasProduced = normalizeSeries(rows, "cumulative_quantity_produced");

  if (!hasPlanned && !hasProduced) return rows;

  return [
    {
      month: "",
      cumulativePerformance: null,
      cumulative_planned_quantity: hasPlanned ? 0 : null,
      cumulative_quantity_produced: hasProduced ? 0 : null,
      plannedReal: false,
      producedReal: false,
    },
    ...rows,
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
          domain={[0, "auto"]}
          allowDecimals={false}
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

        {SERIES.map(({ key, realFlag, name, color }) => (
          <Line
            key={key}
            name={name}
            dataKey={key}
            type="monotone"
            stroke={color}
            strokeWidth={2.5}
            dot={<SeriesDot realFlag={realFlag} color={color} />}
            activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};