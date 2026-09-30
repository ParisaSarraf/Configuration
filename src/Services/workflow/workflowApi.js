const ENDPOINTS = Object.freeze({
  processes: "/workflow/get-process/",
  addProcess: "/workflow/add-process/",
  processInfo: "/workflow/get-process-info-by-id/",
  addState: "/workflow/add-state/",
  addTransition: "/workflow/add-transitions/",
  addAction: "/workflow/add-action/",
  transitionActions: "/workflow/get-transition-action/",
  addTransitionAction: "/workflow/add-transition-action/",
  addProcessPermission: "/workflow/add-process-permission/",
  addStatePermission: "/workflow/add-state-permission/",
  addFormFieldLockRule: "/workflow/add-form-field-lock-rule/",
  addActionPermission: "/workflow/add-action-permission/",
  requests: "/workflow/get-request/",
  requestById: "/workflow/get-request-by-id/",
  requestsNeedUserAction: "/workflow/get-requests-need-user-action/",
  processRequests: "/workflow/get-process-requests-by-id/",
  addRequest: "/workflow/add-request/",
  doAction: "/workflow/do-action/",
});

const get = (client, endpoint, signal) =>
  client.get(endpoint, { signal }).then((response) => response.data);

const post = (client, endpoint, payload, signal) =>
  client.post(endpoint, payload, { signal }).then((response) => response.data);

const put = (client, endpoint, payload, signal) =>
  client.put(endpoint, payload, { signal }).then((response) => response.data);

const remove = (client, endpoint, signal) =>
  client.delete(endpoint, { signal }).then((response) => response.data);

const positiveId = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const requestIdOf = (value, depth = 0) => {
  if (value == null || depth > 5) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const id = requestIdOf(item, depth + 1);
      if (id) return id;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  const direct =
    positiveId(value.request_id) ??
    positiveId(value.requestId) ??
    positiveId(value.id) ??
    positiveId(value.pk);
  if (direct) return direct;
  for (const key of [
    "request",
    "created_request",
    "data",
    "result",
    "results",
    "payload",
    "response",
  ]) {
    const id = requestIdOf(value[key], depth + 1);
    if (id) return id;
  }
  return null;
};

const requestRows = (payload, depth = 0) => {
  if (payload == null || depth > 5) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];
  for (const key of ["results", "data", "requests", "items"]) {
    const rows = requestRows(payload[key], depth + 1);
    if (rows.length) return rows;
  }
  return [payload];
};

const relatedId = (record, key) =>
  positiveId(
    record?.[`${key}_id`] ??
      record?.[key]?.id ??
      record?.[key]?.pk ??
      record?.[key],
  );

/**
 * بعضی نسخه‌های add-request بدنه‌ای بدون id برمی‌گردانند. در این حالت
 * درخواست تازه را با submission/process پیدا می‌کنیم تا فراخوانی do_action
 * به‌خاطر نبود شناسه بی‌صدا حذف نشود.
 */
const createRequestAndResolveId = async (client, payload, signal) => {
  const created = await post(client, ENDPOINTS.addRequest, payload, signal);
  const directId = requestIdOf(created);
  if (directId) return { ...created, __request_id: directId };

  const requests = await get(client, ENDPOINTS.requests, signal);
  const submissionId = positiveId(payload?.form_submission_id);
  const processId = positiveId(payload?.process_id);
  const match = requestRows(requests)
    .slice()
    .reverse()
    .find((request) => {
      const requestSubmissionId =
        relatedId(request, "form_submission") ??
        relatedId(request, "submission");
      const requestProcessId = relatedId(request, "process");
      return (
        (!submissionId || requestSubmissionId === submissionId) &&
        (!processId || requestProcessId === processId)
      );
    });
  const fallbackId = requestIdOf(match);
  return fallbackId
    ? { data: created, request: match, __request_id: fallbackId }
    : created;
};

export const workflowApi = Object.freeze({
  // ---------- Process ----------
  getProcesses: (client, signal) => get(client, ENDPOINTS.processes, signal),
  getProcessInfo: (client, id, signal) =>
    get(client, `${ENDPOINTS.processInfo}${id}`, signal),
  getProcessStateRequestCounts: (client, id, signal) =>
    get(
      client,
      `/workflow/process-report-get-number-of-request-in-states/${id}`,
      signal,
    ),
  createProcess: (client, payload, signal) =>
    post(client, ENDPOINTS.addProcess, payload, signal),
  updateProcess: (client, id, payload, signal) =>
    put(client, `/workflow/update-process/${id}`, payload, signal),
  deleteProcess: (client, id, signal) =>
    remove(client, `/workflow/delete-process/${id}`, signal),

  // ---------- State (ایستگاه) ----------
  createState: (client, payload, signal) =>
    post(client, ENDPOINTS.addState, payload, signal),
  updateState: (client, id, payload, signal) =>
    put(client, `/workflow/update-state/${id}`, payload, signal),
  deleteState: (client, id, signal) =>
    remove(client, `/workflow/delete-state/${id}`, signal),

  // ---------- Transition (ارتباط بین ایستگاه‌ها) ----------
  createTransition: (client, payload, signal) =>
    post(client, ENDPOINTS.addTransition, payload, signal),
  updateTransition: (client, id, payload, signal) =>
    put(client, `/workflow/update-transitions/${id}`, payload, signal),
  deleteTransition: (client, id, signal) =>
    remove(client, `/workflow/delete-transitions/${id}`, signal),

  // ---------- Action (عملیات) ----------
  createAction: (client, payload, signal) =>
    post(client, ENDPOINTS.addAction, payload, signal),
  updateAction: (client, id, payload, signal) =>
    put(client, `/workflow/update-action/${id}`, payload, signal),
  deleteAction: (client, id, signal) =>
    remove(client, `/workflow/delete-action/${id}`, signal),

  // ---------- TransitionAction (اتصال عملیات به یک ارتباط) ----------
  getTransitionActions: (client, signal) =>
    get(client, ENDPOINTS.transitionActions, signal),
  createTransitionAction: (client, payload, signal) =>
    post(client, ENDPOINTS.addTransitionAction, payload, signal),
  deleteTransitionAction: (client, id, signal) =>
    remove(client, `/workflow/delete-transition-action/${id}`, signal),

  // ---------- Request (درخواست‌های فرایند) ----------
  getRequests: (client, signal) => get(client, ENDPOINTS.requests, signal),
  getRequestById: (client, id, signal) =>
    get(client, `${ENDPOINTS.requestById}${id}`, signal),
  getRequestPathById: (client, id, signal) =>
    get(client, `/workflow/get-request-path-by-id/${id}`, signal),
  getRequestsNeedUserAction: (
    client,
    { processId = null, stateId = null } = {},
    signal,
  ) => {
    const params = {};
    if (processId != null && processId !== "")
      params.process_id = Number(processId);
    if (stateId != null && stateId !== "") params.state_id = Number(stateId);
    return client
      .get(ENDPOINTS.requestsNeedUserAction, { signal, params })
      .then((response) => response.data);
  },
  getProcessRequests: (
    client,
    id,
    { stateId = null, stateType = "" } = {},
    signal,
  ) => {
    const params = {};
    if (stateId != null && stateId !== "") params.state_id = Number(stateId);
    if (stateType) params.state_type = stateType;
    return client
      .get(`${ENDPOINTS.processRequests}${id}`, { signal, params })
      .then((response) => response.data);
  },
  createRequest: (client, payload, signal) =>
    createRequestAndResolveId(client, payload, signal),
  doAction: (client, payload, signal) =>
    post(client, ENDPOINTS.doAction, payload, signal),

  // ---------- Permissions ----------
  createProcessPermission: (client, payload, signal) =>
    post(client, ENDPOINTS.addProcessPermission, payload, signal),
  deleteProcessPermission: (client, id, signal) =>
    remove(client, `/workflow/delete-process-permission/${id}`, signal),
  updateProcessPermission: (client, id, payload, signal) =>
    put(client, `/workflow/update-process-permission/${id}`, payload, signal),

  createStatePermission: (client, payload, signal) =>
    post(client, ENDPOINTS.addStatePermission, payload, signal),
  deleteStatePermission: (client, id, signal) =>
    remove(client, `/workflow/delete-state-permission/${id}`, signal),
  createFormFieldLockRule: (client, payload, signal) =>
    post(client, ENDPOINTS.addFormFieldLockRule, payload, signal),
  deleteFormFieldLockRule: (client, id, signal) =>
    remove(client, `/workflow/delete-form-field-lock-rule/${id}`, signal),
  getLockedFieldsByRequestId: (client, id, signal) =>
    get(client, `/workflow/get-locked-field-by-request-id/${id}`, signal),
  getLockedFieldsByProcessId: (client, id, signal) =>
    get(client, `/workflow/get-locked-field-by-process-id/${id}`, signal),

  createActionPermission: (client, payload, signal) =>
    post(client, ENDPOINTS.addActionPermission, payload, signal),
  deleteActionPermission: (client, id, signal) =>
    remove(client, `/workflow/delete-action-permission/${id}`, signal),
});

export { ENDPOINTS as WORKFLOW_ENDPOINTS };
