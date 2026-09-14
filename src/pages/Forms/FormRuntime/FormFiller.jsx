/* eslint-disable react/prop-types */
// =====================================================================
// صفحهٔ تکمیل فرم توسط کاربر نهایی: /forms/:formDefinitionId/fill
//
// همان رندرری که در پیش‌نمایش و چاپ استفاده می‌شود، اینجا در حالت
// mode="fill" اجرا می‌شود؛ پس خروجی دقیقاً همان چیزی است که طراح دیده.
//
// پس از ارسال موفق:
//   success_message      -> پیغام نمایشی
//   success_redirect_url -> صفحهٔ مقصد
// =====================================================================

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, ConfigProvider, Empty, Result, Spin, message } from "antd";
import {
  useCreateFormSubmission,
  useFormDefinitionFieldById,
  useUploadSubmissionAttachments,
} from "../../../QueryServises/formsQuery";
import {
  extractEntityId,
  getApiErrorMessage,
} from "../../../Services/forms/formUtils";
import FormRenderer from "./FormRenderer";
import {
  buildSubmissionPayload,
  checkFileLimits,
  collectFileEntries,
  flattenFields,
} from "./submission";
import "./form-runtime.css";

export default function FormFiller() {
  const { formDefinitionId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useFormDefinitionFieldById(formDefinitionId);
  const createSubmission = useCreateFormSubmission();
  const uploadAttachments = useUploadSubmissionAttachments();
  const [done, setDone] = useState(null);

  // پاسخ API گاهی آرایه و گاهی یک آبجکت است
  const categories = useMemo(
    () => (Array.isArray(data) ? data : data ? [data] : []),
    [data],
  );
  const definition = categories[0] || {};
  const fields = useMemo(() => flattenFields(categories), [categories]);

  const submit = async (values) => {
    try {
      // محدودیت پسوند/حجم فایل‌ها پیش از ارسال بررسی می‌شود.
      const fileProblems = checkFileLimits(fields, values);
      if (fileProblems.length) {
        message.error(fileProblems[0]);
        return;
      }
      const fileEntries = collectFileEntries(fields, values);

      const payload = buildSubmissionPayload({
        formDefinitionId,
        definition,
        fields,
        values,
      });
      const response = await createSubmission.mutateAsync(payload);
      const submissionId = extractEntityId(response) ?? response?.id ?? null;

      // فایل‌ها با اندپوینت اختصاصی پیوست ارسال می‌شوند (multipart).
      if (fileEntries.length) {
        const ready = fileEntries.filter((entry) => entry.fieldId);
        if (!submissionId) {
          message.warning(
            "فرم ثبت شد، اما شناسهٔ ارسال برنگشت و پیوست‌ها ارسال نشدند.",
          );
        } else if (ready.length) {
          const { failed } = await uploadAttachments.mutateAsync({
            submissionId,
            entries: ready,
          });
          if (failed.length)
            message.warning(
              getApiErrorMessage(
                failed[0].error,
                `ارسال ${failed.length} پیوست انجام نشد.`,
              ),
            );
        }
      }

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
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
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
          submitting={createSubmission.isPending || uploadAttachments.isPending}
          onSubmit={submit}
        />
      </div>
    </ConfigProvider>
  );
}
