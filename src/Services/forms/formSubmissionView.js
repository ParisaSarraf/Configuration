/**
 * ابزارهای نمایش «فرم پرشده» (read-only) از روی تعریف فرم + مقادیر ثبت‌شده.
 * مسیر پیشنهادی: src/Services/forms/formSubmissionView.js
 */

export const EMPTY_VALUE = "—";

const FA_DATE = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const FA_DATE_TIME = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/* ---------------------------------------------------------------- schema keys */

const SECTION_CHILD_KEYS = [
  "categories",
  "sections",
  "steps",
  "pages",
  "tabs",
  "groups",
  "fieldsets",
];

const GENERIC_CHILD_KEYS = [
  "fields",
  "components",
  "items",
  "children",
  "elements",
  "rows",
  "columns",
  "inputs",
  "content",
  "blocks",
];

const CONTAINER_TYPES = new Set([
  "section",
  "category",
  "group",
  "row",
  "column",
  "columns",
  "container",
  "grid",
  "layout",
  "panel",
  "card",
  "fieldset",
  "tab",
  "step",
  "page",
  "form",
]);

export const STATIC_TYPES = new Set([
  "heading",
  "header",
  "title",
  "section-title",
  "subtitle",
  "paragraph",
  "text-block",
  "static-text",
  "description",
  "note",
  "alert",
  "divider",
  "separator",
  "hr",
  "spacer",
  "space",
  "html",
]);

const FULL_WIDTH_TYPES = new Set([
  "textarea",
  "long-text",
  "rich-text",
  "richtext",
  "editor",
  "wysiwyg",
  "table",
  "grid-table",
  "repeater",
  "list",
  "file",
  "files",
  "upload",
  "attachment",
  "signature",
  "image",
  "map",
  "description",
  "paragraph",
  "html",
  "heading",
  "divider",
]);

const BOOLEAN_TYPES = new Set([
  "checkbox",
  "switch",
  "toggle",
  "boolean",
  "yes-no",
]);

const DATE_TYPES = new Set([
  "date",
  "jalali-date",
  "persian-date",
  "datepicker",
  "date-picker",
]);

const DATE_TIME_TYPES = new Set([
  "datetime",
  "date-time",
  "datetime-local",
  "datetime-picker",
  "timestamp",
]);

const FILE_TYPES = new Set([
  "file",
  "files",
  "upload",
  "uploader",
  "attachment",
  "attachments",
]);

const IMAGE_TYPES = new Set(["image", "picture", "signature", "sign"]);

const TABLE_TYPES = new Set([
  "table",
  "grid-table",
  "repeater",
  "data-table",
  "multi-row",
]);

const SINGLE_CHOICE_TYPES = new Set([
  "select",
  "dropdown",
  "radio",
  "radio-group",
  "combobox",
  "autocomplete",
  "status",
]);

const MULTI_CHOICE_TYPES = new Set([
  "multiselect",
  "multi-select",
  "checkbox-group",
  "checkboxes",
  "tags",
  "multi",
]);

/* ------------------------------------------------------------------- helpers */

/** پاسخ‌هایی که به‌صورت آرایه‌ی تک‌عضوی برمی‌گردند (مثل get-form-submission-by-id) */
export const normalizeApiItem = (data) => {
  if (Array.isArray(data)) return data[0] ?? null;
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return data.results[0] ?? null;
  }
  return data ?? null;
};

const tryParseJson = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const hasSchemaChildren = (node) => {
  if (Array.isArray(node)) return node.length > 0;
  if (!node || typeof node !== "object") return false;
  return [...SECTION_CHILD_KEYS, ...GENERIC_CHILD_KEYS].some(
    (key) => Array.isArray(node[key]) && node[key].length > 0,
  );
};

/** تعریف فرم را از هر جایی که بک‌اند گذاشته باشد پیدا می‌کند */
export const extractFormDefinition = (...sources) => {
  for (const source of sources) {
    if (!source) continue;
    const candidates = [
      source?.form_definition,
      source?.formDefinition,
      source?.definition,
      source?.schema,
      source?.form_schema,
      source?.structure,
      source?.json_schema,
      source?.form?.form_definition,
      source?.form?.definition,
      source?.form?.schema,
      source?.form?.structure,
      typeof source?.form === "object" ? source?.form : null,
      source,
    ];
    for (const candidate of candidates) {
      const parsed = tryParseJson(candidate);
      if (parsed && typeof parsed === "object" && hasSchemaChildren(parsed)) {
        return parsed;
      }
    }
  }
  return null;
};

/** شناسه‌ی فرم برای فچ‌کردن تعریف آن */
export const extractFormId = (submission) => {
  if (!submission) return null;
  const raw =
    submission.form_id ??
    submission.formId ??
    submission.form ??
    submission.form_definition_id ??
    submission.template_id ??
    null;
  if (raw == null) return null;
  if (typeof raw === "object") {
    return raw.id ?? raw.pk ?? raw.form_id ?? null;
  }
  return raw;
};

export const extractFormTitle = (...sources) => {
  for (const source of sources) {
    const title =
      source?.form?.title ??
      source?.form?.name ??
      source?.form_title ??
      source?.title ??
      source?.name ??
      null;
    if (typeof title === "string" && title.trim()) return title.trim();
  }
  return null;
};

export const fieldType = (field) =>
  String(
    field?.type ?? field?.field_type ?? field?.component ?? field?.widget ?? "",
  )
    .trim()
    .toLowerCase();

export const fieldKeyCandidates = (field) =>
  [
    field?.name,
    field?.field_name,
    field?.key,
    field?.dataIndex,
    field?.slug,
    field?.id,
  ]
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map(String);

const isFieldLike = (node) => {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const type = fieldType(node);
  if (CONTAINER_TYPES.has(type)) return false;
  if (STATIC_TYPES.has(type)) return true;
  return Boolean(type) && fieldKeyCandidates(node).length > 0;
};

/**
 * تعریف فرم (با هر ساختاری: fields / categories / sections / rows …)
 * را به لیست تخت «بخش‌ها» تبدیل می‌کند.
 */
export const buildSections = (definition) => {
  if (!definition) return [];
  const sections = [];
  let current = null;

  const ensureSection = () => {
    if (!current) {
      current = {
        id: `section-${sections.length}`,
        title: null,
        description: null,
        fields: [],
      };
      sections.push(current);
    }
    return current;
  };

  const openSection = (child) => {
    if (!child || typeof child !== "object") return;
    const previous = current;
    current = {
      id: String(child?.id ?? child?.key ?? `section-${sections.length}`),
      title: child?.title ?? child?.label ?? child?.name ?? null,
      description: child?.description ?? child?.help ?? child?.hint ?? null,
      fields: [],
    };
    sections.push(current);
    walkChildren(child);
    current = previous;
  };

  const walkChildren = (node) => {
    SECTION_CHILD_KEYS.forEach((key) => {
      const children = node?.[key];
      if (Array.isArray(children)) children.forEach(openSection);
    });
    GENERIC_CHILD_KEYS.forEach((key) => walk(node?.[key]));
  };

  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;
    if (isFieldLike(node)) {
      ensureSection().fields.push(node);
      return;
    }
    walkChildren(node);
  };

  walk(definition);
  return sections.filter((section) => section.fields.length > 0);
};

/* --------------------------------------------------------- value <-> field */

const canonicalKey = (key) =>
  String(key ?? "")
    .toLowerCase()
    .replace(/-[a-z0-9]{5,}$/i, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "");

/** `project-name-mtxztcwl2` -> `project name` */
export const humanizeKey = (key) => {
  const raw = String(key ?? "");
  const cleaned = raw
    .replace(/-[a-z0-9]{5,}$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return cleaned || raw;
};

export const fieldLabel = (field) => {
  const label =
    field?.label ??
    field?.field_label ??
    field?.title ??
    field?.caption ??
    field?.placeholder ??
    null;
  if (typeof label === "string" && label.trim()) return label.trim();
  return humanizeKey(fieldKeyCandidates(field)[0]);
};

export const fieldOptions = (field) => {
  const raw =
    field?.options ??
    field?.items ??
    field?.choices ??
    field?.values ??
    field?.list ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map((option) =>
    option && typeof option === "object"
      ? {
          value: option.value ?? option.id ?? option.key ?? option.name,
          label: String(
            option.label ??
              option.title ??
              option.text ??
              option.name ??
              option.value ??
              "",
          ),
        }
      : { value: option, label: String(option) },
  );
};

/** مقدار ثبت‌شده‌ی یک فیلد را از form_data پیدا می‌کند (با fallback فازی) */
export const resolveFieldEntry = (field, formData) => {
  const candidates = fieldKeyCandidates(field);
  if (!formData || typeof formData !== "object") {
    return { key: candidates[0] ?? null, value: undefined, found: false };
  }
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(formData, candidate)) {
      return { key: candidate, value: formData[candidate], found: true };
    }
  }
  const dataKeys = Object.keys(formData);
  for (const candidate of candidates) {
    const target = canonicalKey(candidate);
    if (!target) continue;
    const hit = dataKeys.find((key) => canonicalKey(key) === target);
    if (hit) return { key: hit, value: formData[hit], found: true };
  }
  return { key: candidates[0] ?? null, value: undefined, found: false };
};

export const isFullWidthField = (field) => {
  const type = fieldType(field);
  if (FULL_WIDTH_TYPES.has(type)) return true;
  const span = Number(field?.colSpan ?? field?.span ?? field?.cols ?? 0);
  if (span >= 2) return true;
  const width = String(field?.width ?? field?.size ?? "").toLowerCase();
  return width === "full" || width === "100%" || width === "12";
};

export const isStaticField = (field) => STATIC_TYPES.has(fieldType(field));

export const isFileField = (field) => FILE_TYPES.has(fieldType(field));

export const isImageField = (field) => IMAGE_TYPES.has(fieldType(field));

export const isTableField = (field) => TABLE_TYPES.has(fieldType(field));

export const isMultilineField = (field) => {
  const type = fieldType(field);
  return (
    type === "textarea" ||
    type === "long-text" ||
    type === "rich-text" ||
    type === "richtext" ||
    type === "editor" ||
    type === "wysiwyg"
  );
};

/* ------------------------------------------------------------- formatting */

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

const toDate = (value) => {
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value ?? "").trim();
  if (DATE_ONLY_RE.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toJalaliDate = (value) => {
  const date = toDate(value);
  return date ? FA_DATE.format(date) : String(value ?? EMPTY_VALUE);
};

export const toJalaliDateTime = (value) => {
  const date = toDate(value);
  return date ? FA_DATE_TIME.format(date) : String(value ?? EMPTY_VALUE);
};

const toBooleanText = (value) => {
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  const text = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on", "بله"].includes(text)) return "بله";
  if (["false", "0", "no", "off", "خیر"].includes(text)) return "خیر";
  return String(value);
};

export const isEmptyValue = (value) =>
  value == null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

/** متن نمایشی یک مقدار با توجه به نوع فیلد در طراحی فرم */
export const formatFieldValue = (field, value) => {
  if (isEmptyValue(value)) return EMPTY_VALUE;
  const type = fieldType(field);

  if (BOOLEAN_TYPES.has(type) || typeof value === "boolean") {
    return toBooleanText(value);
  }

  if (SINGLE_CHOICE_TYPES.has(type) || MULTI_CHOICE_TYPES.has(type)) {
    const options = fieldOptions(field);
    const labelOf = (item) => {
      const raw =
        item && typeof item === "object"
          ? (item.value ?? item.id ?? item.key ?? item.label)
          : item;
      const match = options.find(
        (option) => String(option.value) === String(raw),
      );
      return match?.label ?? String(raw);
    };
    return Array.isArray(value)
      ? value.map(labelOf).join("، ")
      : labelOf(value);
  }

  if (DATE_TIME_TYPES.has(type)) return toJalaliDateTime(value);
  if (DATE_TYPES.has(type)) return toJalaliDate(value);

  if (typeof value === "string") {
    if (DATE_ONLY_RE.test(value.trim())) return toJalaliDate(value);
    if (DATE_TIME_RE.test(value.trim())) return toJalaliDateTime(value);
    return value;
  }

  if (typeof value === "number") {
    return type === "number" || type === "amount" || type === "currency"
      ? value.toLocaleString("en-US")
      : String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === "object"
          ? (item.label ??
            item.name ??
            item.title ??
            item.value ??
            JSON.stringify(item))
          : String(item),
      )
      .join("، ");
  }

  if (typeof value === "object") {
    return (
      value.label ??
      value.name ??
      value.title ??
      value.value ??
      JSON.stringify(value)
    );
  }

  return String(value);
};

/** مقادیری که در تعریف فرم فیلدی برایشان پیدا نشد (تا هیچ داده‌ای گم نشود) */
export const buildOrphanFields = (formData, usedKeys) => {
  if (!formData || typeof formData !== "object") return [];
  return Object.keys(formData)
    .filter((key) => !usedKeys.has(key))
    .map((key) => ({ name: key, label: humanizeKey(key), type: "text" }));
};

export const fileName = (file) => {
  if (!file) return EMPTY_VALUE;
  if (typeof file === "string") return file.split("/").pop() || file;
  return (
    file.name ??
    file.file_name ??
    file.title ??
    String(file.file ?? file.url ?? "")
      .split("/")
      .pop() ??
    `#${file.id ?? ""}`
  );
};

export const fileUrl = (file) => {
  if (!file) return null;
  if (typeof file === "string") return file;
  return (
    file.url ?? file.file ?? file.file_url ?? file.path ?? file.src ?? null
  );
};
