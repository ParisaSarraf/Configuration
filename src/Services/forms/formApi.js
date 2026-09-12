const ENDPOINTS = Object.freeze({
  category: "/forms/add-form-category/",
  categories: "/forms/get-form-category/",
  definition: "/forms/add-form-definition/",
  definitions: "/forms/get-form-definition/",
  field: "/forms/add-form-field/",
  submission: "/forms/add-form-submission/",
});

const get = (client, endpoint, signal) =>
  client.get(endpoint, { signal }).then((response) => response.data);

const post = (client, endpoint, payload, signal) =>
  client.post(endpoint, payload, { signal }).then((response) => response.data);

const put = (client, endpoint, payload, signal) =>
  client.put(endpoint, payload, { signal }).then((response) => response.data);

const remove = (client, endpoint, signal) =>
  client.delete(endpoint, { signal }).then((response) => response.data);

/** آبجکت ↔ رشتهٔ JSON برای form_data (قالب دوم برای تلاش مجدد). */
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

/** همان پیلود بدون submitter_id (اختیاری است؛ سرور به ادمین نسبت می‌دهد). */
const withoutSubmitter = (payload) => {
  if (payload?.submitter_id == null) return null;
  const next = { ...payload };
  delete next.submitter_id;
  return next;
};

/**
 * ثبت فرم.
 * Swagger می‌گوید form_data رشته است، ولی بک‌اند در عمل JSONField است؛
 * پس ترتیب تلاش این است: همان پیلود ← قالب دیگر form_data ← بدون
 * submitter_id. فقط روی خطای 400 تلاش بعدی انجام می‌شود؛ خطاهای
 * دیگر (401، 500، قطع شبکه) بی‌درنگ بالا می‌روند.
 */
const createSubmission = async (client, payload, signal) => {
  const attempts = [
    payload,
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
});

export { ENDPOINTS as FORM_ENDPOINTS };
