// =====================================================================
// کمک‌کارهای «نمایش فرم پرشده»
//
// این فایل دقیقاً معکوسِ کاری است که
// src/pages/Forms/FormRuntime/submission.js هنگام ثبت انجام می‌دهد:
// آنجا مقادیر رندرر به form_data تبدیل می‌شوند، اینجا form_data به همان
// شکلی که FormRenderer/FieldControl می‌فهمند برمی‌گردد.
// =====================================================================

import {
  DISPLAY_ONLY,
  resolveType,
} from "@/pages/Forms/FormRuntime/fieldSchema";
import { MULTI_TYPES } from "@/pages/Forms/FormRuntime/formElements";

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

const parsed = (raw) => {
  if (typeof raw !== "string") return raw;
  const text = raw.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return raw;
  try {
    return JSON.parse(text);
  } catch {
    return raw;
  }
};

/** form_data ممکن است رشتهٔ JSON باشد (بک‌اند هر دو حالت را قبول می‌کند). */
export const readFormData = (detail) => {
  const raw = parsed(detail?.form_data ?? null);
  return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
};

const fileNamesOf = (raw) => {
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return String(
        item.name ?? item.file_name ?? item.title ?? item.file ?? "",
      );
    })
    .map((name) => name.trim())
    .filter(Boolean);
};

/** یک مقدار ذخیره‌شده را به شکل مورد انتظار FieldControl برمی‌گرداند. */
export const hydrateValue = (field, raw) => {
  const type = resolveType(field);

  if (DISPLAY_ONLY.has(type)) return undefined;
  if (raw === undefined || raw === null) return undefined;

  if (type === "checkbox") return Boolean(raw);

  if (MULTI_TYPES.has(type)) {
    const list = Array.isArray(raw) ? raw : [raw];
    return list
      .map((item) =>
        item && typeof item === "object"
          ? (item.value ?? item.label ?? "")
          : item,
      )
      .filter((item) => item !== "" && item != null)
      .map(String);
  }

  // امضا در ثبت به شکل { kind, value, signed_at } ذخیره می‌شود
  if (type === "signature")
    return raw && typeof raw === "object"
      ? String(raw.value ?? "")
      : String(raw);

  // فایل‌ها به شکل [{ name }] ذخیره می‌شوند و کنترل، آرایهٔ نام می‌خواهد
  if (type === "file" || type === "multifile") return fileNamesOf(raw);

  if (type === "matrix") return Array.isArray(raw) ? raw : [];

  if (type === "sheet_table" || type === "date_signature")
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

  // تاریخ/تاریخ‌وساعت میلادی ذخیره می‌شود و خودِ DateField آن را شمسی نشان می‌دهد
  return raw;
};

/**
 * مقادیر آمادهٔ initialValues برای FormRenderer.
 *
 * نکته: خروجی از روی form_data خام ساخته می‌شود تا کلیدهای تخت
 * (مثل سلول‌های «جدول ثابت سند») هم سر جای خودشان رندر شوند.
 */
export const hydrateSubmissionValues = (categories, formData) => {
  const data = formData && typeof formData === "object" ? formData : {};
  const values = { ...data };

  flattenFields(categories).forEach((field) => {
    const name = field?.field_name ? String(field.field_name) : "";
    const id = field?.id != null ? String(field.id) : "";
    const raw =
      name && name in data
        ? data[name]
        : id && id in data
          ? data[id]
          : undefined;
    const next = hydrateValue(field, raw);
    if (next === undefined) return;

    const key = keyOf(field);
    if (key) values[key] = next;
    if (id && id !== key && id in data) values[id] = next;
  });

  return values;
};

const FORM_ID_KEYS = [
  "form_definition_id",
  "form_definition",
  "formDefinitionId",
  "definition_id",
  "definition",
  "form_id",
  "form",
  "formId",
];

const toId = (value) => {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

/** شناسهٔ تعریف فرم را از رکورد ارسال بیرون می‌کشد (هر نامی که بک‌اند بدهد). */
export const resolveFormDefinitionId = (detail) => {
  if (!detail || typeof detail !== "object") return null;

  for (const key of FORM_ID_KEYS) {
    const value = detail[key];
    const direct = toId(value);
    if (direct) return direct;
    if (value && typeof value === "object") {
      const nested = toId(value.id ?? value.pk ?? value.form_definition_id);
      if (nested) return nested;
    }
  }
  return null;
};

const collectFieldNames = (node, acc = new Set(), depth = 0) => {
  if (!node || depth > 6) return acc;
  if (Array.isArray(node)) {
    node.forEach((item) => collectFieldNames(item, acc, depth + 1));
    return acc;
  }
  if (typeof node !== "object") return acc;
  if (node.field_name) acc.add(String(node.field_name));
  Object.values(node).forEach((value) => {
    if (value && typeof value === "object")
      collectFieldNames(value, acc, depth + 1);
  });
  return acc;
};

/**
 * اگر پاسخ ارسال شناسهٔ فرم نداشت، از روی کلیدهای form_data حدس می‌زنیم؛
 * کلیدها همان field_name های تعریف فرم‌اند، پس تطبیق قابل اتکاست.
 */
export const guessFormDefinitionId = (definitions, formData) => {
  const keys = Object.keys(formData || {});
  if (!keys.length) return null;

  const list = Array.isArray(definitions)
    ? definitions
    : asCategories(definitions);
  let best = null;

  list.forEach((definition) => {
    const id = toId(definition?.id ?? definition?.form_definition_id);
    if (!id) return;
    const names = collectFieldNames(definition);
    if (!names.size) return;
    const score = keys.filter((key) => names.has(key)).length;
    if (score && (!best || score > best.score)) best = { id, score };
  });

  if (!best) return null;
  return best.score >= Math.min(2, keys.length) ? best.id : null;
};
