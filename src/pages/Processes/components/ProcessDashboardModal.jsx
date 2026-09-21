import { Alert, Button, Empty, Skeleton } from "antd";
import {
 ApartmentOutlined,
 BarChartOutlined,
 ReloadOutlined,
 RiseOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";
import { useProcessStateRequestCounts } from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import Modal from "../../../components/Modal";

const asArray = (payload) => {
 if (Array.isArray(payload)) return payload;
 if (Array.isArray(payload?.results)) return payload.results;
 if (Array.isArray(payload?.data)) return payload.data;
 return [];
};

const formatNumber = (value) => Number(value || 0).toLocaleString("fa-IR");

const Metric = ({ icon, label, value, detail }) => (
 <div className="rounded-2xl border border-slate-200 bg-white p-4 ">
 <div className="mb-4 flex items-center justify-between">
 <span className="text-xs font-medium text-slate-400">{label}</span>
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ">
 {icon}
 </span>
 </div>
 <div className="text-2xl font-bold tabular-nums text-slate-800 ">
 {value}
 </div>
 <div className="mt-1 truncate text-xs text-slate-400">{detail}</div>
 </div>
);

const ProcessDashboardModal = ({ open, process, onClose }) => {
 const processId = process?.id ?? null;
 const query = useProcessStateRequestCounts(processId, {
 enabled: Boolean(open && processId),
 retry: false,
 });

 const states = useMemo(
 () =>
 asArray(query.data).map((item) => ({
 id: item?.id,
 name: item?.name || "ایستگاه بدون نام",
 count: Math.max(0, Number(item?.request_count) || 0),
 })),
 [query.data],
 );

 const stats = useMemo(() => {
 const total = states.reduce((sum, item) => sum + item.count, 0);
 const busiest = states.reduce(
 (selected, item) =>
 !selected || item.count > selected.count ? item : selected,
 null,
 );
 return {
 total,
 activeStates: states.filter((item) => item.count > 0).length,
 max: Math.max(1, ...states.map((item) => item.count)),
 busiest,
 };
 }, [states]);

 const title = (
 <div className="py-0.5">
 <div className="text-base font-semibold text-slate-800 ">
 داشبورد {process?.name || "فرایند"}
 </div>
 <div className="mt-1 text-xs font-normal text-slate-400">
 توزیع درخواست‌ها در ایستگاه‌های فرایند
 </div>
 </div>
 );

 const renderBody = () => {
 if (!processId) return <Empty description="شناسه فرایند پیدا نشد" />;

 if (query.isLoading)
 return (
 <div className="space-y-4">
 <div className="grid gap-3 sm:grid-cols-3">
 {[0, 1, 2].map((item) => (
 <div
 key={item}
 className="h-28 animate-pulse rounded-2xl bg-slate-100 "
 />
 ))}
 </div>
 <Skeleton active paragraph={{ rows: 7 }} />
 </div>
 );

 if (query.isError)
 return (
 <Alert
 type="error"
 showIcon
 message="دریافت گزارش فرایند انجام نشد"
 description={getApiErrorMessage(query.error)}
 action={
 <Button
 size="small"
 icon={<ReloadOutlined />}
 onClick={() => query.refetch()}
 >
 تلاش مجدد
 </Button>
 }
 />
 );

 if (!states.length)
 return (
 <Empty description="برای ایستگاه‌های این فرایند گزارشی وجود ندارد" />
 );

 return (
 <div className="space-y-4">
 <div className="grid gap-3 sm:grid-cols-3">
 <Metric
 icon={<BarChartOutlined />}
 label="کل درخواست‌ها"
 value={formatNumber(stats.total)}
 detail="مجموع درخواست‌های همه ایستگاه‌ها"
 />
 <Metric
 icon={<ApartmentOutlined />}
 label="ایستگاه‌های درگیر"
 value={`${formatNumber(stats.activeStates)} از ${formatNumber(states.length)}`}
 detail="ایستگاه‌هایی که درخواست فعال دارند"
 />
 <Metric
 icon={<RiseOutlined />}
 label="پرتراکم‌ترین ایستگاه"
 value={formatNumber(stats.busiest?.count)}
 detail={stats.busiest?.name || "—"}
 />
 </div>

 <section className="rounded-2xl border border-slate-200 bg-white p-5 ">
 <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
 <div>
 <h3 className="m-0 text-sm font-semibold text-slate-800 ">
 درخواست‌ها به تفکیک ایستگاه
 </h3>
 <p className="mb-0 mt-1 text-xs text-slate-400">
 طول هر نوار متناسب با تعداد درخواست‌های همان ایستگاه است
 </p>
 </div>
 <Button
 type="text"
 size="small"
 icon={<ReloadOutlined />}
 loading={query.isFetching}
 onClick={() => query.refetch()}
 >
 به‌روزرسانی
 </Button>
 </div>

 <div className="max-h-[420px] space-y-4 overflow-y-auto pl-1">
 {states.map((state) => {
 const width = (state.count / stats.max) * 100;
 return (
 <div key={state.id ?? state.name}>
 <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
 <span className="truncate font-medium text-slate-600 ">
 {state.name}
 </span>
 <span className="shrink-0 font-semibold tabular-nums text-slate-800 ">
 {formatNumber(state.count)}
 </span>
 </div>
 <div className="h-2 overflow-hidden rounded-full bg-slate-100 ">
 <div
 className={`h-full rounded-full transition-all duration-500 ${state.count > 0 ? "bg-blue-500" : "bg-slate-200 "}`}
 style={{
 width: `${state.count > 0 ? Math.max(width, 2) : 0}%`,
 }}
 role="progressbar"
 aria-label={`${state.name}: ${state.count} درخواست`}
 aria-valuenow={state.count}
 aria-valuemin={0}
 aria-valuemax={stats.max}
 />
 </div>
 </div>
 );
 })}
 </div>
 </section>
 </div>
 );
 };

 return (
 <Modal
 isOpen={open}
 title={title}
 onClose={onClose}
 footer={false}
 size={900}
 destroyOnClose
 >
 {renderBody()}
 </Modal>
 );
};

export default ProcessDashboardModal;
