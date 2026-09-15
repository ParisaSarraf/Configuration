/* eslint-disable react/prop-types */
// =====================================================================
// نمایش «همان فرم» با مقادیر ثبت‌شده، فقط-خواندنی.
//
// رندرر تازه‌ای ساخته نمی‌شود؛ دقیقاً همان FormRenderer صفحهٔ تکمیل فرم
// با mode="view" مونت می‌شود؛ پس چیدمان گرید، هدر سند، جدول‌ها و امضاها
// دقیقاً مثل زمان باز شدن فرم دیده می‌شوند.
// =====================================================================

import { useMemo } from "react";
import { Alert, Empty, Skeleton } from "antd";
import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { useFormDefinitionFieldById } from "@/QueryServises/formsQuery";
import {
  asCategories,
  hydrateSubmissionValues,
} from "@/Services/forms/submissionValues";
import "./submission-view.css";

export default function SubmissionFormView({
  formDefinitionId,
  formData,
  enabled = true,
  showToolbar = true,
  framed = true,
}) {
  const definitionQuery = useFormDefinitionFieldById(formDefinitionId, {
    enabled: Boolean(enabled && formDefinitionId),
  });

  const categories = useMemo(
    () => asCategories(definitionQuery.data),
    [definitionQuery.data],
  );

  // initialValues باید هویت پایدار داشته باشد؛ FormRenderer فقط وقتی مقادیر را
  // از نو اعمال می‌کند که هویت این آبجکت عوض شود.
  const values = useMemo(
    () => hydrateSubmissionValues(categories, formData),
    [categories, formData],
  );

  if (!formDefinitionId)
    return (
      <Alert
        type="warning"
        showIcon
        message="ساختار فرم در دسترس نیست"
        description="برای نمایش فرم به شکل اصلی، شناسهٔ تعریف فرم (form_definition_id) لازم است."
      />
    );

  if (definitionQuery.isLoading)
    return <Skeleton active paragraph={{ rows: 10 }} />;

  if (definitionQuery.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={getApiErrorMessage(
          definitionQuery.error,
          "دریافت ساختار فرم انجام نشد.",
        )}
      />
    );

  if (!categories.length)
    return <Empty className="py-10" description="این فرم هیچ فیلدی ندارد." />;

  return (
    <div className="fr-view">
      <FormRenderer
        categories={categories}
        mode="view"
        initialValues={values}
        showToolbar={showToolbar}
        framed={framed}
      />
    </div>
  );
}
