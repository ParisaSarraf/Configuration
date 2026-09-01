// موتور چیدمان ردیفی (حالت «طراحی روی فرم»).
//
// در این مدل طراح فقط دو چیز تعیین می‌کند:
//   ۱) ترتیب فیلدها   ۲) عرض هر فیلد (۱/۱ تا ۱/۴)
// مختصات x/y — همان چیزی که در css_class ذخیره می‌شود — از روی
// همین دو محاسبه می‌شود؛ پس خروجی کاملاً با حالت «چیدمان آزاد»
// و با نمایشگر نهایی فرم سازگار است.

import { GRID } from "../FormBuilderStudio/formStudioLayout";

export const COLS = GRID.cols;
export const ROW_UNIT = GRID.rowUnit;

// عرض‌های استاندارد (برحسب ستون از ۱۲)
export const WIDTH_PRESETS = [
  { value: 12, label: "تمام عرض", short: "۱/۱" },
  { value: 8, label: "دو‌سوم", short: "۲/۳" },
  { value: 6, label: "نصف عرض", short: "۱/۲" },
  { value: 4, label: "یک‌سوم", short: "۱/۳" },
  { value: 3, label: "یک‌چهارم", short: "۱/۴" },
];

// عناصری که همیشه تمام‌عرض هستند
export const FULL_WIDTH_TYPES = new Set([
  "doc_header",
  "section_band",
  "sheet_table",
  "matrix",
  "divider",
  "page_break",
]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const widthOf = (field) => {
  if (FULL_WIDTH_TYPES.has(field?.field_type)) return COLS;
  const raw = Number(field?.w);
  if (!Number.isFinite(raw) || raw <= 0) return COLS;
  return clamp(Math.round(raw), 2, COLS);
};

export const heightOf = (field) => {
  const raw = Number(field?.h);
  if (!Number.isFinite(raw) || raw <= 0) return GRID.defaultRows;
  return clamp(Math.round(raw), 2, 220);
};

/** مرتب‌سازی براساس order و در نبودش، y سپس x */
export const sortFields = (fields = []) =>
  (Array.isArray(fields) ? fields : [])
    .filter(Boolean)
    .map((field, index) => ({ ...field, __index: index }))
    .sort((a, b) => {
      const orderA = Number.isFinite(Number(a.order))
        ? Number(a.order)
        : a.__index;
      const orderB = Number.isFinite(Number(b.order))
        ? Number(b.order)
        : b.__index;
      if (orderA !== orderB) return orderA - orderB;
      const yA = Number(a.y) || 0;
      const yB = Number(b.y) || 0;
      if (yA !== yB) return yA - yB;
      return (Number(b.x) || 0) - (Number(a.x) || 0);
    })
    .map(({ __index, ...field }) => field);

/**
 * فیلدها را به ردیف‌های ۱۲ ستونی تقسیم می‌کند.
 * خروجی: [{ y, h, used, items: [{ field, x, w, h, index }] }]
 */
export const flowRows = (fields = [], { gap = 0 } = {}) => {
  const ordered = sortFields(fields);
  const rows = [];
  let current = null;
  let cursorY = 0;

  ordered.forEach((field, index) => {
    const w = widthOf(field);
    const h = heightOf(field);
    const isBlock = FULL_WIDTH_TYPES.has(field.field_type) || w >= COLS;
    const needsNewRow =
      !current || isBlock || current.block || current.used + w > COLS;

    if (needsNewRow) {
      if (current) cursorY += current.h + gap;
      current = { y: cursorY, h, used: 0, items: [], block: isBlock };
      rows.push(current);
    }

    current.items.push({ field, index, x: current.used, w, h });
    current.used += w;
    current.h = Math.max(current.h, h);
  });

  return rows;
};

/**
 * مختصات x/y/w/h و order را از روی ترتیب و عرض حساب می‌کند.
 */
export const flowLayout = (fields = [], options = {}) => {
  const rows = flowRows(fields, options);
  const result = [];
  rows.forEach((row) => {
    row.items.forEach((item) => {
      result.push({
        ...item.field,
        x: item.x,
        y: row.y,
        w: item.w,
        h: row.block ? row.h : item.h,
        order: result.length,
      });
    });
  });
  return result;
};

/** جابه‌جایی یک فیلد به جایگاه target (ایندکس در لیست مرتب) */
export const moveFieldTo = (fields = [], id, target) => {
  const ordered = sortFields(fields);
  const from = ordered.findIndex((field) => String(field.id) === String(id));
  if (from < 0) return ordered;
  const next = ordered.slice();
  const [moved] = next.splice(from, 1);
  const bounded = clamp(
    Number.isFinite(Number(target)) ? Number(target) : next.length,
    0,
    next.length,
  );
  next.splice(bounded > from ? bounded - 1 : bounded, 0, moved);
  return next;
};

/** جابه‌جایی نسبی (۱+ یعنی یک پله پایین‌تر) */
export const moveField = (fields = [], id, offset = 1) => {
  const ordered = sortFields(fields);
  const from = ordered.findIndex((field) => String(field.id) === String(id));
  if (from < 0) return ordered;
  const to = clamp(from + offset, 0, ordered.length - 1);
  if (to === from) return ordered;
  const next = ordered.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const patchField = (fields = [], id, patch = {}) =>
  sortFields(fields).map((field) =>
    String(field.id) === String(id) ? { ...field, ...patch } : field,
  );

export const setFieldWidth = (fields, id, w) =>
  flowLayout(patchField(fields, id, { w: clamp(Math.round(w), 2, COLS) }));

export const setFieldHeight = (fields, id, h) =>
  flowLayout(patchField(fields, id, { h: clamp(Math.round(h), 2, 220) }));

export const rowsToPx = (rows) => Math.max(Number(rows) || 0, 0) * ROW_UNIT;

/** ارتفاع کل فرم برحسب واحد ردیف */
export const totalRows = (fields = []) => {
  const rows = flowRows(fields);
  if (!rows.length) return 0;
  const last = rows[rows.length - 1];
  return last.y + last.h;
};

// ارتفاع مفید یک برگ A4 در واحد ردیف (تقریبی)
export const A4_ROWS = 130;
