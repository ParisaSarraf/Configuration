/* eslint-disable react/prop-types */
// =====================================================================
// FormRenderer — رندرر مشترک برای سه حالت:
//   mode="design"  فقط نمایش (داخل فرم‌ساز)
//   mode="preview" پیش‌نمایش تعاملی — کاربر تایپ می‌کند، چیزی ذخیره نمی‌شود
//   mode="fill"    تکمیل واقعی فرم و ارسال
// خروجی چاپ A4 هم از همین کامپوننت می‌آید، پس پیش‌نمایش دقیقاً همان
// چیزی است که چاپ می‌شود.
// =====================================================================

import { useMemo, useState } from "react";
import { GRID, normalizeFields } from "../FormBuilderStudio/formStudioLayout";
import { INPUT_TYPES, validateAll } from "./formElements";
import FieldControl from "./FieldControl";
import SheetTable from "./SheetTable";
import "./form-runtime.css";

const keyOf = (field) => field.field_name || String(field.id);

const sortByOrder = (fields) =>
  [...(fields || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/* ------------------------------- عناصر ------------------------------- */

function DocHeader({ field }) {
  const meta = Array.isArray(field.choices) ? field.choices : [];
  return (
    <div className="fr-docheader">
      <div className="fr-docheader-meta">
        {meta.map((item, index) => (
          <span key={item.key || index}>
            {item.label}: <b>{item.value}</b>
          </span>
        ))}
      </div>
      <div className="fr-docheader-title">{field.field_label}</div>
      <div className="fr-docheader-logo">
        {field.default_value ? (
          <img src={field.default_value} alt="لوگو" />
        ) : (
          <span className="fr-help">لوگو</span>
        )}
      </div>
    </div>
  );
}

function Element({ field, values, errors, onChange, readOnly }) {
  const type = field.field_type;

  if (type === "page_break") return <div className="fr-pagebreak" />;
  if (type === "hidden" || type === "spacer") return null;
  if (type === "divider") return <div className="fr-divider" />;
  if (type === "doc_header") return <DocHeader field={field} />;
  if (type === "section_band") return <div className="fr-band">{field.field_label}</div>;

  if (type === "static_text")
    return (
      <div className="fr-cell fr-plain">
        <span className="fr-static">{field.default_value || field.field_label}</span>
      </div>
    );

  if (type === "sheet_table" || type === "matrix")
    return <SheetTable field={field} values={values} onChange={onChange} readOnly={readOnly} />;

  const key = keyOf(field);
  const error = errors?.[key];
  const stacked =
    type === "textarea" ||
    type === "radio" ||
    type === "checkboxes" ||
    type === "signature" ||
    Boolean(field.help_text);

  return (
    <div className={`fr-cell${stacked ? " fr-stack" : ""}`}>
      {field.field_label && type !== "checkbox" && (
        <span className="fr-label">
          {field.field_label}
          {field.required && <span className="fr-req">*</span>}
        </span>
      )}
      {field.help_text && <span className="fr-help">{field.help_text}</span>}
      <FieldControl
        field={field}
        value={values?.[key]}
        onChange={(next) => onChange?.(key, next)}
        readOnly={readOnly}
        invalid={Boolean(error)}
        compact={!stacked}
      />
      {error && <span className="fr-error">{error}</span>}
    </div>
  );
}

function Section({ item, values, errors, onChange, readOnly }) {
  const fields = normalizeFields(sortByOrder(item.fields));
  if (!fields.length) return null;
  return (
    <div
      className="fr-grid"
      style={{
        gridTemplateColumns: `repeat(${GRID.cols}, minmax(0, 1fr))`,
        gridAutoRows: `${GRID.rowUnit}px`,
      }}
    >
      {fields.map((field) => (
        <div
          key={field.id}
          className="fr-slot"
          style={{
            gridColumn: `${field.x + 1} / span ${field.w}`,
            gridRow: `${field.y + 1} / span ${field.h}`,
          }}
        >
          <Element
            field={field}
            values={values}
            errors={errors}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- رندرر ------------------------------- */

export default function FormRenderer({
  categories = [],
  mode = "preview",
  showToolbar = true,
  framed = true,
  onSubmit,
}) {
  const [interactive, setInteractive] = useState(mode !== "design");
  const [device, setDevice] = useState("a4"); // a4 | fluid | mobile
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const readOnly = !interactive;

  const allFields = useMemo(
    () =>
      categories
        .flatMap((item) => item.fields || [])
        .filter((field) => INPUT_TYPES.has(field.field_type)),
    [categories],
  );

  const filledCount = allFields.filter((field) => {
    const value = values[keyOf(field)];
    return value !== undefined && value !== "" && value !== false;
  }).length;

  const change = (key, next) => {
    setValues((prev) => ({ ...prev, [key]: next }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  };

  const check = () => {
    const found = validateAll(allFields, values);
    setErrors(found);
    const count = Object.keys(found).length;
    setNotice(count ? `${count} فیلد ایراد دارد.` : "همه فیلدها معتبرند.");
    return count === 0;
  };

  const paperClass = [
    "fr-paper",
    device === "mobile" ? "fr-mobile" : "",
    device === "fluid" ? "fr-fluid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="fr-root">
      {showToolbar && (
        <div className="fr-toolbar fr-no-print">
          <button
            type="button"
            className={`fr-chip${interactive ? " is-active" : ""}`}
            onClick={() => setInteractive((prev) => !prev)}
          >
            {interactive ? "حالت تعاملی: روشن" : "حالت تعاملی: خاموش"}
          </button>
          <button
            type="button"
            className={`fr-chip${device === "a4" ? " is-active" : ""}`}
            onClick={() => setDevice("a4")}
          >
            A4
          </button>
          <button
            type="button"
            className={`fr-chip${device === "fluid" ? " is-active" : ""}`}
            onClick={() => setDevice("fluid")}
          >
            تمام‌عرض
          </button>
          <button
            type="button"
            className={`fr-chip${device === "mobile" ? " is-active" : ""}`}
            onClick={() => setDevice("mobile")}
          >
            موبایل
          </button>

          <span className="fr-toolbar-spacer" />

          <span className={`fr-status${notice.includes("ایراد") ? " is-error" : ""}`}>
            {notice || `${filledCount} از ${allFields.length} فیلد تکمیل شده`}
          </span>

          <button type="button" className="fr-chip" onClick={check} disabled={readOnly}>
            بررسی اعتبارسنجی
          </button>
          <button
            type="button"
            className="fr-chip"
            onClick={() => {
              setValues({});
              setErrors({});
              setNotice("");
            }}
            disabled={readOnly}
          >
            پاک‌کردن
          </button>
          <button type="button" className="fr-chip" onClick={() => window.print()}>
            چاپ / PDF
          </button>
          {mode === "fill" && (
            <button
              type="button"
              className="fr-chip is-active"
              onClick={() => check() && onSubmit?.(values)}
            >
              ثبت فرم
            </button>
          )}
        </div>
      )}

      <div className={`fr-paper-wrap${device === "fluid" ? " fr-fluid" : ""}`}>
        <div className={`${paperClass} fr-print-area`}>
          <div className={framed ? "fr-frame" : undefined}>
            {categories.map((item, index) => (
              <Section
                key={item.id ?? item.category?.id ?? index}
                item={item}
                values={values}
                errors={errors}
                onChange={change}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
