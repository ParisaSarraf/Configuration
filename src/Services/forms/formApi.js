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

  createSubmission: (client, payload, signal) =>
    post(client, ENDPOINTS.submission, payload, signal),
});

export { ENDPOINTS as FORM_ENDPOINTS };
