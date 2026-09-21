import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  ConfigProvider,
  Empty,
  Result,
  Spin,
  message,
} from "antd";
import {
  useFormDefinitionFieldById,
  useSubmitForm,
} from "../../../QueryServises/formsQuery";
import { getApiErrorMessage } from "../../../Services/forms/formUtils";
import FormRenderer from "./FormRenderer";
import {
  buildSubmissionPayload,
  collectFileEntries,
  flattenFields,
  validateFiles,
} from "./submission";
import "./form-runtime.css";

export default function FormFiller() {
  const { formDefinitionId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useFormDefinitionFieldById(formDefinitionId);
  const submitForm = useSubmitForm();
  const [done, setDone] = useState(null);

  const categories = useMemo(
    () => (Array.isArray(data) ? data : data ? [data] : []),
    [data],
  );
  const definition = categories[0] || {};
  const fields = useMemo(() => flattenFields(categories), [categories]);

  const submit = async (values) => {
    try {
      const fileProblems = validateFiles(fields, values);
      if (fileProblems.length) {
        message.error(fileProblems[0]);
        return;
      }

      const files = collectFileEntries(fields, values);
      const payload = buildSubmissionPayload({
        formDefinitionId,
        definition,
        fields,
        values,
      });

      const { submissionId, failed, skipped } = await submitForm.mutateAsync({
        payload,
        files,
      });

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

      setDone(definition.success_message || "فرم شما با موفقیت ثبت شد.");
      const target = definition.success_redirect_url;
      if (target)
        window.setTimeout(() => {
          if (/^https?:\/\//i.test(target)) window.location.assign(target);
          else navigate(target);
        }, 1500);
    } catch (error) {
      message.error(getApiErrorMessage(error, "ارسال فرم با مشکل مواجه شد"));
    }
  };

  if (isLoading)
    return (
      <div style={{ display: "grid", placeItems: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );

  if (isError || !categories.length)
    return (
      <Empty
        description="این فرم یافت نشد یا در دسترس نیست"
        style={{ padding: 48 }}
      />
    );

  if (done)
    return (
      <ConfigProvider direction="rtl">
        <Result
          status="success"
          title={done}
          subTitle={
            definition.success_redirect_url
              ? "در حال انتقال به صفحهٔ بعد…"
              : undefined
          }
          extra={
            <Button onClick={() => setDone(null)}>تکمیل یک پاسخ دیگر</Button>
          }
        />
      </ConfigProvider>
    );

  return (
    <ConfigProvider direction="rtl">
      <div style={{ padding: 16 }}>
        <header style={{ textAlign: "center", marginBottom: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {definition.name || "تکمیل فرم"}
          </h1>
          {definition.description ? (
            <p style={{ fontSize: 12, color: "#667085", margin: "4px 0 0" }}>
              {definition.description}
            </p>
          ) : null}
        </header>

        {definition.is_active === false ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="این فرم غیرفعال است و ممکن است ارسال آن پذیرفته نشود."
          />
        ) : null}

        <FormRenderer
          categories={categories}
          mode="fill"
          submitting={submitForm.isPending}
          onSubmit={submit}
        />
      </div>
    </ConfigProvider>
  );
}
