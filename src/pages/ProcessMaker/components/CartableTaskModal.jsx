import { useEffect, useMemo, useState } from "react";
import { Alert, App, Button, Empty, Result, Skeleton, Space, Tag } from "antd";
import {
  FileTextOutlined,
  PartitionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import {
  buildFormData,
  buildSubmissionPayload,
  collectFileEntries,
  flattenFields,
  resolveSubmitterId,
  validateFiles,
} from "@/pages/Forms/FormRuntime/submission";
import {
  useFormDefinitionFieldById,
  useSubmitForm,
} from "@/QueryServises/formsQuery";
import {
  useCreateRequest,
  useDoAction,
  useLockedFieldsByProcessId,
  useProcessInfo,
  useTransitionActions,
} from "@/QueryServises/workflowQuery";
import {
  buildGraph,
  pickProcessInfo,
} from "@/pages/Processes/ProcessBuilder/processGraph";
import {
  getStateTypeLabel,
  isStartStateType,
} from "@/pages/Processes/ProcessBuilder/processSchema";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { getUserFromToken } from "@/utils/ExportFromToken";
import Modal from "../../../components/Modal";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const entityIdOf = (payload) => {
  const item = Array.isArray(payload)
    ? payload[0]
    : Array.isArray(payload?.results)
      ? payload.results[0]
      : Array.isArray(payload?.data)
        ? payload.data[0]
        : payload;
  const value =
    item?.id ??
    item?.request_id ??
    item?.request?.id ??
    item?.data?.id ??
    item?.result?.id;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const looksLikeFormDefinition = (record) =>
  Boolean(
    record &&
    (Array.isArray(record.fields) ||
      "enable_auto_save" in record ||
      "max_submissions" in record ||
      "success_message" in record ||
      "version" in record),
  );

const resolveFormDefinitionId = (record) => {
  if (!record) return null;
  const nested = record.form_definition;
  if (nested && typeof nested === "object") return nested.id ?? null;
  if (typeof nested === "number" || typeof nested === "string") return nested;
  if (record.form_definition_id != null) return record.form_definition_id;
  if (looksLikeFormDefinition(record)) return record.id ?? null;
  return null;
};

const resolveProcessId = (record) => {
  if (!record) return null;
  if (looksLikeFormDefinition(record))
    return record.process?.id ?? record.process_id ?? null;
  return record.id ?? null;
};

const CartableTaskModal = ({
  open,
  process: processItem,
  submitterId,
  onClose,
  onSubmitted,
}) => {
  const { message } = App.useApp();

  const formDefinitionId = useMemo(
    () => resolveFormDefinitionId(processItem),
    [processItem],
  );
  const processId = useMemo(() => resolveProcessId(processItem), [processItem]);

  const submitter = useMemo(
    () => resolveSubmitterId(submitterId),
    [submitterId],
  );
  const submitterName = useMemo(() => getUserFromToken()?.displayName, []);

  const formQuery = useFormDefinitionFieldById(formDefinitionId, {
    enabled: Boolean(open && formDefinitionId),
  });
  const processInfoQuery = useProcessInfo(processId, {
    enabled: Boolean(open && processId),
  });
  const transitionActionsQuery = useTransitionActions({
    enabled: Boolean(open && processId),
    staleTime: 60 * 1000,
  });
  const processLocksQuery = useLockedFieldsByProcessId(processId, {
    enabled: Boolean(open && processId),
  });
  const submitForm = useSubmitForm();
  const createRequest = useCreateRequest();
  const doAction = useDoAction();

  const [done, setDone] = useState(null);
  const [renderToken, setRenderToken] = useState(0);

  useEffect(() => {
    if (!open) return;
    setDone(null);
    setRenderToken((prev) => prev + 1);
  }, [open, formDefinitionId]);

  const categories = useMemo(() => {
    const data = formQuery.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return data ? [data] : [];
  }, [formQuery.data]);

  const definition = categories[0] || {};
  const fields = useMemo(() => flattenFields(categories), [categories]);

  const workflow = useMemo(() => {
    const info = pickProcessInfo(processInfoQuery.data);
    if (!info) return null;
    const states = asArray(info.process_states);
    const graph = buildGraph(
      processInfoQuery.data,
      asArray(transitionActionsQuery.data),
      processLocksQuery.data,
    );
    const startNode = graph?.nodes?.find((state) =>
      isStartStateType(state.stateTypeId),
    );
    const actionById = new Map(
      (graph?.actions ?? []).map((action) => [String(action.id), action]),
    );
    const nodeById = new Map(
      (graph?.nodes ?? []).map((state) => [String(state.id), state]),
    );
    const startActions = (graph?.edges ?? [])
      .filter((edge) => String(edge.source) === String(startNode?.id))
      .flatMap((edge) =>
        (edge.actions ?? []).map((link) => {
          const action = actionById.get(String(link.actionId));
          const nextState = nodeById.get(String(edge.target));
          return {
            key: `${edge.id}-${link.id ?? link.actionId}`,
            actionId: action?.id ?? link.actionId,
            label: action?.name || "ارسال به مرحله بعد",
            nextStateId: nextState?.id ?? edge.target,
            nextStateName: nextState?.name || "مرحله بعد",
          };
        }),
      );
    return {
      startState: states.find((state) =>
        isStartStateType(state?.state_type?.id ?? state?.state_type_id),
      ),
      states,
      actions: asArray(info.process_actions),
      startActions,
      startLockedFieldIds: startNode?.lockedFieldIds ?? [],
    };
  }, [
    processInfoQuery.data,
    processLocksQuery.data,
    transitionActionsQuery.data,
  ]);

  const submitOptions = useMemo(() => {
    if (processInfoQuery.isLoading || transitionActionsQuery.isLoading)
      return [
        {
          key: "loading-start-actions",
          label: "در حال دریافت مسیرهای شروع…",
          disabled: true,
        },
      ];
    return workflow?.startActions?.length
      ? workflow.startActions
      : [
          {
            key: "create-at-start",
            actionId: null,
            label: "ثبت درخواست",
            nextStateName: workflow?.startState?.name || "",
          },
        ];
  }, [processInfoQuery.isLoading, transitionActionsQuery.isLoading, workflow]);

  const formTitle =
    definition.name ||
    processItem?.form_definition?.name ||
    processItem?.name ||
    "بدون فرم";

  const submit = async (values, selectedAction) => {
    try {
      const fileProblems = validateFiles(fields, values);
      if (fileProblems.length) {
        message.error(fileProblems[0]);
        return;
      }

      const files = collectFileEntries(fields, values);

      const formData = buildFormData(fields, values);
      if (!Object.keys(formData).length && !files.length) {
        message.warning("داده‌ای برای ارسال وجود ندارد؛ ابتدا فرم را پر کنید.");
        return;
      }

      const payload = buildSubmissionPayload({
        formDefinitionId,
        fields,
        values,
        submitterId: submitter,
      });

      const { submissionId, uploaded, failed, skipped, verification } =
        await submitForm.mutateAsync({ payload, files });

      const attachmentCount = uploaded?.length ?? 0;

      if (verification?.checked && !verification.ok) {
        const names = verification.mismatches
          .map((item) => item.fieldName)
          .join("، ");
        throw new Error(
          `مقدار ذخیره‌شدهٔ این فیلدها با دادهٔ ارسالی یکسان نیست: ${names}`,
        );
      }
      if (submissionId && !verification?.checked)
        message.warning(
          "فرم ثبت شد، اما بازخوانی فیلدبه‌فیلد از سرور انجام نشد.",
        );

      if (files.length && !submissionId)
        message.warning(
          "فرم ثبت شد، اما شناسهٔ ارسال در پاسخ سرور نبود و پیوست‌ها ارسال نشدند.",
        );

      if (failed?.length)
        message.warning(
          getApiErrorMessage(
            failed[0].error,
            `ارسال ${failed.length} پیوست انجام نشد.`,
          ),
        );

      if (skipped?.length && submissionId)
        message.warning(
          `${skipped.length} فایل ارسال نشد؛ فیلد مربوطه شناسهٔ معتبری روی سرور ندارد.`,
        );

      if (!processId) {
        throw new Error(
          "شناسهٔ فرایند پیدا نشد؛ امکان ثبت درخواست وجود ندارد.",
        );
      }

      if (!submissionId) {
        throw new Error(
          "شناسهٔ ارسال فرم از سرور دریافت نشد؛ امکان ثبت درخواست وجود ندارد.",
        );
      }

      // بعد از ثبت موفق submission، مطابق Swagger درخواست فرایند هم ساخته می‌شود:
      // POST /api/v1/workflow/add-request/
      // { process_id, form_submission_id, title }
      const createdRequest = await createRequest.mutateAsync({
        process_id: Number(processId),
        form_submission_id: Number(submissionId),
        title: formTitle,
      });
      const requestId = entityIdOf(createdRequest);

      if (selectedAction?.actionId) {
        if (!requestId)
          throw new Error(
            "درخواست ساخته شد، اما شناسهٔ آن برای اجرای عملیات مسیر دریافت نشد.",
          );
        await doAction.mutateAsync({
          request_id: Number(requestId),
          action_id: Number(selectedAction.actionId),
        });
      }

      const messageText =
        definition.success_message ||
        "فرم و درخواست فرایند با موفقیت ثبت شدند.";

      setDone(messageText);
      onSubmitted?.({
        submissionId,
        requestId,
        processId,
        processName: processItem?.name || "",
        formDefinitionId,
        formName: formTitle,
        submitterId: submitter,
        submitterName: submitterName || "",
        stateName:
          selectedAction?.nextStateName || workflow?.startState?.name || "",
        fieldCount: Object.keys(formData).length,
        attachmentCount,
        formData,
      });
      message.success(messageText);
    } catch (error) {
      message.error(getApiErrorMessage(error, "ارسال فرم انجام نشد."));
    }
  };

  const renderBody = () => {
    if (!formDefinitionId)
      return (
        <Empty
          className="py-16"
          description="شناسهٔ فرم پیدا نشد؛ رکورد انتخاب‌شده نه تعریف فرم است و نه فرمی به آن وصل شده است."
        />
      );

    if (formQuery.isLoading)
      return <Skeleton active paragraph={{ rows: 10 }} />;

    if (formQuery.isError || !categories.length)
      return (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(
            formQuery.error,
            "فرم این فرایند یافت نشد یا در دسترس نیست.",
          )}
          action={
            <Button size="small" onClick={() => formQuery.refetch()}>
              تلاش مجدد
            </Button>
          }
        />
      );

    if (done)
      return (
        <Result
          status="success"
          title={done}
          subTitle={
            workflow?.startState?.name
              ? `درخواست در ایستگاه «${workflow.startState.name}» ثبت شد.`
              : "درخواست شما ثبت شد."
          }
          extra={
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setDone(null);
                  setRenderToken((prev) => prev + 1);
                }}
              >
                ارسال یک درخواست دیگر
              </Button>
              <Button onClick={onClose}>بازگشت به کارتابل</Button>
            </Space>
          }
        />
      );

    if (!fields.length)
      return (
        <Empty
          className="py-16"
          description="این فرم هیچ فیلدی ندارد؛ ابتدا در «استودیو ساخت فرم» فیلد اضافه کنید."
        />
      );

    const showWorkflowBox =
      Boolean(workflow?.startState || workflow?.actions?.length) ||
      Boolean(definition.description);

    return (
      <>
        {showWorkflowBox ? (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            {workflow ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <PartitionOutlined className="text-orange-500" />
                <span className="font-semibold">مسیر گردش کار:</span>
                {workflow.startState ? (
                  <Tag color="green">
                    {workflow.startState.name} (
                    {getStateTypeLabel(
                      workflow.startState?.state_type?.id ??
                        workflow.startState?.state_type_id,
                    )}
                    )
                  </Tag>
                ) : (
                  <span>ایستگاه شروع تعیین نشده است.</span>
                )}
              </div>
            ) : null}
            {definition.description ? (
              <p className="mt-2 mb-0 text-xs leading-6 text-slate-500 dark:text-slate-400">
                {definition.description}
              </p>
            ) : null}
          </div>
        ) : null}

        {definition.is_active === false ? (
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="این فرم غیرفعال است و ممکن است ارسال آن از سوی سرور پذیرفته نشود."
          />
        ) : null}

        <FormRenderer
          key={`${formDefinitionId}-${renderToken}`}
          categories={categories}
          definition={definition}
          fields={fields}
          mode="fill"
          showToolbar={false}
          initialDevice="fluid"
          readOnly={false}
          disabled={false}
          submitLabel="ثبت درخواست"
          submitOptions={submitOptions}
          lockedFieldIds={workflow?.startLockedFieldIds ?? []}
          submitSectionTitle="ثبت درخواست در فرایند و انتخاب مسیر اول"
          submitting={
            submitForm.isPending ||
            createRequest.isPending ||
            doAction.isPending
          }
          onSubmit={submit}
        />
      </>
    );
  };

  return (
    <Modal
      isOpen={open}
      size="min(1100px, 96vw)"
      onClose={onClose}
      destroyOnClose
      footer={null}
      title={
        <div className="flex w-full flex-col gap-1">
          <span className="flex items-center gap-2 text-xs font-normal text-slate-500">
            <FileTextOutlined />
            {formTitle}
            {definition.version ? <Tag>نسخه {definition.version}</Tag> : null}
            <Tag icon={<UserOutlined />} color={submitter ? "blue" : "default"}>
              {submitter
                ? `ارسال‌کننده: ${submitterName || submitter}`
                : "بدون شناسهٔ کاربر (ثبت به‌نام ادمین)"}
            </Tag>
          </span>
        </div>
      }
    >
      {renderBody()}
    </Modal>
  );
};

export default CartableTaskModal;
