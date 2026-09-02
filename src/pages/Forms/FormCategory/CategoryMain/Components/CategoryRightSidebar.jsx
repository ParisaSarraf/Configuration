/* eslint-disable react/prop-types */
// =====================================================================
// پیش‌نمایش فرم در ستون سوم صفحهٔ دسته‌بندی‌ها.
//
// قبلاً فرم با عرض واقعی A4 داخل پنل ۵۵۰ پیکسلی رندر می‌شد و
// همه‌چیز بریده/اسکرول می‌شد. حالا همان برگهٔ A4 کامل با مقیاس
// خودکار دیده می‌شود (مثل پیش‌نمایش PDF) با گزینهٔ تمام‌صفحه
// و چاپ مستقیم.
// =====================================================================

import { useMemo } from "react";
import { useFormDefinitionFieldById } from "../../../../../QueryServises/formsQuery";
import FormPaperPreview from "../../../FormRuntime/FormPaperPreview";

const CategoryRightSidebar = ({ FormId }) => {
  const { data: FormFieldById, isLoading } = useFormDefinitionFieldById(FormId);

  const categories = useMemo(() => {
    if (Array.isArray(FormFieldById)) return FormFieldById;
    if (FormFieldById) return [FormFieldById];
    return [];
  }, [FormFieldById]);

  const hasFields = categories.some((item) => (item?.fields || []).length > 0);
  const formName = categories[0]?.name || "";

  if (!FormId)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-gray-500">
        <p className="text-sm font-semibold">پیش‌نمایش فرم</p>
        <p className="text-xs">
          یک فرم را از لیست انتخاب کنید تا برگهٔ آن اینجا نمایش داده شود.
        </p>
      </div>
    );

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        در حال بارگذاری…
      </div>
    );

  if (!hasFields)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-gray-500">
        <p className="text-sm font-semibold">این فرم هنوز فیلدی ندارد.</p>
        <p className="text-xs">
          از ستون وسط وارد فرم‌ساز شوید و فیلدها را روی برگه طراحی کنید.
        </p>
      </div>
    );

  return (
    <FormPaperPreview
      categories={categories}
      mode="preview"
      title={formName ? `پیش‌نمایش: ${formName}` : "پیش‌نمایش فرم"}
      subtitle="دقیقاً همان برگهٔ چاپی است؛ می‌توانید تایپ کنید، چیزی ذخیره نمی‌شود."
    />
  );
};

export default CategoryRightSidebar;
