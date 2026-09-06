import { isTempId, nextTempId } from "@/Services/workflow/workflowPayloads";

import {
  CANVAS_PADDING,
  DEFAULT_GRANTEE_TYPE,
  NODE_HEIGHT,
  NODE_WIDTH,
  STATE_TYPE_IDS,
  isStartStateType,
  isTerminalStateType,
} from "./processSchema";

/**
 * تبدیل پاسخ بک‌اند به مدل بوم و برعکس.
 *
 * منبع داده: GET /workflow/get-process-info-by-id/<id>
 * (GetProcessInfoSerializer → many=True ، پس پاسخ یک آرایه است)
 *
 *   { id, name,
 *     process_states:      [{ id, name, description, state_type: {id, name},
 *                             state_permissions: [{ id, permission_type, grantee_type, group }] }],
 *     process_transitions: [{ id, process, current_state: {...}, next_state: {...} }],
 *     process_actions:     [{ id, name, description, action_type: {id, name},
 *                             action_permissions: [{ id, grantee_type, group }] }],
 *     process_permissions: [{ id, permission_type, grantee_type, group }] }
 *
 * اتصال Action به Transition در این پاسخ نیست و از
 * GET /workflow/get-transition-action/ گرفته و سمت کلاینت فیلتر می‌شود.
 *
 * مختصات (x, y) در بک‌اند وجود ندارد؛ بنابراین چیدمان خودکار محاسبه و
 * جابه‌جایی کاربر در localStorage مرورگر نگه داشته می‌شود.
 */

const POSITIONS_STORAGE_PREFIX = "process-builder:positions:";

const LEVEL_GAP = 76;
const SIBLING_GAP = 56;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

const asArray = (value) => (Array.isArray(value) ? value : []);

/** پاسخ get-process-info-by-id با many=True ساخته شده؛ اولین رکورد را برمی‌گرداند. */
export const pickProcessInfo = (payload) => {
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (payload && typeof payload === "object") return payload;
  return null;
};

const mapPermission = (item) => ({
  id: item?.id,
  permissionType: item?.permission_type ?? "view",
  granteeType: item?.grantee_type ?? DEFAULT_GRANTEE_TYPE,
  groupId: toNumber(item?.group?.id ?? item?.group_id ?? item?.group),
  groupName: item?.group?.name ?? "",
});

const mapActionPermission = (item) => ({
  id: item?.id,
  granteeType: item?.grantee_type ?? DEFAULT_GRANTEE_TYPE,
  groupId: toNumber(item?.group?.id ?? item?.group_id ?? item?.group),
  groupName: item?.group?.name ?? "",
});

const mapNode = (state) => ({
  id: state?.id,
  name: state?.name ?? "",
  description: state?.description ?? "",
  stateTypeId: toNumber(state?.state_type?.id ?? state?.state_type_id ?? state?.state_type) ?? STATE_TYPE_IDS.NORMAL,
  permissions: asArray(state?.state_permissions).map(mapPermission),
  x: 0,
  y: 0,
});

const mapEdge = (transition) => ({
  id: transition?.id,
  source: toNumber(transition?.current_state?.id ?? transition?.current_state_id ?? transition?.current_state),
  target: toNumber(transition?.next_state?.id ?? transition?.next_state_id ?? transition?.next_state),
  actions: [],
});

const mapAction = (action) => ({
  id: action?.id,
  name: action?.name ?? "",
  description: action?.description ?? "",
  actionTypeId: toNumber(action?.action_type?.id ?? action?.action_type_id ?? action?.action_type) ?? 1,
  permissions: asArray(action?.action_permissions).map(mapActionPermission),
});

/**
 * مدل بوم را از پاسخ‌های بک‌اند می‌سازد.
 *
 * @param {object|Array} infoPayload پاسخ get-process-info-by-id
 * @param {Array} transitionActions پاسخ get-transition-action
 */
export const buildGraph = (infoPayload, transitionActions) => {
  const info = pickProcessInfo(infoPayload);
  if (!info) return null;

  const processId = toNumber(info.id);
  const nodes = asArray(info.process_states).map(mapNode);
  const edges = asArray(info.process_transitions).map(mapEdge);
  const actions = asArray(info.process_actions).map(mapAction);
  const permissions = asArray(info.process_permissions).map(mapPermission);

  const edgeById = new Map(edges.map((edge) => [edge.id, edge]));

  asArray(transitionActions).forEach((item) => {
    const linkedProcessId = toNumber(
      item?.transition?.process?.id ?? item?.transition?.process ?? item?.process_id
    );
    if (linkedProcessId !== null && processId !== null && linkedProcessId !== processId) return;

    const transitionId = toNumber(item?.transition?.id ?? item?.transition_id ?? item?.transition);
    const actionId = toNumber(item?.action?.id ?? item?.action_id ?? item?.action);
    const edge = edgeById.get(transitionId);
    if (!edge || actionId === null) return;
    if (edge.actions.some((link) => link.actionId === actionId)) return;

    edge.actions.push({ id: item?.id, actionId });
  });

  return {
    id: processId,
    name: info.name ?? "",
    nodes,
    edges: edges.filter((edge) => edge.source !== null && edge.target !== null),
    actions,
    permissions,
  };
};

export const emptyGraph = (processId, name = "") => ({
  id: toNumber(processId),
  name,
  nodes: [],
  edges: [],
  actions: [],
  permissions: [],
});

export const cloneGraph = (graph) => ({
  ...graph,
  nodes: graph.nodes.map((node) => ({ ...node, permissions: node.permissions.map((p) => ({ ...p })) })),
  edges: graph.edges.map((edge) => ({ ...edge, actions: edge.actions.map((a) => ({ ...a })) })),
  actions: graph.actions.map((action) => ({
    ...action,
    permissions: action.permissions.map((p) => ({ ...p })),
  })),
  permissions: graph.permissions.map((p) => ({ ...p })),
});

const permissionSignature = (list) =>
  list
    .map((item) => [item.permissionType ?? "", item.granteeType ?? "", item.groupId ?? ""].join("|"))
    .sort()
    .join(",");

/**
 * امضای منطقی گراف برای تشخیص تغییرات ذخیره‌نشده.
 * مختصات عمداً در امضا نیستند، چون بک‌اند آن‌ها را نگه نمی‌دارد.
 */
export const graphSignature = (graph) => {
  if (!graph) return "";
  return JSON.stringify({
    name: trimmed(graph.name),
    nodes: graph.nodes
      .map((node) =>
        [
          String(node.id),
          trimmed(node.name),
          trimmed(node.description),
          Number(node.stateTypeId),
          permissionSignature(node.permissions),
        ].join("|")
      )
      .sort(),
    edges: graph.edges
      .map((edge) =>
        [
          String(edge.source),
          String(edge.target),
          edge.actions
            .map((link) => String(link.actionId))
            .sort()
            .join("+"),
        ].join("|")
      )
      .sort(),
    actions: graph.actions
      .map((action) =>
        [
          String(action.id),
          trimmed(action.name),
          trimmed(action.description),
          Number(action.actionTypeId),
          action.permissions
            .map((item) => [item.granteeType ?? "", item.groupId ?? ""].join("|"))
            .sort()
            .join(","),
        ].join("|")
      )
      .sort(),
    permissions: permissionSignature(graph.permissions),
  });
};

export const createNode = ({ stateTypeId, x = CANVAS_PADDING, y = CANVAS_PADDING, name = "" }) => ({
  id: nextTempId("state"),
  name,
  description: "",
  stateTypeId: toNumber(stateTypeId) ?? STATE_TYPE_IDS.NORMAL,
  permissions: [],
  x,
  y,
});

export const createEdge = ({ source, target }) => ({
  id: nextTempId("transition"),
  source,
  target,
  actions: [],
});

export const createAction = ({ actionTypeId, name = "", description = "" }) => ({
  id: nextTempId("action"),
  name,
  description,
  actionTypeId: toNumber(actionTypeId) ?? 1,
  permissions: [],
});

export const createPermission = ({ permissionType = "view", groupId = null }) => ({
  id: nextTempId("permission"),
  permissionType,
  granteeType: DEFAULT_GRANTEE_TYPE,
  groupId,
  groupName: "",
});

export const findNode = (graph, nodeId) =>
  graph?.nodes.find((node) => String(node.id) === String(nodeId)) ?? null;

export const findEdge = (graph, edgeId) =>
  graph?.edges.find((edge) => String(edge.id) === String(edgeId)) ?? null;

export const findAction = (graph, actionId) =>
  graph?.actions.find((action) => String(action.id) === String(actionId)) ?? null;

/* ------------------------------- مختصات ------------------------------- */

export const readStoredPositions = (processId) => {
  if (!processId || typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(`${POSITIONS_STORAGE_PREFIX}${processId}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const writeStoredPositions = (processId, nodes) => {
  if (!processId || typeof window === "undefined") return;
  try {
    const positions = nodes.reduce((acc, node) => {
      if (!isTempId(node.id)) acc[node.id] = { x: Math.round(node.x), y: Math.round(node.y) };
      return acc;
    }, {});
    window.localStorage.setItem(
      `${POSITIONS_STORAGE_PREFIX}${processId}`,
      JSON.stringify(positions)
    );
  } catch {
    /* ذخیره مختصات اختیاری است و خطای آن نباید بوم را خراب کند. */
  }
};

/**
 * چیدمان خودکار لایه‌ای (از ایستگاه شروع به پایین) برای گرافی که مختصات ندارد.
 * مختصات ذخیره‌شده‌ی کاربر بر چیدمان خودکار اولویت دارد.
 */
export const layoutGraph = (graph, storedPositions = {}) => {
  if (!graph) return graph;

  const levels = new Map();
  const visited = new Set();
  const queue = [];

  graph.nodes
    .filter((node) => isStartStateType(node.stateTypeId))
    .forEach((node) => {
      levels.set(node.id, 0);
      visited.add(node.id);
      queue.push(node.id);
    });

  if (queue.length === 0 && graph.nodes.length > 0) {
    const first = graph.nodes[0];
    levels.set(first.id, 0);
    visited.add(first.id);
    queue.push(first.id);
  }

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentLevel = levels.get(currentId) ?? 0;
    graph.edges
      .filter((edge) => String(edge.source) === String(currentId))
      .forEach((edge) => {
        if (visited.has(edge.target)) return;
        visited.add(edge.target);
        levels.set(edge.target, currentLevel + 1);
        queue.push(edge.target);
      });
  }

  let orphanLevel = Math.max(-1, ...Array.from(levels.values())) + 1;
  graph.nodes.forEach((node) => {
    if (!levels.has(node.id)) {
      levels.set(node.id, orphanLevel);
      orphanLevel += 1;
    }
  });

  const buckets = new Map();
  graph.nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    if (!buckets.has(level)) buckets.set(level, []);
    buckets.get(level).push(node);
  });

  const widest = Math.max(1, ...Array.from(buckets.values(), (bucket) => bucket.length));
  const rowWidth = widest * NODE_WIDTH + (widest - 1) * SIBLING_GAP;

  const nodes = graph.nodes.map((node) => {
    const stored = storedPositions[node.id];
    if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
      return { ...node, x: stored.x, y: stored.y };
    }

    const level = levels.get(node.id) ?? 0;
    const bucket = buckets.get(level) ?? [node];
    const index = bucket.indexOf(node);
    const bucketWidth = bucket.length * NODE_WIDTH + (bucket.length - 1) * SIBLING_GAP;
    const offset = CANVAS_PADDING + (rowWidth - bucketWidth) / 2;

    return {
      ...node,
      x: Math.round(offset + index * (NODE_WIDTH + SIBLING_GAP)),
      y: Math.round(CANVAS_PADDING + level * (NODE_HEIGHT + LEVEL_GAP)),
    };
  });

  return { ...graph, nodes };
};

export const graphBounds = (nodes) => {
  if (!nodes.length) {
    return { minX: 0, minY: 0, maxX: NODE_WIDTH, maxY: NODE_HEIGHT, width: NODE_WIDTH, height: NODE_HEIGHT };
  }
  const minX = Math.min(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxX = Math.max(...nodes.map((node) => node.x + NODE_WIDTH));
  const maxY = Math.max(...nodes.map((node) => node.y + NODE_HEIGHT));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};

/** مسیر بزیه بین دو ایستگاه به همراه نقطه‌ی میانی برای برچسب و دکمه‌ی حذف. */
export const edgeGeometry = (source, target) => {
  const startX = source.x + NODE_WIDTH / 2;
  const startY = source.y + NODE_HEIGHT;
  const endX = target.x + NODE_WIDTH / 2;
  const endY = target.y;

  const distance = Math.max(48, Math.abs(endY - startY) / 2);
  const path = `M ${startX} ${startY} C ${startX} ${startY + distance}, ${endX} ${endY - distance}, ${endX} ${endY}`;

  return {
    path,
    midX: (startX + endX) / 2,
    midY: (startY + endY) / 2,
    startX,
    startY,
    endX,
    endY,
  };
};

/* ------------------------------ اعتبارسنجی ------------------------------ */

/**
 * اعتبارسنجی فرایند بر اساس قوانین واقعی بک‌اند:
 *  - نبود ایستگاه شروع → add-request خطای «فرایند دارای مرحله اغازین نمی باشد» می‌دهد
 *  - name ایستگاه و name/description عملیات در مدل بک‌اند اجباری هستند
 *  - درخواست فقط وقتی جلو می‌رود که عملیات‌های یک انتقال کامل شوند
 *    → انتقال بدون عملیات، درخواست را متوقف می‌کند
 *  - برای دیدن/انجام عملیات، دسترسی سمت‌ها لازم است
 */
export const validateGraph = (graph) => {
  const errors = [];
  const warnings = [];

  if (!graph) return { errors, warnings };

  if (!trimmed(graph.name)) errors.push("نام فرایند الزامی است.");
  if (graph.nodes.length === 0) errors.push("فرایند باید حداقل یک ایستگاه داشته باشد.");

  const startNodes = graph.nodes.filter((node) => isStartStateType(node.stateTypeId));
  if (graph.nodes.length > 0 && startNodes.length === 0) {
    errors.push("فرایند ایستگاه شروع ندارد؛ بدون آن امکان ایجاد درخواست وجود ندارد.");
  }
  if (startNodes.length > 1) {
    warnings.push("بیش از یک ایستگاه شروع دارید؛ درخواست فقط از یکی از آن‌ها آغاز می‌شود.");
  }

  const completeNodes = graph.nodes.filter(
    (node) => Number(node.stateTypeId) === STATE_TYPE_IDS.COMPLETE
  );
  if (graph.nodes.length > 0 && completeNodes.length === 0) {
    warnings.push("فرایند ایستگاه پایان ندارد؛ درخواست‌ها هیچ‌وقت تکمیل نمی‌شوند.");
  }

  graph.nodes.forEach((node) => {
    if (!trimmed(node.name)) errors.push("نام همه‌ی ایستگاه‌ها باید پر شود.");
    if (trimmed(node.name).length > 255) errors.push(`نام ایستگاه «${node.name}» بیش از ۲۵۵ کاراکتر است.`);
  });

  const nodeIds = new Set(graph.nodes.map((node) => String(node.id)));
  const seenEdges = new Set();

  graph.edges.forEach((edge) => {
    if (!nodeIds.has(String(edge.source)) || !nodeIds.has(String(edge.target))) {
      errors.push("یک ارتباط ناقص است و به ایستگاه موجود متصل نیست.");
      return;
    }
    if (String(edge.source) === String(edge.target)) {
      errors.push("ارتباط باید بین دو ایستگاه متفاوت باشد.");
      return;
    }
    const key = `${edge.source}->${edge.target}`;
    if (seenEdges.has(key)) {
      warnings.push("بین دو ایستگاه ارتباط تکراری وجود دارد.");
    }
    seenEdges.add(key);

    if (edge.actions.length === 0) {
      warnings.push(
        "برای یک ارتباط هیچ عملیاتی تعریف نشده؛ درخواست در آن مرحله قابل پیشروی نیست."
      );
    }
  });

  graph.nodes.forEach((node) => {
    const hasOutgoing = graph.edges.some((edge) => String(edge.source) === String(node.id));
    const hasIncoming = graph.edges.some((edge) => String(edge.target) === String(node.id));

    if (!hasOutgoing && !isTerminalStateType(node.stateTypeId)) {
      warnings.push(`ایستگاه «${node.name || "بی‌نام"}» ارتباط خروجی ندارد.`);
    }
    if (!hasIncoming && !isStartStateType(node.stateTypeId)) {
      warnings.push(`ایستگاه «${node.name || "بی‌نام"}» ارتباط ورودی ندارد و در دسترس قرار نمی‌گیرد.`);
    }
  });

  graph.actions.forEach((action) => {
    if (!trimmed(action.name)) errors.push("نام همه‌ی عملیات‌ها باید پر شود.");
    if (!trimmed(action.description)) {
      errors.push(`توضیحات عملیات «${action.name || "بی‌نام"}» الزامی است.`);
    }
    if (action.permissions.length === 0) {
      warnings.push(`عملیات «${action.name || "بی‌نام"}» به هیچ سمتی داده نشده است.`);
    }
  });

  const usedActionIds = new Set(
    graph.edges.flatMap((edge) => edge.actions.map((link) => String(link.actionId)))
  );
  graph.actions.forEach((action) => {
    if (!usedActionIds.has(String(action.id))) {
      warnings.push(`عملیات «${action.name || "بی‌نام"}» به هیچ ارتباطی وصل نشده است.`);
    }
  });

  graph.permissions.forEach((permission) => {
    if (permission.granteeType === "group" && !permission.groupId) {
      errors.push("برای دسترسی فرایند باید سمت انتخاب شود.");
    }
  });
  graph.nodes.forEach((node) => {
    node.permissions.forEach((permission) => {
      if (permission.granteeType === "group" && !permission.groupId) {
        errors.push(`برای دسترسی ایستگاه «${node.name || "بی‌نام"}» باید سمت انتخاب شود.`);
      }
    });
  });
  graph.actions.forEach((action) => {
    action.permissions.forEach((permission) => {
      if (permission.granteeType === "group" && !permission.groupId) {
        errors.push(`برای دسترسی عملیات «${action.name || "بی‌نام"}» باید سمت انتخاب شود.`);
      }
    });
  });

  if (graph.permissions.length === 0) {
    warnings.push("برای هیچ سمتی دسترسی فرایند تعریف نشده؛ کاربران عادی آن را نمی‌بینند.");
  }

  return {
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
  };
};
