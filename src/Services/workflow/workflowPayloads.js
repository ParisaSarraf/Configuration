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

export const fieldLockRulePayload = (stateId, fieldId) => ({
  state_id: Number(stateId),
  form_field_id: Number(fieldId),
});

export const actionPermissionPayload = (actionId, permission) => ({
  action_id: Number(actionId),
  grantee_type: permission.granteeType,
  ...(permission.groupId ? { group_id: Number(permission.groupId) } : {}),
});

// ---------- diff ----------

const byId = (list = []) =>
  new Map(list.map((item) => [String(item.id), item]));

const emptyPlan = () => ({
  processName: null,
  states: { created: [], updated: [], deleted: [] },
  transitions: { created: [], updated: [], deleted: [] },
  actions: { created: [], updated: [], deleted: [] },
  links: { created: [], deleted: [] },
  processPermissions: { created: [], deleted: [] },
  statePermissions: { created: [], deleted: [] },
  fieldLockRules: { created: [], deleted: [] },
  actionPermissions: { created: [], deleted: [] },
});

const diffPermissions = (initialList, currentList, ownerId, bucket) => {
  const initial = byId(initialList);
  const current = byId(currentList);

  currentList.forEach((permission) => {
    if (isTempId(permission.id)) bucket.created.push({ ownerId, permission });
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

  current.nodes.forEach((node) => {
    const before = initialNodes.get(String(node.id));
    const initialLocks = new Set(
      (before?.lockedFieldRules ?? []).map((rule) => String(rule.formFieldId)),
    );
    const currentLocks = new Set((node.lockedFieldIds ?? []).map(String));
    currentLocks.forEach((fieldId) => {
      if (!initialLocks.has(fieldId))
        plan.fieldLockRules.created.push({ stateId: node.id, fieldId });
    });
    (before?.lockedFieldRules ?? []).forEach((rule) => {
      if (!currentLocks.has(String(rule.formFieldId)))
        plan.fieldLockRules.deleted.push(rule.id);
    });
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
    plan.fieldLockRules,
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

/**
 * تغییراتی که در ذخیره‌ی جزئی خطا خورده‌اند را دوباره روی نسخه‌ی تازه‌ی سرور
 * اعمال می‌کند؛ به این ترتیب موارد موفق تکرار نمی‌شوند و فقط موارد ناموفق
 * برای تلاش بعدی در حالت «ذخیره‌نشده» باقی می‌مانند.
 */
export const reapplySavePlan = (serverGraph, plan) => {
  if (!serverGraph || !plan || planChangeCount(plan) === 0) return serverGraph;
  const next = JSON.parse(JSON.stringify(serverGraph));
  const sameId = (left, right) => String(left) === String(right);
  const upsert = (list, item) => {
    const index = list.findIndex((entry) => sameId(entry.id, item.id));
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  };
  const removeIds = (list, ids) =>
    list.filter((item) => !ids.some((id) => sameId(item.id, id)));

  if (plan.processName) next.name = plan.processName;

  plan.states.created.forEach((item) => upsert(next.nodes, item));
  plan.states.updated.forEach((item) => upsert(next.nodes, item));
  next.nodes = removeIds(next.nodes, plan.states.deleted);

  plan.transitions.created.forEach((item) => upsert(next.edges, item));
  plan.transitions.updated.forEach((item) => upsert(next.edges, item));
  next.edges = removeIds(next.edges, plan.transitions.deleted);

  plan.actions.created.forEach((item) => upsert(next.actions, item));
  plan.actions.updated.forEach((item) => upsert(next.actions, item));
  next.actions = removeIds(next.actions, plan.actions.deleted);

  plan.links.created.forEach(({ edgeId, actionId }) => {
    const edge = next.edges.find((item) => sameId(item.id, edgeId));
    if (!edge) return;
    edge.actions = edge.actions ?? [];
    if (!edge.actions.some((item) => sameId(item.actionId, actionId))) {
      edge.actions.push({ id: nextTempId("transition-action"), actionId });
    }
  });
  next.edges.forEach((edge) => {
    edge.actions = removeIds(edge.actions ?? [], plan.links.deleted);
  });

  plan.processPermissions.created.forEach(({ permission }) =>
    upsert(next.permissions, permission),
  );
  next.permissions = removeIds(
    next.permissions ?? [],
    plan.processPermissions.deleted,
  );

  plan.statePermissions.created.forEach(({ ownerId, permission }) => {
    const node = next.nodes.find((item) => sameId(item.id, ownerId));
    if (node) upsert(node.permissions, permission);
  });
  next.nodes.forEach((node) => {
    node.permissions = removeIds(
      node.permissions ?? [],
      plan.statePermissions.deleted,
    );
  });

  plan.fieldLockRules.created.forEach(({ stateId, fieldId }) => {
    const node = next.nodes.find((item) => sameId(item.id, stateId));
    if (!node) return;
    node.lockedFieldIds = node.lockedFieldIds ?? [];
    if (!node.lockedFieldIds.some((id) => sameId(id, fieldId)))
      node.lockedFieldIds.push(fieldId);
  });
  next.nodes.forEach((node) => {
    const deletedFieldIds = (node.lockedFieldRules ?? [])
      .filter((rule) =>
        plan.fieldLockRules.deleted.some((id) => sameId(rule.id, id)),
      )
      .map((rule) => rule.formFieldId);
    node.lockedFieldIds = (node.lockedFieldIds ?? []).filter(
      (id) => !deletedFieldIds.some((fieldId) => sameId(id, fieldId)),
    );
  });

  plan.actionPermissions.created.forEach(({ ownerId, permission }) => {
    const action = next.actions.find((item) => sameId(item.id, ownerId));
    if (action) upsert(action.permissions, permission);
  });
  next.actions.forEach((action) => {
    action.permissions = removeIds(
      action.permissions ?? [],
      plan.actionPermissions.deleted,
    );
  });

  return next;
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
  const errors = [];
  const failedPlan = emptyPlan();
  let succeededCount = 0;
  let attemptedCount = 0;

  const remapId = (map, id) => map.get(String(id)) ?? id;
  const requireServerId = (map, id, label) => {
    const value = remapId(map, id);
    if (isTempId(value) || !Number.isFinite(Number(value)))
      throw new Error(`وابستگی «${label}» هنوز ذخیره نشده است.`);
    return Number(value);
  };

  const attempt = async (label, task, onSuccess, onFailure) => {
    attemptedCount += 1;
    try {
      const result = await task();
      succeededCount += 1;
      onSuccess?.(result);
      return result;
    } catch (error) {
      errors.push({ label, error });
      onFailure?.(error);
      return null;
    }
  };

  if (plan.processName)
    await attempt(
      "نام فرایند",
      () =>
        workflowApi.updateProcess(client, processId, {
          name: plan.processName,
        }),
      null,
      () => {
        failedPlan.processName = plan.processName;
      },
    );

  for (const node of plan.states.created)
    await attempt(
      `ساخت مرحله «${node.name || "بی‌نام"}»`,
      () => workflowApi.createState(client, statePayload(node, processId)),
      (created) => stateIds.set(String(node.id), created?.id),
      () => failedPlan.states.created.push(node),
    );

  for (const node of plan.states.updated)
    await attempt(
      `ویرایش مرحله «${node.name || node.id}»`,
      () => workflowApi.updateState(client, node.id, stateUpdatePayload(node)),
      null,
      () => failedPlan.states.updated.push(node),
    );

  for (const edge of plan.transitions.created) {
    const pendingEdge = {
      ...edge,
      source: remapId(stateIds, edge.source),
      target: remapId(stateIds, edge.target),
    };
    await attempt(
      "ساخت مسیر",
      () =>
        workflowApi.createTransition(
          client,
          transitionPayload(
            processId,
            requireServerId(stateIds, edge.source, "مرحله مبدأ"),
            requireServerId(stateIds, edge.target, "مرحله مقصد"),
          ),
        ),
      (created) => transitionIds.set(String(edge.id), created?.id),
      () => failedPlan.transitions.created.push(pendingEdge),
    );
  }

  for (const edge of plan.transitions.updated) {
    const pendingEdge = {
      ...edge,
      source: remapId(stateIds, edge.source),
      target: remapId(stateIds, edge.target),
    };
    await attempt(
      `ویرایش مسیر ${edge.id}`,
      () =>
        workflowApi.updateTransition(
          client,
          edge.id,
          transitionPayload(
            processId,
            requireServerId(stateIds, edge.source, "مرحله مبدأ"),
            requireServerId(stateIds, edge.target, "مرحله مقصد"),
          ),
        ),
      null,
      () => failedPlan.transitions.updated.push(pendingEdge),
    );
  }

  for (const action of plan.actions.created)
    await attempt(
      `ساخت عملیات «${action.name || "بی‌نام"}»`,
      () => workflowApi.createAction(client, actionPayload(action, processId)),
      (created) => actionIds.set(String(action.id), created?.id),
      () => failedPlan.actions.created.push(action),
    );

  for (const action of plan.actions.updated)
    await attempt(
      `ویرایش عملیات «${action.name || action.id}»`,
      () =>
        workflowApi.updateAction(
          client,
          action.id,
          actionUpdatePayload(action),
        ),
      null,
      () => failedPlan.actions.updated.push(action),
    );

  for (const link of plan.links.created) {
    const pendingLink = {
      edgeId: remapId(transitionIds, link.edgeId),
      actionId: remapId(actionIds, link.actionId),
    };
    await attempt(
      "اتصال عملیات به مسیر",
      () =>
        workflowApi.createTransitionAction(
          client,
          transitionActionPayload(
            requireServerId(actionIds, link.actionId, "عملیات"),
            requireServerId(transitionIds, link.edgeId, "مسیر"),
          ),
        ),
      null,
      () => failedPlan.links.created.push(pendingLink),
    );
  }

  for (const item of plan.processPermissions.created)
    await attempt(
      "افزودن دسترسی فرایند",
      () =>
        workflowApi.createProcessPermission(
          client,
          processPermissionPayload(processId, item.permission),
        ),
      null,
      () => failedPlan.processPermissions.created.push(item),
    );

  for (const item of plan.statePermissions.created) {
    const pending = { ...item, ownerId: remapId(stateIds, item.ownerId) };
    await attempt(
      "افزودن دسترسی مرحله",
      () =>
        workflowApi.createStatePermission(
          client,
          statePermissionPayload(
            requireServerId(stateIds, item.ownerId, "مرحله"),
            item.permission,
          ),
        ),
      null,
      () => failedPlan.statePermissions.created.push(pending),
    );
  }

  for (const item of plan.fieldLockRules.created) {
    const pending = { ...item, stateId: remapId(stateIds, item.stateId) };
    await attempt(
      "قفل‌کردن فیلد مرحله",
      () =>
        workflowApi.createFormFieldLockRule(
          client,
          fieldLockRulePayload(
            requireServerId(stateIds, item.stateId, "مرحله"),
            item.fieldId,
          ),
        ),
      null,
      () => failedPlan.fieldLockRules.created.push(pending),
    );
  }

  for (const item of plan.actionPermissions.created) {
    const pending = { ...item, ownerId: remapId(actionIds, item.ownerId) };
    await attempt(
      "افزودن دسترسی عملیات",
      () =>
        workflowApi.createActionPermission(
          client,
          actionPermissionPayload(
            requireServerId(actionIds, item.ownerId, "عملیات"),
            item.permission,
          ),
        ),
      null,
      () => failedPlan.actionPermissions.created.push(pending),
    );
  }

  const deletions = [
    ["links", "حذف اتصال عملیات", workflowApi.deleteTransitionAction],
    [
      "actionPermissions",
      "حذف دسترسی عملیات",
      workflowApi.deleteActionPermission,
    ],
    ["statePermissions", "حذف دسترسی مرحله", workflowApi.deleteStatePermission],
    ["fieldLockRules", "حذف قفل فیلد", workflowApi.deleteFormFieldLockRule],
    [
      "processPermissions",
      "حذف دسترسی فرایند",
      workflowApi.deleteProcessPermission,
    ],
    ["transitions", "حذف مسیر", workflowApi.deleteTransition],
    ["actions", "حذف عملیات", workflowApi.deleteAction],
    ["states", "حذف مرحله", workflowApi.deleteState],
  ];
  for (const [bucketName, label, removeItem] of deletions) {
    for (const id of plan[bucketName].deleted)
      await attempt(
        `${label} ${id}`,
        () => removeItem(client, id),
        null,
        () => failedPlan[bucketName].deleted.push(id),
      );
  }

  return {
    stateIds,
    actionIds,
    transitionIds,
    errors,
    failedPlan,
    succeededCount,
    attemptedCount,
  };
};
