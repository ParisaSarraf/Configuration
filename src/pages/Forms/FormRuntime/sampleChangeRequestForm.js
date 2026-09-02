// =====================================================================
// قالب فرم رسمی «درخواست تغییرات» (SY-SE-F-003/KS-C)
// مختصات x/y/w/h روی شبکهٔ ۱۲ ستونی فرم‌ساز است (هر ردیف = 8px).
// کل ارتفاع قالب ۱۱۸ ردیف (≈ 944px) است تا در یک برگ A4
// (ارتفاع مفید ≈ 1047px) جا شود.
// دکمهٔ «درج قالب فرم رسمی» در فرم‌ساز این لیست را یک‌جا می‌سازد.
// =====================================================================

const head = (r, c, text, width) => ({
  r,
  c,
  text,
  variant: "head",
  align: "center",
  ...(width ? { width } : {}),
});

export const effectRow = (row, key, label) => [
  { r: row, c: 0, text: label, variant: "sub" },
  { r: row, c: 1, type: "checkbox", name: `${key}_yes`, align: "center" },
  { r: row, c: 2, type: "checkbox", name: `${key}_no`, align: "center" },
  { r: row, c: 3, type: "text", name: `${key}_note` },
];

export const approvalRow = (row, key, label) => [
  { r: row, c: 0, text: label, variant: "sub" },
  {
    r: row,
    c: 1,
    type: "radio_row",
    name: `${key}_opinion`,
    options: ["تایید", "رد"],
    align: "center",
  },
  { r: row, c: 2, type: "signature", name: `${key}_sign`, tall: true },
];

export const EFFECT_CELLS = [
  head(0, 0, "نوع اثر"),
  head(0, 1, "بله", "12%"),
  head(0, 2, "خیر", "12%"),
  head(0, 3, "توضیح / برآورد"),
  ...effectRow(1, "cost", "افزایش هزینه"),
  ...effectRow(2, "schedule", "تأثیر بر زمان‌بندی"),
  ...effectRow(3, "quality", "تأثیر بر کیفیت / عملکرد"),
  ...effectRow(4, "docs", "نیاز به بازنگری مستندات"),
  ...effectRow(5, "tooling", "نیاز به تغییر ابزار و قالب"),
];

export const APPROVAL_CELLS = [
  head(0, 0, "بررسی کننده"),
  head(0, 1, "نظر (تایید / رد)", "26%"),
  head(0, 2, "امضا", "30%"),
  ...approvalRow(1, "sys_eng", "واحد مهندسی سیستم"),
  ...approvalRow(2, "planning", "واحد برنامه‌ریزی و کنترل پروژه"),
  ...approvalRow(3, "design", "واحد طراحی"),
  ...approvalRow(4, "manufacturing", "واحد مهندسی ساخت"),
  ...approvalRow(5, "management", "مدیریت"),
];

const text = (name, label, x, y, extra = {}) => ({
  field_name: name,
  field_label: label,
  field_type: "text",
  x,
  y,
  w: 3,
  h: 4,
  ...extra,
});

const optionRow = (name, label, y, options) => ({
  field_name: name,
  field_label: label,
  field_type: "option_row",
  choices: options,
  x: 0,
  y,
  w: 12,
  h: 4,
});

const band = (name, label, y) => ({
  field_name: name,
  field_label: label,
  field_type: "section_band",
  x: 0,
  y,
  w: 12,
  h: 3,
});

export const CHANGE_REQUEST_TEMPLATE = [
  {
    field_name: "doc-header",
    field_label: "درخواست تغییرات",
    field_type: "doc_header",
    choices: [
      { key: "code", label: "شناسه سند", value: "SY-SE-F-003/KS-C" },
      { key: "rev", label: "تاریخ بازنگری", value: "۱۴۰۵/۰۱/۱۵" },
    ],
    x: 0,
    y: 0,
    w: 12,
    h: 8,
  },

  // ۱) اطلاعات کلی
  band("band-general", "اطلاعات کلی", 8),
  text("project-name", "نام پروژه", 0, 11, { required: true }),
  text("project-code", "کد پروژه", 3, 11),
  text("part-name", "نام قطعه", 6, 11),
  text("part-code", "کد قطعه", 9, 11),
  text("requester", "درخواست دهنده", 0, 15, { required: true }),
  text("requester-role", "سمت", 3, 15),
  { ...text("request-date", "تاریخ درخواست", 6, 15), field_type: "date" },
  { ...text("attachment", "پیوست", 9, 15), field_type: "file" },

  optionRow("part-identity", "هویت قطعه", 19, [
    "استاندارد",
    "ساخت",
    "تولید",
  ]),
  optionRow("change-reason", "دلیل تغییرات", 23, [
    "اصلاح خطا",
    "بهبود عملکرد",
    "کاهش هزینه",
    "درخواست مشتری",
    "سایر",
  ]),

  // ۲) شرح تغییر پیشنهادی
  band("band-description", "شرح تغییر پیشنهادی", 27),
  {
    field_name: "change-description",
    field_label: "شرح کامل تغییر",
    field_type: "textarea",
    placeholder: "وضعیت فعلی، وضعیت پیشنهادی و دلیل فنی را بنویسید…",
    required: true,
    x: 0,
    y: 30,
    w: 12,
    h: 12,
  },

  // ۳) اثرات تغییر
  band("band-effects", "اثرات تغییر", 42),
  {
    field_name: "effects-table",
    field_label: "جدول اثرات",
    field_type: "sheet_table",
    choices: EFFECT_CELLS,
    min_value: 6,
    max_value: 4,
    x: 0,
    y: 45,
    w: 12,
    h: 22,
  },
  optionRow("impact-scope", "محدودهٔ تأثیر", 67, [
    "فقط این قطعه",
    "مجموعهٔ مرتبط",
    "کل محصول",
  ]),

  // ۴) بررسی و تاییدات
  band("band-approvals", "بررسی و تاییدات", 71),
  {
    field_name: "approvals-table",
    field_label: "جدول تاییدات",
    field_type: "sheet_table",
    choices: APPROVAL_CELLS,
    min_value: 6,
    max_value: 3,
    x: 0,
    y: 74,
    w: 12,
    h: 32,
  },

  // ۵) نتیجهٔ نهایی
  band("band-result", "نتیجهٔ نهایی", 106),
  optionRow("final-result", "نتیجه", 109, [
    "تایید تغییر",
    "رد تغییر",
    "ارجاع به کمیتهٔ فنی",
  ]),
  {
    field_name: "final-notes",
    field_label: "توضیحات تکمیلی",
    field_type: "textarea",
    x: 0,
    y: 113,
    w: 12,
    h: 7,
  },
  {
    field_name: "distribution",
    field_label: "توزیع نسخ",
    field_type: "static_text",
    default_value:
      "توزیع نسخ: واحد مهندسی سیستم — واحد طراحی — واحد برنامه‌ریزی و کنترل پروژه — بایگانی فنی",
    x: 0,
    y: 120,
    w: 12,
    h: 3,
  },
];

export default CHANGE_REQUEST_TEMPLATE;
