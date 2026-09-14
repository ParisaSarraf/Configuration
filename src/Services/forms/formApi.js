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

const post = (client, endpoint, payload, signal) =>
  client.post(endpoint, payload, { signal }).then((response) => response.data);

const put = (client, endpoint, payload, signal) =>
  client.put(endpoint, payload, { signal }).then((response) => response.data);

const remove = (client, endpoint, signal) =>
  client.delete(endpoint, { signal }).then((response) => response.data);

const flipFormData = (payload) => {
  const raw = payload?.form_data;
  if (typeof raw === "string") {
    try {
      return { ...payload, form_data: JSON.parse(raw) };
    } catch {
      return null;
    }
  }

  if (raw && typeof raw === "object")
    return { ...payload, form_data: JSON.stringify(raw) };

  return null;
};

// مقدار فیلدهای فایل نباید در form_data باشد (سرور با FileField چک می‌کند و
// خطای "The submitted data was not a file" می‌دهد). این تابع یک تور ایمنی است
// برای قالب‌های قدیمی که هنوز نام فایل را در پیلود می‌گذارند.
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

const looksLikeFileValue = (value) => {
  if (typeof File !== "undefined" && value instanceof File) return true;
  if (!Array.isArray(value) || !value.length) return false;
  return value.every(
    (item) =>
      (typeof File !== "undefined" && item instanceof File) ||
      (item &&
        typeof item === "object" &&
        Object.keys(item).length > 0 &&
        Object.keys(item).every((key) => FILE_DESCRIPTOR_KEYS.has(key))),
  );
};

const withoutFileValues = (payload) => {
  const raw = payload?.form_data;
  const data =
    typeof raw === "string"
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })()
      : raw;
  if (!data || typeof data !== "object") return null;

  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => !looksLikeFileValue(value)),
  );
  if (Object.keys(cleaned).length === Object.keys(data).length) return null;

  return {
    ...payload,
    form_data: typeof raw === "string" ? JSON.stringify(cleaned) : cleaned,
  };
};

const withoutSubmitter = (payload) => {
  if (payload?.submitter_id == null) return null;
  const next = { ...payload };
  delete next.submitter_id;
  return next;
};

const createSubmission = async (client, payload, signal) => {
  const attempts = [
    payload,
    withoutFileValues(payload),
    flipFormData(payload),
    withoutSubmitter(payload),
  ].filter(Boolean);

  let lastError;

  for (const attempt of attempts) {
    try {
      return await post(client, ENDPOINTS.submission, attempt, signal);
    } catch (error) {
      if (error?.response?.status !== 400) throw error;
      lastError = error;
    }
  }

  throw lastError;
};

/* --------------------------------------------------------------- پیوست‌ها */
// فایل‌ها با پیلود JSON فرم ارسال نمی‌شوند؛ سرور برای هر فایل یک درخواست
// multipart جداگانه می‌خواهد:
//   POST /forms/add-form-submission-attachment/
//   fields: submission_id (int) | field_id (int) | file (binary)

const toRawFile = (item) => item?.originFileObj ?? item?.file ?? item;

const addSubmissionAttachment = (
  client,
  { submissionId, fieldId, file },
  signal,
  onUploadProgress,
) => {
  const raw = toRawFile(file);
  if (!raw) return Promise.reject(new Error("فایلی برای ارسال انتخاب نشده است."));

  const body = new FormData();
  body.append("submission_id", String(Number(submissionId)));
  body.append("field_id", String(Number(fieldId)));
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
 * خروجی: { uploaded: [...], failed: [{ ...entry, error }] }
 * تک‌تک خطاها گرفته می‌شوند تا یک فایل خراب، بقیه را متوقف نکند.
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
        {
          submissionId,
          fieldId: entry.fieldId,
          file: entry.file,
        },
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
  getSubmissions: (client, signal) =>
    get(client, ENDPOINTS.submissions, signal),

  addSubmissionAttachment,
  uploadSubmissionAttachments,
  deleteSubmissionAttachment: (client, id, signal) =>
    remove(client, `/forms/delete-form-submission-attachment/${id}`, signal),
});

export { ENDPOINTS as FORM_ENDPOINTS };
