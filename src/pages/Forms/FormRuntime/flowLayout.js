// =====================================================================
// flowLayout — موتور چیدمان «ساده» (ردیفی) برای طراحی روی خود فرم.
//
// مدل قدیم: هر فیلد مختصات آزاد x/y دارد و کاربر باید جای دقیق
// هر کارت را دستی پیدا کند (هم‌پوشانی، فاصلهٔ اضافی، بهم‌ریختگی).
// مدل ساده: فیلدها فقط یک ترتیب دارند و هر فیلد یک «عرض»
// (تمام‌عرض / دو‌سوم / نصف / یک‌سوم / یک‌چهارم). فیلدها کنار هم
// می‌نشینند تا عرض ردیف پر شود، بعد خودبه‌خود به ردیف بعدی می‌روند —
// دقیقاً مانند پرکردن یک فرم کاغذی.
//
// خروجی همان x/y/w/h قبلی است، پس رندرر فرم، پیش‌نمایش و خروجی
// چاپ A4 دست‌نخورده می‌مانند و دو حالت طراحی قابل تعویض‌اند.
// =====================================================================

import { GRID } from "../FormBuilderStudio/formStudioLayout";

export const COLS = GRID.cols; // ۱۲ ستون
export const ROW_UNIT = GRID.rowUnit; // هر واحد ارتفاع = 8px

export const WIDTH_PRESETS = [
  { value: COLS, label: "تمام عرض", short: "۱/۱" },
  { value: 8, label: "دو‌سوم", short: "۲/۳" },
  { value: 6, label: "نصف عرض", short: "۱/۲" },
  { value: 4, label: "یک‌سوم", short: "۱/۳" },
  { value: 3, label: "یک‌چهارم", short: "۱/۴" },
];

// عناصر ساختاری که همیشه کل عرض برگه را می‌گیرند.
export const FULL_WIDTH_TYPES = new Set([
  "doc_header",
  "section_band",
  "sheet_table",
  "matrix",
  "divider",
  "page_break",
  "static_text",
]);

const num = (value, fallback) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

const bound = (value, min, max) => Math.min(Math.max(Math.round(value), min), max);

export const widthOf = (field) =>
  FULL_WIDTH_TYPES.has(field?.field_type)
    ? COLS
    : bound(num(field?.w, COLS), 2, COLS);

export const heightOf = (field) => bound(num(field?.h, 4), 2, 220);

export const sortFields = (fields) =>
  (Array.isArray(fields) ? fields : [])
    .filter((field) => field && field.id != null)
    .map((field, index) => ({ ...field, order: num(field.order, index) }))
    .sort((a, b) => a.order - b.order);

/**
 * ردیف‌بندی: فیلدها به ترتیب در یک ردیف کنار هم قرار می‌گیرند تا
 * ۱۲ ستون پر شود؛ عناصر تمام‌عرض همیشه ردیف مستقل دارند.
 * @returns آرایه‌ای از { y, h, items: [فیلدهای همان ردیف] }
 */
export const flowRows = (fields, { gap = 0 } = {}) => {
  const list = sortFields(fields);
  const rows = [];
  let current = null;

  list.forEach((field, index) => {
    const w = widthOf(field);
    const h = heightOf(field);
    const isBlock = w >= COLS;
    const needsNewRow =
      !current || isBlock || current.block || current.used + w > COLS;

    if (needsNewRow) {
      current = { y: 0, h, used: 0, items: [], block: isBlock };
      rows.push(current);
    }

    current.items.push({ ...field, w, h, x: current.used, y: 0, index });
    current.used += w;
    current.h = Math.max(current.h, h);
  });

  // مختصات عمودی را پس از معلوم‌شدن ارتفاع نهایی هر ردیف می‌نویسیم.
  let cursor = 0;
  rows.forEach((row) => {
    row.y = cursor;
    row.items.forEach((item) => {
      item.y = cursor;
    });
    cursor += row.h + gap;
  });

  return rows;
};

/** همان ردیف‌بندی، اما به شکل لیست تخت فیلدها با x/y/w/h/order نهایی. */
export const flowLayout = (fields, options) => {
  const flat = [];
  flowRows(fields, options).forEach((row) => {
    row.items.forEach((item) => {
      flat.push({ ...item, y: row.y });
    });
  });
  return flat.map((field, order) => ({ ...field, order, index: order }));
};

const indexOfField = (list, id) =>
  list.findIndex((field) => String(field.id) === String(id));

/** جابه‌جایی یک فیلد به جایگاه مشخص در ترتیب فرم. */
export const moveFieldTo = (fields, id, target) => {
  const list = sortFields(fields);
  const index = indexOfField(list, id);
  if (index < 0) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  const wanted = num(target, index);
  next.splice(bound(wanted > index ? wanted - 1 : wanted, 0, next.length), 0, item);
  return next.map((field, order) => ({ ...field, order }));
};

/** یک پله بالا/پایین بردن فیلد. */
export const moveField = (fields, id, offset) => {
  const list = sortFields(fields);
  const index = indexOfField(list, id);
  if (index < 0) return list;
  const step = num(offset, 0);
  const target = index + (step > 0 ? step + 1 : step);
  return moveFieldTo(list, id, target);
};

export const patchField = (fields, id, patch) =>
  sortFields(fields).map((field) =>
    String(field.id) === String(id) ? { ...field, ...patch } : field,
  );

export const setFieldWidth = (fields, id, w) =>
  patchField(fields, id, { w: bound(num(w, COLS), 2, COLS) });

export const setFieldHeight = (fields, id, h) =>
  patchField(fields, id, { h: bound(num(h, 4), 2, 220) });

export const rowsToPx = (rows) => Math.max(num(rows, 0), 0) * ROW_UNIT;

/** مجموع ارتفاع فرم برحسب واحد ردیف (برای هشدار سرریز A4). */
export const totalRows = (fields) =>
  flowRows(fields).reduce((sum, row) => sum + row.h, 0);

// ارتفاع مفید یک برگ A4 با حاشیهٔ 10mm ≈ 1047px ≈ 130 واحد ردیف
export const A4_ROWS = 130;
