import { useMemo, useState } from "react";
import { Alert, App, Button, Empty, Skeleton, Tooltip } from "antd";
import {
 ArrowLeftOutlined,
 CalendarOutlined,
 CheckCircleOutlined,
 CloseCircleOutlined,
 DownOutlined,
 EyeOutlined,
 PaperClipOutlined,
 SendOutlined,
 StopOutlined,
 UpOutlined,
 UserOutlined,
} from "@ant-design/icons";
import { useDoAction, useProcessRequests } from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import Modal from "../../../components/Modal";

const asArray = (value) => {
 if (Array.isArray(value)) return value;
 if (Array.isArray(value?.results)) return value.results;
 if (Array.isArray(value?.data)) return value.data;
 return value ? [value] : [];
};

const unwrapPayload = (payload) => {
 if (Array.isArray(payload?.data)) return payload.data;
 if (Array.isArray(payload?.results)) return payload.results;
 return payload;
};

const jalali = (value) => {
 if (!value) return "—";
 const text = georgianDateTimeToJalaliDateTime(String(value));
 return text && !String(text).includes("Invalid") ? text : "—";
};

const fullName = (user) => {
 if (!user) return "نامشخص";
 return (
 [user.name, user.last_name].filter(Boolean).join(" ").trim() ||
 user.username ||
 "نامشخص"
 );
};

const readTransitions = (request, process, fallbackProcess) =>
 asArray(request?.current_state?.transitions).flatMap((transition) => {
 const actionLinks = asArray(transition?.actions);
 const links = actionLinks.length > 0 ? actionLinks : [null];
 return links.map((actionLink, actionIndex) => {
 const action = actionLink?.action ?? null;
 return {
 optionKey: `${transition?.id ?? "transition"}-${actionLink?.id ?? action?.id ?? actionIndex}`,
 id: transition?.id ?? null,
 actionLinkId: actionLink?.id ?? null,
 actionId: action?.id ?? null,
 actionName: action?.name ?? action?.action_type?.name ?? "بدون عملیات",
 actionType: String(action?.action_type?.name ?? "").toLowerCase(),
 actionDescription: action?.description ?? "",
 currentStateId:
 transition?.current_state?.id ?? request?.current_state?.id ?? null,
 currentStateName:
 transition?.current_state?.name ?? request?.current_state?.name ?? "",
 nextStateId: transition?.next_state?.id ?? null,
 nextStateName: transition?.next_state?.name ?? "مرحله بعد",
 nextStateType: String(
 transition?.next_state?.state_type?.name ?? "",
 ).toLowerCase(),
 processId:
 transition?.process ?? process?.id ?? fallbackProcess?.id ?? null,
 };
 });
 });

const processRequestRowsFromResponse = (payload, fallbackProcess) =>
 asArray(unwrapPayload(payload)).flatMap((process) =>
 asArray(process?.requests).map((request) => {
 const submission = request?.form_submission ?? null;
 const formData = submission?.form_data ?? null;
 return {
 rowKey: `process-${process?.id ?? fallbackProcess?.id ?? "unknown"}-request-${request?.id ?? "unknown"}`,
 processId: process?.id ?? fallbackProcess?.id ?? null,
 processName: process?.name ?? fallbackProcess?.name ?? "",
 formDefinitionId:
 process?.form_definition ?? fallbackProcess?.form_definition ?? null,
 requestId: request?.id ?? null,
 title: request?.title ?? "بدون عنوان",
 stateName: request?.current_state?.name ?? "—",
 stateType: String(
 request?.current_state?.state_type?.name ?? "",
 ).toLowerCase(),
 createdBy: request?.created_by ?? null,
 submissionId: submission?.id ?? null,
 formData,
 attachments: Array.isArray(submission?.file_attachments)
 ? submission.file_attachments
 : [],
 submitter: submission?.submitter ?? null,
 createdAt: request?.created_at ?? submission?.created_at ?? null,
 submittedAt: submission?.created_at ?? null,
 fieldCount: Object.keys(formData ?? {}).length,
 transitions: readTransitions(request, process, fallbackProcess),
 };
 }),
 );

const actionPresentation = (transition) => {
 const kind = transition?.actionType ?? "";
 if (["deny", "denied", "reject", "rejected"].includes(kind))
 return {
 buttonType: "default",
 danger: true,
 label: transition?.actionName || "رد",
 Icon: CloseCircleOutlined,
 };
 if (["cancel", "cancelled", "canceled"].includes(kind))
 return {
 buttonType: "default",
 danger: true,
 label: transition?.actionName || "لغو",
 Icon: StopOutlined,
 };
 if (["approve", "resolve", "complete", "completed"].includes(kind))
 return {
 buttonType: "primary",
 danger: false,
 label: transition?.actionName || "تأیید",
 Icon: CheckCircleOutlined,
 };
 return {
 buttonType: "primary",
 danger: false,
 label: transition?.actionName || "ارجاع",
 Icon: SendOutlined,
 };
};

const requestStatePresentation = (stateType) => {
 if (["denied", "rejected", "reject"].includes(stateType))
 return {
 dot: "bg-red-500",
 pill: "bg-red-50 text-red-600 ",
 };
 if (["cancelled", "canceled", "cancel"].includes(stateType))
 return {
 dot: "bg-amber-500",
 pill: "bg-amber-50 text-amber-700 ",
 };
 if (["complete", "completed", "done"].includes(stateType))
 return {
 dot: "bg-emerald-500",
 pill: "bg-emerald-50 text-emerald-700 ",
 };
 if (stateType === "start")
 return {
 dot: "bg-blue-500",
 pill: "bg-blue-50 text-blue-700 ",
 };
 return {
 dot: "bg-blue-500",
 pill: "bg-blue-50 text-blue-700 ",
 };
};

const MetaItem = ({ icon, label, value }) => (
 <div className="min-w-0">
 <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
 {icon}
 <span>{label}</span>
 </div>
 <div className="truncate text-xs font-semibold text-slate-700 ">
 {value || "—"}
 </div>
 </div>
);

const ProcessRequestsModal = ({ open, process, onClose, onViewSubmission }) => {
 const { message } = App.useApp();
 const processId = process?.id ?? null;
 const query = useProcessRequests(processId, {
 enabled: Boolean(open && processId),
 });
 const doAction = useDoAction();
 const [pendingOptionKey, setPendingOptionKey] = useState(null);
 const [expandedRequestKey, setExpandedRequestKey] = useState(null);

 const responseData = useMemo(() => unwrapPayload(query.data), [query.data]);
 const rows = useMemo(
 () => processRequestRowsFromResponse(responseData, process),
 [responseData, process],
 );
 const activeRequestKey = expandedRequestKey ?? rows[0]?.rowKey ?? null;

 const handleReferral = async (record, transition) => {
 if (!transition?.actionId || !record?.requestId || doAction.isPending)
 return;
 setPendingOptionKey(`${record.rowKey}-${transition.optionKey}`);
 try {
 await doAction.mutateAsync({
 request_id: Number(record.requestId),
 action_id: Number(transition.actionId),
 });
 message.success(
 `عملیات «${transition.actionName}» انجام شد و درخواست به «${transition.nextStateName || "مرحله بعد"}» رفت.`,
 );
 await query.refetch();
 } catch (error) {
 message.error(
 getApiErrorMessage(error, "انجام عملیات درخواست ناموفق بود."),
 );
 } finally {
 setPendingOptionKey(null);
 }
 };

 const title = (
 <div className="py-0.5">
 <div className="text-base font-semibold text-slate-800 ">
 درخواست‌های {process?.name || "فرآیند"}
 </div>
 <div className="mt-1 text-xs font-normal text-slate-400">
 {rows.length.toLocaleString("fa-IR")} درخواست ثبت‌شده
 </div>
 </div>
 );

 const renderTransitions = (record) => {
 const transitions = record.transitions ?? [];
 if (!transitions.length)
 return (
 <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400 ">
 در وضعیت فعلی عملیات قابل اجرایی وجود ندارد.
 </div>
 );

 return (
 <div>
 <div className="mb-2.5 flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-700 ">
 عملیات قابل انجام
 </span>
 <span className="text-xs text-slate-400">
 {transitions.length.toLocaleString("fa-IR")} انتخاب
 </span>
 </div>
 <div className="space-y-2">
 {transitions.map((transition, index) => {
 const presentation = actionPresentation(transition);
 const ActionIcon = presentation.Icon;
 const pendingKey = `${record.rowKey}-${transition.optionKey}`;
 const isPending =
 doAction.isPending && pendingOptionKey === pendingKey;
 return (
 <div
 key={transition.optionKey ?? `${transition.id}-${index}`}
 className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between "
 >
 <div className="min-w-0">
 <div className="flex min-w-0 items-center gap-2 text-xs">
 <span className="max-w-36 truncate font-medium text-slate-500">
 {transition.currentStateName || record.stateName}
 </span>
 <ArrowLeftOutlined className="shrink-0 text-xs text-slate-300" />
 <span className="max-w-40 truncate font-semibold text-slate-800 ">
 {transition.nextStateName}
 </span>
 </div>
 {transition.actionDescription ? (
 <p className="mb-0 mt-1.5 line-clamp-1 text-xs text-slate-400">
 {transition.actionDescription}
 </p>
 ) : null}
 </div>
 <Button
 type={presentation.buttonType}
 danger={presentation.danger}
 size="small"
 className="shrink-0 !rounded-lg !font-medium"
 icon={<ActionIcon />}
 loading={isPending}
 disabled={!transition.actionId || doAction.isPending}
 onClick={() => handleReferral(record, transition)}
 >
 {presentation.label}
 </Button>
 </div>
 );
 })}
 </div>
 </div>
 );
 };

 const renderRequest = (record) => {
 const isExpanded = activeRequestKey === record.rowKey;
 const state = requestStatePresentation(record.stateType);
 return (
 <article
 key={record.rowKey}
 className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-slate-300 "
 >
 <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex min-w-0 items-start gap-3">
 <span
 className={`mt-2 h-2 w-2 shrink-0 rounded-full ${state.dot}`}
 />
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="m-0 truncate text-sm font-semibold text-slate-800 ">
 {record.title}
 </h3>
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-medium ${state.pill}`}
 >
 {record.stateName}
 </span>
 </div>
 <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
 <span>درخواست #{record.requestId}</span>
 {record.submissionId ? (
 <span>ارسال #{record.submissionId}</span>
 ) : null}
 <span>{jalali(record.createdAt)}</span>
 </div>
 </div>
 </div>

 <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
 <Tooltip title="مشاهده روند و فرم پرشده">
 <Button
 size="small"
 type="text"
 icon={<EyeOutlined />}
 className="!rounded-lg !text-slate-500"
 onClick={() => onViewSubmission?.(record)}
 disabled={!record.submissionId}
 >
 جزئیات
 </Button>
 </Tooltip>
 <Button
 size="small"
 type="text"
 className="!rounded-lg !text-slate-500"
 icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
 onClick={() =>
 setExpandedRequestKey(isExpanded ? "__none__" : record.rowKey)
 }
 >
 {isExpanded ? "بستن" : "مشاهده عملیات"}
 </Button>
 </div>
 </div>

 {isExpanded ? (
 <div className="border-t border-slate-100 bg-slate-50/60 p-4 ">
 <div className="mb-4 grid gap-4 rounded-xl bg-white p-3 sm:grid-cols-2 lg:grid-cols-4 ">
 <MetaItem
 icon={<UserOutlined />}
 label="ثبت‌کننده"
 value={fullName(record.createdBy)}
 />
 <MetaItem
 icon={<UserOutlined />}
 label="ارسال‌کننده"
 value={fullName(record.submitter)}
 />
 <MetaItem
 icon={<CalendarOutlined />}
 label="تاریخ ارسال"
 value={jalali(record.submittedAt)}
 />
 <MetaItem
 icon={<PaperClipOutlined />}
 label="پیوست"
 value={
 record.attachments.length
 ? `${record.attachments.length.toLocaleString("fa-IR")} فایل`
 : "بدون پیوست"
 }
 />
 </div>
 {renderTransitions(record)}
 </div>
 ) : null}
 </article>
 );
 };

 const renderBody = () => {
 if (!processId) return <Empty description="شناسه فرآیند پیدا نشد" />;
 if (query.isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
 if (query.isError)
 return (
 <Alert
 type="error"
 showIcon
 message="دریافت درخواست‌های فرآیند انجام نشد"
 description={getApiErrorMessage(query.error)}
 />
 );
 if (!rows.length)
 return <Empty description="هنوز درخواستی برای این فرآیند ثبت نشده است" />;
 return <div className="space-y-3">{rows.map(renderRequest)}</div>;
 };

 return (
 <Modal
 isOpen={open}
 title={title}
 onClose={onClose}
 footer={false}
 size={1040}
 className="process-requests-modal"
 >
 {renderBody()}
 </Modal>
 );
};

export default ProcessRequestsModal;
