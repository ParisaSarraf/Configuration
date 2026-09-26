// =====================================================================
// کمک‌کارهای «نمایش فرم پرشده» در کارتابل
//
// این فایل دقیقاً معکوس کاری است که
// src/pages/Forms/FormRuntime/submission.js هنگام ثبت انجام می‌دهد:
// آنجا مقادیر رندرر به form_data تبدیل می‌شوند، اینجا form_data به همان
// شکلی برمی‌گردد که FormRenderer / FieldControl می‌فهمند.
// =====================================================================

import {
  DISPLAY_ONLY,
  resolveType,
} from "@/pages/Forms/FormRuntime/fieldSchema";
import { MULTI_TYPES } from "@/pages/Forms/FormRuntime/formElements";

const has = (collection, value) => {
  if (collection instanceof Set) return collection.has(value);
  if (Array.isArray(collection)) return collection.includes(value);
  return false;
};

/* ------------------------- نرمال‌سازی پاسخ API ------------------------- */

/** بعضی اندپوینت‌ها (مثل get-form-submission-by-id) آرایهٔ تک‌عضوی می‌دهند. */
export const normalizeApiItem = (payload) => {
  if (Array.isArray(payload))
    return payload.find((item) => item && typeof item === "object") ?? null;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results))
      return normalizeApiItem(payload.results);
    return payload;
  }
  return null;
};

export const asArray = (payload) => {
  if (Array.isArray(payload)) return payload.filter(Boolean);
  if (Array.isArray(payload?.results)) return payload.results.filter(Boolean);
  return payload && typeof payload === "object" ? [payload] : [];
};

/** پاسخ get-form-definition/{id} گاهی آرایه و گاهی یک آبجکت است. */
export const asCategories = (payload) => {
  if (Array.isArray(payload)) return payload.filter(Boolean);
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) return payload.results.filter(Boolean);
    if (Array.isArray(payload.categories))
      return payload.categories.filter(Boolean);
    return [payload];
  }
  return [];
};

export const flattenFields = (categories) =>
  (categories || []).flatMap((item) =>
    Array.isArray(item?.fields) ? item.fields : [],
  );

/** همان کلیدی که FormRenderer با آن مقدار هر فیلد را می‌خواند. */
export const keyOf = (field) => field?.field_name || String(field?.id ?? "");

const parsedJson = (raw) => {
  if (typeof raw !== "string") return raw;
  const text = raw.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return raw;
  try {
    return JSON.parse(text);
  } catch {
    return raw;
  }
};

/** form_data ممکن است آبجکت یا رشتهٔ JSON باشد (بک‌اند هر دو را قبول دارد). */
export const readFormData = (detail) => {
  const raw = parsedJson(detail?.form_data ?? null);
  return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
};

/* --------------------------- برگرداندن مقادیر --------------------------- */

const TRUTHY = new Set(["1", "true", "on", "yes", "بله", "دارد", "✓"]);

const splitList = (raw) =>
  String(raw)
    .split(/[،,]|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const fileNamesOf = (raw) => {
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return item.name || item.file_name || item.title || item.file || "";
    })
    .filter(Boolean);
};

const asText = (raw) => {
  if (raw == null) return "";
  if (Array.isArray(raw)) return raw.map((item) => asText(item)).join("، ");
  if (typeof raw === "boolean") return raw ? "بله" : "خیر";
  if (typeof raw === "object") return JSON.stringify(raw);
  return String(raw);
};

const matrixRowsOf = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];

  return Object.entries(raw)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([, row]) => {
      if (row && typeof row === "object" && !Array.isArray(row)) return row;
      if (typeof row !== "string") return null;
      try {
        const parsed = JSON.parse(row);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};

/** یک مقدار ذخیره‌شده را به شکل مورد انتظار همان نوع فیلد برمی‌گرداند. */
export const hydrateValue = (field, raw) => {
  const type = resolveType(field);
  const value = parsedJson(raw);

  if (has(MULTI_TYPES, type))
    return Array.isArray(value) ? value.map(asText) : splitList(asText(value));

  if (type === "checkbox") {
    if (typeof value === "boolean") return value;
    return TRUTHY.has(
      String(value ?? "")
        .trim()
        .toLowerCase(),
    ) || String(value ?? "").trim() === "بله"
      ? true
      : false;
  }

  if (type === "file" || type === "multifile" || type === "spreadsheet")
    return fileNamesOf(value);

  if (type === "signature") {
    if (value && typeof value === "object")
      return asText(value.value ?? value.text ?? value.name ?? "");
    return asText(value);
  }

  if (type === "matrix") return matrixRowsOf(value);

  // امضا+تاریخ به شکل آبجکت ذخیره می‌شود و همان‌طور مصرف می‌شود.
  if (type === "date_signature")
    return value && typeof value === "object" ? value : {};

  if (
    type === "number" ||
    type === "decimal" ||
    type === "currency" ||
    type === "slider" ||
    type === "rating"
  )
    return value === "" || value == null ? "" : Number(value);

  // تاریخ‌ها دست‌نخورده می‌مانند؛ DateField خودش میلادی را شمسی نشان می‌دهد.
  return asText(value);
};

/**
 * مقدار هر فیلد فرم را از form_data برمی‌دارد.
 * کلیدهای تخت (سلول‌های «جدول ثابت سند») هم حفظ می‌شوند، چون
 * SheetTable مقدارها را با نام سلول از همین آبجکت می‌خواند.
 */
export const hydrateSubmissionValues = (categories, formData) => {
  const source = formData && typeof formData === "object" ? formData : {};
  const values = { ...source };

  flattenFields(categories).forEach((field) => {
    const type = resolveType(field);
    if (has(DISPLAY_ONLY, type)) return;
    const key = keyOf(field);
    if (!key || !(key in source)) return;
    values[key] = hydrateValue(field, source[key]);
  });

  return values;
};

/* ----------------------- پیدا کردن فرمِ این ارسال ----------------------- */

const FORM_ID_KEYS = [
  "form_definition_id",
  "form_definition",
  "formDefinitionId",
  "definition_id",
  "definition",
  "form_id",
  "formId",
  "form",
];

/** شناسهٔ فرم را از خود رکورد ارسال بیرون می‌کشد (اگر بک‌اند فرستاده باشد). */
export const resolveFormDefinitionId = (record) => {
  if (!record || typeof record !== "object") return null;
  for (const key of FORM_ID_KEYS) {
    const value = record[key];
    if (value == null) continue;
    if (typeof value === "object") {
      if (value.id != null) return value.id;
      continue;
    }
    if (typeof value === "number") return value;
    const text = String(value).trim();
    if (/^\d+$/.test(text)) return Number(text);
  }
  return null;
};

/** همهٔ field_name های یک تعریف فرم (شامل سلول‌های جدول سند). */
const fieldNamesOf = (definition) => {
  const names = new Set();
  const walk = (node, depth) => {
    if (!node || depth > 6) return;
    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, depth + 1));
      return;
    }
    if (typeof node !== "object") return;
    if (typeof node.field_name === "string" && node.field_name)
      names.add(node.field_name);
    if (typeof node.name === "string" && node.r != null) names.add(node.name);
    if (Array.isArray(node.fields)) walk(node.fields, depth + 1);
    if (Array.isArray(node.categories)) walk(node.categories, depth + 1);
    if (Array.isArray(node.choices)) walk(node.choices, depth + 1);
  };
  walk(definition, 0);
  return names;
};

/**
 * تا وقتی بک‌اند form_definition_id را برنگرداند، فرم را از روی
 * هم‌پوشانی کلیدهای form_data با field_name های هر فرم حدس می‌زنیم.
 */
export const matchFormDefinitionId = (definitions, formData) => {
  const keys = Object.keys(formData || {});
  if (!keys.length) return null;

  let best = null;
  asArray(definitions).forEach((definition) => {
    const id = definition?.id;
    if (id == null) return;
    const names = fieldNamesOf(definition);
    if (!names.size) return;
    const score = keys.reduce(
      (sum, key) => (names.has(key) ? sum + 1 : sum),
      0,
    );
    if (!best || score > best.score) best = { id, score };
  });

  if (!best) return null;
  return best.score >= Math.min(2, keys.length) ? best.id : null;
};

/* ------------- ساخت فرم موقت از خود مقادیر (آخرین راه) ------------- */

const RANDOM_SUFFIX = /[-_][a-z0-9]*\d[a-z0-9]*$/i;
const DATETIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const JALALI_DATE = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
const TIME_ONLY = /^\d{1,2}:\d{2}(:\d{2})?$/;

const humanize = (key) => {
  const text = String(key)
    .replace(RANDOM_SUFFIX, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return text || String(key);
};

const guessType = (value) => {
  if (typeof value === "boolean") return "checkbox";
  const text = asText(value);
  if (DATETIME.test(text)) return "datetime";
  if (DATE_ONLY.test(text) || JALALI_DATE.test(text)) return "date";
  if (TIME_ONLY.test(text)) return "time";
  if (text.length > 80 || text.includes("\n")) return "textarea";
  return "text";
};

const layoutToken = (x, y, w, h) =>
  `form-studio-x:${x} form-studio-y:${y} form-studio-w:${w} form-studio-h:${h}`;

/**
 * اگر ساختار اصلی فرم در دسترس نباشد، از کلیدهای form_data یک فرم
 * موقت می‌سازیم تا همان رندرر، «برچسب + مقدار» را در جای خودش نشان دهد.
 */
export const synthesizeCategories = (formData, label = "مقادیر ثبت‌شده") => {
  const keys = Object.keys(formData || {});
  if (!keys.length) return [];

  let x = 0;
  let y = 0;
  let rowHeight = 0;

  const fields = keys.map((key, index) => {
    const type = guessType(formData[key]);
    const w = type === "textarea" ? 12 : 6;
    const h = type === "textarea" ? 12 : 7;

    if (x + w > 12) {
      x = 0;
      y += rowHeight + 2;
      rowHeight = 0;
    }

    const field = {
      id: `submission-field-${index + 1}`,
      field_name: key,
      field_label: humanize(key),
      field_type: type,
      is_required: false,
      order: index,
      css_class: layoutToken(x, y, w, h),
    };

    x += w;
    rowHeight = Math.max(rowHeight, h);
    if (x >= 12) {
      x = 0;
      y += rowHeight + 2;
      rowHeight = 0;
    }

    return field;
  });

  return [{ id: "submission-view", name: label, fields }];
};
