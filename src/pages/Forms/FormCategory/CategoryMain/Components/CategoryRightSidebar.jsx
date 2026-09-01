/* eslint-disable react/prop-types */
// =====================================================================
// پیش‌نمایش فرم — فقط یک لایهٔ نازک روی FormRenderer.
// قبلاً تمام ورودی‌های این فایل پراپ disabled داشتند و فرم قفل بود؛
// حالا همان کامپوننتی رندر می‌شود که در حالت تکمیل و خروجی چاپ استفاده
// می‌شود، پس پیش‌نمایش دقیقاً برابر خروجی نهایی است و قابل تایپ هم هست.
// =====================================================================

import { useMemo } from "react";
import { useFormDefinitionFieldById } from "../../../../../QueryServises/formsQuery";
import FormRenderer from "../../../FormRuntime/FormRenderer";

const CategoryRightSidebar = ({ FormId }) => {
  const { data: FormFieldById, isLoading } = useFormDefinitionFieldById(FormId);

  const categories = useMemo(() => {
    if (Array.isArray(FormFieldById)) return FormFieldById;
    if (FormFieldById) return [FormFieldById];
    return [];
  }, [FormFieldById]);

  const hasFields = categories.some((item) => (item?.fields || []).length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-gray-800">
          پیش‌نمایش فرم
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          در حالت تعاملی می‌توانید فیلدها را تکمیل کنید؛ چیزی ذخیره نمی‌شود.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500">در حال بارگذاری…</p>
      )}

      {!isLoading && !hasFields && (
        <p className="text-sm text-gray-500">
          هنوز فیلدی برای این فرم ساخته نشده است.
        </p>
      )}

      {!isLoading && hasFields && (
        <div className="min-h-0 flex-1 overflow-auto">
          <FormRenderer categories={categories} mode="preview" />
        </div>
      )}
    </div>
  );
};

export default CategoryRightSidebar;
