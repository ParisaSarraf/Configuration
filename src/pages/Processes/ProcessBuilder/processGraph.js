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

const mapLockRule = (item) => ({
  id: item?.id,
  formFieldId: toNumber(
    item?.form_field?.id ??
      item?.form_field_id ??
      item?.field?.id ??
      item?.field_id ??
      item?.form_field,
  ),
});

const processLockStates = (payload, processId) => {
  const unwrapped = payload?.data ?? payload?.results ?? payload;
  const roots = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapped
      ? [unwrapped]
      : [];
  return roots
    .filter((item) => {
      const itemProcessId = toNumber(
        item?.id ?? item?.process_id ?? item?.process,
      );
      return (
        processId === null ||
        itemProcessId === null ||
        itemProcessId === processId
      );
    })
    .flatMap((item) =>
      asArray(item?.process_states ?? item?.states ?? item?.process_state),
    );
};

const lockRulesOf = (state) =>
  asArray(
    state?.field_lock_rules ??
      state?.form_field_lock_rules ??
      state?.locked_fields,
  )
    .map(mapLockRule)
    .filter((rule) => rule.formFieldId !== null);

const mergeProcessLocks = (nodes, payload, processId) => {
  const states = processLockStates(payload, processId);
  if (states.length === 0) return nodes;
  const rulesByStateId = new Map(
    states.map((state) => [String(state?.id), lockRulesOf(state)]),
  );
  return nodes.map((node) => {
    const rules = rulesByStateId.get(String(node.id));
    if (!rulesByStateId.has(String(node.id))) return node;
    return {
      ...node,
      lockedFieldRules: rules,
      lockedFieldIds: rules.map((rule) => rule.formFieldId),
    };
  });
};

const lockedFormFields = (payload, processId) =>
  processLockStates(payload, processId)
    .flatMap((state) =>
      asArray(
        state?.field_lock_rules ??
          state?.form_field_lock_rules ??
          state?.locked_fields,
      ),
    )
    .map((rule) => rule?.form_field ?? rule?.field)
    .filter(Boolean);

const mapNode = (state) => ({
  id: state?.id,
  name: state?.name ?? "",
  description: state?.description ?? "",
  stateTypeId:
    toNumber(
      state?.state_type?.id ?? state?.state_type_id ?? state?.state_type,
    ) ?? STATE_TYPE_IDS.NORMAL,
  permissions: asArray(state?.state_permissions).map(mapPermission),
  lockedFieldRules: lockRulesOf(state),
  lockedFieldIds: lockRulesOf(state).map((rule) => rule.formFieldId),
  x: 0,
  y: 0,
});

const mapEdge = (transition) => ({
  id: transition?.id,
  source: toNumber(
    transition?.current_state?.id ??
      transition?.current_state_id ??
      transition?.current_state,
  ),
  target: toNumber(
    transition?.next_state?.id ??
      transition?.next_state_id ??
      transition?.next_state,
  ),
  actions: [],
});

const mapAction = (action) => ({
  id: action?.id,
  name: action?.name ?? "",
  description: action?.description ?? "",
  actionTypeId:
    toNumber(
      action?.action_type?.id ?? action?.action_type_id ?? action?.action_type,
    ) ?? 1,
  permissions: asArray(action?.action_permissions).map(mapActionPermission),
});

/**
 * مدل بوم را از پاسخ‌های بک‌اند می‌سازد.
 *
 * @param {object|Array} infoPayload پاسخ get-process-info-by-id
 * @param {Array} transitionActions پاسخ get-transition-action
 */
export const buildGraph = (
  infoPayload,
  transitionActions,
  processLocks = null,
) => {
  const info = pickProcessInfo(infoPayload);
  if (!info) return null;

  const processId = toNumber(info.id);
  const nodes = mergeProcessLocks(
    asArray(info.process_states).map(mapNode),
    processLocks,
    processId,
  );
  const edges = asArray(info.process_transitions).map(mapEdge);
  const actions = asArray(info.process_actions).map(mapAction);
  const permissions = asArray(info.process_permissions).map(mapPermission);

  const edgeById = new Map(edges.map((edge) => [edge.id, edge]));

  asArray(transitionActions).forEach((item) => {
    const linkedProcessId = toNumber(
      item?.transition?.process?.id ??
        item?.transition?.process ??
        item?.process_id,
    );
    if (
      linkedProcessId !== null &&
      processId !== null &&
      linkedProcessId !== processId
    )
      return;

    const transitionId = toNumber(
      item?.transition?.id ?? item?.transition_id ?? item?.transition,
    );
    const actionId = toNumber(
      item?.action?.id ?? item?.action_id ?? item?.action,
    );
    const edge = edgeById.get(transitionId);
    if (!edge || actionId === null) return;
    if (edge.actions.some((link) => link.actionId === actionId)) return;

    edge.actions.push({ id: item?.id, actionId });
  });

  return {
    id: processId,
    name: info.name ?? "",
    formDefinitionId:
      toNumber(
        info.form_definition?.id ??
          info.form_definition_id ??
          info.form_definition,
      ) ?? null,
    formFields: [
      ...asArray(info.form_definition?.fields),
      ...lockedFormFields(processLocks, processId),
    ].filter(
      (field, index, fields) =>
        fields.findIndex((item) => String(item?.id) === String(field?.id)) ===
        index,
    ),
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
  nodes: graph.nodes.map((node) => ({
    ...node,
    permissions: node.permissions.map((p) => ({ ...p })),
    lockedFieldRules: (node.lockedFieldRules ?? []).map((r) => ({ ...r })),
    lockedFieldIds: [...(node.lockedFieldIds ?? [])],
  })),
  edges: graph.edges.map((edge) => ({
    ...edge,
    actions: edge.actions.map((a) => ({ ...a })),
  })),
  actions: graph.actions.map((action) => ({
    ...action,
    permissions: action.permissions.map((p) => ({ ...p })),
  })),
  permissions: graph.permissions.map((p) => ({ ...p })),
});

const permissionSignature = (list) =>
  list
    .map((item) =>
      [
        item.permissionType ?? "",
        item.granteeType ?? "",
        item.groupId ?? "",
      ].join("|"),
    )
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
          (node.lockedFieldIds ?? []).map(String).sort().join(","),
        ].join("|"),
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
        ].join("|"),
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
            .map((item) =>
              [item.granteeType ?? "", item.groupId ?? ""].join("|"),
            )
            .sort()
            .join(","),
        ].join("|"),
      )
      .sort(),
    permissions: permissionSignature(graph.permissions),
  });
};

export const createNode = ({
  stateTypeId,
  x = CANVAS_PADDING,
  y = CANVAS_PADDING,
  name = "",
}) => ({
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

// توضیحات در بک‌اند اجباری است؛ پس اگر خالی باشد از نام عملیات ساخته می‌شود
// تا کاربر با خطای اجباری‌بودن توضیحات روبرو نشود. مقدار قابل ویرایش است.
export const createAction = ({
  actionTypeId,
  name = "",
  description = "",
}) => ({
  id: nextTempId("action"),
  name,
  description: description || (name ? `عملیات «${name}» در این مرحله.` : ""),
  actionTypeId: toNumber(actionTypeId) ?? 1,
  permissions: [],
});

export const createPermission = ({
  permissionType = "view",
  groupId = null,
}) => ({
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
  graph?.actions.find((action) => String(action.id) === String(actionId)) ??
  null;

/**
 * قانون قفلِ یک مرحله بعد از خروج از همان مرحله فعال می‌شود.
 * بنابراین در مرحله جاری فقط قفل‌های مراحل بالادستی (بدون خود مرحله جاری)
 * جمع می‌شوند و در تمام ادامه مسیر ماندگار می‌مانند.
 */
export const cumulativeLockedFieldIds = (graph, currentStateId) => {
  if (!graph || currentStateId == null) return [];

  const currentId = String(currentStateId);
  const ancestors = new Set();
  const visited = new Set([currentId]);
  const queue = [currentId];

  while (queue.length) {
    const targetId = queue.shift();
    (graph.edges ?? [])
      .filter((edge) => String(edge.target) === targetId)
      .forEach((edge) => {
        const sourceId = String(edge.source);
        if (visited.has(sourceId)) return;
        visited.add(sourceId);
        ancestors.add(sourceId);
        queue.push(sourceId);
      });
  }

  const fieldIds = new Set();
  (graph.nodes ?? []).forEach((node) => {
    if (!ancestors.has(String(node.id))) return;
    (node.lockedFieldIds ?? []).forEach((fieldId) =>
      fieldIds.add(String(fieldId)),
    );
  });

  return Array.from(fieldIds);
};

/* ------------------------------- مختصات ------------------------------- */

export const readStoredPositions = (processId) => {
  if (!processId || typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      `${POSITIONS_STORAGE_PREFIX}${processId}`,
    );
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
      if (!isTempId(node.id))
        acc[node.id] = { x: Math.round(node.x), y: Math.round(node.y) };
      return acc;
    }, {});
    window.localStorage.setItem(
      `${POSITIONS_STORAGE_PREFIX}${processId}`,
      JSON.stringify(positions),
    );
  } catch {
    /* ذخیره مختصات اختیاری است و خطای آن نباید بوم را خراب کند. */
  }
};

/**
 * چیدمان خودکار لایه‌ای (از مرحله شروع به پایین) برای گرافی که مختصات ندارد.
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

  const widest = Math.max(
    1,
    ...Array.from(buckets.values(), (bucket) => bucket.length),
  );
  const rowWidth = widest * NODE_WIDTH + (widest - 1) * SIBLING_GAP;

  const nodes = graph.nodes.map((node) => {
    const stored = storedPositions[node.id];
    if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
      return { ...node, x: stored.x, y: stored.y };
    }

    const level = levels.get(node.id) ?? 0;
    const bucket = buckets.get(level) ?? [node];
    const index = bucket.indexOf(node);
    const bucketWidth =
      bucket.length * NODE_WIDTH + (bucket.length - 1) * SIBLING_GAP;
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
    return {
      minX: 0,
      minY: 0,
      maxX: NODE_WIDTH,
      maxY: NODE_HEIGHT,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
  }
  const minX = Math.min(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxX = Math.max(...nodes.map((node) => node.x + NODE_WIDTH));
  const maxY = Math.max(...nodes.map((node) => node.y + NODE_HEIGHT));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};

/* --------------------------- هندسهٔ خطوط فرایند --------------------------- */
//
// مسیریابی به سبک draw.io: هر خط از ضلعی از مبدأ که رو به مقصد است بیرون
// می‌آید، با پاره‌های عمودی/افقی و گوشه‌های گرد پیش می‌رود و از ضلع مقابلِ
// مقصد وارد می‌شود. خطوطِ هم‌گروه (رفت و برگشت بین یک جفت مرحله) در «لِین»های
// جدا حرکت می‌کنند تا هر جهت، خط و برچسب خودش را داشته باشد.

/** فاصلهٔ خطوط هم‌گروه از یکدیگر. */
export const EDGE_LANE_GAP = 36;
/** امتداد کوتاه عمود بر ضلع، پیش از اولین گوشه. */
const EDGE_STUB = 20;
/** شعاع گردی گوشه‌ها. */
const EDGE_CORNER_RADIUS = 10;
/** حداقل فاصله از بدنهٔ مراحل هنگام دور زدن. */
const EDGE_CLEARANCE = 26;
/** موقعیت برچسب روی طول خط؛ وقتی چند خط بین دو مرحله هست، از میانه فاصله می‌گیرد. */
const EDGE_LABEL_T = 0.5;
const EDGE_LABEL_T_GROUPED = 0.35;

const round2 = (value) => Math.round(value * 100) / 100;

const rectOf = (node) => ({
  left: node.x,
  top: node.y,
  right: node.x + NODE_WIDTH,
  bottom: node.y + NODE_HEIGHT,
  cx: node.x + NODE_WIDTH / 2,
  cy: node.y + NODE_HEIGHT / 2,
});

/** حذف نقاط پشت‌سرهمِ یکسان تا مسیر گوشهٔ صفر نداشته باشد. */
const dedupePoints = (points) =>
  points.filter(
    (point, index) =>
      index === 0 ||
      Math.abs(point.x - points[index - 1].x) > 0.01 ||
      Math.abs(point.y - points[index - 1].y) > 0.01,
  );

/** تبدیل خط راست‌گوشه به مسیر SVG با گوشه‌های گرد. */
const toRoundedPath = (rawPoints) => {
  const points = dedupePoints(rawPoints);
  if (points.length < 2) return "";

  let path = `M ${round2(points[0].x)} ${round2(points[0].y)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const inLength = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outLength = Math.hypot(next.x - corner.x, next.y - corner.y);
    const radius = Math.min(EDGE_CORNER_RADIUS, inLength / 2, outLength / 2);

    if (radius < 0.5) {
      path += ` L ${round2(corner.x)} ${round2(corner.y)}`;
      continue;
    }

    const beforeX = corner.x - ((corner.x - previous.x) / inLength) * radius;
    const beforeY = corner.y - ((corner.y - previous.y) / inLength) * radius;
    const afterX = corner.x + ((next.x - corner.x) / outLength) * radius;
    const afterY = corner.y + ((next.y - corner.y) / outLength) * radius;
    path +=
      ` L ${round2(beforeX)} ${round2(beforeY)}` +
      ` Q ${round2(corner.x)} ${round2(corner.y)} ${round2(afterX)} ${round2(afterY)}`;
  }

  const last = points[points.length - 1];
  return `${path} L ${round2(last.x)} ${round2(last.y)}`;
};

/** نقطه‌ای که در فاصلهٔ نسبی `t` از طول مسیر قرار دارد (برای برچسب). */
const pointAlong = (points, t) => {
  if (points.length < 2) return { x: points[0]?.x ?? 0, y: points[0]?.y ?? 0 };

  const segments = [];
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const length = Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    );
    segments.push(length);
    total += length;
  }
  if (total <= 0) return { x: points[0].x, y: points[0].y };

  let remaining = total * t;
  for (let index = 0; index < segments.length; index += 1) {
    const length = segments[index];
    const isLast = index === segments.length - 1;
    if (remaining <= length || isLast) {
      const ratio = length > 0 ? Math.min(remaining / length, 1) : 0;
      const from = points[index];
      const to = points[index + 1];
      return {
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio,
      };
    }
    remaining -= length;
  }
  return { x: points[points.length - 1].x, y: points[points.length - 1].y };
};

/**
 * مسیر یک انتقال. `laneOffset` کل خط را عمود بر جهت حرکت جابه‌جا می‌کند؛
 * همین باعث می‌شود رفت و برگشتِ یک جفت مرحله روی هم نیفتند.
 */
const routeEdge = (source, target, laneOffset) => {
  const s = rectOf(source);
  const t = rectOf(target);
  const dx = t.cx - s.cx;
  const dy = t.cy - s.cy;

  const down = dy >= 0;
  const right = dx >= 0;
  const verticalGap = down ? t.top - s.bottom : s.top - t.bottom;
  const horizontalGap = right ? t.left - s.right : s.left - t.right;
  const verticalRoom = verticalGap >= EDGE_STUB * 2 + 6;
  const horizontalRoom = horizontalGap >= EDGE_STUB * 2 + 6;

  // محور غالب؛ فقط اگر فضایش بسته باشد و محور دیگر باز باشد، محور عوض می‌شود.
  let vertical = Math.abs(dy) >= Math.abs(dx);
  if (vertical && !verticalRoom && horizontalRoom) vertical = false;
  if (!vertical && !horizontalRoom && verticalRoom) vertical = true;

  let points;
  if (vertical) {
    const exitY = down ? s.bottom : s.top;
    const enterY = down ? t.top : t.bottom;
    const exitX = s.cx + laneOffset;
    const enterX = t.cx + laneOffset;
    let channelY;
    if (verticalRoom) {
      channelY = (exitY + enterY) / 2 + laneOffset;
    } else if (down) {
      channelY = Math.max(s.bottom, t.bottom) + EDGE_CLEARANCE + laneOffset;
    } else {
      channelY = Math.min(s.top, t.top) - EDGE_CLEARANCE + laneOffset;
    }
    points = [
      { x: exitX, y: exitY },
      { x: exitX, y: channelY },
      { x: enterX, y: channelY },
      { x: enterX, y: enterY },
    ];
  } else {
    const exitX = right ? s.right : s.left;
    const enterX = right ? t.left : t.right;
    const exitY = s.cy + laneOffset;
    const enterY = t.cy + laneOffset;
    let channelX;
    if (horizontalRoom) {
      channelX = (exitX + enterX) / 2 + laneOffset;
    } else if (right) {
      channelX = Math.max(s.right, t.right) + EDGE_CLEARANCE + laneOffset;
    } else {
      channelX = Math.min(s.left, t.left) - EDGE_CLEARANCE + laneOffset;
    }
    points = [
      { x: exitX, y: exitY },
      { x: channelX, y: exitY },
      { x: channelX, y: enterY },
      { x: enterX, y: enterY },
    ];
  }

  return { points, path: toRoundedPath(points) };
};

/** حلقهٔ یک مرحله به خودش؛ در دادهٔ فعلی رخ نمی‌دهد ولی مسیر را خراب نمی‌کند. */
const routeSelfLoop = (node, laneOffset) => {
  const r = rectOf(node);
  const outX = r.right + 30;
  const backX = r.left - 30;
  const overY = r.top - 34 - laneOffset;
  const points = [
    { x: r.right, y: r.cy - 16 },
    { x: outX, y: r.cy - 16 },
    { x: outX, y: overY },
    { x: backX, y: overY },
    { x: backX, y: r.cy + 16 },
    { x: r.left, y: r.cy + 16 },
  ];
  return { points, path: toRoundedPath(points) };
};

/**
 * هندسهٔ همهٔ یال‌ها یک‌جا محاسبه می‌شود، چون فاصله‌گذاری خطوط به هم نگاه
 * می‌کند: هر جفت مرحله یک گروه است و خطوط آن گروه در لِین‌های جدا می‌روند.
 *
 * @returns {Map<string, {path: string, midX: number, midY: number,
 *   startX: number, startY: number, endX: number, endY: number}>}
 */
export const buildEdgeGeometries = (nodes = [], edges = []) => {
  const nodeById = new Map(nodes.map((node) => [String(node.id), node]));

  const groups = new Map();
  edges.forEach((edge) => {
    const source = String(edge.source);
    const target = String(edge.target);
    const key = source <= target ? `${source}|${target}` : `${target}|${source}`;
    const group = groups.get(key) ?? [];
    group.push(edge);
    groups.set(key, group);
  });

  const lanes = new Map();
  const labelParams = new Map();
  groups.forEach((group) => {
    const ordered = [...group].sort((a, b) => {
      const bySource = String(a.source).localeCompare(String(b.source));
      if (bySource !== 0) return bySource;
      return String(a.id).localeCompare(String(b.id));
    });
    const labelT =
      ordered.length > 1 ? EDGE_LABEL_T_GROUPED : EDGE_LABEL_T;
    ordered.forEach((edge, index) => {
      lanes.set(
        String(edge.id),
        (index - (ordered.length - 1) / 2) * EDGE_LANE_GAP,
      );
      labelParams.set(String(edge.id), labelT);
    });
  });

  const geometries = new Map();
  edges.forEach((edge) => {
    const source = nodeById.get(String(edge.source));
    const target = nodeById.get(String(edge.target));
    if (!source || !target) return;

    const laneOffset = lanes.get(String(edge.id)) ?? 0;
    const { points, path } =
      String(source.id) === String(target.id)
        ? routeSelfLoop(source, laneOffset)
        : routeEdge(source, target, laneOffset);

    const clean = dedupePoints(points);
    const label = pointAlong(
      clean,
      labelParams.get(String(edge.id)) ?? EDGE_LABEL_T,
    );
    const first = clean[0];
    const last = clean[clean.length - 1];

    geometries.set(String(edge.id), {
      path,
      midX: label.x,
      midY: label.y,
      startX: first.x,
      startY: first.y,
      endX: last.x,
      endY: last.y,
    });
  });

  return geometries;
};

/* ------------------------------ اعتبارسنجی ------------------------------ */

/**
 * اعتبارسنجی فرایند بر اساس قوانین واقعی بک‌اند:
 *  - نبود مرحله شروع → add-request خطای «فرایند دارای مرحله اغازین نمی باشد» می‌دهد
 *  - name مرحله و name/description عملیات در مدل بک‌اند اجباری هستند
 *  - درخواست فقط وقتی جلو می‌رود که عملیاتی یک انتقال کامل شوند
 *    → انتقال بدون عملیات، درخواست را متوقف می‌کند
 *  - برای دیدن/انجام عملیات، دسترسی سمت‌ها لازم است
 */
export const validateGraph = (graph) => {
  const errors = [];
  const warnings = [];

  if (!graph) return { errors, warnings };

  if (!trimmed(graph.name)) errors.push("نام فرایند الزامی است.");
  if (graph.nodes.length === 0)
    errors.push("فرایند باید حداقل یک مرحله داشته باشد.");

  const startNodes = graph.nodes.filter((node) =>
    isStartStateType(node.stateTypeId),
  );
  if (graph.nodes.length > 0 && startNodes.length === 0) {
    errors.push(
      "فرایند مرحله شروع ندارد؛ بدون آن امکان ایجاد درخواست وجود ندارد.",
    );
  }
  if (startNodes.length > 1) {
    warnings.push(
      "بیش از یک مرحله شروع دارید؛ درخواست فقط از یکی از آن‌ها آغاز می‌شود.",
    );
  }

  // پایان، رد شده و لغو شده هر سه پایان‌دهنده‌ی فرایند هستند.
  const terminalNodes = graph.nodes.filter((node) =>
    isTerminalStateType(node.stateTypeId),
  );
  if (graph.nodes.length > 0 && terminalNodes.length === 0) {
    warnings.push(
      "فرایند مرحله پایانی ندارد؛ درخواست‌ها هیچ‌وقت خاتمه پیدا نمی‌کنند.",
    );
  }

  graph.nodes.forEach((node) => {
    if (!trimmed(node.name)) errors.push("نام همه‌ی مراحل باید پر شود.");
    if (trimmed(node.name).length > 255)
      errors.push(`نام مرحله «${node.name}» بیش از ۲۵۵ کاراکتر است.`);
  });

  const nodeIds = new Set(graph.nodes.map((node) => String(node.id)));
  const seenEdges = new Set();

  graph.edges.forEach((edge) => {
    if (
      !nodeIds.has(String(edge.source)) ||
      !nodeIds.has(String(edge.target))
    ) {
      errors.push("یک مسیر ناقص است و به مرحله موجود متصل نیست.");
      return;
    }
    if (String(edge.source) === String(edge.target)) {
      errors.push("مسیر باید بین دو مرحله متفاوت باشد.");
      return;
    }
    const key = `${edge.source}->${edge.target}`;
    if (seenEdges.has(key)) {
      warnings.push("بین دو مرحله مسیر تکراری وجود دارد.");
    }
    seenEdges.add(key);

    if (edge.actions.length === 0) {
      warnings.push(
        "برای یک مسیر هیچ عملیاتی تعریف نشده؛ درخواست در آن مرحله قابل پیشروی نیست.",
      );
    }
  });

  graph.nodes.forEach((node) => {
    const hasOutgoing = graph.edges.some(
      (edge) => String(edge.source) === String(node.id),
    );
    const hasIncoming = graph.edges.some(
      (edge) => String(edge.target) === String(node.id),
    );

    if (!hasOutgoing && !isTerminalStateType(node.stateTypeId)) {
      warnings.push(`مرحله «${node.name || "بی‌نام"}» مسیر خروجی ندارد.`);
    }
    if (!hasIncoming && !isStartStateType(node.stateTypeId)) {
      warnings.push(
        `مرحله «${node.name || "بی‌نام"}» مسیر ورودی ندارد و در دسترس قرار نمی‌گیرد.`,
      );
    }
  });

  graph.actions.forEach((action) => {
    if (!trimmed(action.name)) errors.push("نام همه‌ی عملیات باید پر شود.");
    if (!trimmed(action.description)) {
      errors.push(`توضیحات عملیات «${action.name || "بی‌نام"}» الزامی است.`);
    }
    if (action.permissions.length === 0) {
      warnings.push(
        `عملیات «${action.name || "بی‌نام"}» به هیچ سمتی داده نشده است.`,
      );
    }
  });

  const usedActionIds = new Set(
    graph.edges.flatMap((edge) =>
      edge.actions.map((link) => String(link.actionId)),
    ),
  );
  graph.actions.forEach((action) => {
    if (!usedActionIds.has(String(action.id))) {
      warnings.push(
        `عملیات «${action.name || "بی‌نام"}» به هیچ مسیری وصل نشده است.`,
      );
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
        errors.push(
          `برای دسترسی مرحله «${node.name || "بی‌نام"}» باید سمت انتخاب شود.`,
        );
      }
    });
  });
  graph.actions.forEach((action) => {
    action.permissions.forEach((permission) => {
      if (permission.granteeType === "group" && !permission.groupId) {
        errors.push(
          `برای دسترسی عملیات «${action.name || "بی‌نام"}» باید سمت انتخاب شود.`,
        );
      }
    });
  });

  if (graph.permissions.length === 0) {
    warnings.push(
      "برای هیچ سمتی دسترسی فرایند تعریف نشده؛ کاربران عادی آن را نمی‌بینند.",
    );
  }

  return {
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
  };
};
