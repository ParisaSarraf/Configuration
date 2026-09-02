/* eslint-disable react/prop-types */
// =====================================================================
// SheetBuilder — طراح بصری جدول (جایگزین ورود JSON)
//
// کاربر روی خود جدول کار می‌کند: در هر خانه تایپ می‌کند، با
// یک کلیک نوع خانه را عوض می‌کند، ردیف/ستون می‌افزاید، خانه‌ها را
// ادغام می‌کند یا کل جدول را از Excel می‌چسباند.
//
// خروجی دقیقاً همان آرایهٔ سلول‌های { r, c, rs, cs, ... } است که
// SheetTable رندر می‌کند؛ پس ساختار ذخیره‌سازی دست‌نخورده می‌ماند.
//
// در کنار Form.Item کار می‌کند: value رشتهٔ JSON و onChange هم رشتهٔ
// JSON برمی‌گرداند. onSize(rows, cols) هم برای هم‌روزانی تعداد
// ردیف/ستون در فیلدهای min_value / max_value صدا زده می‌شود.
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import { emptySheet } from "./formElements";
import "./sheet-builder.css";

/* ------------------------------ انواع خانه ------------------------------ */

const KINDS = [
  {
    id: "head",
    label: "سرستون",
    patch: { variant: "head", type: "", align: "center", tall: false },
  },
  {
    id: "sub",
    label: "برچسب ردیف",
    patch: { variant: "sub", type: "", align: "right", tall: false },
  },
  {
    id: "static",
    label: "متن ثابت",
    patch: { variant: "plain", type: "", align: "right", tall: false },
  },
  {
    id: "text",
    label: "ورودی متن",
    patch: { variant: "plain", type: "text", align: "right", tall: false },
  },
  {
    id: "number",
    label: "عدد",
    patch: { variant: "plain", type: "number", align: "center", tall: false },
  },
  {
    id: "date",
    label: "تاریخ",
    patch: { variant: "plain", type: "date", align: "center", tall: false },
  },
  {
    id: "checkbox",
    label: "تیک ✓",
    patch: { variant: "plain", type: "checkbox", align: "center", tall: false },
  },
  {
    id: "select",
    label: "لیست انتخاب",
    patch: { variant: "plain", type: "select", align: "right", tall: false },
  },
  {
    id: "textarea",
    label: "متن بلند",
    patch: { variant: "plain", type: "textarea", align: "right", tall: true },
  },
  {
    id: "signature",
    label: "محل امضا",
    patch: { variant: "plain", type: "signature", align: "center", tall: true },
  },
];

const KIND_IDS = new Set(KINDS.map((kind) => kind.id));

const kindOf = (cell) => {
  if (cell.type) return KIND_IDS.has(cell.type) ? cell.type : "text";
  if (cell.variant === "head") return "head";
  if (cell.variant === "sub") return "sub";
  return "static";
};

const KIND_LABEL = new Map(KINDS.map((kind) => [kind.id, kind.label]));

/** خانه‌های ورودی، متن ثابت نشان نمی‌دهند؛ پس متن راهنما ویرایش می‌شود. */
const editsPlaceholder = (cell) =>
  Boolean(cell.type) && cell.type !== "checkbox";

/* ------------------------------ مدل جدول ------------------------------ */

const readCells = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

let idCounter = 0;
const nextId = () => {
  idCounter += 1;
  return `cell-${idCounter}`;
};

/** آرایهٔ سلول‌ها ← ماتریس مالکیت (برای مدیریت سادهٔ ادغام‌ها) */
const buildGrid = (cells) => {
  const rows = cells.reduce(
    (max, cell) =>
      Math.max(max, (Number(cell.r) || 0) + Math.max(Number(cell.rs) || 1, 1)),
    0,
  );
  const cols = cells.reduce(
    (max, cell) =>
      Math.max(max, (Number(cell.c) || 0) + Math.max(Number(cell.cs) || 1, 1)),
    0,
  );

  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const byId = new Map();

  cells.forEach((cell) => {
    const r = Number(cell.r) || 0;
    const c = Number(cell.c) || 0;
    const rs = Math.max(Number(cell.rs) || 1, 1);
    const cs = Math.max(Number(cell.cs) || 1, 1);
    const id = nextId();
    byId.set(id, { ...cell, r, c, rs, cs });
    for (let i = r; i < Math.min(r + rs, rows); i += 1)
      for (let j = c; j < Math.min(c + cs, cols); j += 1)
        if (!grid[i][j]) grid[i][j] = id;
  });

  // خانه‌های جامانده (جدول‌های ناقص) را پر می‌کنیم
  for (let i = 0; i < rows; i += 1)
    for (let j = 0; j < cols; j += 1)
      if (!grid[i][j]) {
        const id = nextId();
        byId.set(id, { text: "", type: "text", variant: "plain", align: "right" });
        grid[i][j] = id;
      }

  return { rows, cols, grid, byId };
};

/** ماتریس مالکیت ← آرایهٔ سلول‌های قابل ذخیره */
const gridToCells = (grid, byId) => {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const boxes = new Map();

  for (let i = 0; i < rows; i += 1)
    for (let j = 0; j < cols; j += 1) {
      const id = grid[i][j];
      if (!id) continue;
      const box = boxes.get(id);
      if (!box) boxes.set(id, { minR: i, minC: j, maxR: i, maxC: j });
      else {
        box.minR = Math.min(box.minR, i);
        box.minC = Math.min(box.minC, j);
        box.maxR = Math.max(box.maxR, i);
        box.maxC = Math.max(box.maxC, j);
      }
    }

  const out = [];
  boxes.forEach((box, id) => {
    const base = byId.get(id) || {};
    const cell = {
      r: box.minR,
      c: box.minC,
      rs: box.maxR - box.minR + 1,
      cs: box.maxC - box.minC + 1,
      text: base.text || "",
      variant: base.variant || "plain",
      align: base.align || "right",
    };
    if (base.type) {
      cell.type = base.type;
      cell.name = base.name || `cell_${box.minR}_${box.minC}`;
    }
    if (base.tall) cell.tall = true;
    if (base.placeholder) cell.placeholder = base.placeholder;
    if (Array.isArray(base.options) && base.options.length)
      cell.options = base.options;
    if (base.width) cell.width = base.width;
    out.push(cell);
  });

  return out.sort((a, b) => a.r - b.r || a.c - b.c);
};

const cloneGrid = (grid) => grid.map((row) => row.slice());
const cloneMap = (map) =>
  new Map(Array.from(map.entries()).map(([key, cell]) => [key, { ...cell }]));

/** گسترش یک مستطیل تا هیچ خانهٔ ادغام‌شده‌ای نیمه‌بریده نماند */
const normalizeRect = (grid, rect) => {
  const box = { ...rect };
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = box.minR; i <= box.maxR; i += 1)
      for (let j = box.minC; j <= box.maxC; j += 1) {
        const id = grid[i][j];
        for (let a = 0; a < grid.length; a += 1)
          for (let b = 0; b < grid[a].length; b += 1) {
            if (grid[a][b] !== id) continue;
            if (a < box.minR) { box.minR = a; changed = true; }
            if (a > box.maxR) { box.maxR = a; changed = true; }
            if (b < box.minC) { box.minC = b; changed = true; }
            if (b > box.maxC) { box.maxC = b; changed = true; }
          }
      }
  }
  return box;
};

/* ------------------------------ الگوها ------------------------------ */

const headCell = (c, text, width) => ({
  r: 0,
  c,
  rs: 1,
  cs: 1,
  text,
  variant: "head",
  align: "center",
  ...(width ? { width } : {}),
});

const TEMPLATES = [
  {
    id: "basic",
    label: "جدول ساده ۳×۳",
    build: () => emptySheet(3, 3),
  },
  {
    id: "yesno",
    label: "بله / خیر / توضیح",
    build: () => {
      const cells = [
        headCell(0, "عنوان", "34%"),
        headCell(1, "بله", "10%"),
        headCell(2, "خیر", "10%"),
        headCell(3, "توضیح / برآورد", "46%"),
      ];
      for (let r = 1; r <= 4; r += 1) {
        cells.push({ r, c: 0, rs: 1, cs: 1, text: `مورد ${r}`, variant: "sub", align: "right" });
        cells.push({ r, c: 1, rs: 1, cs: 1, text: "", type: "checkbox", name: `row${r}_yes`, align: "center" });
        cells.push({ r, c: 2, rs: 1, cs: 1, text: "", type: "checkbox", name: `row${r}_no`, align: "center" });
        cells.push({ r, c: 3, rs: 1, cs: 1, text: "", type: "text", name: `row${r}_note`, align: "right" });
      }
      return cells;
    },
  },
  {
    id: "approval",
    label: "تاییدات و امضا",
    build: () => {
      const cells = [
        headCell(0, "بررسی کننده", "38%"),
        headCell(1, "نظر / تایید یا رد", "36%"),
        headCell(2, "امضا", "26%"),
      ];
      for (let r = 1; r <= 4; r += 1) {
        cells.push({ r, c: 0, rs: 1, cs: 1, text: `واحد ${r}`, variant: "sub", align: "right" });
        cells.push({ r, c: 1, rs: 1, cs: 1, text: "", type: "text", name: `unit${r}_opinion`, align: "right" });
        cells.push({ r, c: 2, rs: 1, cs: 1, text: "", type: "signature", name: `unit${r}_sign`, align: "center", tall: true });
      }
      return cells;
    },
  },
  {
    id: "pairs",
    label: "برچسب و مقدار",
    build: () => {
      const cells = [];
      for (let r = 0; r < 4; r += 1) {
        cells.push({ r, c: 0, rs: 1, cs: 1, text: `عنوان ${r + 1}`, variant: "sub", align: "right", ...(r === 0 ? { width: "30%" } : {}) });
        cells.push({ r, c: 1, rs: 1, cs: 1, text: "", type: "text", name: `value_${r + 1}`, align: "right" });
      }
      return cells;
    },
  },
];

/* ------------------------------ کامپوننت ------------------------------ */

export default function SheetBuilder({ value, onChange, onSize }) {
  const cells = useMemo(() => readCells(value), [value]);
  const model = useMemo(() => buildGrid(cells), [cells]);
  const { rows, cols, grid, byId } = model;

  const [selected, setSelected] = useState({ r: 0, c: 0 });
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    onSize?.(rows, cols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols]);

  const emit = (nextGrid, nextById) =>
    onChange?.(JSON.stringify(gridToCells(nextGrid, nextById), null, 2));

  const applyCells = (nextCells) =>
    onChange?.(JSON.stringify(nextCells, null, 2));

  /* جعبهٔ هر خانه برای rowSpan/colSpan */
  const boxes = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < rows; i += 1)
      for (let j = 0; j < cols; j += 1) {
        const id = grid[i][j];
        const box = map.get(id);
        if (!box) map.set(id, { minR: i, minC: j, maxR: i, maxC: j });
        else {
          box.maxR = Math.max(box.maxR, i);
          box.maxC = Math.max(box.maxC, j);
        }
      }
    return map;
  }, [grid, rows, cols]);

  const selectedId =
    rows && selected.r < rows && selected.c < cols
      ? grid[selected.r][selected.c]
      : null;
  const selectedCell = selectedId ? byId.get(selectedId) : null;
  const selectedBox = selectedId ? boxes.get(selectedId) : null;

  /* ------------------------------ عملیات ------------------------------ */

  const patchSelected = (patch) => {
    if (!selectedId) return;
    const nextById = cloneMap(byId);
    nextById.set(selectedId, { ...nextById.get(selectedId), ...patch });
    emit(grid, nextById);
  };

  const setCellText = (id, text) => {
    const nextById = cloneMap(byId);
    const cell = nextById.get(id);
    nextById.set(
      id,
      editsPlaceholder(cell) ? { ...cell, placeholder: text } : { ...cell, text },
    );
    emit(grid, nextById);
  };

  const addRow = (at) => {
    const nextGrid = cloneGrid(grid);
    const nextById = cloneMap(byId);
    const row = [];
    for (let j = 0; j < cols; j += 1) {
      const above = at > 0 ? nextGrid[at - 1][j] : null;
      const below = at < rows ? nextGrid[at][j] : null;
      if (above && below && above === below) row.push(above);
      else {
        const id = nextId();
        nextById.set(id, { text: "", type: "text", variant: "plain", align: "right" });
        row.push(id);
      }
    }
    nextGrid.splice(at, 0, row);
    emit(nextGrid, nextById);
  };

  const removeRow = (at) => {
    if (rows <= 1) return;
    const nextGrid = cloneGrid(grid);
    nextGrid.splice(at, 1);
    setSelected({ r: Math.max(0, at - 1), c: selected.c });
    emit(nextGrid, byId);
  };

  const addCol = (at) => {
    const nextGrid = cloneGrid(grid);
    const nextById = cloneMap(byId);
    for (let i = 0; i < rows; i += 1) {
      const before = at > 0 ? nextGrid[i][at - 1] : null;
      const after = at < cols ? nextGrid[i][at] : null;
      if (before && after && before === after) nextGrid[i].splice(at, 0, before);
      else {
        const id = nextId();
        nextById.set(
          id,
          i === 0
            ? { text: "ستون جدید", variant: "head", align: "center" }
            : { text: "", type: "text", variant: "plain", align: "right" },
        );
        nextGrid[i].splice(at, 0, id);
      }
    }
    emit(nextGrid, nextById);
  };

  const removeCol = (at) => {
    if (cols <= 1) return;
    const nextGrid = cloneGrid(grid);
    nextGrid.forEach((row) => row.splice(at, 1));
    setSelected({ r: selected.r, c: Math.max(0, at - 1) });
    emit(nextGrid, byId);
  };

  const mergeSelected = (direction) => {
    if (!selectedBox) return;
    const rect = { ...selectedBox };
    if (direction === "col") {
      if (rect.maxC + 1 >= cols) return;
      rect.maxC += 1;
    } else {
      if (rect.maxR + 1 >= rows) return;
      rect.maxR += 1;
    }
    const box = normalizeRect(grid, rect);
    const nextGrid = cloneGrid(grid);
    for (let i = box.minR; i <= box.maxR; i += 1)
      for (let j = box.minC; j <= box.maxC; j += 1) nextGrid[i][j] = selectedId;
    setSelected({ r: box.minR, c: box.minC });
    emit(nextGrid, byId);
  };

  const splitSelected = () => {
    if (!selectedBox) return;
    const nextGrid = cloneGrid(grid);
    const nextById = cloneMap(byId);
    for (let i = selectedBox.minR; i <= selectedBox.maxR; i += 1)
      for (let j = selectedBox.minC; j <= selectedBox.maxC; j += 1) {
        if (i === selectedBox.minR && j === selectedBox.minC) continue;
        const id = nextId();
        nextById.set(id, { text: "", type: "text", variant: "plain", align: "right" });
        nextGrid[i][j] = id;
      }
    emit(nextGrid, nextById);
  };

  const importPaste = () => {
    const lines = pasteText
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+$/, ""))
      .filter((line) => line.trim().length);
    if (!lines.length) return;
    const table = lines.map((line) => line.split(/\t|\s*[|،,]\s*/));
    const width = table.reduce((max, row) => Math.max(max, row.length), 1);
    const next = [];
    table.forEach((row, r) => {
      for (let c = 0; c < width; c += 1) {
        const text = (row[c] || "").trim();
        if (r === 0)
          next.push({ r, c, rs: 1, cs: 1, text: text || `ستون ${c + 1}`, variant: "head", align: "center" });
        else if (text)
          next.push({ r, c, rs: 1, cs: 1, text, variant: "plain", align: "right" });
        else
          next.push({ r, c, rs: 1, cs: 1, text: "", type: "text", name: `cell_${r}_${c}`, align: "right" });
      }
    });
    applyCells(next);
    setPasteOpen(false);
    setPasteText("");
  };

  /* ------------------------------ رندر ------------------------------ */

  if (!rows || !cols)
    return (
      <div className="sb-root">
        <div className="sb-empty">
          <p>هنوز جدولی ساخته نشده — یکی از این الگوها را انتخاب کنید:</p>
          <div className="sb-chips">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                className="sb-btn is-primary"
                onClick={() => applyCells(template.build())}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="sb-root">
      <div className="sb-toolbar">
        <span className="sb-size">
          {rows} ردیف × {cols} ستون
        </span>
        <button type="button" className="sb-btn" onClick={() => addRow(rows)}>
          + ردیف
        </button>
        <button type="button" className="sb-btn" onClick={() => addCol(cols)}>
          + ستون
        </button>
        <button
          type="button"
          className={`sb-btn${pasteOpen ? " is-active" : ""}`}
          onClick={() => setPasteOpen((prev) => !prev)}
        >
          چسباندن از Excel
        </button>
        <span className="sb-sep" />
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            className="sb-btn is-ghost"
            title="جایگزینی کل جدول با این الگو"
            onClick={() => applyCells(template.build())}
          >
            {template.label}
          </button>
        ))}
      </div>

      {pasteOpen && (
        <div className="sb-paste">
          <textarea
            className="sb-paste-input"
            rows={4}
            value={pasteText}
            placeholder="محتوا را از Excel یا Word کپی کنید و اینجا بچسبانید. هر خط = یک ردیف، ستون‌ها با Tab یا کاما جدا می‌شوند."
            onChange={(event) => setPasteText(event.target.value)}
          />
          <div className="sb-chips">
            <button type="button" className="sb-btn is-primary" onClick={importPaste}>
              ساخت جدول از این متن
            </button>
            <span className="sb-hint">ردیف اول به‌عنوان سرستون در نظر گرفته می‌شود.</span>
          </div>
        </div>
      )}

      <div className="sb-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              <th className="sb-corner" />
              {Array.from({ length: cols }, (unused, c) => (
                <th key={`col-${c}`} className="sb-colhead">
                  <button type="button" className="sb-mini" title="افزودن ستون" onClick={() => addCol(c)}>
                    +
                  </button>
                  <span>{c + 1}</span>
                  <button
                    type="button"
                    className="sb-mini is-danger"
                    title="حذف ستون"
                    onClick={() => removeCol(c)}
                    disabled={cols <= 1}
                  >
                    ×
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (unusedRow, r) => (
              <tr key={`row-${r}`}>
                <th className="sb-rowhead">
                  <button type="button" className="sb-mini" title="افزودن ردیف" onClick={() => addRow(r)}>
                    +
                  </button>
                  <span>{r + 1}</span>
                  <button
                    type="button"
                    className="sb-mini is-danger"
                    title="حذف ردیف"
                    onClick={() => removeRow(r)}
                    disabled={rows <= 1}
                  >
                    ×
                  </button>
                </th>
                {Array.from({ length: cols }, (unusedCol, c) => {
                  const id = grid[r][c];
                  const box = boxes.get(id);
                  if (!box || box.minR !== r || box.minC !== c) return null;
                  const cell = byId.get(id) || {};
                  const kind = kindOf(cell);
                  const isSelected = id === selectedId;
                  const classes = [
                    "sb-cell",
                    cell.variant === "head" ? "is-head" : "",
                    cell.variant === "sub" ? "is-sub" : "",
                    cell.type ? "is-input" : "",
                    isSelected ? "is-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <td
                      key={id}
                      className={classes}
                      colSpan={box.maxC - box.minC + 1}
                      rowSpan={box.maxR - box.minR + 1}
                      onClick={() => setSelected({ r, c })}
                    >
                      <input
                        className="sb-cell-input"
                        value={
                          (editsPlaceholder(cell) ? cell.placeholder : cell.text) || ""
                        }
                        placeholder={editsPlaceholder(cell) ? "متن راهنما…" : "متن خانه…"}
                        onFocus={() => setSelected({ r, c })}
                        onChange={(event) => setCellText(id, event.target.value)}
                      />
                      <span className="sb-tag">{KIND_LABEL.get(kind)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="sb-inspector">
          <div className="sb-row">
            <span className="sb-row-title">
              خانهٔ ردیف {selected.r + 1} ، ستون {selected.c + 1}
            </span>
          </div>

          <div className="sb-row">
            <span className="sb-row-label">نوع خانه</span>
            <div className="sb-chips">
              {KINDS.map((kind) => (
                <button
                  key={kind.id}
                  type="button"
                  className={`sb-chip${kindOf(selectedCell) === kind.id ? " is-active" : ""}`}
                  onClick={() => patchSelected(kind.patch)}
                >
                  {kind.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sb-row">
            <span className="sb-row-label">چیدمان</span>
            <div className="sb-chips">
              <button
                type="button"
                className={`sb-chip${selectedCell.align !== "center" ? " is-active" : ""}`}
                onClick={() => patchSelected({ align: "right" })}
              >
                راست‌چین
              </button>
              <button
                type="button"
                className={`sb-chip${selectedCell.align === "center" ? " is-active" : ""}`}
                onClick={() => patchSelected({ align: "center" })}
              >
                وسط‌چین
              </button>
              <button
                type="button"
                className={`sb-chip${selectedCell.tall ? " is-active" : ""}`}
                onClick={() => patchSelected({ tall: !selectedCell.tall })}
              >
                خانهٔ بلند
              </button>
              <span className="sb-sep" />
              <button type="button" className="sb-chip" onClick={() => mergeSelected("col")}>
                ادغام با ستون بعدی
              </button>
              <button type="button" className="sb-chip" onClick={() => mergeSelected("row")}>
                ادغام با ردیف پایین
              </button>
              <button
                type="button"
                className="sb-chip"
                onClick={splitSelected}
                disabled={
                  !selectedBox ||
                  (selectedBox.maxR === selectedBox.minR &&
                    selectedBox.maxC === selectedBox.minC)
                }
              >
                تفکیک
              </button>
            </div>
          </div>

          <div className="sb-row">
            <span className="sb-row-label">عرض ستون</span>
            <input
              className="sb-field sb-field-sm"
              value={selectedCell.width || ""}
              placeholder="مثلاً 30%"
              onChange={(event) => patchSelected({ width: event.target.value })}
            />
            {Boolean(selectedCell.type) && (
              <>
                <span className="sb-row-label">کلید ذخیره</span>
                <input
                  className="sb-field"
                  dir="ltr"
                  value={selectedCell.name || ""}
                  placeholder={`cell_${selected.r}_${selected.c}`}
                  onChange={(event) => patchSelected({ name: event.target.value })}
                />
              </>
            )}
          </div>

          {selectedCell.type === "select" && (
            <div className="sb-row">
              <span className="sb-row-label">گزینه‌ها</span>
              <input
                className="sb-field"
                value={(selectedCell.options || []).join("، ")}
                placeholder="گزینه‌ها را با کاما جدا کنید"
                onChange={(event) =>
                  patchSelected({
                    options: event.target.value
                      .split(/[،,]/)
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          )}

          <p className="sb-hint">
            در خانه‌های ورودی، متن تایپ‌شده فقط متن راهنمای داخل کادر است؛
            عنوان واقعی را در خانه‌های «سرستون» یا «برچسب ردیف» بنویسید.
          </p>
        </div>
      )}
    </div>
  );
}
