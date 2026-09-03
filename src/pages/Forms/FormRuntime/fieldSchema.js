// =====================================================================
// رجیستری واحد انواع فیلد — تنها منبع حقیقت برای:
//   ۱) برچسب فارسی و گروه پالت
//   ۲) نگاشت به enum بک‌اند (field_type)
//   ۳) اینکه در «ویرایش ویژگی‌های فیلد» چه بخش‌هایی دیده شود
//   ۴) اینکه چه کلیدهایی به API فرستاده شود (بقیه null می‌شوند)
//
// قاعده: هر جا لازم شد نوع جدیدی اضافه شود، فقط همین فایل.
// =====================================================================

/* بخش‌های درایور (panels) و کلیدهای API متناظرشان */
export const PANEL_KEYS = Object.freeze({
  basic: ["placeholder", "help_text", "default_value"],
  help: ["help_text"],
  length: ["min_length", "max_length"],
  range: ["min_value", "max_value"],
  rating: ["max_value"],
  choices: ["choices"],
  file: ["allowed_extensions", "max_file_size_mb"],
  matrix: ["choices", "min_value", "max_value"],
  sheet: ["choices", "min_value", "max_value"],
  docheader: ["choices", "default_value"],
  checkboxLabel: ["default_value"],
  staticText: ["default_value"],
  regex: ["regex_validation", "regex_error_message"],
});

/** کلیدهایی که همیشه برای هر فیلدی ارسال می‌شوند. */
export const BASE_KEYS = Object.freeze([
  "form_definition_id",
  "field_name",
  "field_label",
  "field_type",
  "order",
  "css_class",
  "required",
]);

/** همهٔ کلیدهای اختیاری که ممکن است روی یک فیلد معنا داشته باشند. */
export const OPTIONAL_KEYS = Object.freeze([
  "placeholder",
  "help_text",
  "default_value",
  "min_length",
  "max_length",
  "min_value",
  "max_value",
  "regex_validation",
  "regex_error_message",
  "choices",
  "allowed_extensions",
  "max_file_size_mb",
]);

/** الگوهای اعتبارسنجی خودکار بر اساس نوع فیلد. */
export const AUTO_PATTERNS = Object.freeze({
  email: {
    regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    message: "آدرس ایمیل معتبر نیست.",
  },
  url: {
    regex: "^https?:\\/\\/[^\\s]+$",
    message: "آدرس باید با http:// یا https:// شروع شود.",
  },
  phone: {
    regex: "^[0-9\u06f0-\u06f9\u0660-\u0669+\\-\\s]{7,15}$",
    message: "شمارهٔ تماس معتبر نیست.",
  },
});

/**
 * فهرست کامل انواع.
 *   type    : شناسهٔ داخلی (همان چیزی که رندرر می‌فهمد)
 *   backend : اگر متفاوت باشد، مقداری که به API می‌رود
 *   marker  : نشانهٔ css_class برای بازگرداندن نوع داخلی هنگام خواندن
 *   panels  : بخش‌های درایور
 */
export const FIELD_DEFS = [
  { type: "text", label: "متن تک‌خطی", hint: "یک کادر ورودی ساده", group: "ورودی متن", panels: ["basic", "length", "regex"] },
  { type: "textarea", label: "متن چندخطی", hint: "کادر بزرگ چندخطی", group: "ورودی متن", panels: ["basic", "length"] },
  { type: "phone", label: "شمارهٔ تماس", group: "ورودی متن", panels: ["basic", "length"], autoPattern: "phone" },
  { type: "email", label: "ایمیل", group: "ورودی متن", panels: ["basic"], autoPattern: "email" },
  { type: "url", label: "آدرس وب", group: "ورودی متن", panels: ["basic"], autoPattern: "url" },
  { type: "address", label: "نشانی", hint: "نشانی چندخطی همراه کدپستی", group: "ورودی متن", panels: ["basic"] },

  { type: "number", label: "عدد صحیح", group: "عدد و زمان", panels: ["basic", "range"] },
  { type: "decimal", label: "عدد اعشاری", group: "عدد و زمان", panels: ["basic", "range"] },
  { type: "currency", label: "مبلغ", group: "عدد و زمان", panels: ["basic", "range"] },
  { type: "slider", label: "اسلایدر", hint: "انتخاب عدد با کشیدن", group: "عدد و زمان", panels: ["help", "range"] },
  { type: "rating", label: "امتیاز ستاره‌ای", group: "عدد و زمان", panels: ["help", "rating"] },
  { type: "date", label: "تاریخ", group: "عدد و زمان", panels: [] },
  { type: "datetime", label: "تاریخ و ساعت", group: "عدد و زمان", panels: [] },
  { type: "time", label: "ساعت", group: "عدد و زمان", panels: [] },

  { type: "select", label: "لیست کشویی", group: "انتخاب", panels: ["basic", "choices"] },
  { type: "radio", label: "تک‌انتخابی (رادیویی)", group: "انتخاب", panels: ["basic", "choices"] },
  { type: "option_row", label: "گزینه‌های خطی", hint: "رادیویی در یک خط — مخصوص فرم چاپی", group: "انتخاب", panels: ["help", "choices"], backend: "radio", marker: "opt-inline" },
  { type: "checkbox", label: "تیک تکی (بله/خیر)", group: "انتخاب", panels: ["help", "checkboxLabel"] },
  { type: "checkboxes", label: "چند تیک", group: "انتخاب", panels: ["help", "choices"] },
  { type: "multiselect", label: "چندانتخابی (تیک‌دار)", group: "انتخاب", panels: ["help", "choices"] },
  { type: "multiselect_list", label: "چندانتخابی (لیستی)", group: "انتخاب", panels: ["basic", "choices"] },

  { type: "file", label: "بارگذاری فایل", group: "فایل", panels: ["help", "file"] },
  { type: "multifile", label: "بارگذاری چند فایل", group: "فایل", panels: ["help", "file"] },

  { type: "matrix", label: "جدول پرشدنی", hint: "ستون‌ها را شما می‌سازید، کاربر ردیف اضافه می‌کند", group: "جدول", panels: ["help", "matrix"] },
  { type: "sheet_table", label: "جدول ثابت سند", hint: "جدول چاپی با ادغام سلول و امضا", group: "جدول", panels: ["sheet"] },

  { type: "signature", label: "محل امضا", group: "سند", panels: ["help"] },
  { type: "date_signature", label: "تاریخ و امضا", hint: "خانهٔ تاریخ + محل امضا در یک ردیف؛ برچسب خانه‌ها در بخش گزینه‌ها قابل تغییر است", group: "سند", panels: ["help", "choices"], backend: "signature", marker: "el-datesign" },
  { type: "logo", label: "لوگو", hint: "تصویر لوگو با نشانی دلخواه", group: "سند", panels: ["staticText"], backend: "display_text", marker: "el-logo" },
  { type: "form_number", label: "شماره فرم", hint: "کد یا شمارهٔ سند — عنوان و مقدارش قابل تغییر است", group: "سند", panels: ["staticText"], backend: "display_text", marker: "el-formno" },
  { type: "section", label: "عنوان بخش", hint: "نوار تیتر — در submission ذخیره نمی‌شود", group: "سند", panels: [] },
  { type: "display_text", label: "متن نمایشی", hint: "فقط خواندنی", group: "سند", panels: ["staticText"] },
  { type: "doc_header", label: "سربرگ سند", group: "سند", panels: ["docheader"] },
  { type: "divider", label: "خط جداکننده", group: "سند", panels: [] },
  { type: "page_break", label: "شکست صفحه (چاپ)", group: "سند", panels: [] },
];

/** نوع‌های قدیمی که باید به نام جدید ترجمه شوند. */
export const TYPE_ALIASES = Object.freeze({
  section_band: "section",
  static_text: "display_text",
  national_id: "text",
  spreadsheet: "multifile",
  hidden: "display_text",
  country: "text",
});

const DEF_BY_TYPE = new Map(FIELD_DEFS.map((def) => [def.type, def]));

export const canonicalType = (type) => {
  const key = String(type || "text");
  return TYPE_ALIASES[key] || key;
};

export const defOf = (type) =>
  DEF_BY_TYPE.get(canonicalType(type)) || DEF_BY_TYPE.get("text");

export const labelOf = (type) => defOf(type).label;

export const hasPanel = (type, panel) => defOf(type).panels.includes(panel);

export const GROUPS = FIELD_DEFS.reduce(
  (list, def) => (list.includes(def.group) ? list : [...list, def.group]),
  [],
);

/** نوع‌هایی که اصلاً مقدار کاربر نمی‌گیرند (در submission نمی‌آیند). */
export const DISPLAY_ONLY = new Set([
  "section",
  "display_text",
  "doc_header",
  "divider",
  "page_break",
  "spacer",
  "logo",
  "form_number",
]);

/** کلیدهای مجاز برای یک نوع خاص. */
export const payloadKeysOf = (type) => {
  const keys = new Set();
  defOf(type).panels.forEach((panel) =>
    (PANEL_KEYS[panel] || []).forEach((key) => keys.add(key)),
  );
  if (defOf(type).autoPattern) {
    keys.add("regex_validation");
    keys.add("regex_error_message");
  }
  return keys;
};

/** مقدار field_type که باید به API برود. */
export const toBackendType = (type) => {
  const def = defOf(type);
  return def.backend || def.type;
};

/**
 * نوع داخلی را از فیلد بازگشته از API درمی‌آورد
 * (برای انواعی که با نشانهٔ css_class ذخیره شده‌اند).
 */
export const resolveType = (field) => {
  const base = canonicalType(field?.field_type);
  const css = String(field?.css_class || "");
  const marked = FIELD_DEFS.find(
    (def) =>
      def.marker &&
      def.backend === base &&
      new RegExp(`(^|\\s)${def.marker}(\\s|$)`).test(css),
  );
  return marked ? marked.type : base;
};

/** افزودن/حذف نشانهٔ نوع در css_class هنگام ذخیره. */
export const applyTypeMarker = (type, cssClass) => {
  const markers = FIELD_DEFS.map((def) => def.marker).filter(Boolean);
  const cleaned = String(cssClass || "")
    .split(/\s+/)
    .filter((token) => token && !markers.includes(token));
  const marker = defOf(type).marker;
  if (marker) cleaned.push(marker);
  return cleaned.join(" ").trim();
};

/** مقدار پیش‌فرض choices هنگام ساخت فیلد جدید. */
export const defaultChoicesFor = (type) => {
  const canonical = canonicalType(type);
  if (canonical === "matrix")
    return [
      { value: "column_1", label: "ستون ۱", type: "text" },
      { value: "column_2", label: "ستون ۲", type: "text" },
    ];
  if (canonical === "doc_header")
    return [
      { key: "code", label: "شناسه سند", value: "SY-SE-F-000" },
      { key: "rev", label: "تاریخ بازنگری", value: "۱۴۰۵/۰۱/۰۱" },
    ];
  if (canonical === "date_signature")
    return [
      { value: "date", label: "تاریخ" },
      { value: "signature", label: "امضا" },
    ];
  if (hasPanel(canonical, "choices"))
    return [
      { value: "option_1", label: "گزینه ۱" },
      { value: "option_2", label: "گزینه ۲" },
    ];
  return [];
};

/** نرمال‌سازی گزینه‌ها به قالب مورد توافق بک‌اند: [{ value, label }] */
export const toChoiceObjects = (choices) =>
  (Array.isArray(choices) ? choices : [])
    .map((choice, index) => {
      if (typeof choice === "string") {
        const label = choice.trim();
        return label ? { value: label, label } : null;
      }
      if (!choice || typeof choice !== "object") return null;
      const label = String(choice.label ?? choice.value ?? "").trim();
      if (!label) return null;
      const value = String(choice.value ?? choice.key ?? "").trim();
      return { value: value || label || `option_${index + 1}`, label };
    })
    .filter(Boolean);

/** ستون‌های جدول پرشدنی. */
export const MATRIX_COLUMN_TYPES = [
  { value: "text", label: "متن" },
  { value: "number", label: "عدد" },
  { value: "date", label: "تاریخ" },
  { value: "select", label: "انتخابی" },
  { value: "checkbox", label: "تیک" },
];

export const toMatrixColumns = (choices) =>
  (Array.isArray(choices) ? choices : [])
    .map((column, index) => {
      if (typeof column === "string")
        return { value: `column_${index + 1}`, label: column, type: "text" };
      if (!column || typeof column !== "object") return null;
      const label = String(column.label ?? column.value ?? "").trim();
      if (!label) return null;
      return {
        value: String(column.value ?? column.key ?? `column_${index + 1}`),
        label,
        type: column.type || "text",
        options: Array.isArray(column.options) ? column.options : [],
        width: column.width || "",
      };
    })
    .filter(Boolean);
