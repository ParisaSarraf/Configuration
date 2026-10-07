import { useId, useMemo, useState } from "react";
import { layoutGraph } from "../ProcessBuilder/processGraph";
import "./StationDurationJourney.css";

const fa = (value) => Number(value).toLocaleString("fa-IR");
const count = (value) => value == null ? "—" : fa(value);
export const durationSeconds = (value) => {
  if (value == null || value === "") return null;
  const match = String(value).trim().match(/^(?:(\d+)\s+)?(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/);
  if (!match) return null;
  return Number(match[1] || 0) * 86400 + Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4]);
};
export const formatStationDuration = (value, compact = false) => {
  const seconds = durationSeconds(value);
  if (seconds == null) return value == null || value === "" ? "—" : String(value);
  if (seconds > 0 && seconds < 1) return "کمتر از یک ثانیه";
  let remaining = Math.floor(seconds);
  const parts = [];
  for (const [unit, size] of [["روز", 86400], ["ساعت", 3600], ["دقیقه", 60], ["ثانیه", 1]]) {
    const amount = Math.floor(remaining / size);
    remaining %= size;
    if (amount) parts.push(`${fa(amount)} ${unit}`);
  }
  if (!parts.length) return "۰ ثانیه";
  if (compact && parts.length > 2) return `حدود ${parts.slice(0, 2).join(" و ")}`;
  return parts.join(" و ");
};

export default function StationDurationJourney({ rows, graph }) {
  const markerId = `duration-arrow-${useId().replace(/:/g, "")}`;
  const detailsId = `duration-details-${useId().replace(/:/g, "")}`;
  const [selectedId, setSelectedId] = useState(null);
  const model = useMemo(() => {
    const reportById = new Map(rows.map((row, index) => [String(row.id ?? `report-${index}`), row]));
    const known = new Set();
    const sourceNodes = (graph?.nodes || []).map((node) => {
      const id = String(node.id);
      known.add(id);
      return { ...node, id, report: reportById.get(id) };
    });
    rows.forEach((row, index) => {
      const id = String(row.id ?? `report-${index}`);
      if (!known.has(id)) sourceNodes.push({ id, name: row.name, report: row });
    });
    const edges = (graph?.edges || []).map((edge) => ({ ...edge, source: String(edge.source), target: String(edge.target) }));
    const laidOut = layoutGraph({ nodes: sourceNodes, edges });
    const minY = Math.min(...laidOut.nodes.map((node) => node.y));
    const minX = Math.min(...laidOut.nodes.map((node) => node.x));
    const levels = laidOut.nodes.map((node) => Math.round((node.y - minY) / 152));
    const width = Math.max(232, Math.max(...levels) * 240 + 232);
    const nodes = laidOut.nodes.map((node, index) => ({
      ...node,
      x: width - 196 - levels[index] * 240,
      y: 40 + (node.x - minX) * 1.05,
    }));
    const height = Math.max(...nodes.map((node) => node.y)) + 244;
    let slowest = null;
    for (const row of rows) {
      const value = durationSeconds(row.average);
      if (value != null && value > 0 && (slowest == null || value > slowest.seconds)) slowest = { row, seconds: value };
    }
    return { nodes, edges, width, height, slowest };
  }, [rows, graph]);
  const selected = model.nodes.find((node) => node.id === selectedId) || model.nodes.find((node) => node.report) || model.nodes[0];
  const report = selected?.report;
  const byId = new Map(model.nodes.map((node) => [node.id, node]));
  const destinations = model.edges.filter((edge) => edge.source === selected?.id).map((edge) => byId.get(edge.target)).filter(Boolean);
  const isSlowest = (node) => !!node.report && node.report === model.slowest?.row;

  return (
    <div className="station-journey" dir="rtl">
      <div className="station-journey-intro">
        <p>میانگین توقف داخل هر دایره است؛ برای دیدن جزئیات، ایستگاه را انتخاب کنید.</p>
        {model.slowest && <span className="station-journey-insight">بیشترین میانگین توقف: <strong>{model.slowest.row.name}</strong></span>}
      </div>
      <div className="station-journey-map" tabIndex={0} aria-label="نقشه زمان ایستگاه‌ها؛ اتصال‌ها مطابق مسیر فرایند است">
        <div className="station-journey-canvas" style={{ width: model.width, height: model.height }}>
          <svg className="station-journey-lines" width={model.width} height={model.height} aria-hidden="true">
            <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="currentColor" strokeWidth="1.5" /></marker></defs>
            {model.edges.map((edge, index) => {
              const source = byId.get(edge.source), target = byId.get(edge.target);
              if (!source || !target) return null;
              const sx = source.x + 74, sy = source.y + 74, tx = target.x + 74, ty = target.y + 74;
              const distance = Math.hypot(tx - sx, ty - sy);
              let d;
              if (!distance) d = `M ${sx + 52} ${sy - 52} C ${sx + 150} ${sy - 130}, ${sx + 150} ${sy + 130}, ${sx + 55} ${sy + 55}`;
              else {
                const dx = (tx - sx) / distance, dy = (ty - sy) / distance;
                const x1 = sx + dx * 80, y1 = sy + dy * 80, x2 = tx - dx * 82, y2 = ty - dy * 82;
                const bend = Math.max(36, Math.abs(x2 - x1) / 2);
                d = tx < sx ? `M${x1},${y1} C${x1 - bend},${y1} ${x2 + bend},${y2} ${x2},${y2}` : `M${sx + 80},${sy} H${model.width - 24} Q${model.width - 8},${sy} ${model.width - 8},${sy - 16} V${ty + 16} Q${model.width - 8},${ty} ${model.width - 24},${ty} H${tx + 82}`;
              }
              return <path key={edge.id ?? index} d={d} className={edge.source === selected?.id || edge.target === selected?.id ? "is-highlighted" : ""} markerEnd={`url(#${markerId})`} />;
            })}
          </svg>
          {model.nodes.map((node, nodeIndex) => (
            <div key={node.id} className="station-journey-stop" style={{ left: node.x, top: node.y }}>
              <button type="button" className={`station-journey-circle ${selected?.id === node.id ? "is-selected" : ""} ${isSlowest(node) ? "is-slowest" : ""}`} onClick={() => setSelectedId(node.id)} aria-pressed={selected?.id === node.id} aria-controls={detailsId} aria-label={`${node.name}، میانگین توقف: ${node.report ? formatStationDuration(node.report.average) : "بدون گزارش"}`}>
                <span className="station-journey-caption">میانگین توقف</span>
                <strong title={node.report ? formatStationDuration(node.report.average) : "بدون گزارش"}>{node.report ? formatStationDuration(node.report.average, true) : "بدون گزارش"}</strong>
                <span className="station-journey-caption">{node.report ? `${count(node.report.requestCount)} درخواست` : "داده‌ای ثبت نشده"}</span>
              </button>
              <div className="station-journey-name" title={node.name}>{node.name}</div>
              {isSlowest(node) && <span className="station-journey-slowest-label">بیشترین میانگین</span>}
              {model.edges.some((edge) => edge.source === node.id && edge.target === model.nodes[nodeIndex + 1]?.id) && <span className="station-journey-mobile-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
      <p className="station-journey-note"><span className="station-journey-desktop-note">خط‌ها اتصال واقعی ایستگاه‌ها را نشان می‌دهند؛ </span><span className="station-journey-mobile-note">مسیرهای بعدی در جزئیات هر ایستگاه قابل انتخاب‌اند؛ </span>اندازه دایره‌ها نشان‌دهنده مدت زمان نیست.</p>
      <section id={detailsId} className="station-journey-details" aria-live="polite" aria-atomic="true">
        <div className="station-journey-details-heading"><div><span className="station-journey-caption">جزئیات ایستگاه انتخاب‌شده</span><h3>{selected?.name}</h3></div><span className="station-journey-counts">{report ? `${count(report.visitCount)} بازدید · ${count(report.requestCount)} درخواست` : "گزارش زمانی موجود نیست"}</span></div>
        {report ? <dl className="station-journey-metrics">{[["میانگین زمان", report.average], ["حداقل زمان", report.minimum], ["حداکثر زمان", report.maximum], ["مجموع زمان", report.total]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatStationDuration(value)}</dd></div>)}</dl> : <p className="station-journey-note">برای این ایستگاه هنوز داده زمانی از API دریافت نشده است.</p>}
        {!!destinations.length && <div className="station-journey-next"><span>ایستگاه‌های بعدی:</span>{destinations.map((node, index) => <button type="button" key={`${node.id}-${index}`} onClick={() => setSelectedId(node.id)}>{node.name} ←</button>)}</div>}
      </section>
    </div>
  );
}
