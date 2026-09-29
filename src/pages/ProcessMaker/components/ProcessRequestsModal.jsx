import { useEffect, useMemo, useState } from "react";
import { Alert, App, Button, Empty, Select, Skeleton } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  FilterOutlined,
  PaperClipOutlined,
  SendOutlined,
  StopOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";

import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import {
  buildFormData,
  collectFileEntries,
  flattenFields,
  validateFiles,
} from "@/pages/Forms/FormRuntime/submission";
import {
  useFormDefinitionFieldById,
  useUpdateFormSubmission,
  useUploadSubmissionAttachments,
} from "@/QueryServises/formsQuery";
import {
  useDoAction,
  useLockedFieldsByRequestId,
  useProcessInfo,
  useProcessRequests,
} from "@/QueryServises/workflowQuery";
import {
  asCategories,
  hydrateSubmissionValues,
} from "@/Services/forms/submissionValues";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { pickProcessInfo } from "@/pages/Processes/ProcessBuilder/processGraph";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import Modal from "../../../components/Modal";

const STATE_TYPE_OPTIONS = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "start", label: "شروع" },
  { value: "normal", label: "جاری" },
  { value: "complete", label: "پایان‌یافته" },
  { value: "cancelled", label: "لغوشده" },
  { value: "denied", label: "ردشده" },
];

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

const formIdOf = (value) =>
  value && typeof value === "object" ? (value.id ?? null) : (value ?? null);

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

const lockedFieldIdOf = (item) =>
  item?.form_field?.id ??
  item?.form_field_id ??
  item?.field?.id ??
  item?.field_id ??
  item?.id ??
  null;

const readTransitions = (request, process, fallbackProcess) =>
  asArray(request?.current_state?.transitions).flatMap((transition) => {
    const actionLinks = asArray(transition?.actions);
    return actionLinks.map((actionLink, actionIndex) => {
      const action = actionLink?.action ?? null;
      return {
        key: `${transition?.id ?? "transition"}-${actionLink?.id ?? action?.id ?? actionIndex}`,
        actionId: action?.id ?? null,
        label: action?.name ?? action?.action_type?.name ?? "ارجاع",
        actionType: String(action?.action_type?.name ?? "").toLowerCase(),
        actionDescription: action?.description ?? "",
        currentStateName:
          transition?.current_state?.name ?? request?.current_state?.name ?? "",
        nextStateId: transition?.next_state?.id ?? null,
        nextStateName: transition?.next_state?.name ?? "مرحله بعد",
        processId:
          transition?.process ?? process?.id ?? fallbackProcess?.id ?? null,
      };
    });
  });

const rowFromRequest = (request, process, fallbackProcess) => {
  const submission = request?.form_submission ?? null;
  const formData = submission?.form_data ?? {};
  return {
    rowKey: `process-${process?.id ?? fallbackProcess?.id ?? "unknown"}-request-${request?.id ?? "unknown"}`,
    processId:
      process?.id ??
      request?.process?.id ??
      request?.process_id ??
      (typeof request?.process === "number" ? request.process : null) ??
      fallbackProcess?.id ??
      null,
    processName:
      process?.name ?? request?.process?.name ?? fallbackProcess?.name ?? "",
    formDefinitionId: formIdOf(
      process?.form_definition ??
        request?.form_definition ??
        request?.process?.form_definition ??
        fallbackProcess?.form_definition,
    ),
    requestId: request?.id ?? null,
    title: request?.title ?? process?.name ?? "درخواست فرایند",
    currentStateId: request?.current_state?.id ?? null,
    stateName: request?.current_state?.name ?? "بدون مرحله",
    stateType: String(
      request?.current_state?.state_type?.slug ??
        request?.current_state?.state_type?.code ??
        request?.current_state?.state_type?.type ??
        request?.current_state?.state_type?.name ??
        (typeof request?.current_state?.state_type === "string"
          ? request.current_state.state_type
          : "") ??
        "",
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
    transitions: readTransitions(request, process, fallbackProcess),
  };
};

export const requestRowsFromResponse = (payload, fallbackProcess = null) =>
  asArray(unwrapPayload(payload)).flatMap((item) => {
    if (Array.isArray(item?.requests))
      return item.requests.map((request) =>
        rowFromRequest(request, item, fallbackProcess),
      );
    const process =
      item?.process && typeof item.process === "object"
        ? item.process
        : fallbackProcess;
    return [rowFromRequest(item, process, fallbackProcess)];
  });

export const statePresentation = (stateType) => {
  if (["denied", "rejected", "reject"].includes(stateType))
    return {
      dot: "bg-rose-500",
      panel:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
      label: "ردشده",
    };
  if (["cancelled", "canceled", "cancel"].includes(stateType))
    return {
      dot: "bg-amber-500",
      panel:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
      label: "لغوشده",
    };
  if (["complete", "completed", "done"].includes(stateType))
    return {
      dot: "bg-emerald-500",
      panel:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
      label: "پایان‌یافته",
    };
  if (stateType === "start")
    return {
      dot: "bg-sky-500",
      panel:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300",
      label: "شروع",
    };
  return {
    dot: "bg-indigo-500",
    panel:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300",
    label: "جاری",
  };
};

const actionPresentation = (transition) => {
  const kind = transition?.actionType ?? "";
  if (["deny", "denied", "reject", "rejected"].includes(kind))
    return {
      tone: "danger",
      label: transition?.label || "رد",
      Icon: CloseCircleOutlined,
    };
  if (["cancel", "cancelled", "canceled"].includes(kind))
    return {
      tone: "danger",
      label: transition?.label || "لغو",
      Icon: StopOutlined,
    };
  if (["approve", "resolve", "complete", "completed"].includes(kind))
    return {
      tone: "primary",
      label: transition?.label || "تأیید",
      Icon: CheckCircleOutlined,
    };
  return {
    tone: "primary",
    label: transition?.label || "ارجاع",
    Icon: SendOutlined,
  };
};

const MetaItem = ({ icon, label, value }) => (
  <div className="min-w-0">
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
      {icon}
      <span>{label}</span>
    </div>
    <div className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
      {value || "—"}
    </div>
  </div>
);

export const RequestWorkPanel = ({ record, onCompleted }) => {
  const { message } = App.useApp();
  const formQuery = useFormDefinitionFieldById(record.formDefinitionId, {
    enabled: Boolean(record.formDefinitionId && record.submissionId),
  });
  const locksQuery = useLockedFieldsByRequestId(record.requestId, {
    enabled: Boolean(record.requestId),
  });
  const updateSubmission = useUpdateFormSubmission();
  const uploadAttachments = useUploadSubmissionAttachments();
  const doAction = useDoAction();

  const categories = useMemo(
    () => asCategories(formQuery.data),
    [formQuery.data],
  );
  const fields = useMemo(() => flattenFields(categories), [categories]);
  const initialValues = useMemo(
    () => hydrateSubmissionValues(categories, record.formData),
    [categories, record.formData],
  );
  const lockedFieldIds = useMemo(
    () =>
      asArray(locksQuery.data)
        .map(lockedFieldIdOf)
        .filter((id) => id != null),
    [locksQuery.data],
  );
  const submitOptions = useMemo(
    () =>
      (record.transitions ?? []).map((transition) => {
        const presentation = actionPresentation(transition);
        return {
          ...transition,
          label: presentation.label,
          className: presentation.tone,
        };
      }),
    [record.transitions],
  );

  const pending =
    updateSubmission.isPending ||
    uploadAttachments.isPending ||
    doAction.isPending;

  const saveAndRefer = async (values, selectedAction) => {
    if (!selectedAction?.actionId) return;
    try {
      const fileProblems = validateFiles(fields, values);
      if (fileProblems.length) {
        message.error(fileProblems[0]);
        return;
      }

      const changedData = buildFormData(fields, values, {
        includeFiles: false,
        stringifyValues: false,
      });
      const formData = { ...(record.formData ?? {}), ...changedData };
      const result = await updateSubmission.mutateAsync({
        id: record.submissionId,
        payload: { form_data: formData },
      });
      if (result.verification?.checked && !result.verification.ok) {
        const names = result.verification.mismatches
          .map((item) => item.fieldName)
          .join("، ");
        throw new Error(
          `ذخیرهٔ این فیلدها با مقدار ارسالی یکسان نیست: ${names}`,
        );
      }

      const files = collectFileEntries(fields, values);
      if (files.length) {
        const uploadResult = await uploadAttachments.mutateAsync({
          submissionId: record.submissionId,
          entries: files,
        });
        if (uploadResult.failed?.length)
          throw (
            uploadResult.failed[0].error ?? new Error("آپلود فایل ناموفق بود.")
          );
      }

      await doAction.mutateAsync({
        request_id: Number(record.requestId),
        action_id: Number(selectedAction.actionId),
      });
      message.success(
        `فرم ذخیره شد و درخواست با عملیات «${selectedAction.label}» به «${selectedAction.nextStateName || "مرحله بعد"}» ارجاع شد.`,
      );
      await onCompleted?.();
    } catch (error) {
      message.error(
        getApiErrorMessage(error, "ذخیره فرم و ارجاع درخواست انجام نشد."),
      );
    }
  };

  if (!record.submissionId || !record.formDefinitionId)
    return (
      <Alert
        type="warning"
        showIcon
        message="فرم این درخواست برای تکمیل در دسترس نیست."
      />
    );
  if (formQuery.isLoading || locksQuery.isLoading)
    return <Skeleton active paragraph={{ rows: 8 }} />;
  if (formQuery.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={getApiErrorMessage(
          formQuery.error,
          "دریافت ساختار فرم انجام نشد.",
        )}
      />
    );
  if (!categories.length) return <Empty description="ساختار فرم خالی است." />;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        فیلدهای باز این مرحله را تکمیل کنید و سپس یکی از عملیات پایین فرم را
        انتخاب کنید. فیلدهای قفل‌شده مربوط به مراحل قبلی‌اند.
      </div>
      <FormRenderer
        key={`request-${record.requestId}-state-${record.currentStateId}`}
        categories={categories}
        mode="fill"
        initialValues={initialValues}
        initialDevice="fluid"
        showToolbar={false}
        lockedFieldIds={lockedFieldIds}
        submitOptions={submitOptions}
        submitSectionTitle={`تکمیل مرحله «${record.stateName}» و ارجاع`}
        submitting={pending}
        onSubmit={saveAndRefer}
      />
      {!submitOptions.length ? (
        <Alert
          type="info"
          showIcon
          message="برای مرحله فعلی عملیات قابل اجرایی وجود ندارد."
        />
      ) : null}
    </div>
  );
};

const ProcessRequestsModal = ({ open, process, onClose }) => {
  const processId = process?.id ?? null;
  const [stateType, setStateType] = useState("");
  const [stateId, setStateId] = useState(null);
  const [expandedRequestKey, setExpandedRequestKey] = useState(null);

  useEffect(() => {
    if (!open) return;
    setStateType("");
    setStateId(null);
    setExpandedRequestKey(null);
  }, [open, processId]);

  const processInfoQuery = useProcessInfo(processId, {
    enabled: Boolean(open && processId),
    staleTime: 60 * 1000,
  });
  const filters = useMemo(() => ({ stateId, stateType }), [stateId, stateType]);
  const query = useProcessRequests(processId, filters, {
    enabled: Boolean(open && processId),
    keepPreviousData: true,
  });

  const processInfo = pickProcessInfo(processInfoQuery.data);
  const states = asArray(processInfo?.process_states);
  const responseData = useMemo(() => unwrapPayload(query.data), [query.data]);
  const rows = useMemo(
    () => requestRowsFromResponse(responseData, process),
    [responseData, process],
  );

  const title = (
    <div className="py-0.5">
      <div className="text-base font-semibold text-slate-800 dark:text-slate-100">
        درخواست‌های جاری «{process?.name || "فرایند"}»
      </div>
      <div className="mt-1 text-xs font-normal text-slate-400">
        {rows.length.toLocaleString("fa-IR")} مورد مطابق فیلتر
      </div>
    </div>
  );

  const renderRequest = (record) => {
    const isExpanded = expandedRequestKey === record.rowKey;
    const state = statePresentation(record.stateType);
    return (
      <article
        key={record.rowKey}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${state.dot}`} />
              <h3 className="m-0 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {record.title}
              </h3>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
              <span>{fullName(record.submitter || record.createdBy)}</span>
              <span>{jalali(record.createdAt)}</span>
              {record.attachments.length ? (
                <span>
                  {record.attachments.length.toLocaleString("fa-IR")} پیوست
                </span>
              ) : null}
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-3 ${state.panel}`}>
            <div className="text-[10px] font-semibold opacity-70">
              مرحلهٔ فعلی درخواست
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <strong className="truncate text-sm">{record.stateName}</strong>
              <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] dark:bg-black/10">
                {state.label}
              </span>
            </div>
          </div>

          <Button
            type={isExpanded ? "default" : "primary"}
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={() =>
              setExpandedRequestKey(isExpanded ? null : record.rowKey)
            }
          >
            {isExpanded ? "بستن" : "تکمیل و ارجاع"}
          </Button>
        </div>

        {isExpanded ? (
          <div className="border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/30">
            <div className="mb-4 grid gap-4 rounded-xl bg-white p-3 sm:grid-cols-2 lg:grid-cols-4 dark:bg-slate-900">
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
                label="تاریخ ایجاد"
                value={jalali(record.submittedAt)}
              />
              <MetaItem
                icon={<PaperClipOutlined />}
                label="پیوست‌ها"
                value={
                  record.attachments.length
                    ? `${record.attachments.length.toLocaleString("fa-IR")} فایل`
                    : "بدون پیوست"
                }
              />
            </div>
            <RequestWorkPanel record={record} onCompleted={query.refetch} />
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="min(1380px, 98vw)"
      destroyOnClose
      footer={null}
    >
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          <FilterOutlined className="text-blue-500" />
          فیلتر مرحله
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[11px] text-slate-500">نوع وضعیت</div>
            <Select
              className="w-full"
              value={stateType}
              options={STATE_TYPE_OPTIONS}
              onChange={(value) => {
                setStateType(value);
                setExpandedRequestKey(null);
              }}
            />
          </div>
          <div>
            <div className="mb-1 text-[11px] text-slate-500">مرحله مشخص</div>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-full"
              placeholder="همه مراحل"
              value={stateId}
              loading={processInfoQuery.isLoading}
              options={states.map((state) => ({
                value: state.id,
                label: state.name || `مرحله ${state.id}`,
              }))}
              onChange={(value) => {
                setStateId(value ?? null);
                setExpandedRequestKey(null);
              }}
            />
          </div>
        </div>
        {(stateType || stateId) && (
          <Button
            onClick={() => {
              setStateType("");
              setStateId(null);
            }}
          >
            پاک‌کردن فیلتر
          </Button>
        )}
      </div>

      {query.isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : query.isError ? (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(
            query.error,
            "دریافت درخواست‌های فرایند انجام نشد.",
          )}
          action={
            <Button size="small" onClick={() => query.refetch()}>
              تلاش مجدد
            </Button>
          }
        />
      ) : rows.length ? (
        <div className="space-y-3">{rows.map(renderRequest)}</div>
      ) : (
        <Empty
          className="py-14"
          description="درخواستی مطابق فیلتر انتخاب‌شده وجود ندارد."
        />
      )}
    </Modal>
  );
};

export default ProcessRequestsModal;
