// Free-canvas layout engine for the Form Builder Studio.
//
// Each field is positioned with (x, y, w, h) in *grid units*, not raw
// pixels — x/w are column units, y/h are row units. Pixel math lives in
// colsToPx / rowsToPx below so the whole canvas can be re-tuned (denser
// grid, wider canvas, ...) from the GRID constant alone.
//
// During a drag or resize the on-screen movement is real, continuous
// pixels (see FormBuilderStudio.jsx) — GRID only decides where things
// *snap to* once the mouse is released, so the interaction feels like
// picking a card up and placing it anywhere, not hopping between cells.

const LAYOUT_TOKEN = /(?:^|\s)form-studio-(x|y|w|h):(-?\d+)(?=\s|$)/g;
const LEGACY_ROW_TOKEN = /(?:^|\s)form-studio-row:([^\s]+)/g;
const LEGACY_WIDTH_TOKEN = /(?:^|\s)form-studio-width:([^\s]+)/g;

export const GRID = Object.freeze({
  cols: 12,
  colWidth: 84,
  gap: 12,
  rowUnit: 8,
  minCols: 2,
  minRows: 7, // 7 * 8 = 56px
  defaultCols: 12,
  defaultRows: 13, // 13 * 8 = 104px
  gapAfterPlace: 2, // row units of breathing room when auto-stacking/pushing
});

// Distance in px between the start of one column and the start of the
// next — the unit position (x) is measured in, as opposed to a span's
// width in px (which is one gap narrower than colPitch * span).
export const colPitch = GRID.colWidth + GRID.gap;

export const canvasWidth = () =>
  GRID.cols * GRID.colWidth + (GRID.cols - 1) * GRID.gap;

// Width (in px) of a card spanning `cols` grid columns.
export const colsToPx = (cols) =>
  Math.max(cols, 0) * GRID.colWidth + Math.max(cols - 1, 0) * GRID.gap;

// Inverse of colsToPx — how many columns a given pixel width spans.
export const pxToCols = (px) => Math.round((px + GRID.gap) / colPitch);

export const rowsToPx = (rows) => Math.max(rows, 0) * GRID.rowUnit;

export const pxToRows = (px) => Math.round(px / GRID.rowUnit);

// Left offset (in px) of column index `xCol`.
export const xToPx = (xCol) => xCol * colPitch;

// Inverse of xToPx — which column index a given left offset lands on.
export const pxToX = (px) => Math.round(px / colPitch);

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const LEGACY_WIDTH_SPANS = { "1/1": 12, "1/2": 6, "1/3": 4, "1/4": 3, "2/3": 8 };

export const stripLayout = (cssClass = "") =>
  String(cssClass)
    .replace(LAYOUT_TOKEN, " ")
    .replace(LEGACY_ROW_TOKEN, " ")
    .replace(LEGACY_WIDTH_TOKEN, " ")
    .replace(/\s+/g, " ")
    .trim();

const readLayout = (cssClass = "") => {
  const layout = {};
  String(cssClass).replace(LAYOUT_TOKEN, (_, key, value) => {
    layout[key] = Number(value);
    return "";
  });
  const { x, y, w, h } = layout;
  if ([x, y, w, h].every(Number.isFinite)) return { x, y, w, h };
  return null;
};

const legacyWidthCols = (cssClass = "") => {
  let span = GRID.cols;
  String(cssClass).replace(LEGACY_WIDTH_TOKEN, (_, value) => {
    if (LEGACY_WIDTH_SPANS[value]) span = LEGACY_WIDTH_SPANS[value];
    return "";
  });
  return clamp(span, GRID.minCols, GRID.cols);
};

const legacyRowId = (cssClass = "", fallback) => {
  let id = fallback;
  String(cssClass).replace(LEGACY_ROW_TOKEN, (_, value) => {
    if (value) id = value;
    return "";
  });
  return id;
};

export const writeLayout = (cssClass, { x, y, w, h }) =>
  [
    stripLayout(cssClass),
    `form-studio-x:${Math.round(x)}`,
    `form-studio-y:${Math.round(y)}`,
    `form-studio-w:${Math.round(w)}`,
    `form-studio-h:${Math.round(h)}`,
  ]
    .filter(Boolean)
    .join(" ");

/**
 * Normalizes raw fields from the API into canvas-ready fields.
 * Fields that already carry x/y/w/h keep their saved position exactly.
 *
 * Fields that only have the old row/width tokens (or nothing at all)
 * are replayed onto the canvas: fields that shared an old rowId are
 * placed left-to-right on the same y (wrapping to a new line if they'd
 * overflow 12 columns), and each old row stacks under the last — so a
 * form that hasn't been touched since the redesign opens looking like
 * its previous layout instead of collapsing into one flat column, and
 * is then free to be dragged anywhere.
 */
export const normalizeFields = (fields) => {
  const list = (Array.isArray(fields) ? fields : [])
    .filter((field) => field && field.id != null)
    .map((field, index) => ({
      ...field,
      order: Number.isFinite(Number(field.order)) ? Number(field.order) : index,
    }))
    .sort((a, b) => a.order - b.order);

  let cursorY = 0;
  let rowKey = null;
  let rowX = 0;
  let rowH = GRID.defaultRows;

  return list.map((field, index) => {
    const saved = readLayout(field.css_class);
    if (saved) {
      cursorY = Math.max(cursorY, saved.y + saved.h + GRID.gapAfterPlace);
      rowKey = null; // next legacy field (if any) starts a fresh row
      return { ...field, ...saved };
    }

    const w = legacyWidthCols(field.css_class);
    const key = legacyRowId(field.css_class, `solo-${index}`);
    const startsNewRow = key !== rowKey || rowX + w > GRID.cols;

    if (startsNewRow) {
      if (rowKey !== null) cursorY += rowH + GRID.gapAfterPlace;
      rowKey = key;
      rowX = 0;
      rowH = GRID.defaultRows;
    }

    const placed = { ...field, x: rowX, y: cursorY, w, h: GRID.defaultRows };
    rowX += w;
    rowH = Math.max(rowH, GRID.defaultRows);
    return placed;
  });
};

const overlaps = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/**
 * After a card is dropped or resized, gently pushes any card it now
 * overlaps straight down (cascading if that push creates a new
 * overlap). Nothing is ever forced into a fixed row — cards that don't
 * overlap keep their exact free position.
 */
export const settleCollisions = (fields, movedId) => {
  let list = fields.map((field) => ({ ...field }));
  const moved = list.find((field) => String(field.id) === String(movedId));
  if (!moved) return list;

  let changed = true;
  let guard = 0;
  while (changed && guard < list.length * 2) {
    changed = false;
    guard += 1;
    list = list.map((field) => {
      if (field.id === moved.id) return field;
      if (overlaps(moved, field) && field.y >= moved.y) {
        changed = true;
        return { ...field, y: moved.y + moved.h + GRID.gapAfterPlace };
      }
      return field;
    });
  }
  return list;
};

export const canvasHeight = (fields, minRows = 40) =>
  rowsToPx(
    Math.max(minRows, ...fields.map((field) => field.y + field.h), 0) +
      GRID.gapAfterPlace,
  );
