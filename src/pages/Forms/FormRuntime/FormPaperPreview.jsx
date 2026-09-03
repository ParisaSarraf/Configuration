/* eslint-disable react/prop-types */
// =====================================================================
// FormPaperPreview — پیش‌نمایش «برگهٔ A4» در پنل‌های باریک
//
// همان FormRenderer واقعی رندر می‌شود (پس پیش‌نمایش = خروجی
// چاپ)، اما کل کاغذ ۲۱۰ میلی‌متری با transform: scale به اندازهٔ پنل
// کوچک می‌شود — دقیقاً مثل پیش‌نمایش Word/PDF.
//
// سه حالت نمایش: تناسب عرض · اندازهٔ واقعی · تمام‌صفحه
// =====================================================================

import { useEffect, useRef, useState } from "react";
import FormRenderer from "./FormRenderer";
import printForm from "./printForm";
import "./form-runtime.css";

const A4_WIDTH = 794; // ۲۱۰میلی‌متر در ۹۶dpi
const A4_HEIGHT = 1123; // ۲۹۷میلی‌متر
const MIN_SCALE = 0.28;

function PaperStage({ categories, mode, fit, paperRef }) {
  const stageRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(A4_HEIGHT);

  useEffect(() => {
    const stage = stageRef.current;
    const inner = innerRef.current;
    if (!stage || !inner) return undefined;

    const measure = () => {
      const available = stage.clientWidth - 24;
      const next = fit
        ? Math.min(1, Math.max(MIN_SCALE, available / A4_WIDTH))
        : 1;
      // offsetHeight تحت تاثیر scale نیست، پس حلقهٔ بی‌پایان نمی‌سازد.
      const measured = inner.offsetHeight || A4_HEIGHT;
      setScale((prev) => (Math.abs(prev - next) > 0.004 ? next : prev));
      setHeight((prev) => (Math.abs(prev - measured) > 1 ? measured : prev));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [fit, categories]);

  return (
    <div className="fr-stage" ref={stageRef}>
      <div
        className="fr-scaler"
        style={{ width: A4_WIDTH * scale, height: height * scale }}
      >
        <div
          className="fr-scale-inner"
          ref={innerRef}
          style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
        >
          <FormRenderer
            categories={categories}
            mode={mode}
            showToolbar={false}
            paperRef={paperRef}
          />
        </div>
      </div>
    </div>
  );
}

export default function FormPaperPreview({
  categories = [],
  mode = "preview",
  title = "پیش‌نمایش فرم",
  subtitle,
}) {
  const [fit, setFit] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const paperRef = useRef(null);
  const bigPaperRef = useRef(null);

  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div className="fr-preview">
      <div className="fr-preview-bar fr-no-print">
        <div className="fr-preview-title">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="fr-preview-tools">
          <button
            type="button"
            className={`fr-chip${fit ? " is-active" : ""}`}
            onClick={() => setFit(true)}
          >
            تناسب عرض
          </button>
          <button
            type="button"
            className={`fr-chip${fit ? "" : " is-active"}`}
            onClick={() => setFit(false)}
          >
            اندازهٔ واقعی
          </button>
          <button
            type="button"
            className="fr-chip"
            onClick={() => setExpanded(true)}
          >
            تمام‌صفحه
          </button>
          <button
            type="button"
            className="fr-chip"
            onClick={() => printForm(paperRef.current)}
          >
            چاپ / PDF
          </button>
        </div>
      </div>

      <PaperStage
        categories={categories}
        mode={mode}
        fit={fit}
        paperRef={paperRef}
      />

      {expanded ? (
        <div className="fr-preview-overlay" role="dialog" aria-modal="true">
          <div className="fr-preview-overlay-bar fr-no-print">
            <span>{title}</span>
            <div className="fr-preview-tools">
              <button
                type="button"
                className="fr-chip"
                onClick={() => printForm(bigPaperRef.current)}
              >
                چاپ / PDF
              </button>
              <button
                type="button"
                className="fr-chip"
                onClick={() => setExpanded(false)}
              >
                بستن (Esc)
              </button>
            </div>
          </div>
          <PaperStage
            categories={categories}
            mode={mode}
            fit
            paperRef={bigPaperRef}
          />
        </div>
      ) : null}
    </div>
  );
}
