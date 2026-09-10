/* eslint-disable react/prop-types */
// =====================================================================
// کشوی کار کارتابل: «مشاهده‌ی فرم → تکمیل → ارسال»
//
// همان رندرر فرم‌ساز (FormRenderer) در حالت mode="fill" استفاده می‌شود؛
// پس کاربر دقیقاً همان چیزی را می‌بیند که طراح فرم ساخته و چاپ می‌شود.
//
// APIهای واقعی مورد استفاده:
//   GET  /forms/get-form-definition/<id>   → فیلدهای فرم (useFormDefinitionFieldById)
//   GET  /workflow/get-process-info-by-id/<id> → ایستگاه‌ها و عملیات فرایند
//   POST /forms/add-form-submission/       → ارسال نهایی (useCreateFormSubmission)
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Drawer,
  Empty,
  Result,
  Skeleton,
  Space,
  Tag,
} from "antd";
import {
  CloseOutlined,
  FileTextOutlined,
  PartitionOutlined,
  SendOutlined,
} from "@ant-design/icons";
import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import {
  buildSubmissionPayload,
  flattenFields,
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

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};  

const CartableTaskDrawer = ({
  open,
  process: processItem,
  submitterId,
  onClose,
  onSubmitted,
}) => {
  const { message } = App.useApp();
  const formDefinitionId = processItem?.form_definition?.id ?? null;

  const formQuery = useFormDefinitionFieldById(formDefinitionId, {
    enabled: Boolean(open && formDefinitionId),
  });
  const processInfoQuery = useProcessInfo(processItem?.id, {
    enabled: Boolean(open && processItem?.id),
  });
  const createSubmission = useCreateFormSubmission();

  const [done, setDone] = useState(null);

  // با هر بار باز شدن کشو، فرم از نو mount می‌شود تا مقادیر کار قبلی نماند.
  const [renderToken, setRenderToken] = useState(0);
  useEffect(() => {
    if (!open) return;
    setDone(null);
    setRenderToken((prev) => prev + 1);
  }, [open, formDefinitionId]);

  // پاسخ API گاهی آرایه و گاهی یک آبجکت است (مثل FormFiller).
  const categories = useMemo(() => {
    const data = formQuery.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  }, [formQuery.data]);

  const definition = categories[0] || {};
  const fields = useMemo(() => flattenFields(categories), [categories]);

  // خلاصه‌ی گردش کار: ایستگاه شروع و ایستگاه‌های بعدی، تا کاربر بداند
  // فرمی که ارسال می‌کند به کجا می‌رود.
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

  const submit = async (values) => {
    try {
      const payload = buildSubmissionPayload({
        formDefinitionId,
        definition,
        fields,
        values,
        submitterId,
      });
      const response = await createSubmission.mutateAsync(payload);
      const messageText =
        definition.success_message || "فرم شما با موفقیت ارسال شد.";
      setDone(messageText);
      onSubmitted?.({
        submissionId: response?.id ?? null,
        processId: processItem?.id ?? null,
        processName: processItem?.name || "",
        formDefinitionId,
        formName: definition.name || processItem?.form_definition?.name || "",
        stateName: workflow?.startState?.name || "",
        fieldCount: Object.keys(payload.form_data || {}).length,
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
          description="برای این فرایند فرمی تعیین نشده است؛ ابتدا در فرایندساز یک «تعریف فرم» به آن وصل کنید."
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

    return (
      <>
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <PartitionOutlined className="text-orange-500" />
            <span className="font-semibold">مسیر گردش کار:</span>
            {workflow?.startState ? (
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
            {workflow?.actions?.length ? (
              <>
                <span className="font-semibold">عملیات فرایند:</span>
                {workflow.actions.slice(0, 5).map((action) => (
                  <Tag key={action.id}>{action.name}</Tag>
                ))}
              </>
            ) : null}
          </div>
          {definition.description ? (
            <p className="mt-2 mb-0 text-xs leading-6 text-slate-500 dark:text-slate-400">
              {definition.description}
            </p>
          ) : null}
        </div>

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
          mode="fill"
          submitLabel="ارسال به فرایند"
          submitting={createSubmission.isPending}
          onSubmit={submit}
        />
      </>
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="min(1100px, 96vw)"
      destroyOnClose
      closeIcon={<CloseOutlined />}
      title={
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {processItem?.name || "کار کارتابل"}
          </span>
          <span className="flex items-center gap-2 text-xs font-normal text-slate-500">
            <FileTextOutlined />
            {processItem?.form_definition?.name || "بدون فرم"}
            {definition.version ? <Tag>نسخه {definition.version}</Tag> : null}
          </span>
        </div>
      }
      extra={
        <Tag icon={<SendOutlined />} color="orange">
          تکمیل و ارسال فرم
        </Tag>
      }
    >
      {renderBody()}
    </Drawer>
  );
};

export default CartableTaskDrawer;
