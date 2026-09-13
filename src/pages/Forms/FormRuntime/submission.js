import { DISPLAY_ONLY, canonicalType } from "./fieldSchema";
import { MULTI_TYPES } from "./formElements";
import {
  jalaliDateTimeToGeorgianDateTime,
  jalaliDateToGeorgianDate,
} from "../../../utils/timeTool";
import { getAuthDataFromToken } from "../../../utils/ExportFromToken";

const JALALI_DATE = /^\d{4}\/\d{1,2}\/\d{1,2}/;

const ok = (text) =>
  text && !String(text).includes("Invalid") ? String(text) : "";

const toGregorianISO = (text, type) => {
  if (!JALALI_DATE.test(text)) return text;
  const [datePart, timePart] = text.split(/[T ]/);
  if (type === "datetime")
    return ok(
      jalaliDateTimeToGeorgianDateTime(`${datePart}T${timePart || "00:00"}`),
    );
  return ok(jalaliDateToGeorgianDate(datePart));
};

const NUMERIC = new Set(["number", "decimal", "currency", "slider", "rating"]);

const toNumber = (raw) => {
  if (raw === "" || raw == null) return null;
  const parsed = Number(
    String(raw)
      .replace(/[\u066b\u060c,]/g, ".")
      .replace(/[^0-9.\-]/g, ""),
  );
  return Number.isFinite(parsed) ? parsed : null;
};

const isBlank = (value) =>
  value == null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

export const normalizeValue = (field, raw) => {
  const type = canonicalType(field?.field_type);

  if (DISPLAY_ONLY.has(type)) return undefined;
  if (raw === undefined) return undefined;

  if (type === "checkbox") return Boolean(raw);

  if (NUMERIC.has(type)) return toNumber(raw);

  if (MULTI_TYPES.has(type))
    return (Array.isArray(raw) ? raw : [raw]).filter(
      (item) => item !== "" && item != null,
    );

  if (type === "matrix") {
    const rows = Array.isArray(raw) ? raw : [];
    const clean = rows
      .map((row) =>
        Object.entries(row || {}).reduce((acc, [key, cell]) => {
          if (cell === "" || cell == null) return acc;
          return { ...acc, [key]: cell };
        }, {}),
      )
      .filter((row) => Object.keys(row).length > 0);
    return clean.length ? clean : null;
  }

  if (type === "sheet_table" || type === "date_signature") {
    const cells = raw && typeof raw === "object" ? raw : {};
    const clean = Object.entries(cells).reduce((acc, [key, cell]) => {
      if (cell === "" || cell == null || cell === false) return acc;
      return { ...acc, [key]: cell };
    }, {});
    return Object.keys(clean).length ? clean : null;
  }

  if (type === "signature") {
    const text = String(raw || "").trim();
    if (!text) return null;
    return { kind: "typed", value: text, signed_at: new Date().toISOString() };
  }

  if (type === "file" || type === "multifile") {
    const names = Array.isArray(raw)
      ? raw
      : String(raw || "")
          .split("،")
          .map((item) => item.trim())
          .filter(Boolean);
    return names.length ? names.map((name) => ({ name })) : null;
  }

  if (type === "date" || type === "datetime") {
    const text = String(raw || "").trim();
    if (!text) return null;
    return toGregorianISO(text, type) || null;
  }

  return typeof raw === "string" ? raw.trim() : raw;
};

export const buildFormData = (fields, values) =>
  (fields || []).reduce((data, field) => {
    const key = field.field_name || String(field.id || "");
    if (!key) return data;
    const normalized = normalizeValue(field, values?.[key]);
    if (normalized === undefined || isBlank(normalized)) return data;
    return { ...data, [key]: normalized };
  }, {});

const toPositiveInt = (raw) => {
  if (raw == null || raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};


export const resolveSubmitterId = (submitterId, token) => {
  const explicit = toPositiveInt(submitterId);
  if (explicit != null) return explicit;

  const auth = getAuthDataFromToken(token);
  return toPositiveInt(auth?.user_id ?? auth?.id);
};

/**
 * پیلود کامل برای /forms/add-form-submission/
 *
 * @param {object}   args
 * @param {number}   args.formDefinitionId شناسهٔ تعریف فرم (همان id اصلی)
 * @param {Array}    args.fields           فیلدهای تخت‌شدهٔ فرم
 * @param {object}   args.values           مقادیر خام رندرر
 * @param {number}  [args.submitterId]     اگر ندهید از توکن خوانده می‌شود
 * @param {boolean} [args.stringifyFormData=false] اگر true بدهید رشتهٔ JSON می‌رود
 */
export const buildSubmissionPayload = ({
  formDefinitionId,
  fields,
  values,
  submitterId,
  stringifyFormData = false,
}) => {
  const formData = buildFormData(fields, values);
  const submitter = resolveSubmitterId(submitterId);

  return {
    form_definition_id: Number(formDefinitionId) || null,
    ...(submitter != null ? { submitter_id: submitter } : {}),
    form_data: stringifyFormData ? JSON.stringify(formData) : formData,
  };
};

export const flattenFields = (categories) =>
  (categories || []).flatMap((item) => item.fields || []);
