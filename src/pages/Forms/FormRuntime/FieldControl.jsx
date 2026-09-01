/* eslint-disable react/prop-types */
import { FILE_TYPES, MULTI_TYPES, NUMBER_TYPES, toOptions } from "./formElements";

/**
 * کنترل خام یک فیلد (بدون جعبه و برچسب).
 * ظاهر عمداً خنثی است تا شبیه فرم‌های اداری چاپی باشد.
 */
export default function FieldControl({
  field,
  value,
  onChange,
  readOnly = false,
  invalid = false,
}) {
  const type = field?.field_type || "text";
  const cls = `fr-input${invalid ? " fr-invalid" : ""}`;
  const emit = (next) => onChange && onChange(next);
  const options = toOptions(field?.choices);
  const name = field?.field_name || `field-${field?.id ?? "x"}`;

  if (type === "textarea")
    return (
      <textarea
        className={`fr-textarea${invalid ? " fr-invalid" : ""}`}
        placeholder={field.placeholder || ""}
        readOnly={readOnly}
        value={value ?? ""}
        onChange={(event) => emit(event.target.value)}
      />
    );

  if (type === "select")
    return (
      <select
        className={`fr-select${invalid ? " fr-invalid" : ""}`}
        disabled={readOnly}
        value={value ?? ""}
        onChange={(event) => emit(event.target.value)}
      >
        <option value="">{field.placeholder || "—"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );

  if (type === "radio" || type === "option_row")
    return (
      <div className="fr-options">
        {(options.length
          ? options
          : [
              { value: "گزینه ۱", label: "گزینه ۱" },
              { value: "گزینه ۲", label: "گزینه ۲" },
            ]
        ).map((option) => (
          <label className="fr-option" key={option.value}>
            <input
              type="radio"
              name={name}
              checked={String(value ?? "") === String(option.value)}
              disabled={readOnly}
              onChange={() => emit(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );

  if (MULTI_TYPES.has(type)) {
    const list = Array.isArray(value) ? value : [];
    return (
      <div className="fr-options">
        {options.map((option) => (
          <label className="fr-option" key={option.value}>
            <input
              type="checkbox"
              checked={list.includes(option.value)}
              disabled={readOnly}
              onChange={(event) =>
                emit(
                  event.target.checked
                    ? [...list, option.value]
                    : list.filter((item) => item !== option.value),
                )
              }
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === "checkbox")
    return (
      <label className="fr-option">
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => emit(event.target.checked)}
        />
        <span>{field.default_value || field.placeholder || "تأیید می‌کنم"}</span>
      </label>
    );

  if (type === "date")
    return (
      <input
        className={cls}
        type="text"
        inputMode="numeric"
        placeholder={field.placeholder || "۱۴۰۵/۰۰/۰۰"}
        readOnly={readOnly}
        value={value ?? ""}
        onChange={(event) => emit(event.target.value)}
      />
    );

  if (NUMBER_TYPES.has(type))
    return (
      <input
        className={cls}
        type="number"
        placeholder={field.placeholder || ""}
        readOnly={readOnly}
        value={value ?? ""}
        onChange={(event) => emit(event.target.value)}
      />
    );

  if (FILE_TYPES.has(type))
    return (
      <input
        className={cls}
        type="file"
        disabled={readOnly}
        onChange={(event) => emit(event.target.files?.[0]?.name || "")}
      />
    );

  return (
    <input
      className={cls}
      type="text"
      placeholder={field.placeholder || ""}
      readOnly={readOnly}
      value={value ?? ""}
      onChange={(event) => emit(event.target.value)}
    />
  );
}
