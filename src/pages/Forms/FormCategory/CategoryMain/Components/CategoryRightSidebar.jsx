/* eslint-disable react/prop-types */
// =====================================================================
// پیش‌نمایش فرم در ستون سوم صفحهٔ دسته‌بندی‌ها.
// همان برگهٔ A4 با مقیاس خودکار (مشابه پیش‌نمایش PDF).
// =====================================================================

import { useMemo } from "react";
import { useFormDefinitionFieldById } from "../../../../../QueryServises/formsQuery";
import FormPaperPreview from "../../../FormRuntime/FormPaperPreview";
import { FileSearch, LayoutTemplate, Loader2 } from "lucide-react";

const StateCard = ({ icon, title, description, tone = "emerald" }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50/50 text-emerald-600",
    amber: "border-amber-200 bg-amber-50/50 text-amber-600",
  };

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center ${tones[tone]}`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </span>
      <p className="m-0 text-sm font-bold text-slate-700">{title}</p>
      <p className="m-0 text-xs text-slate-500">{description}</p>
    </div>
  );
};

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
      <StateCard
        icon={<FileSearch size={26} className="text-emerald-500" />}
        title="پیش‌نمایش فرم"
        description="یک فرم را از لیست انتخاب کنید تا برگهٔ آن اینجا نمایش داده شود."
      />
    );

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-emerald-600">
        <Loader2 size={18} className="animate-spin" />
        در حال بارگذاری…
      </div>
    );

  if (!hasFields)
    return (
      <StateCard
        tone="amber"
        icon={<LayoutTemplate size={26} className="text-amber-500" />}
        title="این فرم هنوز فیلدی ندارد."
        description="از ستون وسط وارد فرم‌ساز شوید و فیلدها را روی برگه طراحی کنید."
      />
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
