import { extractEntityId } from "./formUtils";

const ENDPOINTS = Object.freeze({
  category: "/forms/add-form-category/",
  categories: "/forms/get-form-category/",
  definition: "/forms/add-form-definition/",
  definitions: "/forms/get-form-definition/",
  field: "/forms/add-form-field/",
  submission: "/forms/add-form-submission/",
  submissions: "/forms/get-form-submission/",
  submissionAttachment: "/forms/add-form-submission-attachment/",
});

const get = (client, endpoint, signal) =>
  client.get(endpoint, { signal }).then((response) => response.data);

const post = (client, endpoint, payload, signal, headers) =>
  client
    .post(endpoint, payload, { signal, ...(headers ? { headers } : {}) })
    .then((response) => response.data);

const put = (client, endpoint, payload, signal) =>
  client.put(endpoint, payload, { signal }).then((response) => response.data);

const remove = (client, endpoint, signal) =>
  client.delete(endpoint, { signal }).then((response) => response.data);

/* ================================================================== *
 *  مسیر رسمی ارسال فرم (دو مرحله‌ای)
 *
 *  مرحلهٔ ۱ — ثبت فرم بدون هیچ فایلی:
 *      POST /forms/add-form-submission/   (application/json)
 *      { form_definition_id, submitter_id?, form_data: { ...فقط فیلدهای غیرفایلی } }
 *      → پاسخ شامل id ِ submission است.
 *
 *  مرحلهٔ ۲ — به‌ازای هر فایل، یک درخواست مجزا با همان id:
 *      POST /forms/add-form-submission-attachment/   (multipart/form-data)
 *      submission_id (int) | field_id (int) | file (binary)
 *
 *  هیچ فایلی هیچ‌وقت در مرحلهٔ ۱ ارسال نمی‌شود و مرحلهٔ ۱ هم هیچ‌وقت
 *  multipart نمی‌شود.
 * ================================================================== */

/* ------------------------------------------------ تشخیص خطاهای سرور */

const errorText = (error) => {
  const data = error?.response?.data;
  if (data == null) return String(error?.message || "");
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
};

/**
 * پیام پیش‌فرض serializers.FileField در DRF.
 *
 * اگر این خطا در مرحلهٔ ۱ بیاید، یعنی سرور در همان اندپوینت ثبت فرم دارد
 * یک FileField را اعتبارسنجی می‌کند — کاری که طبق طراحی دومرحله‌ای نباید انجام
 * دهد. تکرار درخواست یا تغییر شکل پیلود هیچ کمکی نمی‌کند؛ باید سمت سرور
 * اصلاح شود.
 */
export const isNotAFileError = (error) =>
  /was not a file|Check the encoding type/i.test(errorText(error));

export const isFormDataShapeError = (error) =>
  /form_data must be a JSON object/i.test(errorText(error));

const SERVER_FILE_VALIDATION_HINT =
  "اندپوینت ثبت فرم (add-form-submission) روی فیلدهای فایل اعتبارسنجی FileField انجام می‌دهد و حتی وقتی هیچ فایلی ارسال نشود خطا می‌دهد. " +
  "فایل‌ها باید بعد از ثبت فرم و با اندپوینت add-form-submission-attachment ارسال شوند؛ این اعتبارسنجی باید از سمت سرور برداشته شود.";

/** خطای قابل‌فهم برای کاربر، با حفظ پاسخ اصلی سرور. */
export class FormSubmissionError extends Error {
  constructor(message, cause, { code = "submission_failed" } = {}) {
    super(message);
    this.name = "FormSubmissionError";
    this.code = code;
    this.cause = cause;
    this.response = cause?.response;
  }
}

/* ------------------------------------------------ تمیزکاری پیلود */

const isBrowserFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

const FILE_DESCRIPTOR_KEYS = new Set([
  "name",
  "size",
  "type",
  "file_name",
  "url",
  "file",
  "file_url",
  "path",
]);

/** مقداری که فایل یا فرادادهٔ فایل است و نباید در مرحلهٔ ۱ برود. */
const looksLikeFileValue = (value) => {
  if (isBrowserFile(value)) return true;
  if (!Array.isArray(value) || !value.length) return false;
  return value.every(
    (item) =>
      isBrowserFile(item) ||
      (item &&
        typeof item === "object" &&
        Object.keys(item).length > 0 &&
        Object.keys(item).every((key) => FILE_DESCRIPTOR_KEYS.has(key))),
  );
};

/** هر مقداری را به رشته تبدیل می‌کند (فرادادهٔ فایل ← فقط نام فایل). */
const asText = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  if (Array.isArray(value))
    return value
      .map((item) =>
        item && typeof item === "object"
          ? String(item.name ?? item.file_name ?? JSON.stringify(item))
          : String(item ?? ""),
      )
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

const parsedFormData = (payload) => {
  const raw = payload?.form_data;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * پیلود مرحلهٔ ۱ را به شکلی که سرور می‌خواهد درمی‌آورد:
 *   - form_data همیشه یک آبجکت JSON است (نه رشته)
 *   - هیچ فایل/فرادادهٔ فایلی در آن نیست
 *   - کلیدهای تهی (undefined) حذف می‌شوند
 */
export const cleanSubmissionPayload = (payload) => {
  // قالب ورودی حفظ می‌شود: اگر form_data آبجکت باشد آبجکت می‌ماند
  // (حالت مورد قبول سرور) و اگر رشته باشد رشته می‌ماند.
  const asJsonString = typeof payload?.form_data === "string";
  const data = parsedFormData(payload);

  const formData = Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined && !looksLikeFileValue(value))
      // Keep table/matrix values as nested JSON; stringify only scalar values.
      .map(([key, value]) => [
        key,
        value && typeof value === "object" ? value : asText(value),
      ])
      .filter(([, value]) => value !== ""),
  );

  const next = { ...payload };
  Object.keys(next).forEach((key) => {
    if (next[key] === undefined || next[key] === null) delete next[key];
  });
  next.form_data = asJsonString ? JSON.stringify(formData) : formData;

  return next;
};

/* ------------------------------------------------ مرحلهٔ ۱: ثبت فرم */

/**
 * ثبت فرم — دقیقاً یک درخواست JSON، بدون فایل و بدون زنجیرهٔ retry.
 *
 * زنجیرهٔ retry قدیمی (رشته‌کردن form_data، حذف submitter_id و الی آخر) حذف شده:
 * نه مشکلی را حل می‌کرد و نه فقط سه خطای 400 در تب Network می‌ساخت و خطای اصلی را پنهان می‌کرد.
 */
const createSubmission = async (client, payload, signal) => {
  const body = cleanSubmissionPayload(payload);

  try {
    // Content-Type به‌صورت صریح application/json تا درخواست دقیقاً مانند Swagger باشد
    return await post(client, ENDPOINTS.submission, body, signal, {
      "Content-Type": "application/json",
    });
  } catch (error) {
    if (isNotAFileError(error))
      throw new FormSubmissionError(SERVER_FILE_VALIDATION_HINT, error, {
        code: "server_validates_file_on_submission",
      });
    throw error;
  }
};

/** شناسهٔ submission را از هر شکلی که سرور برگرداند بیرون می‌کشد. */
export const resolveSubmissionId = (response) => {
  const direct = extractEntityId(response);
  if (direct) return direct;

  const candidates = [
    response?.submission_id,
    response?.submission?.id,
    response?.form_submission_id,
    response?.form_submission?.id,
    response?.data?.submission_id,
    response?.data?.form_submission_id,
    response?.result?.submission_id,
    Array.isArray(response?.results) ? response.results[0]?.id : undefined,
    Array.isArray(response?.data) ? response.data[0]?.id : undefined,
  ];

  const value = candidates.find(
    (candidate) => candidate !== undefined && candidate !== null,
  );
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

/* --------------------------------------------- مرحلهٔ ۲: پیوست‌ها */

const toRawFile = (item) => {
  if (isBrowserFile(item)) return item;
  const nested = item?.originFileObj ?? item?.file;
  return isBrowserFile(nested) ? nested : null;
};

/**
 * آپلود یک پیوست با شناسهٔ submission که از مرحلهٔ ۱ برگشته:
 *   POST /forms/add-form-submission-attachment/
 *   submission_id (int) | field_id (int) | file (binary)
 */
const addSubmissionAttachment = (
  client,
  { submissionId, fieldId, file },
  signal,
  onUploadProgress,
) => {
  const raw = toRawFile(file);
  if (!raw)
    return Promise.reject(new Error("فایلی برای ارسال انتخاب نشده است."));

  const submission = Number(submissionId);
  const field = Number(fieldId);
  if (!Number.isFinite(submission) || submission <= 0)
    return Promise.reject(
      new Error("شناسهٔ ارسال (submission_id) معتبر نیست."),
    );
  if (!Number.isFinite(field) || field <= 0)
    return Promise.reject(new Error("شناسهٔ فیلد (field_id) معتبر نیست."));

  const body = new FormData();
  body.append("submission_id", String(submission));
  body.append("field_id", String(field));
  body.append("file", raw, raw.name);

  return client
    .post(ENDPOINTS.submissionAttachment, body, {
      signal,
      onUploadProgress,
      // مرورگر خودش boundary را ست می‌کند؛ هدر پیش‌فرض JSON نباید بماند.
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
};

/**
 * آپلود ترتیبی چند پیوست برای یک submission.
 * خروجی: { uploaded, failed }
 * خطای هر فایل جداگانه گرفته می‌شود تا یک فایل خراب، بقیه را متوقف نکند.
 */
const uploadSubmissionAttachments = async (
  client,
  { submissionId, entries = [], signal, onProgress } = {},
) => {
  const uploaded = [];
  const failed = [];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    try {
      const data = await addSubmissionAttachment(
        client,
        { submissionId, fieldId: entry.fieldId, file: entry.file },
        signal,
      );
      uploaded.push({ ...entry, response: data ?? null });
    } catch (error) {
      failed.push({ ...entry, error });
    }
    onProgress?.({ done: index + 1, total: entries.length });
  }

  return { uploaded, failed };
};

/* ------------------------------------------- ارسال کامل (دو مرحله) */

/**
 * ارسال کامل یک فرم:
 *   1) ثبت فرم بدون فایل → گرفتن id از پاسخ
 *   2) با همان id، هر فایل را به add-form-submission-attachment بفرست
 *
 * @returns {Promise<{
 *   submissionId: number|null,
 *   response: any,
 *   uploaded: Array,
 *   failed: Array,
 *   skipped: Array,
 * }>}
 */
const submitForm = async (
  client,
  { payload, files = [], signal, onProgress } = {},
) => {
  const entries = (Array.isArray(files) ? files : []).filter((entry) =>
    toRawFile(entry?.file),
  );
  // پیوست بدون field_id عددی معتبر قابل ارسال نیست.
  const ready = entries.filter((entry) => Number(entry.fieldId) > 0);
  const skipped = entries.filter((entry) => !(Number(entry.fieldId) > 0));

  // مرحلهٔ ۱
  const response = await createSubmission(client, payload, signal);
  const submissionId = resolveSubmissionId(response);

  if (!ready.length)
    return { submissionId, response, uploaded: [], failed: [], skipped };

  if (!submissionId)
    // فرم ثبت شده ولی بدون id نمی‌توان پیوست فرستاد.
    return {
      submissionId: null,
      response,
      uploaded: [],
      failed: [],
      skipped: [...skipped, ...ready],
    };

  // مرحلهٔ ۲
  const { uploaded, failed } = await uploadSubmissionAttachments(client, {
    submissionId,
    entries: ready,
    signal,
    onProgress,
  });

  return { submissionId, response, uploaded, failed, skipped };
};

export const formApi = Object.freeze({
  createCategory: (client, payload, signal) =>
    post(client, ENDPOINTS.category, payload, signal),
  getCategories: (client, signal) => get(client, ENDPOINTS.categories, signal),
  deleteCategory: (client, id, signal) =>
    remove(client, `/forms/delete-form-category/${id}`, signal),

  createDefinition: (client, payload, signal) =>
    post(client, ENDPOINTS.definition, payload, signal),
  getDefinitions: (client, signal) =>
    get(client, ENDPOINTS.definitions, signal),
  getDefinition: (client, id, signal) =>
    get(client, `${ENDPOINTS.definitions}${id}`, signal),
  updateDefinition: (client, id, payload, signal) =>
    put(client, `/forms/update-form-definition/${id}`, payload, signal),
  deleteDefinition: (client, id, signal) =>
    remove(client, `/forms/delete-form-definition/${id}`, signal),

  createField: (client, payload, signal) =>
    post(client, ENDPOINTS.field, payload, signal),
  updateField: (client, id, payload, signal) =>
    put(client, `/forms/update-form-field/${id}`, payload, signal),
  deleteField: (client, id, signal) =>
    remove(client, `/forms/delete-form-field/${id}`, signal),

  createSubmission,
  submitForm,
  resolveSubmissionId,
  getSubmissions: (client, signal) =>
    get(client, ENDPOINTS.submissions, signal),

  addSubmissionAttachment,
  uploadSubmissionAttachments,
  deleteSubmissionAttachment: (client, id, signal) =>
    remove(client, `/forms/delete-form-submission-attachment/${id}`, signal),
});

export { ENDPOINTS as FORM_ENDPOINTS };
