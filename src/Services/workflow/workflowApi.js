// لایه ارتباط با APIهای اپلیکیشن workflow در بک‌اند.
// آدرس‌ها دقیقاً مطابق apps/workflow/urls.py هستند (بدون هیچ endpoint فرضی).
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
  addActionPermission: "/workflow/add-action-permission/",
});

const get = (client, endpoint, signal) =>
  client.get(endpoint, { signal }).then((response) => response.data);

const post = (client, endpoint, payload, signal) =>
  client.post(endpoint, payload, { signal }).then((response) => response.data);

const put = (client, endpoint, payload, signal) =>
  client.put(endpoint, payload, { signal }).then((response) => response.data);

const remove = (client, endpoint, signal) =>
  client.delete(endpoint, { signal }).then((response) => response.data);

export const workflowApi = Object.freeze({
  // ---------- Process ----------
  getProcesses: (client, signal) => get(client, ENDPOINTS.processes, signal),
  getProcessInfo: (client, id, signal) =>
    get(client, `${ENDPOINTS.processInfo}${id}`, signal),
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

  // ---------- Permissions ----------
  createProcessPermission: (client, payload, signal) =>
    post(client, ENDPOINTS.addProcessPermission, payload, signal),
  deleteProcessPermission: (client, id, signal) =>
    remove(client, `/workflow/delete-process-permission/${id}`, signal),

  createStatePermission: (client, payload, signal) =>
    post(client, ENDPOINTS.addStatePermission, payload, signal),
  deleteStatePermission: (client, id, signal) =>
    remove(client, `/workflow/delete-state-permission/${id}`, signal),

  createActionPermission: (client, payload, signal) =>
    post(client, ENDPOINTS.addActionPermission, payload, signal),
  deleteActionPermission: (client, id, signal) =>
    remove(client, `/workflow/delete-action-permission/${id}`, signal),
});

export { ENDPOINTS as WORKFLOW_ENDPOINTS };
