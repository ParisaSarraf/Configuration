// انواع عناصر فرم و کمک‌ابزارهای مشترک بین نمایشگر فرم و فرم‌ساز.

export const NUMBER_TYPES = new Set([
  "number",
  "decimal",
  "currency",
  "rating",
  "slider",
]);

export const CHOICE_TYPES = new Set([
  "select",
  "radio",
  "checkboxes",
  "multiselect",
  "multiselect_list",
  "option_row",
]);

export const MULTI_TYPES = new Set([
  "checkboxes",
  "multiselect",
  "multiselect_list",
]);

export const FILE_TYPES = new Set(["file", "multifile", "spreadsheet"]);

export const SHEET_TYPES = new Set(["sheet_table", "matrix"]);

// عناصری که فقط ظاهر سند را می‌سازند و مقدار ورودی ندارند.
export const LAYOUT_TYPES = new Set([
  "section_band",
  "divider",
  "static_text",
  "page_break",
  "doc_header",
]);

export const TYPE_LABELS = {
  text: "متن کوتاه",
  textarea: "متن بلند",
  number: "عدد",
  select: "لیست کشویی",
  radio: "گزینه رادیویی",
  checkbox: "چک‌باکس",
  date: "تاریخ",
  file: "بارگذاری فایل",
  rating: "امتیازدهی",
  matrix: "جدول ساده",
  sheet_table: "جدول پیشرفته",
  doc_header: "سربرگ سند",
  section_band: "نوار عنوان بخش",
  option_row: "گزینه‌های خطی",
  signature: "محل امضا",
  static_text: "متن ثابت",
  divider: "خط جداکننده",
  page_break: "شکست صفحه چاپ",
};

export const toOptions = (choices = []) =>
  (Array.isArray(choices) ? choices : [])
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string") return { value: item, label: item };
      const value = item.value ?? item.key ?? item.label;
      if (value == null) return null;
      return { value: String(value), label: String(item.label ?? value) };
    })
    .filter(Boolean);

/**
 * ساخت یک جدول خالی: ردیف اول سرستون و بقیه سلول‌های قابل تایپ.
 */
export const emptySheet = (rows = 3, cols = 3) => {
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      cells.push(
        r === 0
          ? {
              r,
              c,
              text: `ستون ${c + 1}`,
              type: "static",
              variant: "head",
            }
          : { r, c, type: "text", name: `cell-${r}-${c}` },
      );
    }
  }
  return cells;
};

/**
 * خواندن ساختار جدول از choices فیلد.
 * هر سلول: { r, c, rs, cs, text, type, name, variant, align, tall, width, options }
 */
export const parseSheet = (field) => {
  const raw = Array.isArray(field?.choices) ? field.choices : [];
  const cells = raw
    .filter(
      (cell) =>
        cell && typeof cell === "object" && Number.isFinite(Number(cell.r)),
    )
    .map((cell, index) => ({
      key: cell.key || `cell-${cell.r}-${cell.c}-${index}`,
      r: Number(cell.r) || 0,
      c: Number(cell.c) || 0,
      rs: Math.max(Number(cell.rs) || 1, 1),
      cs: Math.max(Number(cell.cs) || 1, 1),
      text: cell.text == null ? "" : String(cell.text),
      type: cell.type || "static",
      name: cell.name || "",
      variant: cell.variant || "plain",
      align: cell.align || "center",
      tall: Boolean(cell.tall),
      width: cell.width || null,
      placeholder: cell.placeholder || "",
      options: Array.isArray(cell.options) ? cell.options : [],
    }));

  const rows = Math.max(
    1,
    Number(field?.min_value) || 0,
    ...cells.map((cell) => cell.r + cell.rs),
  );
  const cols = Math.max(
    1,
    Number(field?.max_value) || 0,
    ...cells.map((cell) => cell.c + cell.cs),
  );
  return { rows, cols, cells };
};

const isEmpty = (value) =>
  value == null ||
  (typeof value === "string" && !value.trim()) ||
  (Array.isArray(value) && !value.length);

/** اعتبارسنجی یک فیلد؛ خروجی: متن خطا یا null */
export const validateField = (field, value) => {
  if (!field || LAYOUT_TYPES.has(field.field_type)) return null;
  const label = field.field_label || "این فیلد";
  if (field.required && isEmpty(value)) return `${label} الزامی است`;
  if (isEmpty(value)) return null;

  if (typeof value === "string") {
    if (field.min_length && value.trim().length < Number(field.min_length))
      return `${label} حداقل ${field.min_length} کاراکتر باشد`;
    if (field.max_length && value.trim().length > Number(field.max_length))
      return `${label} حداکثر ${field.max_length} کاراکتر باشد`;
    if (field.regex_validation) {
      try {
        if (!new RegExp(field.regex_validation).test(value))
          return field.regex_error_message || `مقدار ${label} معتبر نیست`;
      } catch {
        // الگوی نامعتبر در تعریف فیلد — نادیده گرفته می‌شود
      }
    }
  }

  if (NUMBER_TYPES.has(field.field_type)) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return `${label} باید عدد باشد`;
    if (field.min_value != null && numeric < Number(field.min_value))
      return `${label} کمتر از حد مجاز است`;
    if (field.max_value != null && numeric > Number(field.max_value))
      return `${label} بیشتر از حد مجاز است`;
  }

  return null;
};

/** اعتبارسنجی همهٔ فیلدها */
export const validateAll = (fields = [], values = {}) => {
  const errors = {};
  (Array.isArray(fields) ? fields : []).forEach((field) => {
    const error = validateField(field, values[field.field_name]);
    if (error) errors[field.field_name] = error;
  });
  return { ok: !Object.keys(errors).length, errors };
};
