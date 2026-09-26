/**
 * نگاشت دادهٔ سرور برای نمایش «فرم پرشده» در کارتابل.
 *
 * قواعد این فایل:
 *  - هیچ چیزی در localStorage ذخیره نمی‌شود؛ همهٔ داده از سرور می‌آید.
 *  - چیدمان فیلدها (x/y/w/h) از `css_class` خودِ فیلدها خوانده می‌شود؛ همان چیزی
 *    که استودیوی ساخت فرم با writeLayout ذخیره می‌کند. پس نمای «ارسال‌شده‌ها»
 *    دقیقاً همان چیدمان طراحی را بازسازی می‌کند.
 *  - این فایل فقط «برگرداندن» مقدارهای ذخیره‌شده به شکل ورودیِ فرم را انجام
 *    می‌دهد؛ یعنی معکوس buildFormData در FormRuntime/submission.js.
 */

import {
  DISPLAY_ONLY,
  canonicalType,
} from "../../pages/Forms/FormRuntime/fieldSchema";
import { MULTI_TYPES } from "../../pages/Forms/FormRuntime/formElements";

const NUMERIC = new Set(["number", "decimal", "currency", "slider", "rating"]);

/** پاسخ‌های بک‌اند گاهی آرایه، گاهی {results}، گاهی یک آبجکت تنها هستند. */
export const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return value ? [value] : [];
};

export const firstItem = (value) => asArray(value)[0] ?? null;

/** خروجی get-form-definition/<id> را به آرایهٔ «دسته‌ها» برای FormRenderer تبدیل می‌کند. */
export const categoriesOf = (payload) =>
  asArray(payload).filter((item) => item && typeof item === "object");

/** Process.form_definition در سریالایزر بک‌اند یا id است یا آبجکت. */
export const formIdOf = (process) => {
  const definition = process?.form_definition ?? process?.form_definition_id;
  if (definition && typeof definition === "object")
    return definition.id ?? null;
  const parsed = Number(definition);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const readSignature = (raw) => {
  if (raw && typeof raw === "object" && !Array.isArray(raw))
    return String(raw.value ?? "");
  return String(raw ?? "");
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

/** فایل‌ها به شکل [{name}] ذخیره می‌شوند؛ FieldControl آرایهٔ نام می‌خواهد. */
const readFiles = (raw) => {
  if (Array.isArray(raw))
    return raw
      .map((item) => (typeof item === "string" ? item : (item?.name ?? "")))
      .filter(Boolean);
  return String(raw ?? "")
    .split("،")
    .map((item) => item.trim())
    .filter(Boolean);
};

/** معکوس normalizeValue: مقدار ذخیره‌شده → مقدار ورودیِ همان فیلد. */
export const hydrateValue = (type, raw) => {
  if (raw === undefined || raw === null) return undefined;

  if (type === "checkbox") return Boolean(raw);

  if (NUMERIC.has(type)) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : "";
  }

  if (MULTI_TYPES.has(type))
    return (Array.isArray(raw) ? raw : [raw]).filter(
      (item) => item !== "" && item != null,
    );

  if (type === "matrix") return matrixRowsOf(raw);

  if (type === "sheet_table" || type === "date_signature")
    return raw && typeof raw === "object" ? raw : {};

  if (type === "signature") return readSignature(raw);

  if (type === "file" || type === "multifile") return readFiles(raw);

  // تاریخ/زمان میلادی ذخیره می‌شود و DateField خودش شمسی نشان می‌دهد.
  return raw;
};

/**
 * مقادیر ذخیره‌شدهٔ یک ارسال را روی فیلدهای همان فرم می‌نشاند.
 * کلیدهایی که فیلد مستقل ندارند (مثل سلول‌های «جدول ثابت سند») دست‌نخورده
 * منتقل می‌شوند تا SheetTable هم پر شود. فیلدهای بدون مقدار خالی می‌مانند.
 */
export const hydrateValues = (fields, formData) => {
  const data =
    formData && typeof formData === "object" && !Array.isArray(formData)
      ? formData
      : {};

  const values = { ...data };

  (fields || []).forEach((field) => {
    const type = canonicalType(field?.field_type);
    if (DISPLAY_ONLY.has(type)) return;

    const key = field?.field_name || String(field?.id ?? "");
    if (!key || !(key in data)) return;

    const hydrated = hydrateValue(type, data[key]);
    if (hydrated === undefined) delete values[key];
    else values[key] = hydrated;
  });

  return values;
};

/** یک ردیف «ارسال‌شده» از روی درخواستِ فرایند (get-request/). */
const rowFromRequest = (request) => {
  if (!request || typeof request !== "object") return null;

  const submission = request.form_submission ?? null;
  const process = request.process ?? request.current_state?.process ?? null;
  const formData = submission?.form_data ?? null;

  return {
    rowKey: `request-${request.id}`,
    source: "request",
    requestId: request.id ?? null,
    title: request.title ?? "",
    processId: process?.id ?? null,
    processName: process?.name ?? "",
    formDefinitionId: formIdOf(process),
    stateId: request.current_state?.id ?? null,
    stateName: request.current_state?.name ?? "",
    submissionId: submission?.id ?? null,
    formData,
    attachments: Array.isArray(submission?.file_attachments)
      ? submission.file_attachments
      : [],
    submitter: submission?.submitter ?? request.created_by ?? null,
    createdAt: submission?.created_at ?? request.created_at ?? null,
    fieldCount: Object.keys(formData ?? {}).length,
  };
};

export const sentRowsFromRequests = (payload) =>
  asArray(payload)
    .map(rowFromRequest)
    .filter((row) => row && row.submissionId);

/**
 * ارسال‌هایی که هنوز به هیچ درخواست فرایندی وصل نیستند (رکوردهای قدیمی).
 * شناسهٔ فرمشان اینجا نامشخص است و در مودال از روی سرور پیدا می‌شود.
 */
export const sentRowsFromSubmissions = (payload, linkedSubmissionIds) => {
  const linked =
    linkedSubmissionIds instanceof Set
      ? linkedSubmissionIds
      : new Set(linkedSubmissionIds ?? []);

  return asArray(payload)
    .filter((item) => item && typeof item === "object" && !linked.has(item.id))
    .map((submission) => ({
      rowKey: `submission-${submission.id}`,
      source: "submission",
      requestId: null,
      title: "",
      processId: null,
      processName: "",
      formDefinitionId: null,
      stateId: null,
      stateName: "",
      submissionId: submission.id ?? null,
      formData: submission.form_data ?? null,
      attachments: Array.isArray(submission.file_attachments)
        ? submission.file_attachments
        : [],
      submitter: submission.submitter ?? null,
      createdAt: submission.created_at ?? null,
      fieldCount: Object.keys(submission.form_data ?? {}).length,
    }));
};

/**
 * شناسهٔ فرمِ یک ارسال را از پاسخ‌های get-form-definition/<id> پیدا می‌کند
 * (آن اندپوینت فهرست submissions هر فرم را هم برمی‌گرداند). کاملاً بر اساس
 * دادهٔ سرور است، نه حدس زدن از روی نام کلیدها.
 */
export const findFormIdBySubmission = (payloads, submissionId) => {
  const target = Number(submissionId);
  if (!Number.isFinite(target) || target <= 0) return null;

  for (const payload of payloads ?? []) {
    for (const definition of asArray(payload)) {
      const submissions = Array.isArray(definition?.submissions)
        ? definition.submissions
        : [];
      if (submissions.some((item) => Number(item?.id) === target))
        return definition?.id ?? null;
    }
  }

  return null;
};
