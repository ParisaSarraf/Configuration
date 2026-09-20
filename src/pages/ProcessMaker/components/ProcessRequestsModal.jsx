import { useMemo, useState } from "react";
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Skeleton,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  SendOutlined,
  StopOutlined,
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

const formatValue = (value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const readTransitions = (request, process, fallbackProcess) =>
  asArray(request?.current_state?.transitions).flatMap((transition) => {
    const actionLinks = asArray(transition?.actions);
    // هر عملیات روی یک مسیر، یک انتخاب مستقل برای کاربر است.
    // قبلاً فقط actions[0] خوانده می‌شد و بقیه عملیات پنهان می‌ماندند.
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
        raw: transition,
      };
    });
  });

const processRequestRowsFromResponse = (payload, fallbackProcess) =>
  asArray(unwrapPayload(payload)).flatMap((process) => {
    const requests = asArray(process?.requests);
    return requests.map((request) => {
      const submission = request?.form_submission ?? null;
      const formData = submission?.form_data ?? null;
      const transitions = readTransitions(request, process, fallbackProcess);
      return {
        rowKey: `process-${process?.id ?? fallbackProcess?.id ?? "unknown"}-request-${request?.id ?? "unknown"}`,
        source: "process-request",
        processId: process?.id ?? fallbackProcess?.id ?? null,
        processName: process?.name ?? fallbackProcess?.name ?? "",
        formDefinitionId:
          process?.form_definition ?? fallbackProcess?.form_definition ?? null,
        requestId: request?.id ?? null,
        title: request?.title ?? "بدون عنوان",
        stateId: request?.current_state?.id ?? null,
        stateName: request?.current_state?.name ?? "—",
        stateType: request?.current_state?.state_type?.name ?? "",
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
        transitions,
      };
    });
  });

const actionPresentation = (transition) => {
  const kind = transition?.actionType ?? "";
  if (["deny", "denied", "reject", "rejected"].includes(kind))
    return {
      color: "red",
      buttonType: "default",
      danger: true,
      label: transition?.actionName || "رد",
      Icon: CloseCircleOutlined,
    };
  if (["cancel", "cancelled", "canceled"].includes(kind))
    return {
      color: "orange",
      buttonType: "default",
      danger: true,
      label: transition?.actionName || "لغو",
      Icon: StopOutlined,
    };
  if (["approve", "resolve", "complete", "completed"].includes(kind))
    return {
      color: "green",
      buttonType: "primary",
      danger: false,
      label: transition?.actionName || "تأیید و ارجاع",
      Icon: CheckCircleOutlined,
    };
  return {
    color: "blue",
    buttonType: "primary",
    danger: false,
    label: transition?.actionName || "ارجاع",
    Icon: SendOutlined,
  };
};

const ProcessRequestsModal = ({ open, process, onClose, onViewSubmission }) => {
  const { message } = App.useApp();
  const processId = process?.id ?? null;
  const query = useProcessRequests(processId, {
    enabled: Boolean(open && processId),
  });
  const doAction = useDoAction();
  const [pendingOptionKey, setPendingOptionKey] = useState(null);

  const responseData = useMemo(() => unwrapPayload(query.data), [query.data]);

  const rows = useMemo(
    () => processRequestRowsFromResponse(responseData, process),
    [responseData, process],
  );

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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-base font-black">درخواست‌های فرآیند</span>
      <Tag color="blue" className="m-0">
        {process?.name || "فرآیند"}
      </Tag>
      <Badge count={rows.length} color="#1677ff" />
    </div>
  );

  const renderTransitions = (record) => {
    const transitions = record.transitions ?? [];
    if (transitions.length === 0)
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          برای این وضعیت مسیر یا عملیات قابل اجرایی تعریف نشده است.
        </div>
      );

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-100">
              انتخاب مسیر و عملیات
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              مقصد را بررسی کنید، سپس عملیات مناسب را انجام دهید.
            </div>
          </div>
          <Tag color="blue" className="m-0">
            {transitions.length} انتخاب
          </Tag>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {transitions.map((transition, index) => {
            const presentation = actionPresentation(transition);
            const ActionIcon = presentation.Icon;
            const pendingKey = `${record.rowKey}-${transition.optionKey}`;
            const isPending =
              doAction.isPending && pendingOptionKey === pendingKey;
            return (
              <div
                key={transition.optionKey ?? `${transition.id}-${index}`}
                className="rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 via-white to-sky-50 p-4 shadow-sm dark:border-blue-500/20 dark:from-blue-950/30 dark:via-slate-900 dark:to-sky-950/20"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    مسیر {index + 1}
                  </span>
                  <Tag color={presentation.color} className="m-0">
                    {transition.actionName}
                  </Tag>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Tag color="purple" className="m-0 rounded-lg px-3 py-1">
                    {transition.currentStateName || record.stateName}
                  </Tag>
                  <ArrowLeftOutlined className="text-blue-500" />
                  <Tag
                    color={presentation.color}
                    className="m-0 rounded-lg px-3 py-1"
                  >
                    {transition.nextStateName}
                  </Tag>
                </div>

                {transition.actionDescription ? (
                  <div className="mt-3 min-h-9 rounded-xl bg-white/70 p-2 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                    {transition.actionDescription}
                  </div>
                ) : null}

                <Button
                  type={presentation.buttonType}
                  danger={presentation.danger}
                  block
                  className="mt-3 font-black"
                  icon={<ActionIcon />}
                  loading={isPending}
                  disabled={!transition.actionId || doAction.isPending}
                  onClick={() => handleReferral(record, transition)}
                >
                  {presentation.label} به «{transition.nextStateName}»
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFormData = (record) => {
    const entries = Object.entries(record.formData ?? {});
    if (!entries.length)
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="مقداری ثبت نشده"
        />
      );
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <div className="mb-1 text-[11px] font-bold text-slate-400">
              {key}
            </div>
            <div className="break-words text-sm font-semibold text-slate-700 dark:text-slate-100">
              {formatValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestCard = (record) => {
    return (
      <Card
        key={record.rowKey}
        className="overflow-hidden rounded-3xl border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700"
        bodyStyle={{ padding: 0 }}
      >
        <div className="border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Tag color="blue" className="m-0">
                  درخواست #{record.requestId}
                </Tag>
                <Tag color="geekblue" className="m-0">
                  ارسال #{record.submissionId}
                </Tag>
                <Tag color="purple" className="m-0">
                  {record.stateName}
                </Tag>
              </div>
              <h3 className="m-0 truncate text-lg font-black text-slate-800 dark:text-slate-100">
                {record.title}
              </h3>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                فرآیند: {record.processName || process?.name || "—"}
              </div>
            </div>
            <Space size={8} wrap>
              <Tooltip title="نمایش فرم پرشده این درخواست">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => onViewSubmission?.(record)}
                  disabled={!record.submissionId}
                >
                  فرم پرشده
                </Button>
              </Tooltip>
              <Tag color={record.transitions.length > 0 ? "blue" : "default"}>
                {record.transitions.length > 0
                  ? `${record.transitions.length} مسیر/عملیات قابل انتخاب`
                  : "بدون مسیر قابل اجرا"}
              </Tag>
            </Space>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_360px]">
          {renderTransitions(record)}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item
                label={
                  <>
                    <UserOutlined /> ثبت‌کننده
                  </>
                }
              >
                {fullName(record.createdBy)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <UserOutlined /> ارسال‌کننده
                  </>
                }
              >
                {fullName(record.submitter)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> تاریخ درخواست
                  </>
                }
              >
                {jalali(record.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> تاریخ ارسال فرم
                  </>
                }
              >
                {jalali(record.submittedAt)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <PaperClipOutlined /> پیوست‌ها
                  </>
                }
              >
                {record.attachments.length ? (
                  <Space size={4} wrap>
                    {record.attachments.map((item, index) => (
                      <Tag key={item.id ?? index} color="blue">
                        {item.original_filename || `پیوست ${index + 1}`}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  "—"
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
    );
  };

  const renderBody = () => {
    if (!processId)
      return (
        <Empty description="شناسهٔ فرآیند برای دریافت درخواست‌ها پیدا نشد." />
      );

    if (query.isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

    if (query.isError)
      return (
        <Alert
          type="error"
          showIcon
          message="دریافت درخواست‌های فرآیند انجام نشد."
          description={getApiErrorMessage(query.error)}
        />
      );

    if (!rows.length)
      return <Empty description="برای این فرآیند ��رخواستی ثبت نشده است." />;

    return (
      <div className="flex flex-col gap-4">{rows.map(renderRequestCard)}</div>
    );
  };

  return (
    <Modal
      isOpen={open}
      title={title}
      onClose={onClose}
      footer={false}
      size={1180}
      className="process-requests-modal"
    >
      {renderBody()}
    </Modal>
  );
};

export default ProcessRequestsModal;
