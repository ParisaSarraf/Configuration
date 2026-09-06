// ساخت payloadهای workflow و همگام‌سازی تغییرات Canvas با APIهای موجود.
//
// بک‌اند برای هر جزء فرایند (state / transition / action / permission) API جداگانه دارد و
// هیچ endpointی برای ذخیره‌ی یکجای نمودار وجود ندارد؛ بنابراین هنگام Save
// اختلاف وضعیت فعلی با وضعیت بارگذاری‌شده محاسبه و همان APIهای واقعی به ترتیب
// وابستگی صدا زده می‌شوند.
import { workflowApi } from "./workflowApi";

const TEMP_PREFIX = "tmp-";
let tempCounter = 0;

export const nextTempId = (kind = "item") => {
  tempCounter += 1;
  return `${TEMP_PREFIX}${kind}-${tempCounter}`;
};

export const isTempId = (id) =>
  typeof id === "string" && id.startsWith(TEMP_PREFIX);

const text = (value) => String(value ?? "").trim();

// ---------- payload builders (دقیقاً مطابق serializerهای بک‌اند) ----------

export const statePayload = (node, processId) => ({
  state_type_id: Number(node.stateTypeId),
  process_id: Number(processId),
  name: text(node.name),
  description: text(node.description),
});

export const stateUpdatePayload = (node) => ({
  state_type_id: Number(node.stateTypeId),
  name: text(node.name),
  description: text(node.description),
});

export const transitionPayload = (processId, currentStateId, nextStateId) => ({
  process_id: Number(processId),
  current_state_id: Number(currentStateId),
  next_state_id: Number(nextStateId),
});

export const actionPayload = (action, processId) => ({
  action_type_id: Number(action.actionTypeId),
  process_id: Number(processId),
  name: text(action.name),
  description: text(action.description),
});

export const actionUpdatePayload = (action) => ({
  action_type_id: Number(action.actionTypeId),
  name: text(action.name),
  description: text(action.description),
});

export const transitionActionPayload = (actionId, transitionId) => ({
  action_id: Number(actionId),
  transition_id: Number(transitionId),
});

export const processPermissionPayload = (processId, permission) => ({
  process_id: Number(processId),
  group_id: Number(permission.groupId),
  permission_type: permission.permissionType,
  grantee_type: permission.granteeType,
});

export const statePermissionPayload = (stateId, permission) => ({
  state_id: Number(stateId),
  group_id: Number(permission.groupId),
  permission_type: permission.permissionType,
  grantee_type: permission.granteeType,
});

export const actionPermissionPayload = (actionId, permission) => ({
  action_id: Number(actionId),
  grantee_type: permission.granteeType,
  ...(permission.groupId ? { group_id: Number(permission.groupId) } : {}),
});

// ---------- diff ----------

const byId = (list = []) => new Map(list.map((item) => [String(item.id), item]));

const emptyPlan = () => ({
  processName: null,
  states: { created: [], updated: [], deleted: [] },
  transitions: { created: [], updated: [], deleted: [] },
  actions: { created: [], updated: [], deleted: [] },
  links: { created: [], deleted: [] },
  processPermissions: { created: [], deleted: [] },
  statePermissions: { created: [], deleted: [] },
  actionPermissions: { created: [], deleted: [] },
});

const diffPermissions = (initialList, currentList, ownerId, bucket) => {
  const initial = byId(initialList);
  const current = byId(currentList);

  currentList.forEach((permission) => {
    if (isTempId(permission.id))
      bucket.created.push({ ownerId, permission });
  });
  initial.forEach((permission, id) => {
    if (!current.has(id)) bucket.deleted.push(permission.id);
  });
};

/**
 * اختلاف نمودار بارگذاری‌شده و نمودار فعلی را به مجموعه‌ای از فراخوانی‌های API تبدیل می‌کند.
 */
export const buildSavePlan = (initial, current) => {
  const plan = emptyPlan();
  if (!initial || !current) return plan;

  if (text(initial.name) !== text(current.name))
    plan.processName = text(current.name);

  // --- states ---
  const initialNodes = byId(initial.nodes);
  const currentNodes = byId(current.nodes);

  current.nodes.forEach((node) => {
    if (isTempId(node.id)) {
      plan.states.created.push(node);
      return;
    }
    const before = initialNodes.get(String(node.id));
    if (!before) return;
    if (
      text(before.name) !== text(node.name) ||
      text(before.description) !== text(node.description) ||
      Number(before.stateTypeId) !== Number(node.stateTypeId)
    )
      plan.states.updated.push(node);
  });
  initial.nodes.forEach((node) => {
    if (!currentNodes.has(String(node.id))) plan.states.deleted.push(node.id);
  });

  // --- transitions ---
  const initialEdges = byId(initial.edges);
  const currentEdges = byId(current.edges);

  current.edges.forEach((edge) => {
    if (isTempId(edge.id)) {
      plan.transitions.created.push(edge);
      return;
    }
    const before = initialEdges.get(String(edge.id));
    if (!before) return;
    if (
      String(before.source) !== String(edge.source) ||
      String(before.target) !== String(edge.target)
    )
      plan.transitions.updated.push(edge);
  });
  initial.edges.forEach((edge) => {
    if (!currentEdges.has(String(edge.id)))
      plan.transitions.deleted.push(edge.id);
  });

  // --- actions ---
  const initialActions = byId(initial.actions);
  const currentActions = byId(current.actions);

  current.actions.forEach((action) => {
    if (isTempId(action.id)) {
      plan.actions.created.push(action);
      return;
    }
    const before = initialActions.get(String(action.id));
    if (!before) return;
    if (
      text(before.name) !== text(action.name) ||
      text(before.description) !== text(action.description) ||
      Number(before.actionTypeId) !== Number(action.actionTypeId)
    )
      plan.actions.updated.push(action);
  });
  initial.actions.forEach((action) => {
    if (!currentActions.has(String(action.id)))
      plan.actions.deleted.push(action.id);
  });

  // --- transition <-> action links ---
  const initialLinks = new Map();
  initial.edges.forEach((edge) =>
    (edge.actions || []).forEach((link) =>
      initialLinks.set(String(link.id), { edge, link }),
    ),
  );
  const currentLinkIds = new Set();
  current.edges.forEach((edge) =>
    (edge.actions || []).forEach((link) => {
      currentLinkIds.add(String(link.id));
      if (isTempId(link.id))
        plan.links.created.push({ edgeId: edge.id, actionId: link.actionId });
    }),
  );
  initialLinks.forEach(({ link }, id) => {
    if (!currentLinkIds.has(id)) plan.links.deleted.push(link.id);
  });

  // --- permissions ---
  diffPermissions(
    initial.permissions,
    current.permissions,
    current.id,
    plan.processPermissions,
  );

  current.nodes.forEach((node) => {
    const before = initialNodes.get(String(node.id));
    diffPermissions(
      before?.permissions || [],
      node.permissions || [],
      node.id,
      plan.statePermissions,
    );
  });
  initial.nodes.forEach((node) => {
    // دسترسی‌های ایستگاه حذف‌شده همراه خود ایستگاه حذف می‌شوند.
    if (!currentNodes.has(String(node.id))) return;
  });

  current.actions.forEach((action) => {
    const before = initialActions.get(String(action.id));
    diffPermissions(
      before?.permissions || [],
      action.permissions || [],
      action.id,
      plan.actionPermissions,
    );
  });

  return plan;
};

export const planChangeCount = (plan) => {
  if (!plan) return 0;
  const buckets = [
    plan.states,
    plan.transitions,
    plan.actions,
    plan.links,
    plan.processPermissions,
    plan.statePermissions,
    plan.actionPermissions,
  ];
  return (
    (plan.processName ? 1 : 0) +
    buckets.reduce(
      (total, bucket) =>
        total +
        (bucket.created?.length || 0) +
        (bucket.updated?.length || 0) +
        (bucket.deleted?.length || 0),
      0,
    )
  );
};

// ---------- sync ----------

const resolveId = (map, id) => Number(map.get(String(id)) ?? id);

/**
 * اجرای ترتیبی plan روی APIهای واقعی.
 * ترتیب مهم است: ابتدا ایستگاه‌ها، سپس ارتباط‌ها و عملیات‌ها، بعد اتصالات و دسترسی‌ها
 * و در انتها حذف‌ها (تا وابستگی‌ها نشکنند).
 */
export const syncProcessGraph = async (client, { processId, plan }) => {
  const stateIds = new Map();
  const actionIds = new Map();
  const transitionIds = new Map();

  if (plan.processName)
    await workflowApi.updateProcess(client, processId, { name: plan.processName });

  for (const node of plan.states.created) {
    const created = await workflowApi.createState(
      client,
      statePayload(node, processId),
    );
    stateIds.set(String(node.id), created?.id);
  }
  for (const node of plan.states.updated)
    await workflowApi.updateState(client, node.id, stateUpdatePayload(node));

  for (const edge of plan.transitions.created) {
    const created = await workflowApi.createTransition(
      client,
      transitionPayload(
        processId,
        resolveId(stateIds, edge.source),
        resolveId(stateIds, edge.target),
      ),
    );
    transitionIds.set(String(edge.id), created?.id);
  }
  for (const edge of plan.transitions.updated)
    await workflowApi.updateTransition(
      client,
      edge.id,
      transitionPayload(
        processId,
        resolveId(stateIds, edge.source),
        resolveId(stateIds, edge.target),
      ),
    );

  for (const action of plan.actions.created) {
    const created = await workflowApi.createAction(
      client,
      actionPayload(action, processId),
    );
    actionIds.set(String(action.id), created?.id);
  }
  for (const action of plan.actions.updated)
    await workflowApi.updateAction(client, action.id, actionUpdatePayload(action));

  for (const link of plan.links.created)
    await workflowApi.createTransitionAction(
      client,
      transitionActionPayload(
        resolveId(actionIds, link.actionId),
        resolveId(transitionIds, link.edgeId),
      ),
    );

  for (const { permission } of plan.processPermissions.created)
    await workflowApi.createProcessPermission(
      client,
      processPermissionPayload(processId, permission),
    );

  for (const { ownerId, permission } of plan.statePermissions.created)
    await workflowApi.createStatePermission(
      client,
      statePermissionPayload(resolveId(stateIds, ownerId), permission),
    );

  for (const { ownerId, permission } of plan.actionPermissions.created)
    await workflowApi.createActionPermission(
      client,
      actionPermissionPayload(resolveId(actionIds, ownerId), permission),
    );

  // --- حذف‌ها ---
  for (const id of plan.links.deleted)
    await workflowApi.deleteTransitionAction(client, id);
  for (const id of plan.actionPermissions.deleted)
    await workflowApi.deleteActionPermission(client, id);
  for (const id of plan.statePermissions.deleted)
    await workflowApi.deleteStatePermission(client, id);
  for (const id of plan.processPermissions.deleted)
    await workflowApi.deleteProcessPermission(client, id);
  for (const id of plan.transitions.deleted)
    await workflowApi.deleteTransition(client, id);
  for (const id of plan.actions.deleted)
    await workflowApi.deleteAction(client, id);
  for (const id of plan.states.deleted)
    await workflowApi.deleteState(client, id);

  return { stateIds, actionIds, transitionIds };
};
