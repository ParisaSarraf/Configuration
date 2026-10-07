const TRUE_VALUES = new Set(["true", "1", "on", "yes", "بله", "دارد", "✓"]);

export const checkboxValue = (value) =>
  value === true ||
  value === 1 ||
  (typeof value === "string" && TRUE_VALUES.has(value.trim().toLowerCase()));

export const textInputValue = (value) =>
  typeof value === "string" || typeof value === "number" ? value : "";

export const objectInputValue = (value) => {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
};

/** کلیدهای معتبر قبلی حفظ می‌شوند؛ کلید خالی یا تکراری مستقل می‌شود. */
export const uniqueSheetCellNames = (cells = [], { legacyFallback = false } = {}) => {
  const keyOf = (cell, index) => String(
    cell.name || cell.key ||
    (legacyFallback ? `${cell.r ?? 0}-${cell.c ?? 0}-${index}` : ""),
  );
  const reserved = new Set(
    cells
      .map((cell, index) => cell?.type ? keyOf(cell, index) : "")
      .filter(Boolean),
  );
  const used = new Set();
  return cells.map((cell, index) => {
    if (!cell?.type) return cell;
    const existing = keyOf(cell, index);
    let name = existing;
    if (!name || used.has(name)) {
      const base = existing
        ? `${existing}__r${Number(cell.r) || 0}_c${Number(cell.c) || 0}`
        : `cell_${Number(cell.r) || 0}_${Number(cell.c) || 0}`;
      name = base;
      let suffix = 2;
      while (reserved.has(name) || used.has(name)) name = `${base}_${suffix++}`;
    }
    used.add(name);
    return name === cell.name ? cell : { ...cell, name };
  });
};

let fieldSequence = 0;
export const newInputFieldName = (fields = []) => {
  const token = globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${++fieldSequence}`;
  const base = `field-${token}`;
  const used = new Set(fields.map((field) => field.field_name));
  let name = base;
  while (used.has(name)) name = `${base}-${++fieldSequence}`;
  return name;
};