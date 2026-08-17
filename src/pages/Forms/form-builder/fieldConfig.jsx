import {
  AlignLeft,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Hash,
  Star,
  Type,
  UploadCloud,
} from "lucide-react";

export const FIELD_TYPES = [
  { type: "shortText", label: "متن کوتاه", description: "پاسخ یک‌خطی", icon: Type },
  { type: "longText", label: "متن بلند", description: "پاسخ چندخطی", icon: AlignLeft },
  { type: "select", label: "لیست کشویی", description: "انتخاب یک گزینه", icon: ChevronDown },
  { type: "checkbox", label: "چک‌باکس", description: "تأیید یا انتخاب", icon: CheckSquare },
  { type: "file", label: "بارگذاری فایل", description: "سند یا تصویر", icon: UploadCloud },
  { type: "number", label: "عدد", description: "مقدار عددی", icon: Hash },
  { type: "rating", label: "امتیازدهی", description: "مقیاس ستاره‌ای", icon: Star },
  { type: "date", label: "تاریخ", description: "انتخاب روز", icon: CalendarDays },
];

const FIELD_DEFAULTS = {
  shortText: { label: "نام و نام خانوادگی", placeholder: "پاسخ خود را وارد کنید" },
  longText: { label: "درباره تجربه خود بنویسید", placeholder: "کمی بیشتر توضیح دهید..." },
  select: { label: "حوزه مورد علاقه", placeholder: "یک گزینه را انتخاب کنید", options: ["طراحی محصول", "مهندسی نرم‌افزار", "مدیریت محصول"] },
  checkbox: { label: "شرایط همکاری را مطالعه کرده‌ام", placeholder: "" },
  file: { label: "رزومه خود را بارگذاری کنید", placeholder: "" },
  number: { label: "سابقه کاری", placeholder: "مثلاً ۵", suffix: "سال" },
  rating: { label: "تجربه خود را ارزیابی کنید", placeholder: "", maxRating: 5 },
  date: { label: "تاریخ شروع همکاری", placeholder: "انتخاب تاریخ" },
};

export const createField = (type, overrides = {}) => ({
  id: crypto.randomUUID?.() || `field-${Date.now()}-${Math.random()}`,
  type,
  label: FIELD_DEFAULTS[type]?.label || "فیلد جدید",
  placeholder: FIELD_DEFAULTS[type]?.placeholder || "",
  helperText: "",
  required: false,
  validation: "none",
  minLength: 0,
  maxLength: 200,
  fieldName: "",
  defaultValue: "",
  cssClass: "",
  regexValidation: "",
  regexErrorMessage: "",
  allowedExtensions: "pdf,doc,docx,jpg,jpeg,png",
  maxFileSizeMb: 10,
  ...FIELD_DEFAULTS[type],
  ...overrides,
});

export const INITIAL_FIELDS = [
  createField("shortText", {
    label: "نام و نام خانوادگی",
    required: true,
    helperText: "نام خود را مطابق مدارک رسمی وارد کنید.",
  }),
  createField("select", {
    label: "برای کدام موقعیت درخواست می‌دهید؟",
    required: true,
  }),
  createField("longText", {
    label: "چرا دوست دارید با ما همکاری کنید؟",
    maxLength: 500,
  }),
];

export const getFieldMeta = (type) => FIELD_TYPES.find((item) => item.type === type) || FIELD_TYPES[0];
