/* eslint-disable react/prop-types */
// جدول پیشرفته با سلول‌های ادغام‌شده (rowspan/colspan) و نوع ورودی متفاوت
// در هر سلول — همان چیزی که فرم‌های رسمی (مثل فرم درخواست تغییرات)
// لازم دارند و جدول ساده (matrix) نمی‌تواند بسازد.

import { parseSheet, toOptions } from "./formElements";

function CellInput({ cell, values, onChange, readOnly }) {
  const key = cell.name || cell.key;
  const value = values?.[key];
  const set = (next) => !readOnly && onChange?.(key, next);

  if (cell.type === "textarea")
    return (
      <textarea
        className="fr-textarea"
        rows={2}
        value={value ?? ""}
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
          checked={Boolean(value)}
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
        {options.map((option) => (
          <label key={option.value} className={`fr-option${readOnly ? " is-readonly" : ""}`}>
            <input
              type="radio"
              name={key}
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
    return (
      <div className="fr-sign">
        {readOnly ? "" : (
          <input
            className="fr-input"
            value={value ?? ""}
            onChange={(event) => set(event.target.value)}
          />
        )}
      </div>
    );

  return (
    <input
      className="fr-input"
      type={cell.type === "number" ? "number" : cell.type === "date" ? "date" : "text"}
      value={value ?? ""}
      placeholder={cell.placeholder}
      disabled={readOnly}
      onChange={(event) => set(event.target.value)}
    />
  );
}

export default function SheetTable({ field, values, onChange, readOnly = false }) {
  const { matrix } = parseSheet(field);

  return (
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
                  colSpan={cell.cs > 1 ? cell.cs : undefined}
                  rowSpan={cell.rs > 1 ? cell.rs : undefined}
                >
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
  );
}
