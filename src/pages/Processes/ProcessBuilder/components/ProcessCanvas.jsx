/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloseOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { Trash2 } from "lucide-react";

import { edgeGeometry, graphBounds } from "../processGraph";
import {
  GRID_SIZE,
  MAX_ZOOM,
  MIN_ZOOM,
  NODE_HEIGHT,
  NODE_WIDTH,
  STATE_TYPE_IDS,
  getActionType,
  getStateType,
} from "../processSchema";

const SURFACE_SIZE = 6000;
const DRAG_TYPE = "application/x-process-state-type";
/** خمیدگی وقتی بین دو ایستگاه، ارتباط برگشت هم تعریف شده باشد. */
const RECIPROCAL_BOW = 60;
/** فاصله‌ی ارتباط‌های هم‌جهت تکراری بین همان دو ایستگاه. */
const PARALLEL_SPACING = 52;
/** ابعاد مینی‌مپ نمای کلی فرایند. */
const MINIMAP_WIDTH = 168;
const MINIMAP_HEIGHT = 112;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const snap = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const ProcessCanvas = ({
  containerRef,
  graph,
  selection,
  viewport,
  connectFrom,
  onViewportChange,
  onSelect,
  onAddNode,
  onNodeMoveStart,
  onNodeMove,
  onNodeMoveEnd,
  onStartConnect,
  onConnect,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
}) => {
  const dragRef = useRef(null);
  const panRef = useRef(null);
  /** درگِ اتصال: مبدأ، نقطه‌ی شروع و اینکه ماوس واقعاً حرکت کرده یا نه. */
  const connectDragRef = useRef(null);
  const [pointer, setPointer] = useState(null);
  /** منوی راست‌کلیک: مختصات نسبت به کادر بوم و هدفِ انتخاب‌شده. */
  const [menu, setMenu] = useState(null);
  /** اندازه‌ی کادر بوم؛ برای رسم کادر دید روی مینی‌مپ. */
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  /** محدوده‌ی نمودار و مقیاس مینی‌مپ. */
  const minimap = useMemo(() => {
    const bounds = graphBounds(graph?.nodes ?? []);
    const scale = Math.min(
      MINIMAP_WIDTH / Math.max(bounds.width, 1),
      MINIMAP_HEIGHT / Math.max(bounds.height, 1),
    );
    return { ...bounds, scale };
  }, [graph]);

  const nodeById = useMemo(
    () => new Map((graph?.nodes ?? []).map((node) => [String(node.id), node])),
    [graph],
  );
  const actionById = useMemo(
    () =>
      new Map(
        (graph?.actions ?? []).map((action) => [String(action.id), action]),
      ),
    [graph],
  );

  /**
   * آفست خمیدگی هر ارتباط. اگر بین دو ایستگاه ارتباط برگشت هم وجود
   * داشته باشد، هر دو خم می‌شوند تا خط، برچسب و ناحیه‌ی کلیکشان جدا باشد و
   * بتوان برای هر جهت جداگانه عملیات تعریف کرد.
   */
  const edgeOffsets = useMemo(() => {
    const edges = graph?.edges ?? [];
    const directions = new Set(
      edges.map((edge) => `${String(edge.source)}>${String(edge.target)}`),
    );
    const seen = new Map();

    return new Map(
      edges.map((edge) => {
        const source = String(edge.source);
        const target = String(edge.target);
        const key = `${source}>${target}`;
        const index = seen.get(key) ?? 0;
        seen.set(key, index + 1);

        const hasReciprocal =
          source !== target && directions.has(`${target}>${source}`);

        return [
          String(edge.id),
          (hasReciprocal ? RECIPROCAL_BOW : 0) + index * PARALLEL_SPACING,
        ];
      }),
    );
  }, [graph]);

  const toSurfacePoint = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - viewport.x) / viewport.zoom,
        y: (clientY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [containerRef, viewport.x, viewport.y, viewport.zoom],
  );

  /** بازکردن منوی راست‌کلیک در محل ماوس؛ همزمان هدف را هم انتخاب می‌کند. */
  const openMenu = useCallback(
    (event, target) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      setMenu({
        x: event.clientX - (rect?.left ?? 0),
        y: event.clientY - (rect?.top ?? 0),
        target,
      });
      onSelect(target);
    },
    [containerRef, onSelect],
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const update = () => {
      const rect = container.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  /* --------------------------- zoom / pan --------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;

      if (event.ctrlKey || event.metaKey) {
        onViewportChange((previous) => {
          const zoom = clamp(
            previous.zoom * (1 - event.deltaY * 0.002),
            MIN_ZOOM,
            MAX_ZOOM,
          );
          const ratio = zoom / previous.zoom;
          return {
            zoom,
            x: pointerX - (pointerX - previous.x) * ratio,
            y: pointerY - (pointerY - previous.y) * ratio,
          };
        });
        return;
      }

      onViewportChange((previous) => ({
        ...previous,
        x: previous.x - event.deltaX,
        y: previous.y - event.deltaY,
      }));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [containerRef, onViewportChange]);

  const handleBackgroundPointerDown = (event) => {
    setMenu(null);
    if (event.button !== 0 && event.button !== 1) return;
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
      moved: false,
    };
    containerRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handleContainerPointerMove = (event) => {
    const pan = panRef.current;
    if (pan) {
      const deltaX = event.clientX - pan.startX;
      const deltaY = event.clientY - pan.startY;
      if (!pan.moved && Math.abs(deltaX) + Math.abs(deltaY) > 3)
        pan.moved = true;
      onViewportChange((previous) => ({
        ...previous,
        x: pan.originX + deltaX,
        y: pan.originY + deltaY,
      }));
      return;
    }
    if (connectFrom) {
      const connectDrag = connectDragRef.current;
      if (connectDrag && !connectDrag.moved) {
        const distance =
          Math.abs(event.clientX - connectDrag.startX) +
          Math.abs(event.clientY - connectDrag.startY);
        // آستانه‌ی کوچک تا لرزش ماوس با درگ اشتباه نشود.
        if (distance > 6) connectDrag.moved = true;
      }
      setPointer(toSurfacePoint(event.clientX, event.clientY));
    }
  };

  const handleContainerPointerUp = (event) => {
    const pan = panRef.current;
    panRef.current = null;
    if (containerRef.current?.hasPointerCapture?.(event.pointerId))
      containerRef.current.releasePointerCapture(event.pointerId);
    if (!pan || pan.moved) return;
    // کلیک ساده روی زمینه: لغو اتصال یا بازگشت به تنزیمات خود فرایند
    if (connectFrom) {
      connectDragRef.current = null;
      onStartConnect(null);
      setPointer(null);
      return;
    }
    onSelect({ type: "process", id: null });
  };

  /* ------------------------------ nodes ------------------------------ */

  const handleNodePointerDown = (event, node) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    if (connectFrom) {
      connectDragRef.current = null;
      onConnect(connectFrom, node.id);
      setPointer(null);
      return;
    }

    onSelect({ type: "node", id: node.id });
    const point = toSurfacePoint(event.clientX, event.clientY);
    dragRef.current = {
      id: node.id,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleNodePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const point = toSurfacePoint(event.clientX, event.clientY);
    if (!drag.moved) {
      drag.moved = true;
      onNodeMoveStart();
    }
    onNodeMove(drag.id, {
      x: Math.max(0, snap(point.x - drag.offsetX)),
      y: Math.max(0, snap(point.y - drag.offsetY)),
    });
  };

  const handleNodePointerUp = (event, node) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag?.moved) {
      onNodeMoveEnd();
      return;
    }

    // رهاکردن درگِ اتصال روی ایستگاه مقصد، ارتباط را کامل می‌کند.
    const connectDrag = connectDragRef.current;
    if (node && connectDrag?.moved) {
      connectDragRef.current = null;
      setPointer(null);
      onConnect(connectDrag.source, node.id);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData(DRAG_TYPE);
    if (!raw) return;
    const point = toSurfacePoint(event.clientX, event.clientY);
    onAddNode(Number(raw), {
      x: Math.max(0, snap(point.x - NODE_WIDTH / 2)),
      y: Math.max(0, snap(point.y - NODE_HEIGHT / 2)),
    });
  };

  const connectSource = connectFrom ? nodeById.get(String(connectFrom)) : null;

  return (
    <div
      ref={containerRef}
      className={`process-canvas${connectFrom ? " process-canvas--connecting" : ""}`}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerCancel={handleContainerPointerUp}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        className="process-canvas__surface"
        style={{
          width: SURFACE_SIZE,
          height: SURFACE_SIZE,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        <svg
          className="process-canvas__edges"
          width={SURFACE_SIZE}
          height={SURFACE_SIZE}
        >
          <defs>
            <marker
              id="process-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {(graph?.edges ?? []).map((edge) => {
            const source = nodeById.get(String(edge.source));
            const target = nodeById.get(String(edge.target));
            if (!source || !target) return null;
            const geometry = edgeGeometry(
              source,
              target,
              edgeOffsets.get(String(edge.id)) ?? 0,
            );
            const isSelected =
              selection.type === "edge" &&
              String(selection.id) === String(edge.id);
            return (
              <g
                key={edge.id}
                className={`process-edge${isSelected ? " process-edge--selected" : ""}`}
              >
                <path
                  className="process-edge__hit"
                  d={geometry.path}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelect({ type: "edge", id: edge.id });
                  }}
                  onContextMenu={(event) =>
                    openMenu(event, { type: "edge", id: edge.id })
                  }
                />
                <path
                  className="process-edge__line"
                  d={geometry.path}
                  markerEnd="url(#process-arrow)"
                />
              </g>
            );
          })}

          {connectSource && pointer ? (
            <path
              className="process-edge__preview"
              d={`M ${connectSource.x + NODE_WIDTH / 2} ${
                connectSource.y + NODE_HEIGHT
              } L ${pointer.x} ${pointer.y}`}
            />
          ) : null}
        </svg>

        {/* برچسب ارتباط‌ها: عملیات‌های متصل به هر انتقال */}
        {(graph?.edges ?? []).map((edge) => {
          const source = nodeById.get(String(edge.source));
          const target = nodeById.get(String(edge.target));
          if (!source || !target) return null;
          const geometry = edgeGeometry(
            source,
            target,
            edgeOffsets.get(String(edge.id)) ?? 0,
          );
          const isSelected =
            selection.type === "edge" &&
            String(selection.id) === String(edge.id);
          const linkedActions = (edge.actions ?? [])
            .map((link) => actionById.get(String(link.actionId)))
            .filter(Boolean);

          return (
            <div
              key={`label-${edge.id}`}
              className={`process-edge-label${
                isSelected ? " process-edge-label--selected" : ""
              }${linkedActions.length === 0 ? " process-edge-label--empty" : ""}`}
              style={{ left: geometry.midX, top: geometry.midY }}
              onPointerDown={(event) => {
                event.stopPropagation();
                onSelect({ type: "edge", id: edge.id });
              }}
              onContextMenu={(event) =>
                openMenu(event, { type: "edge", id: edge.id })
              }
            >
              {linkedActions.length > 0 ? (
                <span className="process-edge-label__actions">
                  {linkedActions.slice(0, 2).map((action) => {
                    const type = getActionType(action.actionTypeId);
                    const Icon = type.Icon;
                    return (
                      <span
                        key={action.id}
                        className="process-edge-label__chip"
                        title={`${type.label}: ${action.name}`}
                      >
                        <Icon />
                        {action.name || type.label}
                      </span>
                    );
                  })}
                  {linkedActions.length > 2 ? (
                    <span className="process-edge-label__more">
                      +{linkedActions.length - 2}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="process-edge-label__warning">بدون عملیات</span>
              )}

              {isSelected ? (
                <button
                  type="button"
                  className="process-edge-label__delete"
                  title="حذف ارتباط"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              ) : null}
            </div>
          );
        })}

        {(graph?.nodes ?? []).map((node) => {
          const type = getStateType(node.stateTypeId);
          const Icon = type.Icon;
          const isSelected =
            selection.type === "node" &&
            String(selection.id) === String(node.id);
          const isConnectSource = String(connectFrom) === String(node.id);

          return (
            <div
              key={node.id}
              className={`process-node ${type.tone.node}${
                isSelected ? " process-node--selected" : ""
              }${isConnectSource ? " process-node--connect-source" : ""}${
                type.shape === "pill" ? " process-node--pill" : ""
              }`}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
              }}
              onPointerDown={(event) => handleNodePointerDown(event, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={(event) => handleNodePointerUp(event, node)}
              onPointerCancel={handleNodePointerUp}
              onContextMenu={(event) =>
                openMenu(event, { type: "node", id: node.id })
              }
            >
              <span className={`process-node__icon ${type.tone.icon}`}>
                <Icon />
              </span>
              <span className="process-node__body">
                <span className="process-node__name">
                  {node.name || "بدون نام"}
                </span>
                <span className={`process-node__chip ${type.tone.chip}`}>
                  {type.shortLabel}
                </span>
              </span>

              {isSelected ? (
                <button
                  type="button"
                  className="process-node__delete"
                  title="حذف ایستگاه"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteNode(node.id);
                  }}
                >
                  <CloseOutlined />
                </button>
              ) : null}

              <button
                type="button"
                className="process-node__handle"
                title={
                  isConnectSource
                    ? "برای پایان اتصال، روی ایستگاه مقصد کلیک کنید"
                    : "ایجاد ارتباط از این ایستگاه"
                }
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelect({ type: "node", id: node.id });
                  const next = isConnectSource ? null : node.id;
                  onStartConnect(next);
                  // هم‌کلیک پشت‌سر‌هم کار می‌کند و هم درگ تا ایستگاه مقصد.
                  connectDragRef.current = next
                    ? {
                        source: node.id,
                        startX: event.clientX,
                        startY: event.clientY,
                        moved: false,
                      }
                    : null;
                  setPointer({
                    x: node.x + NODE_WIDTH / 2,
                    y: node.y + NODE_HEIGHT,
                  });
                }}
              >
                <NodeIndexOutlined />
              </button>
            </div>
          );
        })}
      </div>

      {graph && graph.nodes.length === 0 ? (
        <div className="process-canvas__empty">
          <p className="process-canvas__empty-title">بوم فرایند خالی است</p>
          <p className="process-canvas__empty-hint">
            از جعبه‌ابزار یک «ایستگاه شر��ع» را بکشید یا روی آن کلیک کنید.
          </p>
          <button
            type="button"
            className="process-canvas__empty-action"
            onClick={() => onAddNode(STATE_TYPE_IDS.START)}
          >
            افزودن ایستگاه شروع
          </button>
        </div>
      ) : null}

      {connectFrom ? (
        <div className="process-canvas__hint">
          روی ایستگاه مقصد کلیک کنید یا خط را روی آن رها کنید · برای لغو Esc
        </div>
      ) : null}

      {(graph?.nodes ?? []).length > 1 ? (
        <div
          className="process-canvas__minimap"
          title="نمای کلی فرایند · برای جابه‌جایی کلیک کنید"
          style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
          onPointerDown={(event) => {
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            const graphX =
              minimap.minX + (event.clientX - rect.left) / minimap.scale;
            const graphY =
              minimap.minY + (event.clientY - rect.top) / minimap.scale;
            onViewportChange((previous) => ({
              ...previous,
              x: canvasSize.width / 2 - graphX * previous.zoom,
              y: canvasSize.height / 2 - graphY * previous.zoom,
            }));
          }}
        >
          {(graph?.nodes ?? []).map((node) => {
            const isSelected =
              selection.type === "node" &&
              String(selection.id) === String(node.id);
            return (
              <span
                key={node.id}
                className={`process-canvas__minimap-node${
                  isSelected ? " process-canvas__minimap-node--selected" : ""
                }`}
                style={{
                  left: (node.x - minimap.minX) * minimap.scale,
                  top: (node.y - minimap.minY) * minimap.scale,
                  width: Math.max(4, NODE_WIDTH * minimap.scale),
                  height: Math.max(3, NODE_HEIGHT * minimap.scale),
                }}
              />
            );
          })}

          {canvasSize.width > 0 ? (
            <span
              className="process-canvas__minimap-view"
              style={{
                left:
                  (-viewport.x / viewport.zoom - minimap.minX) * minimap.scale,
                top:
                  (-viewport.y / viewport.zoom - minimap.minY) * minimap.scale,
                width: (canvasSize.width / viewport.zoom) * minimap.scale,
                height: (canvasSize.height / viewport.zoom) * minimap.scale,
              }}
            />
          ) : null}
        </div>
      ) : null}

      {menu ? (
        <div
          className="process-canvas__menu"
          style={{ left: menu.x, top: menu.y }}
          onPointerDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          {menu.target.type === "node" ? (
            <>
              <button
                type="button"
                className="process-canvas__menu-item"
                onClick={() => {
                  connectDragRef.current = null;
                  onStartConnect(menu.target.id);
                  closeMenu();
                }}
              >
                اتصال به ایستگاه دیگر
              </button>
              <button
                type="button"
                className="process-canvas__menu-item"
                onClick={() => {
                  onDuplicateNode?.(menu.target.id);
                  closeMenu();
                }}
              >
                تکرار ایستگاه · Ctrl+D
              </button>
              <button
                type="button"
                className="process-canvas__menu-item process-canvas__menu-item--danger"
                onClick={() => {
                  onDeleteNode(menu.target.id);
                  closeMenu();
                }}
              >
                حذف ایستگاه
              </button>
            </>
          ) : (
            <button
              type="button"
              className="process-canvas__menu-item process-canvas__menu-item--danger"
              onClick={() => {
                onDeleteEdge(menu.target.id);
                closeMenu();
              }}
            >
              حذف ارتباط
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ProcessCanvas;
