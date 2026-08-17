const FIELD_TYPE_MAP = Object.freeze({
  shortText: "text",
  longText: "textarea",
  select: "select",
  checkbox: "checkbox",
  file: "file",
  number: "number",
  rating: "rating",
  date: "date",
});

const integer = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const nullableNumber = (value) => value === "" || value == null ? 0 : Number(value) || 0;

const idList = (value) => (Array.isArray(value) ? value : [])
  .map(Number)
  .filter((id) => Number.isInteger(id) && id > 0);

const VALIDATION_PATTERNS = Object.freeze({
  email: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  url: "^https?:\\/\\/[^\\s]+$",
  phone: "^\\+?[0-9۰-۹٠-٩]{7,15}$",
});

export const resolveValidationPattern = (field) => field.regexValidation || VALIDATION_PATTERNS[field.validation] || "";

// Django's default SlugField/validate_slug only accepts [-a-zA-Z0-9_]. Persian text
// (form titles, field labels) must be transliterated to Latin before slugifying,
// otherwise the backend rejects it with "Enter a valid slug ...".
const PERSIAN_TRANSLITERATION_MAP = Object.freeze({
  "آ": "a", "ا": "a", "أ": "a", "إ": "a", "ب": "b", "پ": "p", "ت": "t", "ث": "s",
  "ج": "j", "چ": "ch", "ح": "h", "خ": "kh", "د": "d", "ذ": "z", "ر": "r", "ز": "z",
  "ژ": "zh", "س": "s", "ش": "sh", "ص": "s", "ض": "z", "ط": "t", "ظ": "z", "ع": "a",
  "غ": "gh", "ف": "f", "ق": "gh", "ک": "k", "ك": "k", "گ": "g", "ل": "l", "م": "m",
  "ن": "n", "و": "v", "ه": "h", "ة": "h", "ی": "y", "ي": "y", "ئ": "y", "ء": "a",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
});

const transliterate = (value) => Array.from(value)
  .map((char) => PERSIAN_TRANSLITERATION_MAP[char] ?? char)
  .join("");

export const slugify = (value = "", fallbackPrefix = "item") => {
  const base = transliterate(String(value))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // If nothing Latin/ASCII survived (e.g. label was emoji/punctuation only),
  // fall back to a deterministic-but-unique ASCII slug instead of sending
  // an invalid/empty slug to the API.
  return base || `${fallbackPrefix}-${Date.now().toString(36)}`;
};

export const toCategoryPayload = (values) => ({
  name: String(values.name || "").trim(),
  slug: slugify(values.slug || values.name, "category"),
  description: String(values.description || "").trim(),
  order: integer(values.order),
  is_collapsed_by_default: Boolean(values.is_collapsed_by_default),
  icon: String(values.icon || "").trim(),
  allowed_groups: idList(values.allowed_groups),
});

export const toDefinitionPayload = (values, categoryId) => ({
  category_id: integer(categoryId),
  created_by_id: integer(values.created_by_id),
  name: String(values.name || "").trim(),
  slug: slugify(values.slug || values.name, "form"),
  description: String(values.description || "").trim(),
  is_active: values.is_active !== false,
  version: integer(values.version, 1),
  close_date: values.close_date?.toISOString?.() || String(values.close_date || ""),
  max_submissions: integer(values.max_submissions),
  enable_auto_save: values.enable_auto_save !== false,
  auto_save_interval: integer(values.auto_save_interval),
  success_message: String(values.success_message || "").trim(),
  success_redirect_url: String(values.success_redirect_url || "").trim(),
  submit_groups: idList(values.submit_groups),
  view_groups: idList(values.view_groups),
});

export const toFieldPayload = (field, formDefinitionId, order) => ({
  form_definition_id: integer(formDefinitionId),
  field_name: slugify(field.fieldName || field.label || `field-${order + 1}`, "field"),
  field_label: String(field.label || "").trim(),
  field_type: FIELD_TYPE_MAP[field.type] || String(field.type || "text"),
  order: integer(order),
  help_text: String(field.helperText || "").trim(),
  placeholder: String(field.placeholder || "").trim(),
  default_value: String(field.defaultValue || ""),
  css_class: String(field.cssClass || ""),
  required: Boolean(field.required),
  min_value: nullableNumber(field.min),
  max_value: nullableNumber(field.max),
  min_length: integer(field.minLength),
  max_length: integer(field.maxLength),
  regex_validation: String(resolveValidationPattern(field)),
  regex_error_message: String(field.regexErrorMessage || (field.validation && field.validation !== "none" ? "فرمت مقدار واردشده معتبر نیست." : "")),
  choices: JSON.stringify(field.options || []),
  allowed_extensions: String(field.allowedExtensions || ""),
  max_file_size_mb: nullableNumber(field.maxFileSizeMb),
});

export const toSubmissionPayload = ({ formDefinitionId, submitterId, values, attachments = [] }) => ({
  form_definition_id: integer(formDefinitionId),
  submiter_id: integer(submitterId),
  form_data: JSON.stringify(values),
  attachments: JSON.stringify(attachments),
});

export const readFilesAsAttachments = async (fileMap, maxTotalBytes = 8 * 1024 * 1024) => {
  const entries = Object.entries(fileMap).flatMap(([fieldName, files]) => (
    (files || []).map((item) => ({ fieldName, file: item.originFileObj || item }))
  ));
  const totalBytes = entries.reduce((sum, entry) => sum + (entry.file?.size || 0), 0);
  if (totalBytes > maxTotalBytes) throw new Error("حجم مجموع فایل‌ها برای ارسال متنی نباید بیشتر از ۸ مگابایت باشد.");

  return Promise.all(entries.map(({ fieldName, file }) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      field_name: fieldName,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      data_url: reader.result,
    });
    reader.onerror = () => reject(new Error(`خواندن فایل «${file.name}» ممکن نبود.`));
    reader.readAsDataURL(file);
  })));
};

export { FIELD_TYPE_MAP };