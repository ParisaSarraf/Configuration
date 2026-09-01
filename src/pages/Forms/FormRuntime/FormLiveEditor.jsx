/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Element } from "./FormRenderer";
import {
  A4_ROWS,
  COLS,
  FULL_WIDTH_TYPES,
  ROW_UNIT,
  WIDTH_PRESETS,
  flowLayout,
  flowRows,
  heightOf,
  moveField,
  moveFieldTo,
  rowsToPx,
  setFieldHeight,
  setFieldWidth,
  sortFields,
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

/**
 * طراحی مستقیم روی خروجی نهایی فرم (WYSIWYG).
 *
 * بوم دقیقاً همان کاغذ A4 است؛ طراح فقط ترتیب، عرض و ارتفاع
 * فیلدها را تعیین می‌کند و می‌تواند همزمان داخل فیلدها تایپ کند.
 */
export default function FormLiveEditor({
  fields = [],
  types,
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
  const [draggingId, setDraggingId] = useState(null);
  const [dropAt, setDropAt] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [chrome, setChrome] = useState(true);

  const ordered = useMemo(() => sortFields(fields), [fields]);
  const rows = useMemo(() => flowRows(ordered), [ordered]);
  const palette = types && types.length ? types : DEFAULT_TYPES;
  const overflow = totalRows(ordered) > A4_ROWS;

  const commit = (next) => {
    if (onPersist) onPersist(next);
  };

  const dropOn = (index) => {
    const id = draggingId;
    setDraggingId(null);
    setDropAt(null);
    if (id == null) return;
    commit(flowLayout(moveFieldTo(ordered, id, index)));
  };

  const startResize = (event, field) => {
    event.preventDefault();
    event.stopPropagation();
    const startY = event.clientY;
    const startH = heightOf(field);
    const nextHeight = (clientY) =>
      Math.max(2, startH + Math.round((clientY - startY) / ROW_UNIT));
    const move = (moveEvent) =>
      setResizing({ id: field.id, h: nextHeight(moveEvent.clientY) });
    const up = (upEvent) => {
      window.removeEventListener("pointermove", move);
      const next = nextHeight(upEvent.clientY);
      setResizing(null);
      if (next !== startH) commit(setFieldHeight(ordered, field.id, next));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const inserter = (index) => (
    <div className={`fw-inserter${dropAt === `slot-${index}` ? " is-drop" : ""}`}>
      <button
        type="button"
        className={`fw-add${paletteAt === index ? " is-open" : ""}`}
        title="افزودن فیلد در این جایگاه"
        disabled={saving}
        onClick={() => setPaletteAt(paletteAt === index ? null : index)}
      >
        +
      </button>
      {draggingId != null ? (
        <div
          className="fw-slotzone"
          onDragOver={(event) => {
            event.preventDefault();
            setDropAt(`slot-${index}`);
          }}
          onDrop={(event) => {
            event.preventDefault();
            dropOn(index);
          }}
        />
      ) : null}
      {paletteAt === index ? (
        <div className="fw-palette">
          {palette.map((item) => {
            const [value, label] = Array.isArray(item)
              ? item
              : [item.value, item.label];
            return (
              <button
                key={value}
                type="button"
                className="fw-palette-item"
                onClick={() => {
                  setPaletteAt(null);
                  if (onAdd) onAdd(value, index);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  const node = (item) => {
    const field = item.field;
    const selected = selectedId === field.id;
    const height = resizing && resizing.id === field.id ? resizing.h : item.h;
    const percent = (item.w / COLS) * 100;
    return (
      <div
        key={field.id || field.field_name}
        className={`fw-node${selected ? " is-selected" : ""}${
          dropAt === item.index ? " is-drop" : ""
        }`}
        style={{
          flex: `0 0 ${percent}%`,
          maxWidth: `${percent}%`,
          height: rowsToPx(height),
        }}
        onMouseDown={() => setSelectedId(field.id)}
        onDoubleClick={() => onEdit && onEdit(field)}
        onDragOver={(event) => {
          if (draggingId == null) return;
          event.preventDefault();
          setDropAt(item.index);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dropOn(item.index);
        }}
      >
        {chrome ? (
          <div className="fw-tools" onMouseDown={(event) => event.stopPropagation()}>
            <span
              className="fw-chip fw-grab"
              title="کشیدن و جابه‌جایی"
              draggable
              onDragStart={(event) => {
                setDraggingId(field.id);
                event.dataTransfer.effectAllowed = "move";
                try {
                  event.dataTransfer.setData("text/plain", String(field.id));
                } catch {
                  // برخی مرورگرها اجازهٔ setData نمی‌دهند
                }
              }}
              onDragEnd={() => {
                setDraggingId(null);
                setDropAt(null);
              }}
            >
              ✣
            </span>
            <span
              className="fw-chip fw-name"
              title="تغییر عنوان فیلد"
              contentEditable
              suppressContentEditableWarning
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
              onBlur={(event) => {
                const label = String(event.currentTarget.textContent || "").trim();
                if (label && label !== field.field_label && onRelabel)
                  onRelabel(field, label);
              }}
            >
              {field.field_label}
            </span>
            {!FULL_WIDTH_TYPES.has(field.field_type) ? (
              <>
                <span className="fw-sep" />
                {WIDTH_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    title={preset.label}
                    className={`fw-chip${
                      item.w === preset.value ? " is-active" : ""
                    }`}
                    onClick={() =>
                      commit(setFieldWidth(ordered, field.id, preset.value))
                    }
                  >
                    {preset.short}
                  </button>
                ))}
              </>
            ) : null}
            <span className="fw-sep" />
            <button
              type="button"
              className="fw-chip"
              title="یک پله بالاتر"
              onClick={() => commit(flowLayout(moveField(ordered, field.id, -1)))}
            >
              ↑
            </button>
            <button
              type="button"
              className="fw-chip"
              title="یک پله پایین‌تر"
              onClick={() => commit(flowLayout(moveField(ordered, field.id, 1)))}
            >
              ↓
            </button>
            <button
              type="button"
              className="fw-chip"
              title="تکثیر فیلد"
              disabled={saving}
              onClick={() => onDuplicate && onDuplicate(field)}
            >
              ⧉
            </button>
            <button
              type="button"
              className="fw-chip"
              title="تنظیمات کامل"
              onClick={() => onEdit && onEdit(field)}
            >
              ⚙
            </button>
            <button
              type="button"
              className="fw-chip is-danger"
              title="حذف فیلد"
              onClick={() => onDelete && onDelete(field)}
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="fr-slot fw-body">
          <Element field={field} values={values} onChange={setValues} />
        </div>
        {chrome ? (
          <span
            className="fw-resize"
            title="تغییر ارتفاع"
            onPointerDown={(event) => startResize(event, field)}
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="fr-root fw-root">
      <div className="fw-bar">
        <button
          type="button"
          className={`fw-chip${chrome ? " is-active" : ""}`}
          onClick={() => setChrome(!chrome)}
        >
          ابزارهای طراحی: {chrome ? "روشن" : "خاموش"}
        </button>
        <button type="button" className="fw-chip" onClick={() => setValues({})}>
          پاک‌کردن نوشته‌های آزمایشی
        </button>
        <button type="button" className="fw-chip" onClick={() => window.print()}>
          چاپ / PDF
        </button>
        <span className="fw-bar-hint">
          با ✣ جابه‌جا کنید · عنوان را در همان نوار ابزار تایپ کنید · دوبار
          کلیک = تنظیمات کامل · با + بین ردیف‌ها فیلد اضافه کنید
        </span>
        {overflow ? (
          <span className="fw-bar-warn">فرم از یک برگ A4 بلندتر شده است</span>
        ) : null}
      </div>

      <div className="fr-paper-wrap">
        <div
          className="fr-paper fr-print-area"
          style={{ opacity: saving ? 0.85 : 1 }}
        >
          <div className="fr-frame">
            {!ordered.length ? (
              <div className="fw-empty">
                <p>هنوز فیلدی اضافه نشده است.</p>
                <button
                  type="button"
                  className="fw-palette-item"
                  onClick={() => onAdd && onAdd("text", 0)}
                >
                  افزودن اولین فیلد
                </button>
              </div>
            ) : null}
            {rows.map((row, rowIndex) => (
              <div
                className="fw-rowwrap"
                key={row.items[0]?.field?.id || `row-${rowIndex}`}
              >
                {inserter(row.items[0]?.index ?? 0)}
                <div className="fw-row" style={{ minHeight: rowsToPx(row.h) }}>
                  {row.items.map((item) => node(item))}
                </div>
              </div>
            ))}
            {ordered.length ? inserter(ordered.length) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
