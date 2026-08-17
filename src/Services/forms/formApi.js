const ENDPOINTS = Object.freeze({
  category: "/forms/add-form-category/",
  definition: "/forms/add-form-definition/",
  field: "/forms/add-form-field/",
  submission: "/forms/add-form-submission/",
});

const post = async (client, endpoint, payload, signal) => {
  const response = await client.post(endpoint, payload, { signal });
  return response.data;
};

export const formApi = Object.freeze({
  createCategory: (client, payload, signal) => post(client, ENDPOINTS.category, payload, signal),
  createDefinition: (client, payload, signal) => post(client, ENDPOINTS.definition, payload, signal),
  createField: (client, payload, signal) => post(client, ENDPOINTS.field, payload, signal),
  createSubmission: (client, payload, signal) => post(client, ENDPOINTS.submission, payload, signal),
});

export const getApiErrorMessage = (error, fallback = "خطایی در ارتباط با سرور رخ داد.") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (data && typeof data === "object") {
    const firstError = Object.entries(data).find(([, value]) => value != null);
    if (firstError) {
      const [field, value] = firstError;
      const message = Array.isArray(value) ? value.join("، ") : String(value);
      return `${field}: ${message}`;
    }
  }

  return error?.message || fallback;
};

export const extractEntityId = (response) => {
  const candidates = [
    response?.id,
    response?.pk,
    response?.data?.id,
    response?.data?.pk,
    response?.result?.id,
    response?.result?.pk,
    response?.[0]?.id,
    response?.[0]?.pk,
    response?.data?.result?.id,
    response?.data?.result?.pk,
  ];
  const value = candidates.find((candidate) => candidate !== undefined && candidate !== null);
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

export { ENDPOINTS as FORM_ENDPOINTS };
