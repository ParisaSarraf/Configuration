/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import FieldControl from "./FieldControl";
import SheetTable from "./SheetTable";
import { SHEET_TYPES, validateAll } from "./formElements";
import { COLS, heightOf, rowsToPx, sortFields, widthOf } from "./flowLayout";
import "./form-runtime.css";

const matrixToSheet = (field) => {
  const columns = Array.isArray(field.choices) ? field.choices : [];
  const cells = [];
  columns.forEach((column, index) => {
    const label =
      (typeof column === "string" ? column : column?.label) ||
      `ستون ${index + 1}`;
    cells.push({ r: 0, c: index, text: label, type: "static", variant: "head" });
    cells.push({
      r: 1,
      c: index,
      type: (typeof column === "object" && column?.type) || "text",
      name: `${field.field_name}-${index}`,
    });
  });
  return {
    ...field,
    choices: cells,
    min_value: 2,
    max_value: columns.length || 1,
  };
};

/**
 * یک عنصر فرم را دقیقاً همان‌گونه که در خروجی چاپی دیده می‌شود رسم می‌کند.
 * همین کامپوننت در حالت طراحی (FormLiveEditor) هم استفاده می‌شود،
 * پس «پیش‌نمایش» و «خروجی» هیچ‌وقت از هم جدا نمی‌شوند.
 */
export function Element({
  field,
  values = {},
  onChange,
  readOnly = false,
  error,
}) {
  const type = field?.field_type || "text";
  const label = field?.field_label || "";
  const value = values[field?.field_name];
  const setValue = (next) =>
    onChange && onChange({ ...values, [field.field_name]: next });

  if (type === "doc_header") {
    const meta = (Array.isArray(field.choices) ? field.choices : []).filter(
      (item) => item && typeof item === "object",
    );
    const logo = field.default_value || "";
    return (
      <div className="fr-docheader">
        <div className="fr-docheader-logo">
          {logo ? (
            <img src={logo} alt="لوگو" />
          ) : (
            <span className="fr-help">لوگو</span>
          )}
        </div>
        <div className="fr-docheader-title">{label}</div>
        <div className="fr-docheader-meta">
          {meta.map((item, index) => (
            <span key={item.key || index}>
              {item.label}: <b>{item.value}</b>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (type === "section_band") return <div className="fr-band">{label}</div>;
  if (type === "divider") return <div className="fr-divider" />;
  if (type === "page_break")
    return <div className="fr-pagebreak">— شکست صفحه در چاپ —</div>;
  if (type === "static_text")
    return <div className="fr-static">{field.default_value || label}</div>;

  if (SHEET_TYPES.has(type)) {
    const source = type === "matrix" ? matrixToSheet(field) : field;
    return (
      <SheetTable
        field={source}
        values={values}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }

  if (type === "signature")
    return (
      <div className="fr-cell fr-stack">
        <span className="fr-label">{label}</span>
        <div className="fr-sign">{readOnly ? "" : "محل امضا"}</div>
      </div>
    );

  const stacked = type === "textarea";
  return (
    <div className={`fr-cell${stacked ? " fr-stack" : ""}`}>
      <span className="fr-label">
        {label}
        {field.required ? <span className="fr-req">*</span> : null}
      </span>
      <div className="fr-value">
        <FieldControl
          field={field}
          value={value}
          onChange={setValue}
          readOnly={readOnly}
          invalid={Boolean(error)}
        />
      </div>
    </div>
  );
}

/**
 * نمایش کامل فرم روی کاغذ A4 براساس مختصات x/y/w/h هر فیلد.
 */
export default function FormRenderer({
  fields = [],
  mode = "preview", // preview | fill | print
  framed = true,
  fluid = false,
  showToolbar = true,
  onSubmit,
}) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const ordered = useMemo(() => sortFields(fields), [fields]);
  const readOnly = mode === "print";

  const height = ordered.reduce(
    (max, field) => Math.max(max, (Number(field.y) || 0) + heightOf(field)),
    0,
  );

  const submit = () => {
    const check = validateAll(ordered, values);
    setErrors(check.errors);
    if (check.ok && onSubmit) onSubmit(values);
  };

  const errorList = Object.values(errors);

  return (
    <div className="fr-root">
      {showToolbar && mode !== "print" ? (
        <div className="fr-toolbar">
          <button type="button" onClick={() => window.print()}>
            چاپ / PDF
          </button>
          {onSubmit ? (
            <button type="button" onClick={submit}>
              ثبت فرم
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="fr-paper-wrap">
        <div className={`fr-paper fr-print-area${fluid ? " fr-fluid" : ""}`}>
          {errorList.length ? (
            <div className="fr-errors">
              {errorList.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          ) : null}
          <div className={framed ? "fr-frame" : undefined}>
            <div className="fr-grid" style={{ height: rowsToPx(height) }}>
              {ordered.map((field) => (
                <div
                  key={field.id || field.field_name}
                  className="fr-slot"
                  style={{
                    right: `${((Number(field.x) || 0) / COLS) * 100}%`,
                    width: `${(widthOf(field) / COLS) * 100}%`,
                    top: rowsToPx(Number(field.y) || 0),
                    height: rowsToPx(heightOf(field)),
                  }}
                >
                  <Element
                    field={field}
                    values={values}
                    onChange={setValues}
                    readOnly={readOnly}
                    error={errors[field.field_name]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
