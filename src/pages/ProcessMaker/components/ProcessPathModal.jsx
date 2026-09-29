import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Skeleton } from "antd";
import { PartitionOutlined } from "@ant-design/icons";

import {
  useProcessInfo,
  useTransitionActions,
} from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import ProcessCanvas from "@/pages/Processes/ProcessBuilder/components/ProcessCanvas";
import {
  buildGraph,
  layoutGraph,
  readStoredPositions,
} from "@/pages/Processes/ProcessBuilder/processGraph";
import "@/pages/Processes/ProcessBuilder/process-builder.css";
import Modal from "../../../components/Modal";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const ProcessPathModal = ({ open, process, onClose }) => {
  const processId = process?.id ?? null;
  const canvasRef = useRef(null);
  const [selection, setSelection] = useState({ type: "process", id: null });
  const [viewport, setViewport] = useState({ x: 80, y: 30, zoom: 0.9 });

  useEffect(() => {
    if (!open) return;
    setSelection({ type: "process", id: null });
    setViewport({ x: 80, y: 30, zoom: 0.9 });
  }, [open, processId]);

  const processQuery = useProcessInfo(processId, {
    enabled: Boolean(open && processId),
  });
  const actionsQuery = useTransitionActions({
    enabled: Boolean(open && processId),
    staleTime: 60 * 1000,
  });

  const graph = useMemo(() => {
    const raw = buildGraph(processQuery.data, asArray(actionsQuery.data));
    return raw ? layoutGraph(raw, readStoredPositions(processId)) : null;
  }, [actionsQuery.data, processId, processQuery.data]);

  // مسیر باید برای کاربر عادی حتی در صورت نداشتن دسترسی به جزئیات Actionها
  // قابل مشاهده بماند؛ در آن حالت فقط برچسب عملیات نمایش داده نمی‌شود.
  const loading = processQuery.isLoading;
  const error = processQuery.error;

  return (
    <Modal
      isOpen={open}
      size="min(1180px, 96vw)"
      onClose={onClose}
      destroyOnClose
      footer={null}
      title={
        <span className="flex items-center gap-2">
          <PartitionOutlined className="text-blue-500" />
          مسیر فرایند «{process?.name || "بدون نام"}»
        </span>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(error, "دریافت مسیر فرایند انجام نشد.")}
        />
      ) : (
        <div
          className="process-builder overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
          style={{ height: "min(68vh, 660px)", minHeight: 460 }}
        >
          <div className="process-builder__canvas-wrapper">
            <ProcessCanvas
              readOnly
              containerRef={canvasRef}
              graph={graph}
              selection={selection}
              viewport={viewport}
              connectFrom={null}
              onViewportChange={setViewport}
              onSelect={setSelection}
              onAddNode={() => {}}
              onNodeMoveStart={() => {}}
              onNodeMove={() => {}}
              onNodeMoveEnd={() => {}}
              onStartConnect={() => {}}
              onDuplicateNode={() => {}}
              onConnect={() => {}}
              onDeleteNode={() => {}}
              onDeleteEdge={() => {}}
              onAddEdgeAction={() => {}}
              onRenameNode={() => {}}
              onOpenWizard={() => {}}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProcessPathModal;
