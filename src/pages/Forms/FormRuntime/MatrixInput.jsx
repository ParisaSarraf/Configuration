/* eslint-disable react/prop-types */
// =====================================================================
// MatrixInput — جدول پرشدنی توسط کاربر
//
// سازندهٔ فرم فقط ستون‌ها را تعریف می‌کند (choices)؛ کاربری که
// فرم را پر می‌کند هر چند ردیف که لازم دارد اضافه می‌کند.
//
// مقدار ذخیره‌شده برای گزارش‌گیری طراحی شده است:
//   [ { "unit": "فنی", "opinion": "تایید", "date": "2026-09-01" }, ... ]
// یعنی آرایه‌ای از ردیف‌ها که کلید هر خانه، value ستون است.
// =====================================================================

import { toMatrixColumns } from "./fieldSchema";
import { toOptions } from "./formElements";
import DateField from "./DateField";

const emptyRow = (columns) =>
  columns.reduce(
    (row, column) => ({
      ...row,
      [column.value]: column.type === "checkbox" ? false : "",
    }),
    {},
  );

function CellControl({ column, value, onChange, readOnly }) {
  const set = (next) => !readOnly && onChange(next);

  if (column.type === "checkbox")
    return (
      <label className={`fr-option${readOnly ? " is-readonly" : ""}`}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => set(event.target.checked)}
        />
      </label>
    );

  if (column.type === "select") {
    const options = toOptions(column.options);
    return (
      <select
        className="fr-select"
        value={value ?? ""}
        disabled={readOnly}
        onChange={(event) => set(event.target.value)}
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // ستون تاریخ هم همان تقویم شمسی پروژه را می‌گیرد.
  if (column.type === "date")
    return (
      <DateField mode="date" value={value} onChange={set} readOnly={readOnly} />
    );

  return (
    <input
      className="fr-input"
      type={column.type === "number" ? "number" : "text"}
      value={value ?? ""}
      disabled={readOnly}
      onChange={(event) => set(event.target.value)}
    />
  );
}

export default function MatrixInput({
  field,
  value,
  onChange,
  readOnly = false,
}) {
  const columns = toMatrixColumns(field?.choices);
  const minRows = Math.max(Number(field?.min_value) || 0, 0);
  const maxRows = Number(field?.max_value) || 0;

  const stored = Array.isArray(value) ? value : [];
  // در حالت طراحی/چاپ، چند ردیف خالی نشان می‌دهیم تا شکل جدول دیده شود.
  const placeholderCount = Math.max(minRows || 2, 1);
  const rows =
    stored.length || !readOnly
      ? stored
      : Array.from({ length: placeholderCount }, () => emptyRow(columns));

  const canAdd = !readOnly && (!maxRows || rows.length < maxRows);
  const canRemove = !readOnly && rows.length > minRows;

  const commit = (next) => onChange?.(next);

  const addRow = () => commit([...stored, emptyRow(columns)]);

  const removeRow = (index) =>
    commit(stored.filter((unused, position) => position !== index));

  const setCell = (index, key, next) =>
    commit(
      stored.map((row, position) =>
        position === index ? { ...row, [key]: next } : row,
      ),
    );

  if (!columns.length)
    return (
      <div className="fr-matrix-empty">
        برای این جدول هنوز ستونی تعریف نشده است.
      </div>
    );

  return (
    <div className="fr-matrix">
      <table className="fr-sheet fr-matrix-table">
        <thead>
          <tr>
            <th className="fr-head fr-matrix-index">#</th>
            {columns.map((column) => (
              <th
                key={column.value}
                className="fr-head"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            ))}
            {!readOnly && <th className="fr-head fr-matrix-tools fr-no-print" />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                className="fr-matrix-hint"
                colSpan={columns.length + (readOnly ? 1 : 2)}
              >
                هنوز ردیفی ثبت نشده — با دکمهٔ پایین ردیف اضافه کنید.
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={`matrix-row-${index}`}>
              <td className="fr-center fr-matrix-index">{index + 1}</td>
              {columns.map((column) => (
                <td
                  key={column.value}
                  className={column.type === "checkbox" ? "fr-center" : undefined}
                >
                  <CellControl
                    column={column}
                    value={row?.[column.value]}
                    onChange={(next) => setCell(index, column.value, next)}
                    readOnly={readOnly}
                  />
                </td>
              ))}
              {!readOnly && (
                <td className="fr-center fr-matrix-tools fr-no-print">
                  <button
                    type="button"
                    className="fr-matrix-remove"
                    title="حذف ردیف"
                    onClick={() => removeRow(index)}
                    disabled={!canRemove}
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="fr-matrix-bar fr-no-print">
        <button
          type="button"
          className="fr-matrix-add"
          onClick={addRow}
          disabled={!canAdd}
        >
          + افزودن ردیف
        </button>
        {maxRows > 0 && (
          <span className="fr-matrix-count">
            {rows.length} از حداکثر {maxRows} ردیف
          </span>
        )}
        {minRows > 0 && (
          <span className="fr-matrix-count">حداقل {minRows} ردیف</span>
        )}
      </div>
    </div>
  );
}
