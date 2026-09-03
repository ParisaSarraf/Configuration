// =====================================================================
// رجیستری انواع عناصر فرم (لایهٔ اجرا)
//
// فهرست انواع و برچسب‌ها از fieldSchema.js می‌آید تا یک منبع حقیقت
// داشته باشیم. این فایل فقط مجموعه‌های رفتاری و اعتبارسنجی را می‌دهد.
//
// سازگاری با بک‌اند: هیچ ستون جدیدی به API اضافه نشده است. عناصر
// ساختاری (سربرگ سند، جدول ادغام‌شده، امضا و ...) با همان فیلدهای
// موجود ذخیره می‌شوند:
//   field_type    -> شناسه نوع عنصر (رشته)
//   choices       -> ساختار داخلی عنصر (آرایه JSON)
//   default_value -> مقدار/متن ثابت
//   css_class     -> مختصات چیدمان (form-studio-x/y/w/h) + نشانهٔ نوع
// =====================================================================

import { FIELD_DEFS, TYPE_ALIASES, canonicalType } from "./fieldSchema";

/** عناصری که ورودی کاربر می‌گیرند (در حالت تکمیل، مقدار دارند). */
export const INPUT_TYPES = new Set([
  "text",
  "textarea",
  "phone",
  "email",
  "url",
  "address",
  "number",
  "decimal",
  "currency",
  "slider",
  "rating",
  "date",
  "datetime",
  "time",
  "select",
  "radio",
  "option_row",
  "checkbox",
  "checkboxes",
  "multiselect",
  "multiselect_list",
  "file",
  "multifile",
  "signature",
  "date_signature",
  "matrix",
  "sheet_table",
]);

/** عناصر صرفاً نمایشی/چیدمانی (در submission نمی‌آیند). */
export const LAYOUT_TYPES = new Set([
  "doc_header",
  "section",
  "display_text",
  "divider",
  "spacer",
  "page_break",
  "logo",
  "form_number",
  // نام‌های قدیمی، برای داده‌های ذخیره‌شدهٔ قبلی
  "section_band",
  "static_text",
  "hidden",
]);

export const NUMBER_TYPES = new Set([
  "number",
  "decimal",
  "currency",
  "slider",
  "rating",
]);

export const MULTI_TYPES = new Set([
  "checkboxes",
  "multiselect",
  "multiselect_list",
]);

export const CHOICE_TYPES = new Set([
  "select",
  "radio",
  "option_row",
  "checkboxes",
  "multiselect",
  "multiselect_list",
]);

export const FILE_TYPES = new Set(["file", "multifile", "spreadsheet"]);

/** انواعی که محدودیت «طول کاراکتر» برایشان معنا دارد. */
export const TEXT_LENGTH_TYPES = new Set([
  "text",
  "textarea",
  "phone",
  "address",
]);

/**
 * پالت فرم‌ساز: [type, عنوان فارسی, گروه]
 * مستقیماً از fieldSchema ساخته می‌شود.
 */
export const PALETTE = FIELD_DEFS.map((def) => [
  def.type,
  def.label,
  def.group,
]);

export const TYPE_LABELS = new Map([
  ...FIELD_DEFS.map((def) => [def.type, def.label]),
  ...Object.entries(TYPE_ALIASES).map(([alias, target]) => [
    alias,
    FIELD_DEFS.find((def) => def.type === target)?.label || alias,
  ]),
]);

/** نرمال‌سازی گزینه‌ها به شکل {value,label}. */
export const toOptions = (choices) =>
  (Array.isArray(choices) ? choices : []).map((choice, index) =>
    typeof choice === "string"
      ? { value: choice, label: choice }
      : {
          value: choice.value ?? choice.key ?? choice.label ?? String(index),
          label: choice.label ?? choice.value ?? `گزینه ${index + 1}`,
        },
  );

// ---------------------------------------------------------------------
// جدول ثابت سند (sheet_table)
// ---------------------------------------------------------------------
// هر سلول یک شیء در choices است:
// { r, c, rs, cs, text, type, name, variant, align, tall }
//   r/c   : شماره سطر/ستون (از صفر)
//   rs/cs : ادغام سطری/ستونی (پیش‌فرض ۱)
//   text  : متن ثابت سلول
//   type  : اگر پر باشد، سلول ورودی است (text/textarea/number/date/
//           checkbox/radio_row/select/signature)
//   name  : کلید ذخیره مقدار سلول
//   variant: head | sub | plain
//   align : right | center | left
//   tall  : ارتفاع بلند برای سلول‌های شرح/امضا

export const parseSheet = (field) => {
  const cells = (Array.isArray(field?.choices) ? field.choices : [])
    .filter((cell) => cell && typeof cell === "object")
    .map((cell, index) => ({
      key: cell.key || `${cell.r ?? 0}-${cell.c ?? 0}-${index}`,
      r: Number(cell.r) || 0,
      c: Number(cell.c) || 0,
      rs: Math.max(Number(cell.rs) || 1, 1),
      cs: Math.max(Number(cell.cs) || 1, 1),
      text: cell.text ?? "",
      type: cell.type || "",
      name: cell.name || "",
      variant: cell.variant || "plain",
      align: cell.align || "right",
      tall: Boolean(cell.tall),
      options: cell.options || [],
      placeholder: cell.placeholder || "",
      width: cell.width || "",
      required: Boolean(cell.required),
    }));

  const cols = Math.max(
    Number(field?.max_value) || 0,
    ...cells.map((cell) => cell.c + cell.cs),
    1,
  );
  const rows = Math.max(
    Number(field?.min_value) || 0,
    ...cells.map((cell) => cell.r + cell.rs),
    1,
  );

  // چیدمان سلول‌ها در ماتریس، با در نظر گرفتن ادغام‌ها
  const taken = Array.from({ length: rows }, () => Array(cols).fill(false));
  const matrix = Array.from({ length: rows }, () => []);
  cells
    .slice()
    .sort((a, b) => a.r - b.r || a.c - b.c)
    .forEach((cell) => {
      if (cell.r >= rows || cell.c >= cols) return;
      if (taken[cell.r][cell.c]) return;
      for (let r = cell.r; r < Math.min(cell.r + cell.rs, rows); r += 1)
        for (let c = cell.c; c < Math.min(cell.c + cell.cs, cols); c += 1)
          taken[r][c] = true;
      matrix[cell.r].push(cell);
    });

  // پر کردن جاهای خالی با سلول‌های تهی تا جدول نشکند
  for (let r = 0; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1)
      if (!taken[r][c]) {
        taken[r][c] = true;
        matrix[r].push({
          key: `blank-${r}-${c}`,
          r,
          c,
          rs: 1,
          cs: 1,
          text: "",
          variant: "plain",
          align: "right",
        });
      }

  matrix.forEach((row) => row.sort((a, b) => a.c - b.c));
  return { rows, cols, matrix };
};

/** یک جدول خالی برای وقتی که کاربر «جدول ثابت سند» را از پالت می‌کشد. */
export const emptySheet = (rows = 3, cols = 3) => {
  const cells = [];
  for (let c = 0; c < cols; c += 1)
    cells.push({
      r: 0,
      c,
      rs: 1,
      cs: 1,
      text: `ستون ${c + 1}`,
      variant: "head",
      align: "center",
    });
  for (let r = 1; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1)
      cells.push({
        r,
        c,
        rs: 1,
        cs: 1,
        text: "",
        type: "text",
        name: `cell_${r}_${c}`,
      });
  return cells;
};

// ---------------------------------------------------------------------
// اعتبارسنجی
// ---------------------------------------------------------------------
const isEmpty = (value) =>
  value == null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "boolean" && value === false) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

export const validateField = (field, value) => {
  const type = canonicalType(field.field_type);
  if (!INPUT_TYPES.has(type)) return "";
  if (field.required && isEmpty(value)) return "تکمیل این فیلد الزامی است.";
  if (isEmpty(value)) return "";

  // جدول پرشدنی: محدودیت روی تعداد ردیف است، نه طول متن
  if (type === "matrix") {
    const rows = Array.isArray(value) ? value : [];
    const minRows = Number(field.min_value) || 0;
    const maxRows = Number(field.max_value) || 0;
    if (minRows && rows.length < minRows)
      return `حداقل ${minRows} ردیف باید تکمیل شود.`;
    if (maxRows && rows.length > maxRows)
      return `حداکثر ${maxRows} ردیف مجاز است.`;
    return "";
  }

  // جدول ثابت سند: اعتبارسنجی در سطح سلول انجام می‌شود
  if (type === "sheet_table") return "";

  // تاریخ و امضا: مقدارش آبجکت چندخانه‌ای است
  if (type === "date_signature") return "";

  // فیلدهای عددی: حداقل/حداکثر مقدار (نه طول کاراکتر)
  if (NUMBER_TYPES.has(type)) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "مقدار باید عدد باشد.";
    if (type === "number" && !Number.isInteger(numeric))
      return "فقط عدد صحیح مجاز است.";
    if (
      field.min_value != null &&
      field.min_value !== "" &&
      numeric < Number(field.min_value)
    )
      return `مقدار نباید کمتر از ${field.min_value} باشد.`;
    if (
      field.max_value != null &&
      field.max_value !== "" &&
      numeric > Number(field.max_value)
    )
      return `مقدار نباید بیشتر از ${field.max_value} باشد.`;
    return "";
  }

  const text = Array.isArray(value) ? value.join(",") : String(value);

  // حداقل/حداکثر طول فقط برای فیلدهای متنی
  if (TEXT_LENGTH_TYPES.has(type)) {
    if (field.min_length && text.length < Number(field.min_length))
      return `حداقل ${field.min_length} کاراکتر لازم است.`;
    if (field.max_length && text.length > Number(field.max_length))
      return `حداکثر ${field.max_length} کاراکتر مجاز است.`;
  }

  if (field.regex_validation) {
    try {
      if (!new RegExp(field.regex_validation).test(text))
        return field.regex_error_message || "فرمت مقدار واردشده معتبر نیست.";
    } catch {
      /* الگوی نامعتبر در تنظیمات فیلد — در پیش‌نمایش نادیده گرفته می‌شود */
    }
  }
  return "";
};

export const validateAll = (fields, values) => {
  const errors = {};
  (fields || []).forEach((field) => {
    const message = validateField(field, values[field.field_name ?? field.id]);
    if (message) errors[field.field_name ?? field.id] = message;
  });
  return errors;
};
