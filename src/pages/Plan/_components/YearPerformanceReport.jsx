// import { useEffect, useState } from "react";
// import { Button, Card, Empty, Input, Segmented, Skeleton, Tag } from "antd";
// import {
//   BarChartOutlined,
//   LineChartOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import {
//   Bar,
//   CartesianGrid,
//   ComposedChart,
//   Legend,
//   Line,
//   ReferenceLine,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { MONTH_NAMES } from "./PlanPeriodsChart";
// import { TableAntd } from "../../../components/TableAntd/TableAntd";
// import { METRIC_COLORS, dotStyle } from "../../../utils/chart.theme";

// const fa = (v) => (v ?? 0).toLocaleString("fa-IR");

// /** سال جاری تقویم جلالی را با اعداد لاتین (نه فارسی) برمی‌گرداند، مثلاً "1405" */
// const getCurrentJalaliYear = () => {
//   try {
//     const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
//       year: "numeric",
//     }).formatToParts(new Date());
//     const yearPart = parts.find((p) => p.type === "year");
//     return yearPart ? yearPart.value : "";
//   } catch {
//     return "";
//   }
// };

// const ChartTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       dir="rtl"
//       className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-100 px-4 py-3 text-sm"
//     >
//       <p className="font-bold text-slate-800 mb-2">{label}</p>
//       {payload.map((item) => (
//         <div key={item.dataKey} className="flex items-center gap-2 py-0.5">
//           <span
//             className="inline-block w-2.5 h-2.5 rounded-full"
//             style={{ background: item.color ?? item.fill ?? item.stroke }}
//           />
//           <span className="text-slate-500">{item.name}:</span>
//           <span className="font-semibold text-slate-800">{fa(item.value)}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// const baseAxisProps = {
//   tick: { fontSize: 12, fill: "#64748b" },
//   axisLine: false,
//   tickLine: false,
// };

// const CHART_TYPE_OPTIONS = [
//   { value: "line", icon: <LineChartOutlined />, label: "خطی" },
//   { value: "bar", icon: <BarChartOutlined />, label: "میله‌ای" },
// ];

// const SectionTitle = ({ children }) => (
//   <h3 className="text-base font-bold text-slate-800 mb-4">{children}</h3>
// );

// /** هدر یک بخش نمودار به همراه سوییچ نوع نمایش (خطی/میله‌ای) */
// const ChartSectionHeader = ({ title, chartType, onChangeType }) => (
//   <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
//     <SectionTitle>{title}</SectionTitle>
//     <Segmented
//       size="small"
//       value={chartType}
//       onChange={onChangeType}
//       options={CHART_TYPE_OPTIONS}
//     />
//   </div>
// );

// /** یک سری داده را بسته به نوع انتخاب‌شده به‌صورت خط یا میله رندر می‌کند */
// const renderSeries = (chartType, series) =>
//   series.map((s) =>
//     chartType === "bar" ? (
//       <Bar
//         key={s.dataKey}
//         name={s.name}
//         dataKey={s.dataKey}
//         fill={s.color}
//         radius={[6, 6, 0, 0]}
//         maxBarSize={36}
//       />
//     ) : (
//       <Line
//         key={s.dataKey}
//         name={s.name}
//         dataKey={s.dataKey}
//         type="monotone"
//         stroke={s.color}
//         strokeWidth={2.5}
//         dot={dotStyle(s.color)}
//       />
//     ),
//   );

// const YearPerformanceReport = ({
//   yearPercentageOfPerformanceList,
//   searchParams,
//   setSearchParams,
//   onSearch,
//   isFetching,
// }) => {
//   const [yearInput, setYearInput] = useState(searchParams?.year ?? "");
//   const [chartTypes, setChartTypes] = useState({
//     quantity: "line",
//     weight: "line",
//     performance: "line",
//   });

//   const setChartType = (key) => (value) =>
//     setChartTypes((prev) => ({ ...prev, [key]: value }));

//   const handleSearch = (yearOverride) => {
//     const year = yearOverride ?? yearInput;
//     setSearchParams((prev) => ({ ...prev, year }));
//     onSearch?.();
//   };

//   // اولین بار که کامپوننت لود می‌شود، اگر سالی انتخاب نشده، سال جاری جلالی را
//   // به‌عنوان پیش‌فرض ست کرده و خودکار جستجو می‌کنیم — کاربر مجبور نیست دستی بزند
//   useEffect(() => {
//     if (!searchParams?.year) {
//       const currentYear = getCurrentJalaliYear();
//       if (currentYear) {
//         setYearInput(currentYear);
//         handleSearch(currentYear);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const rawData = yearPercentageOfPerformanceList ?? [];

//   const chartData = [...rawData]
//     .sort((a, b) => a.period_month - b.period_month)
//     .map((p) => ({
//       month: MONTH_NAMES[p.period_month - 1] ?? `ماه ${p.period_month}`,
//       planned: p.planned_quantity ?? 0,
//       actual: p.actual_quantity ?? 0,
//       planedWeight: p.sum_of_planed_weight ?? 0,
//       produceWeight: p.sum_of_produce_weight ?? 0,
//       performance: p.performance ?? 0,
//     }));

//   const quantitySeries = [
//     {
//       dataKey: "planned",
//       name: "مقدار برنامه‌ریزی",
//       color: METRIC_COLORS.planned,
//     },
//     { dataKey: "actual", name: "مقدار واقعی", color: METRIC_COLORS.produced },
//   ];

//   const weightSeries = [
//     {
//       dataKey: "planedWeight",
//       name: "وزن برنامه‌ریزی‌شده",
//       color: METRIC_COLORS.plannedWeight,
//     },
//     {
//       dataKey: "produceWeight",
//       name: "وزن محقق‌شده",
//       color: METRIC_COLORS.produceWeight,
//     },
//   ];

//   const performanceSeries = [
//     {
//       dataKey: "performance",
//       name: "درصد عملکرد",
//       color: METRIC_COLORS.performance,
//     },
//   ];

//   const tableColumns = [
//     {
//       title: "ماه",
//       dataIndex: "period_month",
//       align: "center",
//       width: 100,
//       render: (m) => MONTH_NAMES[m - 1] ?? `ماه ${m}`,
//     },
//     {
//       title: "مقدار برنامه‌ریزی",
//       dataIndex: "planned_quantity",
//       align: "center",
//       render: (v) => fa(v),
//     },
//     {
//       title: "مقدار واقعی",
//       dataIndex: "actual_quantity",
//       align: "center",
//       render: (v) => fa(v),
//     },
//     {
//       title: "وزن برنامه‌ریزی‌شده",
//       dataIndex: "sum_of_planed_weight",
//       align: "center",
//       render: (v) => fa(v),
//     },
//     {
//       title: "وزن محقق‌شده",
//       dataIndex: "sum_of_produce_weight",
//       align: "center",
//       render: (v) => fa(v),
//     },
//     {
//       title: "درصد عملکرد",
//       dataIndex: "performance",
//       align: "center",
//       render: (v) => {
//         if (v == null) return "—";
//         const color = v >= 100 ? "success" : v >= 50 ? "warning" : "error";
//         return <Tag color={color}>{`${fa(Math.round(v * 100) / 100)}٪`}</Tag>;
//       },
//     },
//   ];

//   return (
//     <Card
//       className="rounded-2xl shadow-sm border-slate-200 mt-6"
//       styles={{ body: { padding: 20 } }}
//     >
//       <SectionTitle>گزارش عملکرد سالانه</SectionTitle>

//       <div className="flex items-center gap-2 mb-6 max-w-xs">
//         <Input
//           placeholder="سال (مثلاً 1405)"
//           value={yearInput}
//           onChange={(e) => setYearInput(e.target.value)}
//           onPressEnter={() => handleSearch()}
//           allowClear
//         />
//         <Button
//           type="primary"
//           icon={<SearchOutlined />}
//           onClick={() => handleSearch()}
//           loading={isFetching}
//         >
//           جستجو
//         </Button>
//       </div>

//       {isFetching ? (
//         <Skeleton active paragraph={{ rows: 6 }} />
//       ) : rawData.length === 0 ? (
//         <Empty description="برای مشاهده گزارش، سال مورد نظر را جستجو کنید" />
//       ) : (
//         <>
//           <div className="w-full grid grid-cols-2 gap-8">
//             {/* نمودار وزن */}
//             <div>
//               <ChartSectionHeader
//                 title="نمودار وزن (برنامه‌ریزی‌شده / محقق‌شده)"
//                 chartType={chartTypes.weight}
//                 onChangeType={setChartType("weight")}
//               />
//               <Card size="small" className="rounded-xl border-slate-200">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <ComposedChart
//                     data={chartData}
//                     margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="#e2e8f0"
//                       vertical={false}
//                     />
//                     <XAxis dataKey="month" reversed {...baseAxisProps} />
//                     <YAxis
//                       orientation="right"
//                       tickFormatter={fa}
//                       width={50}
//                       {...baseAxisProps}
//                     />
//                     <Tooltip
//                       content={<ChartTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend
//                       iconType="circle"
//                       wrapperStyle={{ fontSize: 13, direction: "rtl" }}
//                     />
//                     {renderSeries(chartTypes.weight, weightSeries)}
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </Card>
//             </div>

//             {/* نمودار درصد عملکرد */}
//             <div>
//               <ChartSectionHeader
//                 title="نمودار درصد عملکرد"
//                 chartType={chartTypes.performance}
//                 onChangeType={setChartType("performance")}
//               />
//               <Card size="small" className="rounded-xl border-slate-200">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <ComposedChart
//                     data={chartData}
//                     margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="#e2e8f0"
//                       vertical={false}
//                     />
//                     <XAxis dataKey="month" reversed {...baseAxisProps} />
//                     <YAxis
//                       orientation="right"
//                       tickFormatter={(v) => `${fa(v)}٪`}
//                       width={60}
//                       {...baseAxisProps}
//                     />
//                     <Tooltip
//                       content={<ChartTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend
//                       iconType="circle"
//                       wrapperStyle={{ fontSize: 13, direction: "rtl" }}
//                     />
//                     <ReferenceLine
//                       y={100}
//                       stroke="#cbd5e1"
//                       strokeDasharray="4 4"
//                     />
//                     {renderSeries(chartTypes.performance, performanceSeries)}
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </Card>
//             </div>

//             {/* جدول دیتای خام */}
//           </div>
//           {/* <div>
//             <SectionTitle>جدول عملکرد ماهانه</SectionTitle>
//             <Card
//               size="small"
//               className="rounded-xl border-slate-200"
//               styles={{ body: { padding: 0 } }}
//             >
//               <TableAntd
//                 rowKey="period_month"
//                 columns={tableColumns}
//                 dataSource={rawData}
//                 pagination={false}
//               />
//             </Card>
//           </div> */}
//         </>
//       )}
//     </Card>
//   );
// };

// export default YearPerformanceReport;



import { useEffect, useState } from "react";
import { Button, Card, Empty, Input, Segmented, Skeleton, Tag } from "antd";
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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTH_NAMES } from "./PlanPeriodsChart";
import { TableAntd } from "../../../components/TableAntd/TableAntd";
import { METRIC_COLORS, dotStyle } from "../../../utils/chart.theme";
import { getCurrentJalaliYear } from "./plan.utils";

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

/** هدر یک بخش نمودار به همراه سوییچ نوع نمایش (خطی/میله‌ای) */
const ChartSectionHeader = ({ title, chartType, onChangeType }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
    <SectionTitle>{title}</SectionTitle>
    <Segmented
      size="small"
      value={chartType}
      onChange={onChangeType}
      options={CHART_TYPE_OPTIONS}
    />
  </div>
);

/** یک سری داده را بسته به نوع انتخاب‌شده به‌صورت خط یا میله رندر می‌کند */
const renderSeries = (chartType, series) =>
  series.map((s) =>
    chartType === "bar" ? (
      <Bar
        key={s.dataKey}
        name={s.name}
        dataKey={s.dataKey}
        fill={s.color}
        radius={[6, 6, 0, 0]}
        maxBarSize={36}
      />
    ) : (
      <Line
        key={s.dataKey}
        name={s.name}
        dataKey={s.dataKey}
        type="monotone"
        stroke={s.color}
        strokeWidth={2.5}
        dot={dotStyle(s.color)}
      />
    )
  );

const YearPerformanceReport = ({
  yearPercentageOfPerformanceList,
  searchParams,
  setSearchParams,
  onSearch,
  isFetching,
}) => {
  const [yearInput, setYearInput] = useState(searchParams?.year ?? "");
  const [chartTypes, setChartTypes] = useState({
    quantity: "line",
    weight: "line",
    performance: "line",
  });

  const setChartType = (key) => (value) =>
    setChartTypes((prev) => ({ ...prev, [key]: value }));

  const handleSearch = (yearOverride) => {
    const year = yearOverride ?? yearInput;
    setSearchParams((prev) => ({ ...prev, year }));
    onSearch?.();
  };

  // اولین بار که کامپوننت لود می‌شود، اگر سالی انتخاب نشده، سال جاری جلالی را
  // به‌عنوان پیش‌فرض ست کرده و خودکار جستجو می‌کنیم — کاربر مجبور نیست دستی بزند
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

  const performanceSeries = [
    { dataKey: "performance", name: "درصد عملکرد", color: METRIC_COLORS.performance },
  ];

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
        const color = v >= 100 ? "success" : v >= 50 ? "warning" : "error";
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
        <>
          <div className="w-full grid grid-cols-2 gap-8">
            {/* نمودار وزن */}
            <div>
              <ChartSectionHeader
                title="نمودار وزن (برنامه‌ریزی‌شده / محقق‌شده)"
                chartType={chartTypes.weight}
                onChangeType={setChartType("weight")}
              />
              <Card size="small" className="rounded-xl border-slate-200">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
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
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "#f1f5f9" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 13, direction: "rtl" }}
                    />
                    {renderSeries(chartTypes.weight, weightSeries)}
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* نمودار درصد عملکرد */}
            <div>
              <ChartSectionHeader
                title="نمودار درصد عملکرد"
                chartType={chartTypes.performance}
                onChangeType={setChartType("performance")}
              />
              <Card size="small" className="rounded-xl border-slate-200">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
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
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "#f1f5f9" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 13, direction: "rtl" }}
                    />
                    <ReferenceLine
                      y={100}
                      stroke="#cbd5e1"
                      strokeDasharray="4 4"
                    />
                    {renderSeries(chartTypes.performance, performanceSeries)}
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* جدول دیتای خام */}
          </div>
          {/* <div>
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
          </div> */}
        </>
      )}
    </Card>
  );
};

export default YearPerformanceReport;
