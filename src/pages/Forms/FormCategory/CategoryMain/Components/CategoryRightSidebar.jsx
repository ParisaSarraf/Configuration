import { useMemo } from "react";
import { useFormDefinitionFieldById } from "../../../../../QueryServises/formsQuery";
import { GRID, normalizeFields } from "../../../FormBuilderStudio/formStudioLayout";

// Field types that don't need an input at all — they're just a heading
// or a value shown as plain text.
const SECTION_TYPES = new Set(["section"]);
const DISPLAY_TYPES = new Set(["display_text", "hidden"]);

const MULTI_CHOICE_TYPES = new Set([
  "checkboxes",
  "multiselect",
  "multiselect_list",
]);

const sortByOrder = (fields) =>
  [...(fields || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const choiceOptions = (choices) =>
  (choices || []).map((choice) =>
    typeof choice === "string"
      ? { value: choice, label: choice }
      : {
          value: choice.value ?? choice.key ?? choice.label,
          label: choice.label ?? choice.value,
        },
  );

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 disabled:cursor-not-allowed";

function FieldInput({ field }) {
  const type = field.field_type;

  if (MULTI_CHOICE_TYPES.has(type)) {
    const options = choiceOptions(field.choices);
    return (
      <div className="flex flex-col gap-1.5">
        {(options.length ? options : [{ value: "", label: "بدون گزینه" }]).map(
          (option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <input
                type="checkbox"
                disabled
                className="h-4 w-4 rounded border-gray-300"
              />
              {option.label}
            </label>
          ),
        )}
      </div>
    );
  }

  if (type === "radio") {
    const options = choiceOptions(field.choices);
    return (
      <div className="flex flex-col gap-1.5">
        {(options.length ? options : [{ value: "", label: "بدون گزینه" }]).map(
          (option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <input
                type="radio"
                disabled
                name={field.field_name}
                className="h-4 w-4 border-gray-300"
              />
              {option.label}
            </label>
          ),
        )}
      </div>
    );
  }

  if (type === "checkbox")
    return (
      <label className="flex items-center gap-2 text-sm text-gray-500">
        <input
          type="checkbox"
          disabled
          className="h-4 w-4 rounded border-gray-300"
        />
        {field.default_value || "تأیید می‌کنم"}
      </label>
    );

  if (type === "select" || type === "country") {
    const options = choiceOptions(field.choices);
    return (
      <select disabled className={inputClass} defaultValue="">
        <option value="" disabled>
          {field.placeholder || "انتخاب کنید"}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === "textarea" || type === "address")
    return (
      <textarea
        rows={3}
        disabled
        placeholder={field.placeholder}
        className={inputClass}
      />
    );

  if (["number", "decimal", "currency", "slider"].includes(type))
    return (
      <input
        type="number"
        disabled
        placeholder={field.placeholder}
        className={inputClass}
      />
    );

  if (type === "date")
    return <input type="date" disabled className={inputClass} />;
  if (type === "datetime")
    return <input type="datetime-local" disabled className={inputClass} />;
  if (type === "time")
    return <input type="time" disabled className={inputClass} />;

  if (["file", "multifile", "spreadsheet"].includes(type))
    return (
      <div
        className={`${inputClass} flex items-center justify-center gap-2 text-gray-400`}
      >
        <span>
          {type === "spreadsheet" ? "بارگذاری فایل اکسل/CSV" : "بارگذاری فایل"}
        </span>
      </div>
    );

  if (type === "signature")
    return (
      <div
        className={`${inputClass} flex h-16 items-center justify-center text-gray-300`}
      >
        محل امضا
      </div>
    );

  if (type === "rating")
    return (
      <div className="flex gap-1 text-lg text-gray-300" aria-hidden>
        {"★★★★★"}
      </div>
    );

  if (type === "matrix") {
    const columns = choiceOptions(field.choices);
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs text-gray-500">
          <thead>
            <tr className="bg-gray-50">
              {(columns.length
                ? columns
                : [{ value: "c1", label: "ستون" }]
              ).map((col) => (
                <th
                  key={col.value}
                  className="border-b border-gray-200 px-2 py-1.5 text-right font-medium"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {(columns.length ? columns : [{ value: "c1" }]).map((col) => (
                <td key={col.value} className="px-2 py-1.5 text-gray-300">
                  —
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const inputTypeMap = { email: "email", url: "url", phone: "tel" };
  return (
    <input
      type={inputTypeMap[type] || "text"}
      disabled
      placeholder={field.placeholder}
      className={inputClass}
    />
  );
}

function FieldRow({ field }) {
  if (SECTION_TYPES.has(field.field_type))
    return (
      <div className="mt-2 border-t border-gray-100 pt-3 text-sm font-bold text-gray-700">
        {field.field_label}
      </div>
    );

  if (DISPLAY_TYPES.has(field.field_type)) {
    if (field.field_type === "hidden") return null;
    return (
      <p className="text-sm text-gray-600">
        {field.default_value || field.field_label}
      </p>
    );
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-600">
        {field.field_label}
        {field.required && <span className="text-rose-500">*</span>}
      </label>
      {field.help_text && (
        <p className="mb-1.5 text-[11px] text-gray-400">{field.help_text}</p>
      )}
      <FieldInput field={field} />
    </div>
  );
}

function CategorySection({ item }) {
  const fields = normalizeFields(sortByOrder(item.fields));
  if (!fields.length) return null;
  return (
    <div className="mb-6 last:mb-0">
      {item.category?.name && (
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
            {item.category.icon || "•"}
          </span>
          <h3 className="text-sm font-bold text-gray-700">
            {item.category.name}
          </h3>
        </div>
      )}
      <div
        className="grid w-full rounded-xl bg-slate-50 p-2"
        dir="ltr"
        style={{
          gridTemplateColumns: `repeat(${GRID.cols}, minmax(0, 1fr))`,
          gridAutoRows: `${GRID.rowUnit}px`,
          columnGap: "8px",
          rowGap: 0,
        }}
      >
        {fields.map((field) => (
          <div
            key={field.id}
            className="min-w-0 overflow-auto rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
            dir="rtl"
            style={{
              gridColumn: `${field.x + 1} / span ${field.w}`,
              gridRow: `${field.y + 1} / span ${field.h}`,
            }}
          >
            <FieldRow field={field} />
          </div>
        ))}
      </div>
    </div>
  );
}

const CategoryRightSidebar = ({ FormId }) => {
  const { data: FormFieldById, isLoading } = useFormDefinitionFieldById(FormId);

  const categories = useMemo(() => {
    if (Array.isArray(FormFieldById)) return FormFieldById;
    if (FormFieldById) return [FormFieldById];
    return [];
  }, [FormFieldById]);

  return (
    <aside
      className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">پیش‌نمایش فرم</h2>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-400">در حال بارگذاری...</p>}

      {!isLoading && !categories.some((item) => item.fields?.length) && (
        <p className="text-sm text-gray-400">فیلدی برای نمایش وجود ندارد.</p>
      )}

      {categories.map((item) => (
        <CategorySection key={item.id} item={item} />
      ))}
    </aside>
  );
};

export default CategoryRightSidebar;
