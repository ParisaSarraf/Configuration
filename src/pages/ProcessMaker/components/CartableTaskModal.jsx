import { useEffect, useMemo, useState } from "react";
import { Alert, App, Button, Empty, Result, Skeleton, Space, Tag } from "antd";
import {
  FileTextOutlined,
  PartitionOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import {
  buildFormData,
  buildSubmissionPayload,
  flattenFields,
  resolveSubmitterId,
} from "@/pages/Forms/FormRuntime/submission";
import {
  useCreateFormSubmission,
  useFormDefinitionFieldById,
} from "@/QueryServises/formsQuery";
import { useProcessInfo } from "@/QueryServises/workflowQuery";
import { pickProcessInfo } from "@/pages/Processes/ProcessBuilder/processGraph";
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

/**
 * رکورد کارتابل دو شکل دارد:
 *  ۱) رکورد «فرایند» که فرمش در form_definition آمده است
 *  ۲) رکورد «تعریف فرم» (خروجی useFormDefinitions در کارتابل)
 */
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

  // پرکنندهٔ فرم: prop ← وگرنه user_id داخل access token
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
  const createSubmission = useCreateFormSubmission();

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
    return {
      startState: states.find((state) =>
        isStartStateType(state?.state_type?.id ?? state?.state_type_id),
      ),
      states,
      actions: asArray(info.process_actions),
    };
  }, [processInfoQuery.data]);

  const formTitle =
    definition.name ||
    processItem?.form_definition?.name ||
    processItem?.name ||
    "بدون فرم";

  const submit = async (values) => {
    console.log("=== submit called ===");
    console.log("raw values:", values);
    console.log("typeof values:", typeof values);
    console.log("isArray:", Array.isArray(values));
    try {
      const formData = buildFormData(fields, values);
      if (!Object.keys(formData).length) {
        message.warning("داده‌ای برای ارسال وجود ندارد؛ ابتدا فرم را پر کنید.");
        return;
      }
      console.log("formData:", formData);
      console.log("typeof formData:", typeof formData);

      const payload = buildSubmissionPayload({
        formDefinitionId,
        fields,
        values,
        submitterId: submitter,
      });

      console.log("payload:", payload);
      console.log("payload.form_data:", payload.form_data);
      console.log("typeof payload.form_data:", typeof payload.form_data);
      console.log("JSON.stringify payload:", JSON.stringify(payload));

      const response = await createSubmission.mutateAsync(payload);
      const messageText =
        definition.success_message || "فرم شما با موفقیت ارسال شد.";

      setDone(messageText);
      onSubmitted?.({
        submissionId: response?.id ?? null,
        processId,
        processName: processItem?.name || "",
        formDefinitionId,
        formName: formTitle,
        submitterId: submitter,
        stateName: workflow?.startState?.name || "",
        fieldCount: Object.keys(formData).length,
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
                {workflow.actions?.length ? (
                  <>
                    <span className="font-semibold">عملیات فرایند:</span>
                    {workflow.actions.slice(0, 5).map((action) => (
                      <Tag key={action.id}>{action.name}</Tag>
                    ))}
                  </>
                ) : null}
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
          readOnly={false}
          disabled={false}
          submitLabel={processId ? "ارسال به فرایند" : "ثبت و ارسال فرم"}
          submitting={createSubmission.isPending}
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
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">
              {processItem?.name || "کار کارتابل"}
            </span>
            <Tag icon={<SendOutlined />} color="orange" className="!m-0">
              تکمیل و ارسال فرم
            </Tag>
          </div>
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
