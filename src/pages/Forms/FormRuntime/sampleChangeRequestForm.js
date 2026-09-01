// قالب آمادهٔ فرم رسمی «درخواست تغییرات» (SY-SE-F-003/KS-C)
// مختصات براساس همان شبکهٔ ۱۲ ستونی فرم‌ساز است (یک برگ A4).

const text = (name, label, x, y, w, h = 4, extra = {}) => ({
  field_name: name,
  field_label: label,
  field_type: "text",
  x,
  y,
  w,
  h,
  required: false,
  choices: [],
  ...extra,
});

const band = (name, label, y) => ({
  field_name: name,
  field_label: label,
  field_type: "section_band",
  x: 0,
  y,
  w: 12,
  h: 3,
  choices: [],
});

const optionRow = (name, label, y, options, { x = 0, w = 12, h = 4 } = {}) => ({
  field_name: name,
  field_label: label,
  field_type: "option_row",
  x,
  y,
  w,
  h,
  choices: options,
});

const head = (r, c, label, width) => ({
  r,
  c,
  text: label,
  type: "static",
  variant: "head",
  width,
});

const effectRow = (r, label, key) => [
  { r, c: 0, text: label, type: "static", variant: "sub", align: "right" },
  { r, c: 1, type: "checkbox", name: `${key}_yes` },
  { r, c: 2, type: "checkbox", name: `${key}_no` },
  { r, c: 3, type: "text", name: `${key}_note` },
];

const approvalRow = (r, label, key) => [
  { r, c: 0, text: label, type: "static", variant: "sub", align: "right" },
  { r, c: 1, type: "text", name: `${key}_opinion` },
  { r, c: 2, type: "sign", name: `${key}_sign`, tall: true },
];

export const CHANGE_REQUEST_TEMPLATE = [
  {
    field_name: "doc-header",
    field_label: "درخواست تغییرات",
    field_type: "doc_header",
    x: 0,
    y: 0,
    w: 12,
    h: 8,
    default_value: "",
    choices: [
      { key: "code", label: "شناسه سند", value: "SY-SE-F-003/KS-C" },
      { key: "rev", label: "تاریخ بازنگری", value: "۱۴۰۵/۰۱/۱۵" },
    ],
  },

  band("band-general", "اطلاعات کلی", 8),
  text("project-name", "نام پروژه", 0, 11, 3, 4, { required: true }),
  text("project-code", "کد پروژه", 3, 11, 3),
  text("part-name", "نام قطعه", 6, 11, 3),
  text("part-code", "کد قطعه", 9, 11, 3),
  text("requester", "درخواست‌دهنده", 0, 15, 3, 4, { required: true }),
  text("requester-role", "سمت", 3, 15, 3),
  text("request-date", "تاریخ درخواست", 6, 15, 3, 4, {
    field_type: "date",
  }),
  optionRow("attachment", "پیوست", 15, ["دارد", "ندارد"], { x: 9, w: 3 }),

  optionRow("part-identity", "هویت قطعه", 19, [
    "استاندارد",
    "ساخت داخل",
    "خرید خارج",
    "تولید انبوه",
  ]),
  optionRow("change-reason", "دلیل تغییر", 23, [
    "اصلاح طراحی",
    "درخواست مشتری",
    "بهبود ساخت",
    "رفع عدم انطباق",
    "کاهش هزینه",
    "سایر",
  ]),

  band("band-description", "شرح تغییر پیشنهادی", 27),
  {
    field_name: "change-description",
    field_label: "شرح کامل تغییر",
    field_type: "textarea",
    placeholder: "وضعیت فعلی، وضعیت پیشنهادی و دلیل فنی را بنویسید…",
    x: 0,
    y: 30,
    w: 12,
    h: 12,
    required: true,
    choices: [],
  },

  band("band-effects", "اثرات تغییر", 42),
  {
    field_name: "effects-table",
    field_label: "جدول اثرات",
    field_type: "sheet_table",
    x: 0,
    y: 45,
    w: 12,
    h: 22,
    min_value: 6,
    max_value: 4,
    choices: [
      head(0, 0, "نوع اثر", "32%"),
      head(0, 1, "بله", "9%"),
      head(0, 2, "خیر", "9%"),
      head(0, 3, "توضیح / برآورد", "50%"),
      ...effectRow(1, "هزینه", "cost"),
      ...effectRow(2, "زمان‌بندی", "schedule"),
      ...effectRow(3, "کیفیت و عملکرد", "quality"),
      ...effectRow(4, "مستندات و نقشه‌ها", "docs"),
      ...effectRow(5, "ابزار و قالب", "tooling"),
    ],
  },
  optionRow("impact-scope", "محدودهٔ تأثیر", 67, [
    "فقط همین قطعه",
    "مجموعه",
    "محصول نهایی",
    "مستندات",
    "فرآیند ساخت",
  ]),

  band("band-approvals", "بررسی و تاییدات", 71),
  {
    field_name: "approvals-table",
    field_label: "جدول تاییدات",
    field_type: "sheet_table",
    x: 0,
    y: 74,
    w: 12,
    h: 32,
    min_value: 6,
    max_value: 3,
    choices: [
      head(0, 0, "بررسی کننده", "38%"),
      head(0, 1, "نظر / تایید یا رد", "36%"),
      head(0, 2, "امضا", "26%"),
      ...approvalRow(1, "واحد مهندسی سیستم", "sys_eng"),
      ...approvalRow(2, "واحد برنامه‌ریزی و کنترل پروژه", "planning"),
      ...approvalRow(3, "واحد طراحی", "design"),
      ...approvalRow(4, "واحد مهندسی ساخت", "manufacturing"),
      ...approvalRow(5, "مدیریت", "management"),
    ],
  },

  band("band-result", "نتیجه نهایی", 106),
  optionRow("final-result", "نتیجه بررسی", 109, [
    "تأیید می‌شود",
    "تأیید مشروط",
    "رد می‌شود",
    "نیاز به بررسی مجدد",
  ]),
  {
    field_name: "final-notes",
    field_label: "توضیحات تکمیلی",
    field_type: "textarea",
    x: 0,
    y: 113,
    w: 12,
    h: 7,
    choices: [],
  },
  {
    field_name: "distribution",
    field_label: "توزیع نسخ",
    field_type: "static_text",
    default_value:
      "توزیع نسخ: مهندسی سیستم · برنامه‌ریزی و کنترل پروژه · طراحی · مهندسی ساخت · مدیریت",
    x: 0,
    y: 120,
    w: 12,
    h: 3,
    choices: [],
  },
];

export default CHANGE_REQUEST_TEMPLATE;
