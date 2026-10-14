/* eslint-disable react/prop-types */
// جدول پیشرفته با سلول‌های ادغام‌شده (rowspan/colspan) و نوع ورودی متفاوت
// در هر سلول — همان چیزی که فرم‌های رسمی (مثل فرم درخواست تغییرات)
// لازم دارند و جدول ساده (matrix) نمی‌تواند بسازد.

import { useId } from "react";
import { parseSheet, toOptions } from "./formElements";
import { checkboxValue, textInputValue } from "./inputIdentity";
import DateField from "./DateField";
import SignatureField from "./SignatureField";
import { isTableAnswerEmpty } from "./tableAdvisory";

function CellInput({ cell, values, onChange, readOnly }) {
  const radioGroupId = useId();
  const key = cell.name || cell.key;
  const value = values?.[key];
  const set = (next) => !readOnly && onChange?.(key, next);

  if (cell.type === "textarea")
    return (
      <textarea
        className="fr-textarea"
        rows={2}
        value={textInputValue(value)}
        placeholder={cell.placeholder}
        disabled={readOnly}
        onChange={(event) => set(event.target.value)}
      />
    );

  if (cell.type === "checkbox")
    return (
      <label className={`fr-option${readOnly ? " is-readonly" : ""}`}>
        <input
          type="checkbox"
          checked={checkboxValue(value)}
          disabled={readOnly}
          onChange={(event) => set(event.target.checked)}
        />
        {cell.text}
      </label>
    );

  if (cell.type === "radio_row") {
    const options = toOptions(cell.options);
    return (
      <div className="fr-options">
        {options.map((option, index) => (
          <label key={`${option.value}-${index}`} className={`fr-option${readOnly ? " is-readonly" : ""}`}>
            <input
              type="radio"
              name={`fr-sheet-radio-${radioGroupId}`}
              checked={
                value !== undefined && value !== null && value !== "" &&
                String(value) === String(option.value)
              }
              disabled={readOnly}
              onChange={() => set(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (cell.type === "select") {
    const options = toOptions(cell.options);
    return (
      <select
        className="fr-select"
        value={value ?? ""}
        disabled={readOnly}
        onChange={(event) => set(event.target.value)}
      >
        <option value="">{cell.placeholder || "—"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (cell.type === "signature")
    return <SignatureField value={value} onChange={set} readOnly={readOnly} />;

  // خانهٔ تاریخ در جدول‌های سند هم با تقویم شمسی پروژه پر می‌شود.
  if (cell.type === "date")
    return (
      <DateField
        mode="date"
        value={value}
        onChange={set}
        readOnly={readOnly}
        placeholder={cell.placeholder}
      />
    );

  return (
    <input
      className="fr-input"
      type={cell.type === "number" ? "number" : "text"}
      value={textInputValue(value)}
      placeholder={cell.placeholder}
      disabled={readOnly}
      onChange={(event) => set(event.target.value)}
    />
  );
}

export default function SheetTable({ field, values, onChange, readOnly = false }) {
  const { matrix } = parseSheet(field);
  const missing = readOnly ? [] : matrix.flat().filter((cell) => cell.type && cell.required && isTableAnswerEmpty(values?.[cell.name || cell.key], cell.type));

  return (
    <>
    <table className="fr-sheet">
      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((cell) => {
              const classes = [
                cell.variant === "head" ? "fr-head" : "",
                cell.variant === "sub" ? "fr-sub" : "",
                cell.align === "center" ? "fr-center" : "",
                cell.tall ? "fr-tall" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <td
                  key={cell.key}
                  className={classes}
                  style={cell.width ? { width: cell.width } : undefined}
                  colSpan={cell.cs > 1 ? cell.cs : undefined}
                  rowSpan={cell.rs > 1 ? cell.rs : undefined}
                >
                  {cell.type && cell.required && <span className="fr-table-required" title="پاسخ اجباری؛ فقط هشدار">*</span>}
                  {cell.type ? (
                    <CellInput
                      cell={cell}
                      values={values}
                      onChange={onChange}
                      readOnly={readOnly}
                    />
                  ) : (
                    cell.text
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    {missing.length > 0 && (
      <div className="fr-table-advisory fr-no-print" role="status">
        <strong>یادآوری جدول — مانع ثبت یا ارجاع نیست</strong>
        <ul>{missing.map((cell) => <li key={cell.key}>پاسخ خانهٔ سطر {cell.r + 1}، ستون {cell.c + 1} تکمیل نشده است.</li>)}</ul>
      </div>
    )}
    </>
  );
}
