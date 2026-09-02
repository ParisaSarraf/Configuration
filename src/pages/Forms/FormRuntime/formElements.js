// =====================================================================
// رجیستری انواع عناصر فرم
//
// نکته مهم درباره سازگاری با بک‌اند:
// هیچ ستون جدیدی به API اضافه نشده است. عناصر جدید (سربرگ سند، نوار
// بخش، جدول ادغام‌شده، امضا و ...) با همان فیلدهای موجود ذخیره می‌شوند:
//   field_type    -> شناسه نوع عنصر (رشته)
//   choices       -> ساختار داخلی عنصر (آرایه JSON)
//   default_value -> مقدار/متن ثابت
//   css_class     -> مختصات چیدمان (form-studio-x/y/w/h)
// اگر بک‌اند field_type را با choices محدود کرده باشد، فقط باید همین
// رشته‌ها را به لیست مجاز اضافه کند.
// =====================================================================

/** عناصری که ورودی کاربر می‌گیرند (در حالت تکمیل، مقدار دارند). */
export const INPUT_TYPES = new Set([
  "text",
  "textarea",
  "number",
  "decimal",
  "currency",
  "email",
  "url",
  "phone",
  "national_id",
  "select",
  "radio",
  "option_row",
  "checkbox",
  "checkboxes",
  "date",
  "datetime",
  "time",
  "file",
  "multifile",
  "rating",
  "signature",
  "matrix",
  "sheet_table",
]);

/** عناصر صرفاً نمایشی/چیدمانی. */
export const LAYOUT_TYPES = new Set([
  "doc_header",
  "section_band",
  "static_text",
  "divider",
  "spacer",
  "page_break",
  "hidden",
]);

export const NUMBER_TYPES = new Set(["number", "decimal", "currency", "rating"]);
export const MULTI_TYPES = new Set(["checkboxes", "multiselect", "multiselect_list"]);
export const CHOICE_TYPES = new Set([
  "select",
  "radio",
  "option_row",
  "checkboxes",
  "multiselect",
  "multiselect_list",
]);
export const FILE_TYPES = new Set(["file", "multifile", "spreadsheet"]);

/**
 * پالت فرم‌ساز: [type, عنوان فارسی, گروه]
 * گروه‌ها فقط برای دسته‌بندی پالت در سایدبار استفاده می‌شوند.
 */
export const PALETTE = [
  ["text", "متن کوتاه", "ورودی"],
  ["textarea", "متن بلند", "ورودی"],
  ["number", "عدد", "ورودی"],
  ["date", "تاریخ", "ورودی"],
  ["select", "لیست کشویی", "انتخاب"],
  ["radio", "تک‌انتخابی", "انتخاب"],
  ["option_row", "گزینه‌های خطی", "انتخاب"],
  ["checkbox", "چک‌باکس", "انتخاب"],
  ["checkboxes", "چند‌انتخابی", "انتخاب"],
  ["rating", "امتیازدهی", "انتخاب"],
  ["file", "بارگذاری فایل", "ورودی"],
  ["signature", "محل امضا", "سند"],
  ["doc_header", "سربرگ سند", "سند"],
  ["section_band", "نوار عنوان بخش", "سند"],
  ["static_text", "متن ثابت", "سند"],
  ["divider", "خط جداکننده", "سند"],
  ["sheet_table", "جدول پیشرفته", "جدول"],
  ["matrix", "جدول ساده", "جدول"],
  ["page_break", "شکست صفحه (چاپ)", "سند"],
];

export const TYPE_LABELS = new Map(PALETTE.map(([type, label]) => [type, label]));

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
// جدول پیشرفته
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
        matrix[r].push({ key: `blank-${r}-${c}`, r, c, rs: 1, cs: 1, text: "", variant: "plain", align: "right" });
      }

  matrix.forEach((row) => row.sort((a, b) => a.c - b.c));
  return { rows, cols, matrix };
};

/** یک جدول خالی برای وقتی که کاربر «جدول پیشرفته» را از پالت می‌کشد. */
export const emptySheet = (rows = 3, cols = 3) => {
  const cells = [];
  for (let c = 0; c < cols; c += 1)
    cells.push({ r: 0, c, rs: 1, cs: 1, text: `ستون ${c + 1}`, variant: "head", align: "center" });
  for (let r = 1; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1)
      cells.push({ r, c, rs: 1, cs: 1, text: "", type: "text", name: `cell_${r}_${c}` });
  return cells;
};

// ---------------------------------------------------------------------
// اعتبارسنجی
// ---------------------------------------------------------------------
const isEmpty = (value) =>
  value == null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "boolean" && value === false);

export const validateField = (field, value) => {
  if (!INPUT_TYPES.has(field.field_type)) return "";
  if (field.required && isEmpty(value)) return "تکمیل این فیلد الزامی است.";
  if (isEmpty(value)) return "";

  const text = Array.isArray(value) ? value.join(",") : String(value);

  if (field.min_length && text.length < Number(field.min_length))
    return `حداقل ${field.min_length} کاراکتر لازم است.`;
  if (field.max_length && text.length > Number(field.max_length))
    return `حداکثر ${field.max_length} کاراکتر مجاز است.`;

  if (NUMBER_TYPES.has(field.field_type)) {
    const num = Number(value);
    if (Number.isNaN(num)) return "مقدار باید عدد باشد.";
    if (field.min_value != null && field.min_value !== "" && num < Number(field.min_value))
      return `مقدار نباید کمتر از ${field.min_value} باشد.`;
    if (field.max_value != null && field.max_value !== "" && num > Number(field.max_value))
      return `مقدار نباید بیشتر از ${field.max_value} باشد.`;
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
