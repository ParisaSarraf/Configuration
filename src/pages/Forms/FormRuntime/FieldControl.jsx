/* eslint-disable react/prop-types */
// =====================================================================
// یک کنترل ورودی برای هر نوع فیلد.
//
// کلید ماجرا پراپ readOnly است: در پیش‌نمایش تعاملی و تکمیل فرم
// مقدار false است و کاربر واقعاً تایپ می‌کند؛ در فرم‌ساز true است.
// نوع فیلد از resolveType گرفته می‌شود تا نوع‌های قدیمی و نشانه‌دار
// (مانند گزینه‌های خطی) هم درست رندر شوند.
// =====================================================================

import { toOptions, MULTI_TYPES } from "./formElements";
import { resolveType } from "./fieldSchema";
import MatrixInput from "./MatrixInput";
import DateField from "./DateField";

const INPUT_TYPE_MAP = {
  email: "email",
  url: "url",
  phone: "tel",
  number: "number",
  decimal: "number",
  currency: "number",
  date: "date",
  datetime: "datetime-local",
  time: "time",
};

/** "pdf,docx" ←→ ".pdf,.docx" (قالب مورد انتطار accept) */
const toAccept = (raw) => {
  const text = String(raw || "").trim();
  if (!text) return undefined;
  return text
    .split(/[,،\s]+/)
    .filter(Boolean)
    .map((item) => (item.startsWith(".") ? item : `.${item}`))
    .join(",");
};

const fileNames = (value) =>
  Array.isArray(value) ? value : String(value || "").split("،").filter(Boolean);

export default function FieldControl({
  field,
  value,
  onChange,
  readOnly = false,
  invalid = false,
  compact = false,
}) {
  const type = resolveType(field);
  const cls = `fr-input${invalid ? " is-invalid" : ""}`;
  const set = (next) => !readOnly && onChange?.(next);

  /* ------------------------- جدول پرشدنی ------------------------- */
  if (type === "matrix")
    return (
      <MatrixInput field={field} value={value} onChange={set} readOnly={readOnly} />
    );

  /* ------------- تاریخ / تاریخ‌وساعت / ساعت (تقویم پروژه) ------------- */
  if (type === "date" || type === "datetime" || type === "time")
    return (
      <DateField
        mode={type}
        value={value}
        onChange={set}
        readOnly={readOnly}
        invalid={invalid}
        placeholder={field.placeholder}
      />
    );

  /* -------------------- تاریخ و امضا (بلوک ترکیبی) -------------------- */
  if (type === "date_signature") {
    const slots = toOptions(field.choices);
    const list = slots.length
      ? slots
      : [
          { value: "date", label: "تاریخ" },
          { value: "signature", label: "امضا" },
        ];
    const current =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const setSlot = (key, next) => set({ ...current, [key]: next });

    return (
      <div className="fr-datesign">
        {list.map((slot) => {
          const key = String(slot.value || "");
          const label = String(slot.label || "");
          const isDate = key.includes("date") || label.includes("تاریخ");
          const isSign = key.includes("sign") || label.includes("امضا");
          return (
            <div className="fr-datesign-slot" key={key}>
              <span className="fr-datesign-label">{label}:</span>
              {isDate ? (
                <DateField
                  mode="date"
                  value={current[key]}
                  onChange={(next) => setSlot(key, next)}
                  readOnly={readOnly}
                />
              ) : isSign ? (
                <div className="fr-sign fr-datesign-sign">
                  <input
                    className="fr-input"
                    value={current[key] ?? ""}
                    disabled={readOnly}
                    onChange={(event) => setSlot(key, event.target.value)}
                  />
                </div>
              ) : (
                <input
                  className="fr-input"
                  value={current[key] ?? ""}
                  disabled={readOnly}
                  onChange={(event) => setSlot(key, event.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ------------------------- متن چندخطی ------------------------- */
  if (type === "textarea" || type === "address")
    return (
      <textarea
        className={`fr-textarea${invalid ? " is-invalid" : ""}`}
        rows={type === "address" ? 2 : compact ? 2 : 4}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        maxLength={field.max_length ? Number(field.max_length) : undefined}
        disabled={readOnly}
        onChange={(event) => set(event.target.value)}
      />
    );

  /* ------------------------- لیست کشویی ------------------------- */
  if (type === "select") {
    const options = toOptions(field.choices);
    return (
      <select
        className={`fr-select${invalid ? " is-invalid" : ""}`}
        value={value ?? ""}
        disabled={readOnly}
        onChange={(event) => set(event.target.value)}
      >
        <option value="">{field.placeholder || "انتخاب کنید"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  /* ------------------- انتخاب چندگانهٔ لیستی ------------------- */
  if (type === "multiselect_list") {
    const options = toOptions(field.choices);
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <select
        multiple
        className={`fr-select-multi${invalid ? " is-invalid" : ""}`}
        value={selected}
        disabled={readOnly}
        onChange={(event) =>
          set(Array.from(event.target.selectedOptions).map((option) => option.value))
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  /* ------------------------- تک‌انتخابی ------------------------- */
  if (type === "radio" || type === "option_row") {
    const options = toOptions(field.choices);
    const list = options.length ? options : [{ value: "", label: "بدون گزینه" }];
    return (
      <div className={`fr-options${type === "radio" ? " fr-col" : ""}`}>
        {list.map((option) => (
          <label
            key={option.value}
            className={`fr-option${readOnly ? " is-readonly" : ""}`}
          >
            <input
              type="radio"
              name={`${field.field_name || field.id}`}
              checked={String(value ?? "") === String(option.value)}
              disabled={readOnly}
              onChange={() => set(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  /* --------------- چندانتخابی تیک‌دار (checkboxes/multiselect) --------------- */
  if (MULTI_TYPES.has(type)) {
    const options = toOptions(field.choices);
    const selected = Array.isArray(value) ? value : [];
    const toggle = (option) =>
      set(
        selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      );
    return (
      <div className="fr-options fr-col">
        {(options.length ? options : [{ value: "", label: "بدون گزینه" }]).map((option) => (
          <label key={option.value} className={`fr-option${readOnly ? " is-readonly" : ""}`}>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              disabled={readOnly}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  /* ------------------------- تیک تکی ------------------------- */
  if (type === "checkbox")
    return (
      <label className={`fr-option${readOnly ? " is-readonly" : ""}`}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => set(event.target.checked)}
        />
        {field.default_value || field.field_label || "تأیید می‌کنم"}
      </label>
    );

  /* ------------------------- امتیاز ستاره‌ای ------------------------- */
  if (type === "rating") {
    const max = Math.min(Math.max(Number(field.max_value) || 5, 1), 10);
    const current = Number(value) || 0;
    return (
      <div className="fr-rating">
        {Array.from({ length: max }, (_, index) => index + 1).map((star) => (
          <button
            key={star}
            type="button"
            className={star <= current ? "is-on" : ""}
            disabled={readOnly}
            onClick={() => set(star === current ? "" : star)}
            aria-label={`امتیاز ${star}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  /* ------------------------- نوار کشویی ------------------------- */
  if (type === "slider") {
    const min = field.min_value === "" || field.min_value == null ? 0 : Number(field.min_value);
    const max = field.max_value === "" || field.max_value == null ? 100 : Number(field.max_value);
    const current = value === "" || value == null ? min : Number(value);
    return (
      <div className="fr-slider">
        <span className="fr-slider-range">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={current}
          disabled={readOnly}
          onChange={(event) => set(Number(event.target.value))}
        />
        <span className="fr-slider-range">{max}</span>
        <span className="fr-slider-value">{current}</span>
      </div>
    );
  }

  /* ------------------------- فایل ------------------------- */
  if (type === "file" || type === "multifile") {
    const names = fileNames(value);
    return (
      <div className="fr-upload">
        <input
          className="fr-file"
          type="file"
          multiple={type === "multifile"}
          accept={toAccept(field.allowed_extensions)}
          disabled={readOnly}
          onChange={(event) =>
            set(Array.from(event.target.files || []).map((file) => file.name))
          }
        />
        {names.length > 0 && <span className="fr-upload-names">{names.join("، ")}</span>}
        {field.max_file_size_mb ? (
          <span className="fr-upload-names">
            حداکثر حجم هر فایل: {field.max_file_size_mb} مگابایت
          </span>
        ) : null}
      </div>
    );
  }

  /* ------------------------- محل امضا ------------------------- */
  if (type === "signature")
    return (
      <div className="fr-sign">
        <input
          className="fr-input"
          placeholder="نام و امضا"
          value={value ?? ""}
          disabled={readOnly}
          onChange={(event) => set(event.target.value)}
        />
      </div>
    );

  /* ------------------------- ورودی تک‌خطی ------------------------- */
  const numeric = type === "number" || type === "decimal" || type === "currency";
  return (
    <input
      className={cls}
      type={INPUT_TYPE_MAP[type] || "text"}
      value={value ?? ""}
      placeholder={field.placeholder || ""}
      maxLength={!numeric && field.max_length ? Number(field.max_length) : undefined}
      min={numeric && field.min_value !== "" && field.min_value != null ? field.min_value : undefined}
      max={numeric && field.max_value !== "" && field.max_value != null ? field.max_value : undefined}
      step={type === "decimal" ? "any" : type === "number" ? 1 : undefined}
      disabled={readOnly}
      onChange={(event) => set(event.target.value)}
    />
  );
}
