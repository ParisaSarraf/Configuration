/* eslint-disable react/prop-types */
// یک کنترل ورودی برای هر نوع فیلد.
// کلید ماجرا: پراپ readOnly. در حالت پیش‌نمایش تعاملی و تکمیل فرم
// مقدار false است و کاربر واقعاً تایپ می‌کند؛ در فرم‌ساز true است.

import { toOptions, MULTI_TYPES } from "./formElements";

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

export default function FieldControl({
  field,
  value,
  onChange,
  readOnly = false,
  invalid = false,
  compact = false,
}) {
  const type = field.field_type;
  const cls = `fr-input${invalid ? " is-invalid" : ""}`;
  const set = (next) => !readOnly && onChange?.(next);

  if (type === "textarea")
    return (
      <textarea
        className={`fr-textarea${invalid ? " is-invalid" : ""}`}
        rows={compact ? 2 : 4}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        disabled={readOnly}
        onChange={(event) => set(event.target.value)}
      />
    );

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

  if (type === "checkbox")
    return (
      <label className={`fr-option${readOnly ? " is-readonly" : ""}`}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => set(event.target.checked)}
        />
        {field.default_value || "تأیید می‌کنم"}
      </label>
    );

  if (type === "rating") {
    const current = Number(value) || 0;
    return (
      <div className="fr-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= current ? "is-on" : ""}
            disabled={readOnly}
            onClick={() => set(star)}
            aria-label={`امتیاز ${star}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  if (type === "file" || type === "multifile" || type === "spreadsheet")
    return (
      <input
        className="fr-file"
        type="file"
        multiple={type === "multifile"}
        accept={field.allowed_extensions || undefined}
        disabled={readOnly}
        onChange={(event) =>
          set(Array.from(event.target.files || []).map((file) => file.name).join("، "))
        }
      />
    );

  if (type === "signature")
    return (
      <div className="fr-sign">
        {readOnly ? "محل امضا" : (
          <input
            className="fr-input"
            placeholder="نام و امضا"
            value={value ?? ""}
            onChange={(event) => set(event.target.value)}
          />
        )}
      </div>
    );

  return (
    <input
      className={cls}
      type={INPUT_TYPE_MAP[type] || "text"}
      value={value ?? ""}
      placeholder={field.placeholder || ""}
      disabled={readOnly}
      onChange={(event) => set(event.target.value)}
    />
  );
}
