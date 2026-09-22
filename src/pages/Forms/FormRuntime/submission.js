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


const isBrowserFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

export const toRawFile = (item) => {
  if (isBrowserFile(item)) return item;
  const nested = item?.originFileObj ?? item?.file;
  return isBrowserFile(nested) ? nested : null;
};

export const fileItemsOf = (raw) => {
  if (Array.isArray(raw))
    return raw.filter((item) => item != null && item !== "");
  if (raw == null || raw === "") return [];
  if (typeof raw === "string")
    return raw
      .split("،")
      .map((item) => item.trim())
      .filter(Boolean);
  return [raw];
};

export const realFilesOf = (raw) =>
  fileItemsOf(raw).map(toRawFile).filter(Boolean);

export const fileDescriptor = (file) => ({
  name: file.name,
  size: file.size,
  type: file.type || "application/octet-stream",
});

const FILE_FIELD_TYPES = new Set(["file", "multifile"]);

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

  if (FILE_FIELD_TYPES.has(type)) {
    const items = fileItemsOf(raw)
      .map((item) => {
        const file = toRawFile(item);
        if (file) return fileDescriptor(file);
        if (typeof item === "string") return { name: item };
        return item && typeof item === "object" ? item : null;
      })
      .filter(Boolean);
    return items.length ? items : null;
  }

  if (type === "date" || type === "datetime") {
    const text = String(raw || "").trim();
    if (!text) return null;
    return toGregorianISO(text, type) || null;
  }

  return typeof raw === "string" ? raw.trim() : raw;
};

export const toStringValue = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  if (Array.isArray(value))
    return value
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "object")
          return String(item.name ?? item.file_name ?? JSON.stringify(item));
        return String(item);
      })
      .filter(Boolean)
      .join("، ");

  if (typeof value === "object") {
    if (value.name || value.file_name)
      return String(value.name ?? value.file_name);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const STRUCTURED_VALUE_TYPES = new Set([
  "matrix",
  "sheet_table",
  "date_signature",
]);

export const buildFormData = (
  fields,
  values,
  { includeFiles = true, stringifyValues = true } = {},
) =>
  (fields || []).reduce((data, field) => {
    const key = field.field_name || String(field.id || "");
    if (!key) return data;

    const type = canonicalType(field?.field_type);
    const isFile = FILE_FIELD_TYPES.has(type);
    if (isFile && !includeFiles) return data;

    const normalized = normalizeValue(field, values?.[key]);
    if (normalized === undefined || isBlank(normalized)) return data;

    if (isFile) {
      const names = toStringValue(normalized);
      return names ? { ...data, [key]: names } : data;
    }

    // Structured controls must remain real JSON values, not escaped strings.
    if (STRUCTURED_VALUE_TYPES.has(type)) {
      return { ...data, [key]: normalized };
    }

    const output = stringifyValues ? toStringValue(normalized) : normalized;
    if (output === "") return data;
    return { ...data, [key]: output };
  }, {});


export const collectFileEntries = (fields, values) =>
  (fields || []).flatMap((field) => {
    if (!FILE_FIELD_TYPES.has(canonicalType(field?.field_type))) return [];
    const key = field.field_name || String(field.id || "");
    const fieldId = Number(field.id);
    return realFilesOf(values?.[key]).map((file) => ({
      fieldId: Number.isFinite(fieldId) && fieldId > 0 ? fieldId : null,
      fieldName: key,
      fieldLabel: field.field_label || key,
      file,
    }));
  });

export const isFileField = (field) =>
  FILE_FIELD_TYPES.has(canonicalType(field?.field_type));

export const fileFieldsOf = (fields) => (fields || []).filter(isFileField);

export const checkFileFields = (fields, values) =>
  fileFieldsOf(fields).flatMap((field) => {
    const key = field.field_name || String(field.id || "");
    const label = field.field_label || key;
    const files = realFilesOf(values?.[key]);
    const problems = [];

    if (field.is_required && !files.length)
      problems.push(`«${label}»: انتخاب فایل الزامی است.`);

    const fieldId = Number(field.id);
    if (files.length && !(Number.isFinite(fieldId) && fieldId > 0))
      problems.push(
        `«${label}»: این فیلد شناسهٔ معتبری روی سرور ندارد؛ ابتدا فرم را ذخیره/همگام کنید تا فایل قابل ارسال شود.`,
      );

    return problems;
  });

/** بررسی پسوند و حجم مجاز پیش از آپلود، بر اساس تنظیمات خودِ فیلد. */
export const checkFileLimits = (fields, values) =>
  (fields || []).flatMap((field) => {
    if (!FILE_FIELD_TYPES.has(canonicalType(field?.field_type))) return [];
    const key = field.field_name || String(field.id || "");
    const label = field.field_label || key;
    const allowed = String(field.allowed_extensions || "")
      .split(/[,،\s]+/)
      .filter(Boolean)
      .map((item) => item.replace(/^\./, "").toLowerCase());
    const maxMb = Number(field.max_file_size_mb) || 0;
    const maxBytes = maxMb > 0 ? maxMb * 1024 * 1024 : 0;

    return realFilesOf(values?.[key]).flatMap((file) => {
      const extension = String(file.name || "")
        .split(".")
        .pop()
        .toLowerCase();
      const problems = [];
      if (allowed.length && !allowed.includes(extension))
        problems.push(
          `«${label}»: پسوند فایل «${file.name}» مجاز نیست (مجاز: ${allowed.join("، ")}).`,
        );
      if (maxBytes && file.size > maxBytes)
        problems.push(
          `«${label}»: حجم فایل «${file.name}» از ${maxMb} مگابایت بیشتر است.`,
        );
      return problems;
    });
  });


export const validateFiles = (fields, values) => [
  ...checkFileFields(fields, values),
  ...checkFileLimits(fields, values),
];

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

export const STRINGIFY_FORM_DATA = false;

export const buildSubmissionPayload = ({
  formDefinitionId,
  fields,
  values,
  submitterId,
  stringifyFormData = STRINGIFY_FORM_DATA,
  includeFiles = true,
  stringifyValues = true,
}) => {
  const formData = buildFormData(fields, values, {
    includeFiles,
    stringifyValues,
  });
  const submitter = resolveSubmitterId(submitterId);

  return {
    form_definition_id: Number(formDefinitionId) || null,
    ...(submitter != null ? { submitter_id: submitter } : {}),
    form_data: stringifyFormData ? JSON.stringify(formData) : formData,
  };
};

export const flattenFields = (categories) =>
  (categories || []).flatMap((item) => item.fields || []);
