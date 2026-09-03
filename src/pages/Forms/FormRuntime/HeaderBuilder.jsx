/* eslint-disable react/prop-types */
// =====================================================================
// HeaderBuilder — طراح بصری سربرگ سند (جایگزین ورود JSON)
//
// کاربر مثل طراح جدول، روی خودِ سربرگ کار می‌کند:
//   • عنوان سند را در یک کادر می‌نویسد
//   • لوگو را با کشیدن فایل / کلیک بارگذاری می‌کند (یا نشانی می‌دهد)
//   • ردیف‌های سربرگ (شناسه سند، تاریخ بازنگری، …) را با دکمه‌های
//     آماده اضافه، جابه‌جا یا حذف می‌کند
//   • بالای کادر، پیش‌نمایش زندهٔ همان چیزی که چاپ می‌شود را می‌بیند
//
// قالب ذخیره‌سازی دست‌نخورده است: value رشتهٔ JSON آرایهٔ
// [{ key, label, value }] است و onChange همان رشته را برمی‌گرداند؛
// پس saveEditor و بک‌اند تغییری لازم ندارند.
// =====================================================================

import { useMemo, useRef, useState } from "react";
import {
  WARN_BYTES,
  approxBytes,
  formatBytes,
  isDataUrl,
  readImageFile,
} from "./imageTool";
import "./header-builder.css";

/* ردیف‌های پرکاربرد سربرگ سند — با یک کلیک اضافه می‌شوند. */
const PRESETS = [
  { key: "code", label: "شناسه سند", value: "SY-SE-F-000" },
  { key: "rev", label: "تاریخ بازنگری", value: "۱۴۰۵/۰۱/۰۱" },
  { key: "revision", label: "شماره ویرایش", value: "۰۱" },
  { key: "page", label: "صفحه", value: "۱ از ۱" },
];

const parseRows = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** کلیدها باید یکتا و پایدار بمانند تا هنگام تایپ، فوکوس نپرد. */
const withStableKeys = (rows) => {
  const used = new Set();
  return rows.map((row, index) => {
    let key = String(row?.key || "").trim() || `row_${index + 1}`;
    while (used.has(key)) key = `${key}_${index + 1}`;
    used.add(key);
    return {
      key,
      label: String(row?.label ?? ""),
      value: String(row?.value ?? ""),
    };
  });
};

/* --------------------------------------------------------------------- */
/* انتخاب لوگو: بارگذاری فایل + کشیدن و رها کردن + نشانی اینترنتی        */
/* --------------------------------------------------------------------- */

export function LogoPicker({ value, onChange, compact = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlMode, setUrlMode] = useState(false);
  const bytes = approxBytes(value);
  const heavy = bytes > WARN_BYTES;

  const pick = async (file) => {
    setError("");
    setBusy(true);
    try {
      const image = await readImageFile(file);
      onChange?.(image.src);
    } catch (problem) {
      setError(problem?.message || "بارگذاری تصویر ممکن نشد");
    } finally {
      setBusy(false);
    }
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={compact ? "hb-logo hb-logo-compact" : "hb-logo"}>
      <div
        className="hb-drop"
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") openPicker();
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer?.files?.[0];
          if (file) pick(file);
        }}
      >
        {value ? (
          <img src={value} alt="لوگو" />
        ) : (
          <span className="hb-drop-hint">
            {busy
              ? "در حال آماده‌سازی تصویر…"
              : "تصویر لوگو را بکشید و اینجا رها کنید، یا کلیک کنید"}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) pick(file);
          event.target.value = "";
        }}
      />

      <div className="hb-logo-tools">
        <button type="button" className="hb-btn" onClick={openPicker}>
          بارگذاری فایل
        </button>
        <button
          type="button"
          className="hb-btn"
          onClick={() => setUrlMode((state) => !state)}
        >
          {urlMode ? "بستن نشانی" : "درج نشانی (URL)"}
        </button>
        {value ? (
          <button
            type="button"
            className="hb-btn hb-btn-danger"
            onClick={() => {
              setError("");
              onChange?.("");
            }}
          >
            حذف تصویر
          </button>
        ) : null}
        {bytes ? (
          <span className={heavy ? "hb-badge hb-badge-warn" : "hb-badge"}>
            {formatBytes(bytes)}
          </span>
        ) : null}
      </div>

      {urlMode ? (
        <input
          className="hb-input"
          dir="ltr"
          placeholder="https://example.com/logo.png"
          value={isDataUrl(value) ? "" : value || ""}
          onChange={(event) => onChange?.(event.target.value)}
        />
      ) : null}

      {heavy ? (
        <div className="hb-note">
          حجم این تصویر برای ذخیره در پایگاه داده زیاد است؛ تصویر کوچک‌تری
          انتخاب کنید یا نشانی (URL) بدهید.
        </div>
      ) : null}

      {error ? <div className="hb-error">{error}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* طراح سربرگ                                                            */
/* --------------------------------------------------------------------- */

export default function HeaderBuilder({
  value,
  onChange,
  title,
  onTitle,
  logo,
  onLogo,
}) {
  const rows = useMemo(() => withStableKeys(parseRows(value)), [value]);

  const commit = (next) =>
    onChange?.(JSON.stringify(withStableKeys(next), null, 2));

  const patch = (index, part) =>
    commit(rows.map((row, at) => (at === index ? { ...row, ...part } : row)));

  const remove = (index) => commit(rows.filter((_, at) => at !== index));

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const add = (preset) => {
    const used = new Set(rows.map((row) => row.key));
    let key = preset?.key || `row_${rows.length + 1}`;
    while (used.has(key)) key = `${key}_${rows.length + 1}`;
    commit([
      ...rows,
      { key, label: preset?.label || "", value: preset?.value || "" },
    ]);
  };

  return (
    <div className="hb">
      {/* پیش‌نمایش زنده — همان CSS خروجی چاپ */}
      <div className="hb-preview">
        <div className="fr-docheader">
          <div className="fr-docheader-meta">
            {rows.length ? (
              rows.map((row) => (
                <span key={row.key}>
                  {row.label}: <b>{row.value}</b>
                </span>
              ))
            ) : (
              <span className="fr-help">ردیفی ندارد</span>
            )}
          </div>
          <div className="fr-docheader-title">{title || "عنوان سند"}</div>
          <div className="fr-docheader-logo">
            {logo ? (
              <img src={logo} alt="لوگو" />
            ) : (
              <span className="fr-help">لوگو</span>
            )}
          </div>
        </div>
      </div>

      <div className="hb-grid">
        <label className="hb-field">
          <span className="hb-field-label">عنوان سند</span>
          <input
            className="hb-input"
            value={title || ""}
            placeholder="مثلاً: درخواست تغییرات"
            onChange={(event) => onTitle?.(event.target.value)}
          />
          <span className="hb-hint">وسط سربرگ، درشت چاپ می‌شود.</span>
        </label>

        <div className="hb-field">
          <span className="hb-field-label">لوگو</span>
          <LogoPicker value={logo} onChange={onLogo} />
        </div>
      </div>

      <div className="hb-rows">
        <div className="hb-rows-head">
          <span className="hb-field-label">ردیف‌های سربرگ</span>
          <span className="hb-hint">
            برچسب و مقدار؛ مقدار پررنگ کنار برچسب چاپ می‌شود.
          </span>
        </div>

        {rows.map((row, index) => (
          <div className="hb-row" key={row.key}>
            <input
              className="hb-input"
              value={row.label}
              placeholder="برچسب (مثلاً شناسه سند)"
              onChange={(event) => patch(index, { label: event.target.value })}
            />
            <input
              className="hb-input hb-input-value"
              value={row.value}
              placeholder="مقدار (مثلاً SY-SE-F-003)"
              onChange={(event) => patch(index, { value: event.target.value })}
            />
            <div className="hb-row-tools">
              <button
                type="button"
                className="hb-icon"
                title="یک ردیف بالاتر"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="hb-icon"
                title="یک ردیف پایین‌تر"
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="hb-icon hb-icon-danger"
                title="حذف ردیف"
                onClick={() => remove(index)}
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 ? (
          <div className="hb-empty">
            هنوز ردیفی ندارد؛ از دکمه‌های زیر استفاده کنید.
          </div>
        ) : null}

        <div className="hb-add">
          <button
            type="button"
            className="hb-btn hb-btn-main"
            onClick={() => add()}
          >
            + ردیف خالی
          </button>
          {PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.key}
              className="hb-btn"
              onClick={() => add(preset)}
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
