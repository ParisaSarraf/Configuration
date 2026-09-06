/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App, Button, ConfigProvider, Empty, Spin, Tag, Tooltip } from "antd";
import {
  RedoOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { ArrowRight, Maximize2, Save } from "lucide-react";

import { getApiErrorMessage } from "@/Services/forms/formUtils";
import {
  buildSavePlan,
  planChangeCount,
} from "@/Services/workflow/workflowPayloads";
import {
  useProcessInfo,
  useSaveProcessGraph,
  useTransitionActions,
} from "@/QueryServises/workflowQuery";
import { useRoleList } from "@/QueryServises/roleQuery";

import ProcessCanvas from "./components/ProcessCanvas";
import ProcessPropertiesPanel from "./components/ProcessPropertiesPanel";
import ProcessToolbox from "./components/ProcessToolbox";
import {
  buildGraph,
  cloneGraph,
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
  CANVAS_PADDING,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  getStateType,
} from "./processSchema";
import "./process-builder.css";

const HISTORY_LIMIT = 50;
const PROCESS_SELECTION = { type: "process", id: null };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [connectFrom, setConnectFrom] = useState(null);
  const [historyMeta, setHistoryMeta] = useState({
    canUndo: false,
    canRedo: false,
  });

  const infoQuery = useProcessInfo(processId);
  const linksQuery = useTransitionActions();
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
    if (infoQuery.isFetching || linksQuery.isFetching) return;
    if (!infoQuery.data || !linksQuery.data) return;

    const built = buildGraph(infoQuery.data, linksQuery.data);
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
    processId,
    syncHistoryMeta,
  ]);

  const isDirty = useMemo(() => {
    if (!graph || !baselineRef.current) return false;
    return graphSignature(graph) !== graphSignature(baselineRef.current);
  }, [graph]);

  const validation = useMemo(() => validateGraph(graph), [graph]);

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
      updateGraph((current) => ({ ...current, nodes: [...current.nodes, node] }));
      setSelection({ type: "node", id: node.id });
    },
    [updateGraph, viewport.x, viewport.y, viewport.zoom],
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
        message.warning("ارتباط باید بین دو ایستگاه متفاوت باشد.");
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
        message.warning("این ارتباط از قبل وجود دارد.");
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

  const reloadFromServer = useCallback(async () => {
    await Promise.all([infoQuery.refetch(), linksQuery.refetch()]);
    baselineRef.current = null;
    historyRef.current = { past: [], future: [] };
    syncHistoryMeta();
    applyGraph(null);
  }, [applyGraph, infoQuery, linksQuery, syncHistoryMeta]);

  const handleSave = useCallback(async () => {
    const current = graphRef.current;
    const baseline = baselineRef.current;
    if (!current || !baseline || saveMutation.isPending) return;

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
        // مختصات ایستگاه‌های تازه ساخته‌شده را به شناسه‌ی واقعی منتقل می‌کنیم.
        const stateIds = result?.stateIds;
        const remapped = current.nodes.map((node) => {
          const realId = stateIds?.get?.(String(node.id));
          return realId ? { ...node, id: realId } : node;
        });
        writeStoredPositions(processId, remapped);
        message.success("فرایند ذخیره شد.");
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
    reloadFromServer,
    saveMutation,
  ]);

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
    (infoQuery.isLoading || linksQuery.isLoading || !graph) &&
    !infoQuery.isError &&
    !linksQuery.isError;

  if (infoQuery.isError || linksQuery.isError) {
    return (
      <div className="process-builder process-builder--center">
        <Empty
          description={getApiErrorMessage(
            infoQuery.error || linksQuery.error,
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
                ? `${graph.nodes.length} ایستگاه · ${graph.edges.length} ارتباط · ${graph.actions.length} عملیات`
                : "در حال بارگذاری…"}
            </span>
          </div>
          {isDirty ? (
            <Tag color="warning" className="process-builder__dirty-tag">
              تغییرات ذخیره‌نشده
            </Tag>
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
          <Tooltip title="نمایش کامل فرایند">
            <Button
              icon={<Maximize2 size={16} />}
              onClick={() => fitToScreen()}
              className="process-builder__icon-button"
            />
          </Tooltip>

          <span className="process-builder__divider" />

          <Button
            type="primary"
            icon={<Save size={16} />}
            loading={saveMutation.isPending}
            disabled={!graph || !isDirty}
            onClick={handleSave}
            className="process-builder__save"
          >
            ذخیره فرایند
          </Button>
        </div>
      </header>

      <div className="process-builder__body">
        <ProcessToolbox
          onAddNode={handleAddNode}
          disabled={!graph || saveMutation.isPending}
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
              onConnect={handleConnect}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
            />
          )}
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
          disabled={saveMutation.isPending}
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
