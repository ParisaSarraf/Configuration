const LAYOUT_TOKEN = /(?:^|\s)form-studio-(row|width):([^\s]+)/g;

export const WIDTHS = Object.freeze([
  { value: "1/1", label: "۱/۱", span: 24 },
  { value: "1/2", label: "۱/۲", span: 12 },
  { value: "1/3", label: "۱/۳", span: 8 },
  { value: "1/4", label: "۱/۴", span: 6 },
  { value: "2/3", label: "۲/۳", span: 16 },
]);

export const validWidth = (value) => WIDTHS.some((item) => item.value === value);

export const readLayout = (cssClass = "", fallbackRow = 0) => {
  const layout = { rowId: String(fallbackRow), width: "1/1" };
  String(cssClass).replace(LAYOUT_TOKEN, (_, key, value) => {
    if (key === "row" && value) layout.rowId = value;
    if (key === "width" && validWidth(value)) layout.width = value;
    return "";
  });
  return layout;
};

export const stripLayout = (cssClass = "") => String(cssClass)
  .replace(LAYOUT_TOKEN, " ")
  .replace(/\s+/g, " ")
  .trim();

export const writeLayout = (cssClass, rowId, width) => [
  stripLayout(cssClass),
  `form-studio-row:${rowId || 0}`,
  `form-studio-width:${validWidth(width) ? width : "1/1"}`,
].filter(Boolean).join(" ");

export const widthSpan = (width) => WIDTHS.find((item) => item.value === width)?.span || 24;

export const normalizeFields = (fields) => (Array.isArray(fields) ? fields : [])
  .filter((field) => field && field.id != null)
  .map((field, index) => {
    const layout = readLayout(field.css_class, index);
    return {
      ...field,
      order: Number.isFinite(Number(field.order)) ? Number(field.order) : index,
      rowId: layout.rowId,
      width: layout.width,
    };
  })
  .sort((a, b) => a.order - b.order);

export const reorderFields = (fields, fromId, toId, sideBySide = false) => {
  const from = fields.findIndex((field) => String(field.id) === String(fromId));
  const to = fields.findIndex((field) => String(field.id) === String(toId));
  if (from < 0 || to < 0 || from === to) return fields;
  const next = [...fields];
  const [moved] = next.splice(from, 1);
  const target = next.find((field) => String(field.id) === String(toId));
  moved.rowId = sideBySide ? target.rowId : `row-${Date.now()}-${moved.id}`;
  next.splice(next.indexOf(target) + (from < to ? 1 : 0), 0, moved);
  return next.map((field, order) => ({ ...field, order }));
};
