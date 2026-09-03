/* eslint-disable react/prop-types */
// =====================================================================
// FormLiveEditor — طراحی روی خود فرم (WYSIWYG)
//
// بوم طراحی و خروجی نهایی یکی هستند: همان کاغذ A4، همان
// کنترل‌ها، همان CSS چاپ. کاربر می‌تواند همانجا تایپ کند، عنوان
// فیلد را درجا عوض کند، عرض را با ۱/۱…۱/۴ تغییر دهد، فیلد را بکشد و
// جابه‌جا کند یا بین دو ردیف فیلد جدید اضافه کند.
//
// مختصات آزاد x/y دیگر دستی مدیریت نمی‌شوند؛ flowLayout آن‌ها را از
// ترتیب + عرض حساب می‌کند، پس هیچ‌وقت هم‌پوشانی و جای خالی نمی‌ماند.
// =====================================================================

import { useMemo, useRef, useState } from "react";
import { Element } from "./FormRenderer";
import printForm from "./printForm";
import {
  A4_ROWS,
  COLS,
  FULL_WIDTH_TYPES,
  ROW_UNIT,
  WIDTH_PRESETS,
  flowRows,
  moveField,
  moveFieldTo,
  rowsToPx,
  setFieldHeight,
  setFieldWidth,
  totalRows,
} from "./flowLayout";
import "./form-runtime.css";
import "./form-editor.css";

const DEFAULT_TYPES = [
  ["text", "متن کوتاه"],
  ["textarea", "متن بلند"],
  ["number", "عدد"],
  ["date", "تاریخ"],
  ["select", "لیست کشویی"],
  ["option_row", "گزینه‌های خطی"],
  ["checkbox", "چک‌باکس"],
  ["file", "بارگذاری فایل"],
  ["signature", "محل امضا"],
  ["section_band", "نوار عنوان بخش"],
  ["sheet_table", "جدول پیشرفته"],
  ["doc_header", "سربرگ سند"],
  ["static_text", "متن ثابت"],
  ["divider", "خط جداکننده"],
];

export default function FormLiveEditor({
  fields = [],
  types = DEFAULT_TYPES,
  saving = false,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onRelabel,
  onPersist,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [values, setValues] = useState({});
  const [paletteAt, setPaletteAt] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dropAt, setDropAt] = useState(null);
  const [chrome, setChrome] = useState(true);
  const [resizing, setResizing] = useState(null);

  const rows = useMemo(() => flowRows(fields), [fields]);
  const count = rows.reduce((sum, row) => sum + row.items.length, 0);
  const usedRows = useMemo(() => totalRows(fields), [fields]);
  const overflow = usedRows > A4_ROWS;

  const commit = (next) => onPersist?.(next);
  const change = (key, next) =>
    setValues((prev) => ({ ...prev, [key]: next }));

  const rowHeight = (field) =>
    resizing && String(resizing.id) === String(field.id) ? resizing.h : field.h;

  const startResize = (event, field) => {
    event.preventDefault();
    event.stopPropagation();
    const startY = event.clientY;
    const startH = field.h;
    const compute = (clientY) =>
      Math.max(2, startH + Math.round((clientY - startY) / ROW_UNIT));
    const move = (moveEvent) =>
      setResizing({ id: field.id, h: compute(moveEvent.clientY) });
    const up = (upEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const next = compute(upEvent.clientY);
      setResizing(null);
      if (next !== startH) commit(setFieldHeight(fields, field.id, next));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const dropOn = (event, target) => {
    event.preventDefault();
    setDropAt(null);
    if (dragId == null) return;
    commit(moveFieldTo(fields, dragId, target));
    setDragId(null);
  };

  const inserter = (index) => (
    <div
      className={`fw-inserter fr-no-print${
        dropAt === `slot-${index}` ? " is-drop" : ""
      }`}
      onDragOver={(event) => {
        if (dragId == null) return;
        event.preventDefault();
        setDropAt(`slot-${index}`);
      }}
      onDragLeave={() =>
        setDropAt((prev) => (prev === `slot-${index}` ? null : prev))
      }
      onDrop={(event) => dropOn(event, index)}
    >
      <button
        type="button"
        className={`fw-add${paletteAt === index ? " is-open" : ""}`}
        title="افزودن فیلد در اینجا"
        disabled={saving}
        onClick={() => setPaletteAt(paletteAt === index ? null : index)}
      >
        +
      </button>
      {paletteAt === index && (
        <div className="fw-palette">
          {types.map(([type, label]) => (
            <button
              key={type}
              type="button"
              className="fw-palette-item"
              onClick={() => {
                setPaletteAt(null);
                onAdd?.(type, index);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const node = (field) => {
    const selected = String(selectedId) === String(field.id);
    const width = `${(field.w / COLS) * 100}%`;
    const fixedWidth = FULL_WIDTH_TYPES.has(field.field_type);
    return (
      <div
        key={field.id}
        className={[
          "fw-node",
          selected ? "is-selected" : "",
          dropAt === field.index ? "is-drop" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          flex: `0 0 ${width}`,
          maxWidth: width,
          height: rowsToPx(rowHeight(field)),
        }}
        onMouseDown={() => setSelectedId(field.id)}
        onDoubleClick={() => onEdit?.(field)}
        onDragOver={(event) => {
          if (dragId == null || String(dragId) === String(field.id)) return;
          event.preventDefault();
          setDropAt(field.index);
        }}
        onDragLeave={() =>
          setDropAt((prev) => (prev === field.index ? null : prev))
        }
        onDrop={(event) => dropOn(event, field.index)}
      >
        {chrome && (
          <div className="fw-tools fr-no-print">
            <span
              className="fw-chip fw-grab"
              title="بکشید و جابه‌جا کنید"
              draggable
              onDragStart={(event) => {
                setDragId(field.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(field.id));
              }}
              onDragEnd={() => {
                setDragId(null);
                setDropAt(null);
              }}
            >
              ✣
            </span>
            <span
              className="fw-chip fw-name"
              title="عنوان فیلد — همینجا تایپ کنید"
              contentEditable
              suppressContentEditableWarning
              onBlur={(event) =>
                onRelabel?.(field, event.currentTarget.textContent)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
            >
              {field.field_label}
            </span>
            {!fixedWidth && <span className="fw-sep" />}
            {!fixedWidth &&
              WIDTH_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`fw-chip${
                    field.w === preset.value ? " is-active" : ""
                  }`}
                  title={preset.label}
                  onClick={() =>
                    commit(setFieldWidth(fields, field.id, preset.value))
                  }
                >
                  {preset.short}
                </button>
              ))}
            <span className="fw-sep" />
            <button
              type="button"
              className="fw-chip"
              title="یک پله بالاتر"
              disabled={field.index === 0}
              onClick={() => commit(moveField(fields, field.id, -1))}
            >
              ↑
            </button>
            <button
              type="button"
              className="fw-chip"
              title="یک پله پایینتر"
              disabled={field.index === count - 1}
              onClick={() => commit(moveField(fields, field.id, 1))}
            >
              ↓
            </button>
            <button
              type="button"
              className="fw-chip"
              title="تکثیر فیلد"
              disabled={saving}
              onClick={() => onDuplicate?.(field, field.index)}
            >
              ⧉
            </button>
            <button
              type="button"
              className="fw-chip"
              title="تنطیمات کامل فیلد"
              onClick={() => onEdit?.(field)}
            >
              ⚙
            </button>
            <button
              type="button"
              className="fw-chip is-danger"
              title="حذف فیلد"
              disabled={saving}
              onClick={() => onDelete?.(field)}
            >
              ✕
            </button>
          </div>
        )}

        <div className="fr-slot fw-body">
          <Element
            field={field}
            values={values}
            errors={null}
            onChange={change}
            readOnly={false}
          />
        </div>

        {chrome && selected && (
          <span
            className="fw-resize fr-no-print"
            title="کشیدن برای تغییر ارتفاع"
            onPointerDown={(event) => startResize(event, field)}
          />
        )}
      </div>
    );
  };

  const paperRef = useRef(null);

  return (
    <div className="fr-root fw-root">
      <div className="fw-bar fr-no-print">
        <button
          type="button"
          className={`fw-chip${chrome ? " is-active" : ""}`}
          onClick={() => setChrome((prev) => !prev)}
        >
          {chrome ? "ابزارهای طراحی: روشن" : "ابزارهای طراحی: خاموش"}
        </button>
        <button
          type="button"
          className="fw-chip"
          onClick={() => setValues({})}
        >
          پاک‌کردن نوشته‌های آزمایشی
        </button>
        <button
          type="button"
          className="fw-chip"
          onClick={() => printForm(paperRef.current)}
        >
          چاپ / PDF
        </button>
        {overflow ? (
          <span className="fw-bar-warn">
            محتوا از یک برگ A4 بیشتر شده — برای ادامه، «شکست صفحه» اضافه
            کنید.
          </span>
        ) : null}
        <span className="fw-bar-hint">
          با ✣ جابه‌جا کنید · عنوان را در همان نوار ابزار تایپ کنید · دوبار
          کلیک = تنطیمات کامل · با + بین ردیف‌ها فیلد اضافه کنید
        </span>
      </div>

      <div className="fr-paper-wrap">
        <div className="fr-paper fr-print-area" ref={paperRef}>
          <div className="fr-frame">
            {!count && (
              <div className="fw-empty">
                فرم خالی است — با دکمهٔ + اولین فیلد را اضافه کنید.
              </div>
            )}
            {rows.map((row) => (
              <div className="fw-rowwrap" key={`row-${row.items[0].id}`}>
                {chrome && inserter(row.items[0].index)}
                <div className="fw-row" style={{ minHeight: rowsToPx(row.h) }}>
                  {row.items.map((item) => node(item))}
                </div>
              </div>
            ))}
            {chrome && inserter(count)}
          </div>
        </div>
      </div>
    </div>
  );
}
