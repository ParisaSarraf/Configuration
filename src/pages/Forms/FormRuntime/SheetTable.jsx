/* eslint-disable react/prop-types */
import { parseSheet } from "./formElements";

/**
 * جدول پیشرفته با سلول‌های ادغام‌شده (rowspan/colspan).
 * ساختار در field.choices ذخیره می‌شود:
 *   { r, c, rs, cs, text, type, name, variant, align, tall, width, options }
 *   type: static | text | number | checkbox | select | sign
 */
export default function SheetTable({
  field,
  values = {},
  onChange,
  readOnly = false,
}) {
  const { rows, cols, cells } = parseSheet(field);

  const byPosition = new Map();
  const covered = new Set();
  cells.forEach((cell) => {
    byPosition.set(`${cell.r}:${cell.c}`, cell);
    for (let r = cell.r; r < cell.r + cell.rs; r += 1) {
      for (let c = cell.c; c < cell.c + cell.cs; c += 1) {
        if (r !== cell.r || c !== cell.c) covered.add(`${r}:${c}`);
      }
    }
  });

  const widths = [];
  cells
    .filter((cell) => cell.width && cell.cs === 1)
    .forEach((cell) => {
      if (!widths[cell.c]) widths[cell.c] = cell.width;
    });

  const set = (cellName, next) => {
    if (!cellName || !onChange) return;
    onChange({ ...values, [cellName]: next });
  };

  const renderContent = (cell) => {
    const value = cell.name ? values[cell.name] : undefined;
    if (cell.type === "static" || !cell.name) return cell.text || "\u00a0";
    if (cell.type === "checkbox")
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => set(cell.name, event.target.checked)}
        />
      );
    if (cell.type === "sign") return <span className="fr-signbox" />;
    if (cell.type === "select")
      return (
        <select
          className="fr-select"
          disabled={readOnly}
          value={value ?? ""}
          onChange={(event) => set(cell.name, event.target.value)}
        >
          <option value="">{cell.placeholder || "—"}</option>
          {cell.options.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      );
    return (
      <input
        className="fr-input"
        type={cell.type === "number" ? "number" : "text"}
        placeholder={cell.placeholder || ""}
        readOnly={readOnly}
        value={value ?? ""}
        onChange={(event) => set(cell.name, event.target.value)}
      />
    );
  };

  return (
    <table className="fr-sheet">
      {widths.length ? (
        <colgroup>
          {Array.from({ length: cols }).map((_, index) => (
            <col
              key={index}
              style={widths[index] ? { width: widths[index] } : undefined}
            />
          ))}
        </colgroup>
      ) : null}
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((__, c) => {
              const key = `${r}:${c}`;
              if (covered.has(key)) return null;
              const cell = byPosition.get(key);
              if (!cell) return <td key={c} />;
              const classes = [
                cell.variant === "head" ? "fr-head" : "",
                cell.variant === "sub" ? "fr-sub" : "",
                cell.tall ? "fr-tall" : "",
                cell.align === "right" ? "fr-right" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <td
                  key={c}
                  className={classes || undefined}
                  rowSpan={cell.rs > 1 ? cell.rs : undefined}
                  colSpan={cell.cs > 1 ? cell.cs : undefined}
                >
                  {renderContent(cell)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
