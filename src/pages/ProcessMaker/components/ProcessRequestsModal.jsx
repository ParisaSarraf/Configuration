import { useMemo } from "react";
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
  EyeOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  SendOutlined,
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
  asArray(request?.current_state?.transitions).map((transition) => {
    const actionLink = asArray(transition?.actions)[0] ?? null;
    const action = actionLink?.action ?? null;
    return {
      id: transition?.id ?? null,
      actionLinkId: actionLink?.id ?? null,
      actionId: action?.id ?? null,
      actionName: action?.name ?? action?.action_type?.name ?? "ارجاع",
      actionType: action?.action_type?.name ?? "",
      actionDescription: action?.description ?? "",
      currentStateId:
        transition?.current_state?.id ?? request?.current_state?.id ?? null,
      currentStateName:
        transition?.current_state?.name ?? request?.current_state?.name ?? "",
      nextStateId: transition?.next_state?.id ?? null,
      nextStateName: transition?.next_state?.name ?? "مرحله بعد",
      processId: transition?.process ?? process?.id ?? fallbackProcess?.id ?? null,
      raw: transition,
    };
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

const ProcessRequestsModal = ({ open, process, onClose, onViewSubmission }) => {
  const { message } = App.useApp();
  const processId = process?.id ?? null;
  const query = useProcessRequests(processId, {
    enabled: Boolean(open && processId),
  });
  const doAction = useDoAction();

  const responseData = useMemo(() => unwrapPayload(query.data), [query.data]);

  const rows = useMemo(
    () => processRequestRowsFromResponse(responseData, process),
    [responseData, process],
  );

  const handleReferral = async (record, transition) => {
    if (!transition?.actionId || !record?.requestId) return;
    try {
      await doAction.mutateAsync({
        request_id: Number(record.requestId),
        action_id: Number(transition.actionId),
      });
      message.success(
        `درخواست #${record.requestId} با موفقیت به «${transition.nextStateName || "مرحله بعد"}» ارجاع شد.`,
      );
      query.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, "ارجاع درخواست انجام نشد."));
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

  const renderTransition = (record) => {
    const transition = record.transitions?.[0] ?? null;
    if (!transition)
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          برای این وضعیت مسیر ارجاعی تعریف نشده است.
        </div>
      );

    return (
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 via-white to-sky-50 p-4 shadow-sm dark:border-blue-500/20 dark:from-blue-950/30 dark:via-slate-900 dark:to-sky-950/20">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            مسیر ارجاع
          </span>
          <Tag color="blue" className="m-0">
            {transition.actionName}
          </Tag>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="purple" className="m-0 rounded-lg px-3 py-1">
            {transition.currentStateName || record.stateName}
          </Tag>
          <ArrowLeftOutlined className="text-blue-500" />
          <Tag color="green" className="m-0 rounded-lg px-3 py-1">
            {transition.nextStateName}
          </Tag>
        </div>
        {transition.actionDescription ? (
          <div className="mt-3 rounded-xl bg-white/70 p-2 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
            {transition.actionDescription}
          </div>
        ) : null}
      </div>
    );
  };

  const renderFormData = (record) => {
    const entries = Object.entries(record.formData ?? {});
    if (!entries.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="مقداری ثبت نشده" />;
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <div className="mb-1 text-[11px] font-bold text-slate-400">{key}</div>
            <div className="break-words text-sm font-semibold text-slate-700 dark:text-slate-100">
              {formatValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestCard = (record) => {
    const firstTransition = record.transitions?.[0] ?? null;
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
                <Tag color="blue" className="m-0">درخواست #{record.requestId}</Tag>
                <Tag color="geekblue" className="m-0">ارسال #{record.submissionId}</Tag>
                <Tag color="purple" className="m-0">{record.stateName}</Tag>
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
              <Tooltip
                title={
                  firstTransition
                    ? `ارجاع به ${firstTransition.nextStateName}`
                    : "مسیر ارجاع ندارد"
                }
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={() => handleReferral(record, firstTransition)}
                  loading={doAction.isPending}
                  disabled={!firstTransition || doAction.isPending}
                  className="!border-none !bg-gradient-to-l !from-blue-600 !to-sky-500 !font-black shadow-md shadow-blue-500/20 hover:!from-blue-700 hover:!to-sky-600"
                >
                  ارجاع
                </Button>
              </Tooltip>
            </Space>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_360px]">
            {renderTransition(record)}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label={<><UserOutlined /> ثبت‌کننده</>}>
                {fullName(record.createdBy)}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> ارسال‌کننده</>}>
                {fullName(record.submitter)}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> تاریخ درخواست</>}>
                {jalali(record.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> تاریخ ارسال فرم</>}>
                {jalali(record.submittedAt)}
              </Descriptions.Item>
              <Descriptions.Item label={<><PaperClipOutlined /> پیوست‌ها</>}>
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
      return <Empty description="شناسهٔ فرآیند برای دریافت درخواست‌ها پیدا نشد." />;

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

    return <div className="flex flex-col gap-4">{rows.map(renderRequestCard)}</div>;
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
