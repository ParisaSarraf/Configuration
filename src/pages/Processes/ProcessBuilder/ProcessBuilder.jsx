/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Button,
  ConfigProvider,
  Dropdown,
  Empty,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import {
  RedoOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { ArrowRight, Maximize2, Save, Wand2 } from "lucide-react";

import { getApiErrorMessage } from "@/Services/forms/formUtils";
import {
  buildSavePlan,
  planChangeCount,
  reapplySavePlan,
} from "@/Services/workflow/workflowPayloads";
import {
  useLockedFieldsByProcessId,
  useProcessInfo,
  useProcessRequests,
  useSaveProcessGraph,
  useTransitionActions,
} from "@/QueryServises/workflowQuery";
import { useRoleList } from "@/QueryServises/roleQuery";

import ProcessCanvas from "./components/ProcessCanvas";
import ProcessPropertiesPanel from "./components/ProcessPropertiesPanel";
import ProcessToolbox from "./components/ProcessToolbox";
import ProcessWizardModal from "./components/ProcessWizardModal";
import {
  buildGraph,
  cloneGraph,
  createAction,
  createEdge,
  createNode,
  graphBounds,
  graphSignature,
  layoutGraph,
  readStoredPositions,
  validateGraph,
  writeStoredPositions,
} from "./processGraph";
import {
  ACTION_TYPE_IDS,
  CANVAS_PADDING,
  MAX_ZOOM,
  MIN_ZOOM,
  NODE_HEIGHT,
  NODE_WIDTH,
  STATE_TYPE_IDS,
  ZOOM_STEP,
  getStateType,
  isTerminalStateType,
} from "./processSchema";
import { buildIssueTargets } from "./processIssues";
import "./process-builder.css";

const HISTORY_LIMIT = 50;
const PROCESS_SELECTION = { type: "process", id: null };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const asArray = (value) => (Array.isArray(value) ? value : []);

const processRequestsOf = (payload) => {
  const data = payload?.data ?? payload?.results ?? payload;
  return asArray(data).flatMap((item) =>
    Array.isArray(item?.requests)
      ? item.requests
      : item?.current_state || item?.current_state_id
        ? [item]
        : [],
  );
};

const requestIsTerminal = (request) => {
  const type = request?.current_state?.state_type;
  const typeId =
    type?.id ??
    request?.current_state?.state_type_id ??
    request?.current_state_type_id;
  if (typeId !== undefined && typeId !== null)
    return isTerminalStateType(typeId);

  const label = String(type?.name ?? request?.state_type ?? "")
    .trim()
    .toLowerCase();
  return [
    "complete",
    "completed",
    "denied",
    "rejected",
    "cancelled",
    "canceled",
    "پایان",
    "تکمیل شده",
    "رد شده",
    "لغو شده",
  ].some((terminalLabel) => label.includes(terminalLabel));
};

const hasOpenProcessRequests = (payload) =>
  processRequestsOf(payload).some((request) => !requestIsTerminal(request));

const Builder = ({ processId }) => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const baselineRef = useRef(null);
  const historyRef = useRef({ past: [], future: [] });
  const coalesceRef = useRef({ key: null, at: 0 });

  const [graph, setGraph] = useState(null);
  const [selection, setSelection] = useState(PROCESS_SELECTION);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [connectFrom, setConnectFrom] = useState(null);
  const [historyMeta, setHistoryMeta] = useState({
    canUndo: false,
    canRedo: false,
  });

  const infoQuery = useProcessInfo(processId);
  const linksQuery = useTransitionActions();
  const processLocksQuery = useLockedFieldsByProcessId(processId);
  const processRequestsQuery = useProcessRequests(processId);
  const groupsQuery = useRoleList();
  const saveMutation = useSaveProcessGraph();

  const groups = useMemo(() => {
    const payload = groupsQuery.data;
    const list = Array.isArray(payload) ? payload : (payload?.results ?? []);
    return list.map((group) => ({
      value: group?.id,
      label: group?.name ?? `سمت ${group?.id}`,
    }));
  }, [groupsQuery.data]);

  const hasOpenRequests = useMemo(
    () => hasOpenProcessRequests(processRequestsQuery.data),
    [processRequestsQuery.data],
  );

  /* --------------------------- تاریخچه و state --------------------------- */

  const syncHistoryMeta = useCallback(() => {
    setHistoryMeta({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
    });
  }, []);

  const applyGraph = useCallback((next) => {
    graphRef.current = next;
    setGraph(next);
  }, []);

  const pushHistory = useCallback(() => {
    const current = graphRef.current;
    if (!current) return;
    historyRef.current = {
      past: [...historyRef.current.past, cloneGraph(current)].slice(
        -HISTORY_LIMIT,
      ),
      future: [],
    };
    coalesceRef.current = { key: null, at: 0 };
    syncHistoryMeta();
  }, [syncHistoryMeta]);

  /**
   * تغییر نمودار همراه با ثبت تاریخچه.
   * coalesceKey باعث می‌شود تایپ کردن پیوسته در یک فیلد، تاریخچه را پر نکند.
   */
  const updateGraph = useCallback(
    (recipe, coalesceKey) => {
      const current = graphRef.current;
      if (!current) return;
      const next = typeof recipe === "function" ? recipe(current) : recipe;
      if (!next || next === current) return;

      const now = Date.now();
      const canCoalesce =
        coalesceKey &&
        coalesceRef.current.key === coalesceKey &&
        now - coalesceRef.current.at < 800;

      if (!canCoalesce) {
        historyRef.current = {
          past: [...historyRef.current.past, cloneGraph(current)].slice(
            -HISTORY_LIMIT,
          ),
          future: [],
        };
      } else {
        historyRef.current = { ...historyRef.current, future: [] };
      }
      coalesceRef.current = { key: coalesceKey ?? null, at: now };
      syncHistoryMeta();
      applyGraph(next);
    },
    [applyGraph, syncHistoryMeta],
  );

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    const current = graphRef.current;
    if (!past.length || !current) return;
    const previous = past[past.length - 1];
    historyRef.current = {
      past: past.slice(0, -1),
      future: [cloneGraph(current), ...future].slice(0, HISTORY_LIMIT),
    };
    coalesceRef.current = { key: null, at: 0 };
    syncHistoryMeta();
    setConnectFrom(null);
    applyGraph(previous);
  }, [applyGraph, syncHistoryMeta]);

  const redo = useCallback(() => {
    const { past, future } = historyRef.current;
    const current = graphRef.current;
    if (!future.length || !current) return;
    const [next, ...rest] = future;
    historyRef.current = {
      past: [...past, cloneGraph(current)].slice(-HISTORY_LIMIT),
      future: rest,
    };
    coalesceRef.current = { key: null, at: 0 };
    syncHistoryMeta();
    setConnectFrom(null);
    applyGraph(next);
  }, [applyGraph, syncHistoryMeta]);

  /* ------------------------------- بوم ------------------------------- */

  const fitToScreen = useCallback((target) => {
    const container = canvasRef.current;
    const source = target ?? graphRef.current;
    if (!container || !source || source.nodes.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }
    const rect = container.getBoundingClientRect();
    const bounds = graphBounds(source.nodes);
    const zoom = clamp(
      Math.min(
        (rect.width - CANVAS_PADDING * 2) / bounds.width,
        (rect.height - CANVAS_PADDING * 2) / bounds.height,
        1,
      ),
      MIN_ZOOM,
      MAX_ZOOM,
    );
    setViewport({
      x: (rect.width - bounds.width * zoom) / 2 - bounds.minX * zoom,
      y: (rect.height - bounds.height * zoom) / 2 - bounds.minY * zoom,
      zoom,
    });
  }, []);

  const zoomBy = useCallback((delta) => {
    setViewport((current) => {
      const container = canvasRef.current;
      const zoom = clamp(current.zoom + delta, MIN_ZOOM, MAX_ZOOM);
      if (!container) return { ...current, zoom };
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const ratio = zoom / current.zoom;
      return {
        zoom,
        x: centerX - (centerX - current.x) * ratio,
        y: centerY - (centerY - current.y) * ratio,
      };
    });
  }, []);

  /* ------------------------ بارگذاری فرایند ------------------------ */

  useEffect(() => {
    if (graph) return;
    if (
      infoQuery.isFetching ||
      linksQuery.isFetching ||
      processLocksQuery.isFetching
    )
      return;
    if (!infoQuery.data || !linksQuery.data || !processLocksQuery.data) return;

    const built = buildGraph(
      infoQuery.data,
      linksQuery.data,
      processLocksQuery.data,
    );
    if (!built) return;

    const positioned = layoutGraph(built, readStoredPositions(processId));
    baselineRef.current = cloneGraph(positioned);
    historyRef.current = { past: [], future: [] };
    coalesceRef.current = { key: null, at: 0 };
    syncHistoryMeta();
    setSelection(PROCESS_SELECTION);
    setConnectFrom(null);
    applyGraph(positioned);
    window.requestAnimationFrame(() => fitToScreen(positioned));
  }, [
    applyGraph,
    fitToScreen,
    graph,
    infoQuery.data,
    infoQuery.isFetching,
    linksQuery.data,
    linksQuery.isFetching,
    processLocksQuery.data,
    processLocksQuery.isFetching,
    processId,
    syncHistoryMeta,
  ]);

  const isDirty = useMemo(() => {
    if (!graph || !baselineRef.current) return false;
    return graphSignature(graph) !== graphSignature(baselineRef.current);
  }, [graph]);

  const validation = useMemo(() => validateGraph(graph), [graph]);

  /** نقشه‌ی «پیام خطا → محل مشکل» برای پرش مستقیم روی بوم. */
  const issueTargets = useMemo(() => buildIssueTargets(graph), [graph]);

  /** تعداد تغییراتی که دکمه‌ی ذخیره ارسال خواهد کرد (همان پلن ذخیره). */
  const changeCount = useMemo(() => {
    if (!graph || !baselineRef.current) return 0;
    try {
      return planChangeCount(buildSavePlan(baselineRef.current, graph));
    } catch {
      return 0;
    }
  }, [graph]);

  /* ------------------------------ عملیات ------------------------------ */

  const handleAddNode = useCallback(
    (stateTypeId, position) => {
      const container = canvasRef.current;
      let point = position;
      if (!point && container) {
        const rect = container.getBoundingClientRect();
        point = {
          x: (rect.width / 2 - viewport.x) / viewport.zoom,
          y: (rect.height / 2 - viewport.y) / viewport.zoom,
        };
      }
      const node = createNode({
        stateTypeId,
        x: Math.round(point?.x ?? CANVAS_PADDING),
        y: Math.round(point?.y ?? CANVAS_PADDING),
        name: getStateType(stateTypeId).shortLabel,
      });
      updateGraph((current) => ({
        ...current,
        nodes: [...current.nodes, node],
      }));
      setSelection({ type: "node", id: node.id });
    },
    [updateGraph, viewport.x, viewport.y, viewport.zoom],
  );

  /** چیدمان خودکار مراحل بر اساس مسیر فرایند، بعد نمایش کامل بوم. */
  const handleAutoLayout = useCallback(() => {
    const current = graphRef.current;
    if (!current || current.nodes.length === 0) return;

    // آبجکت خالی یعنی موقعیت‌های ذخیره‌شده نادیده گرفته و چیدمان از نو محاسبه شود.
    const positioned = layoutGraph(current, {});
    updateGraph(() => positioned);
    writeStoredPositions(processId, positioned.nodes);
    window.requestAnimationFrame(() => fitToScreen(positioned));
  }, [updateGraph, fitToScreen, processId]);

  /** تکرار یک مرحله با همان نوع و متن، کمی پایین‌تر از نسخه‌ی اصلی. */
  const handleDuplicateNode = useCallback(
    (nodeId) => {
      const current = graphRef.current;
      const source = current?.nodes.find(
        (node) => String(node.id) === String(nodeId),
      );
      if (!source) return;

      // دسترسی‌ها کپی نمی‌شوند؛ شناسه‌ی آن‌ها به رکورد سرور وابسته است.
      const copy = createNode({
        stateTypeId: source.stateTypeId,
        x: source.x + 40,
        y: source.y + 120,
        name: source.name ? `${source.name} (کپی)` : "",
      });
      copy.description = source.description ?? "";

      updateGraph((graph) => ({ ...graph, nodes: [...graph.nodes, copy] }));
      setSelection({ type: "node", id: copy.id });
    },
    [updateGraph],
  );

  /** انتخاب یک مرحله و بردن مرکز بوم روی آن (نتیجه‌ی جست‌وجو). */
  const handleFocusNode = useCallback((nodeId) => {
    const current = graphRef.current;
    const node = current?.nodes.find(
      (item) => String(item.id) === String(nodeId),
    );
    if (!node) return;

    setSelection({ type: "node", id: node.id });

    const container = canvasRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setViewport((previous) => ({
      ...previous,
      x: rect.width / 2 - (node.x + NODE_WIDTH / 2) * previous.zoom,
      y: rect.height / 2 - (node.y + NODE_HEIGHT / 2) * previous.zoom,
    }));
  }, []);

  /**
   * ساخت یک مسیر خطی از ورودی ویزارد.
   * چیزی حذف نمی‌شود؛ فقط به گراف فعلی اضافه می‌شود و ذخیره‌سازی
   * همچنان با دکمه‌ی «ذخیره فرایند» و همان مسیر قبلی انجام می‌شود.
   */
  const handleWizardApply = useCallback(
    ({ names, withApprove, withDenied }) => {
      const current = graphRef.current;
      if (!current || names.length < 2) return;

      const hasStart = current.nodes.some(
        (node) => Number(node.stateTypeId) === STATE_TYPE_IDS.START,
      );
      const baseY =
        current.nodes.length > 0
          ? Math.max(...current.nodes.map((node) => node.y)) + 160
          : CANVAS_PADDING;

      const created = names.map((name, index) => {
        const stateTypeId =
          index === 0 && !hasStart
            ? STATE_TYPE_IDS.START
            : index === names.length - 1
              ? STATE_TYPE_IDS.COMPLETE
              : STATE_TYPE_IDS.NORMAL;
        const node = createNode({
          stateTypeId,
          x: CANVAS_PADDING,
          y: baseY + index * 160,
        });
        node.name = name;
        return node;
      });

      const newActions = [];
      let approve = null;
      let deny = null;

      if (withApprove) {
        approve = createAction({ actionTypeId: ACTION_TYPE_IDS.APPROVE });
        approve.name = "تأیید";
        newActions.push(approve);
      }
      if (withDenied) {
        deny = createAction({ actionTypeId: ACTION_TYPE_IDS.DENY });
        deny.name = "رد";
        newActions.push(deny);
      }

      let deniedNode = null;
      if (withDenied) {
        deniedNode = createNode({
          stateTypeId: STATE_TYPE_IDS.DENIED,
          x: CANVAS_PADDING + 320,
          y: baseY + 160,
        });
        deniedNode.name = "رد شده";
      }

      const newEdges = [];
      created.forEach((node, index) => {
        const next = created[index + 1];
        if (!next) return;
        const edge = createEdge({ source: node.id, target: next.id });
        if (approve) {
          edge.actions = [
            { id: `tmp-wizard-approve-${node.id}`, actionId: approve.id },
          ];
        }
        newEdges.push(edge);
      });

      if (deniedNode && deny) {
        created.forEach((node, index) => {
          if (index === 0 || index === created.length - 1) return;
          const edge = createEdge({ source: node.id, target: deniedNode.id });
          edge.actions = [
            { id: `tmp-wizard-deny-${node.id}`, actionId: deny.id },
          ];
          newEdges.push(edge);
        });
      }

      updateGraph((graph) => ({
        ...graph,
        nodes: [
          ...graph.nodes,
          ...created,
          ...(deniedNode ? [deniedNode] : []),
        ],
        edges: [...graph.edges, ...newEdges],
        actions: [...graph.actions, ...newActions],
      }));

      setWizardOpen(false);
      setSelection(PROCESS_SELECTION);
    },
    [updateGraph],
  );

  /** تغییر نام مرحله از روی بوم (دوبار کلیک) — همان فیلد name گراف. */
  const handleRenameNode = useCallback(
    (nodeId, name) => {
      const next = (name ?? "").trim();
      updateGraph((state) => ({
        ...state,
        nodes: state.nodes.map((node) =>
          String(node.id) === String(nodeId) ? { ...node, name: next } : node,
        ),
      }));
    },
    [updateGraph],
  );

  /**
   * افزودن عملیات  تأیید/رد به یک مسیر در یک کلیک.
   * اگر عملیاتی با همان نوع و نام قبلاً ساخته شده باشد، همان استفاده می‌شود.
   */
  const handleAddEdgeAction = useCallback(
    (edgeId, kind) => {
      const current = graphRef.current;
      const edge = current?.edges.find(
        (item) => String(item.id) === String(edgeId),
      );
      if (!current || !edge) return;

      const preset =
        kind === "deny"
          ? {
              actionTypeId: ACTION_TYPE_IDS.DENY,
              name: "رد",
              description: "رد درخواست در این مرحله.",
            }
          : {
              actionTypeId: ACTION_TYPE_IDS.APPROVE,
              name: "تأیید",
              description: "تأیید این مرحله و رفتن به مرحله‌ی بعد.",
            };

      const existing = current.actions.find(
        (action) =>
          Number(action.actionTypeId) === preset.actionTypeId &&
          (action.name ?? "").trim() === preset.name,
      );
      const action = existing ?? createAction(preset);

      if (
        (edge.actions ?? []).some(
          (link) => String(link.actionId) === String(action.id),
        )
      ) {
        message.info("این عملیات از قبل روی این مسیر هست.");
        setSelection({ type: "edge", id: edgeId });
        return;
      }

      updateGraph((state) => ({
        ...state,
        actions: existing ? state.actions : [...state.actions, action],
        edges: state.edges.map((item) =>
          String(item.id) === String(edgeId)
            ? {
                ...item,
                actions: [
                  ...(item.actions ?? []),
                  {
                    id: `tmp-transition-action-${action.id}-${(item.actions ?? []).length}`,
                    actionId: action.id,
                  },
                ],
              }
            : item,
        ),
      }));
      setSelection({ type: "edge", id: edgeId });
    },
    [message, updateGraph],
  );

  const handleNodeMove = useCallback(
    (nodeId, point) => {
      const current = graphRef.current;
      if (!current) return;
      applyGraph({
        ...current,
        nodes: current.nodes.map((node) =>
          String(node.id) === String(nodeId)
            ? { ...node, x: Math.round(point.x), y: Math.round(point.y) }
            : node,
        ),
      });
    },
    [applyGraph],
  );

  const handleNodeMoveEnd = useCallback(() => {
    const current = graphRef.current;
    if (current) writeStoredPositions(processId, current.nodes);
  }, [processId]);

  const handleConnect = useCallback(
    (sourceId, targetId) => {
      setConnectFrom(null);
      if (!sourceId || !targetId) return;
      if (String(sourceId) === String(targetId)) {
        message.warning("مسیر باید بین دو مرحله متفاوت باشد.");
        return;
      }
      const current = graphRef.current;
      if (
        current?.edges.some(
          (edge) =>
            String(edge.source) === String(sourceId) &&
            String(edge.target) === String(targetId),
        )
      ) {
        message.warning("این مسیر از قبل وجود دارد.");
        return;
      }
      const edge = createEdge({ source: sourceId, target: targetId });
      updateGraph((state) => ({ ...state, edges: [...state.edges, edge] }));
      setSelection({ type: "edge", id: edge.id });
    },
    [message, updateGraph],
  );

  const handleDeleteNode = useCallback(
    (nodeId) => {
      updateGraph((current) => ({
        ...current,
        nodes: current.nodes.filter(
          (node) => String(node.id) !== String(nodeId),
        ),
        edges: current.edges.filter(
          (edge) =>
            String(edge.source) !== String(nodeId) &&
            String(edge.target) !== String(nodeId),
        ),
      }));
      setSelection(PROCESS_SELECTION);
      setConnectFrom(null);
    },
    [updateGraph],
  );

  const handleDeleteEdge = useCallback(
    (edgeId) => {
      updateGraph((current) => ({
        ...current,
        edges: current.edges.filter(
          (edge) => String(edge.id) !== String(edgeId),
        ),
      }));
      setSelection(PROCESS_SELECTION);
    },
    [updateGraph],
  );

  const reloadFromServer = useCallback(
    async (pendingPlan = null) => {
      const [infoResult, linksResult, locksResult] = await Promise.all([
        infoQuery.refetch(),
        linksQuery.refetch(),
        processLocksQuery.refetch(),
      ]);
      const freshGraph = buildGraph(
        infoResult.data,
        linksResult.data,
        locksResult.data,
      );
      if (!freshGraph) throw new Error("نسخه‌ی تازه‌ی فرایند دریافت نشد.");

      const positioned = layoutGraph(
        freshGraph,
        readStoredPositions(processId),
      );
      baselineRef.current = cloneGraph(positioned);
      const nextGraph =
        pendingPlan && planChangeCount(pendingPlan) > 0
          ? reapplySavePlan(positioned, pendingPlan)
          : positioned;

      historyRef.current = { past: [], future: [] };
      coalesceRef.current = { key: null, at: 0 };
      syncHistoryMeta();
      setSelection(PROCESS_SELECTION);
      setConnectFrom(null);
      applyGraph(nextGraph);
      window.requestAnimationFrame(() => fitToScreen(nextGraph));
      return nextGraph;
    },
    [
      applyGraph,
      fitToScreen,
      infoQuery,
      linksQuery,
      processLocksQuery,
      processId,
      syncHistoryMeta,
    ],
  );

  const handleSave = useCallback(async () => {
    const current = graphRef.current;
    const baseline = baselineRef.current;
    if (!current || !baseline || saveMutation.isPending) return;

    const requestsResult = await processRequestsQuery.refetch();
    if (requestsResult.isError) {
      message.error(
        "امکان بررسی درخواست‌های باز وجود ندارد؛ برای جلوگیری از تغییر اشتباه، ذخیره انجام نشد.",
      );
      return;
    }
    if (hasOpenProcessRequests(requestsResult.data)) {
      message.error(
        "این فرایند درخواست باز دارد و تا رسیدن همه‌ی درخواست‌ها به مرحله پایانی قابل ویرایش نیست.",
      );
      return;
    }

    const { errors, warnings } = validateGraph(current);
    if (errors.length > 0) {
      setSelection(PROCESS_SELECTION);
      message.error(errors[0]);
      return;
    }

    const plan = buildSavePlan(baseline, current);
    if (planChangeCount(plan) === 0) {
      message.info("تغییری برای ذخیره وجود ندارد.");
      return;
    }

    const run = async () => {
      try {
        const result = await saveMutation.mutateAsync({
          processId: Number(processId),
          plan,
        });
        // مختصات مراحل موفق را به شناسه‌ی واقعی منتقل می‌کنیم تا در تلاش بعدی
        // دوباره ساخته نشوند.
        const stateIds = result?.stateIds;
        const remapped = current.nodes.map((node) => {
          const realId = stateIds?.get?.(String(node.id));
          return realId ? { ...node, id: realId } : node;
        });
        writeStoredPositions(processId, remapped);

        if ((result?.errors ?? []).length > 0) {
          await reloadFromServer(result.failedPlan);
          message.warning(
            `${result.succeededCount} مورد ذخیره شد و ${result.errors.length} مورد ناموفق برای تلاش بعدی باقی ماند.`,
          );
          const firstFailure = result.errors[0];
          message.error(
            `${firstFailure.label}: ${getApiErrorMessage(
              firstFailure.error,
              "ذخیره این مورد با مشکل مواجه شد",
            )}`,
          );
          return;
        }

        message.success("همه‌ی تغییرات فرایند ذخیره شد.");
        await reloadFromServer();
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "ذخیره فرایند با مشکل مواجه شد"),
        );
      }
    };

    if (warnings.length > 0) {
      modal.confirm({
        title: "ذخیره با وجود هشدار",
        okText: "ذخیره کن",
        cancelText: "بازگشت و اصلاح",
        content: (
          <ul className="process-builder__warning-list">
            {warnings.slice(0, 6).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ),
        onOk: run,
      });
      return;
    }

    await run();
  }, [
    message,
    modal,
    processId,
    processRequestsQuery,
    reloadFromServer,
    saveMutation,
  ]);

  /** Ctrl+D برای تکرار مرحله انتخاب‌شده. */
  useEffect(() => {
    const handler = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (String(event.key).toLowerCase() !== "d") return;
      if (selection.type !== "node") return;
      event.preventDefault();
      handleDuplicateNode(selection.id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selection, handleDuplicateNode]);

  const handleBack = useCallback(() => {
    if (!isDirty) {
      navigate("/processes");
      return;
    }
    modal.confirm({
      title: "تغییرات ذخیره‌نشده",
      content: "با خروج از این صفحه، تغییرات ذخیره‌نشده از بین می‌رود.",
      okText: "خروج بدون ذخیره",
      cancelText: "در صفحه بمانم",
      okButtonProps: { danger: true },
      onOk: () => navigate("/processes"),
    });
  }, [isDirty, modal, navigate]);

  /* ---------------------------- رویدادها ---------------------------- */

  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") {
        setConnectFrom(null);
        setSelection(PROCESS_SELECTION);
        return;
      }

      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          Boolean(target.closest(".ant-select")));
      if (isEditing) return;

      const withModifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (withModifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (withModifier && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (withModifier && key === "s") {
        event.preventDefault();
        handleSave();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selection.type === "node") {
          event.preventDefault();
          handleDeleteNode(selection.id);
        } else if (selection.type === "edge") {
          event.preventDefault();
          handleDeleteEdge(selection.id);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDeleteEdge, handleDeleteNode, handleSave, redo, selection, undo]);

  /* ------------------------------ رندر ------------------------------ */

  const isLoading =
    (infoQuery.isLoading ||
      linksQuery.isLoading ||
      processLocksQuery.isLoading ||
      !graph) &&
    !infoQuery.isError &&
    !linksQuery.isError &&
    !processLocksQuery.isError;

  if (infoQuery.isError || linksQuery.isError || processLocksQuery.isError) {
    return (
      <div className="process-builder process-builder--center">
        <Empty
          description={getApiErrorMessage(
            infoQuery.error || linksQuery.error || processLocksQuery.error,
            "دریافت اطلاعات فرایند با مشکل مواجه شد",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => navigate("/processes")}>بازگشت</Button>
            <Button
              type="primary"
              onClick={() => {
                infoQuery.refetch();
                linksQuery.refetch();
                processLocksQuery.refetch();
              }}
            >
              تلاش مجدد
            </Button>
          </div>
        </Empty>
      </div>
    );
  }

  return (
    <div className="process-builder">
      <header className="process-builder__toolbar">
        <div className="process-builder__toolbar-start">
          <Tooltip title="بازگشت به لیست فرایندها">
            <Button
              icon={<ArrowRight size={16} />}
              onClick={handleBack}
              className="process-builder__icon-button"
            />
          </Tooltip>
          <div className="process-builder__title">
            <span className="process-builder__title-text">
              {graph?.name || "فرایند بدون نام"}
            </span>
            <span className="process-builder__subtitle">
              {graph
                ? `${graph.nodes.length} مرحله · ${graph.edges.length} مسیر · ${graph.actions.length} عملیات`
                : "در حال بارگذاری…"}
            </span>
          </div>
          {isDirty ? (
            <Tag color="warning" className="process-builder__dirty-tag">
              تغییرات ذخیره‌نشده
            </Tag>
          ) : null}
          {hasOpenRequests ? (
            <Tooltip title="تا زمانی که درخواست‌ها به مرحله پایانی نرسیده‌اند، ساختار فرایند قابل تغییر نیست.">
              <Tag color="error" className="process-builder__dirty-tag">
                ویرایش قفل است · درخواست باز
              </Tag>
            </Tooltip>
          ) : null}
          {validation.errors.length > 0 ? (
            <Tooltip title={validation.errors.join(" · ")}>
              <Tag
                color="error"
                className="process-builder__dirty-tag cursor-pointer"
                onClick={() => setSelection(PROCESS_SELECTION)}
              >
                {`${validation.errors.length} خطا`}
              </Tag>
            </Tooltip>
          ) : null}
        </div>

        <div className="process-builder__toolbar-end">
          <Tooltip title="بازگردانی (Ctrl+Z)">
            <Button
              icon={<UndoOutlined />}
              onClick={undo}
              disabled={!historyMeta.canUndo}
              className="process-builder__icon-button"
            />
          </Tooltip>
          <Tooltip title="انجام مجدد (Ctrl+Shift+Z)">
            <Button
              icon={<RedoOutlined />}
              onClick={redo}
              disabled={!historyMeta.canRedo}
              className="process-builder__icon-button"
            />
          </Tooltip>

          <span className="process-builder__divider" />

          <Tooltip title="کوچک‌نمایی">
            <Button
              icon={<ZoomOutOutlined />}
              onClick={() => zoomBy(-ZOOM_STEP)}
              disabled={viewport.zoom <= MIN_ZOOM}
              className="process-builder__icon-button"
            />
          </Tooltip>
          <span className="process-builder__zoom-value">
            {Math.round(viewport.zoom * 100)}%
          </span>
          <Tooltip title="بزرگ‌نمایی">
            <Button
              icon={<ZoomInOutlined />}
              onClick={() => zoomBy(ZOOM_STEP)}
              disabled={viewport.zoom >= MAX_ZOOM}
              className="process-builder__icon-button"
            />
          </Tooltip>
          <Tooltip title="ساخت قدم‌به‌قدم مسیر فرایند با الگوهای آماده">
            <Button
              type="primary"
              ghost
              icon={<Wand2 size={16} />}
              onClick={() => setWizardOpen(true)}
              disabled={!graph || saveMutation.isPending || hasOpenRequests}
              className="process-builder__wizard-button"
            >
              ساخت سریع
            </Button>
          </Tooltip>

          {/* ابزارهای نمایشی در یک منو جمع شده‌اند تا نوار بالا شلوغ نباشد. */}
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "layout",
                  label: "چیدمان خودکار مراحل",
                  disabled: !graph || graph.nodes.length === 0,
                  onClick: handleAutoLayout,
                },
                {
                  key: "fit",
                  label: "نمایش کامل فرایند",
                  onClick: () => fitToScreen(),
                },
              ],
            }}
          >
            <Button icon={<Maximize2 size={16} />}>نمایش</Button>
          </Dropdown>

          <span className="process-builder__divider" />

          <Button
            type="primary"
            icon={<Save size={16} />}
            loading={saveMutation.isPending}
            disabled={!graph || !isDirty}
            onClick={handleSave}
            className="process-builder__save"
          >
            {changeCount > 0 ? `ذخیره ${changeCount} تغییر` : "ذخیره فرایند"}
          </Button>
        </div>
      </header>

      <div className="process-builder__body">
        <ProcessToolbox
          onAddNode={handleAddNode}
          disabled={!graph || saveMutation.isPending || hasOpenRequests}
          nodes={graph?.nodes ?? []}
          onFocusNode={handleFocusNode}
        />

        <ProcessWizardModal
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onApply={handleWizardApply}
          hasNodes={(graph?.nodes ?? []).length > 0}
        />

        <div className="process-builder__canvas-wrapper">
          {isLoading ? (
            <div className="process-builder__loading">
              <Spin tip="در حال بارگذاری فرایند…" size="large">
                <div className="process-builder__loading-body" />
              </Spin>
            </div>
          ) : (
            <ProcessCanvas
              containerRef={canvasRef}
              graph={graph}
              selection={selection}
              viewport={viewport}
              connectFrom={connectFrom}
              onViewportChange={setViewport}
              onSelect={setSelection}
              onAddNode={handleAddNode}
              onNodeMoveStart={pushHistory}
              onNodeMove={handleNodeMove}
              onNodeMoveEnd={handleNodeMoveEnd}
              onStartConnect={setConnectFrom}
              onDuplicateNode={handleDuplicateNode}
              onConnect={handleConnect}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onAddEdgeAction={handleAddEdgeAction}
              onRenameNode={handleRenameNode}
              onOpenWizard={() => setWizardOpen(true)}
            />
          )}
          {hasOpenRequests && !isLoading ? (
            <div className="process-builder__locked-canvas" role="status">
              <div className="process-builder__locked-message">
                <strong>ویرایش فرایند قفل است</strong>
                <span>این فرایند حداقل یک درخواست باز دارد.</span>
              </div>
            </div>
          ) : null}
          {saveMutation.isPending ? (
            <div className="process-builder__saving">
              <Spin size="small" /> <span>در حال ذخیره…</span>
            </div>
          ) : null}
        </div>

        <ProcessPropertiesPanel
          graph={graph}
          selection={selection}
          groups={groups}
          groupsLoading={groupsQuery.isLoading}
          validation={validation}
          onSelect={setSelection}
          updateGraph={updateGraph}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onAddEdgeAction={handleAddEdgeAction}
          onFocusNode={handleFocusNode}
          issueTargets={issueTargets}
          disabled={saveMutation.isPending || hasOpenRequests}
        />
      </div>
    </div>
  );
};

export default function ProcessBuilder() {
  const { processId } = useParams();
  if (!/^\d+$/.test(processId || ""))
    return <Empty description="شناسه فرایند نامعتبر است" />;
  return (
    <ConfigProvider direction="rtl">
      <App>
        <Builder processId={processId} />
      </App>
    </ConfigProvider>
  );
}
