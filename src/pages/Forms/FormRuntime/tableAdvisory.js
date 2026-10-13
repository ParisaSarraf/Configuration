// Advisory rules only. Never feed these messages into blocking form validation.
const ROW_TOKEN = /(?:^|\s)form-matrix-required-rows:([0-9,]+)(?=\s|$)/g;
export const normalizeRequiredRows = (rows = []) =>
  [...new Set(rows.map((item) => Number(item?.row ?? item))
    .filter((row) => Number.isSafeInteger(row) && row > 0))].sort((a, b) => a - b);
export const readMatrixRequiredRows = (cssClass = "") => {
  const rows = [];
  String(cssClass).replace(ROW_TOKEN, (match, numbers) => {
    rows.push(...numbers.split(","));
    return match;
  });
  ROW_TOKEN.lastIndex = 0;
  return normalizeRequiredRows(rows);
};
export const writeMatrixRequiredRows = (cssClass = "", rows = []) => {
  ROW_TOKEN.lastIndex = 0;
  const clean = String(cssClass).replace(ROW_TOKEN, " ").replace(/\s+/g, " ").trim();
  const normalized = normalizeRequiredRows(rows);
  return [clean, normalized.length ? `form-matrix-required-rows:${normalized.join(",")}` : ""]
    .filter(Boolean).join(" ");
};
export const isTableAnswerEmpty = (value, type) => {
  if (type === "checkbox") return ![true, "true", 1, "1", "__YES__"].includes(value);
  if (value == null) return true;
  if (typeof value === "string") return !value.trim();
  if (Array.isArray(value)) return !value.length;
  return false; // Numeric zero is an answer, not an empty cell.
};
export const matrixAdvisories = (field, rows, columns) => {
  const warnings = [];
  const requiredRows = readMatrixRequiredRows(field?.css_class);
  const minRows = Math.max(0, Number(field?.min_value) || 0);
  const maxRows = Math.max(0, Number(field?.max_value) || 0);
  if (minRows && rows.length < minRows) warnings.push(`تعداد ردیف‌ها کمتر از حداقل پیشنهادی ${minRows} است.`);
  if (maxRows && rows.length > maxRows) warnings.push(`تعداد ردیف‌ها بیشتر از حداکثر پیشنهادی ${maxRows} است.`);
  if (minRows && maxRows && minRows > maxRows) warnings.push("حداقل و حداکثر پیشنهادی ردیف‌ها با هم سازگار نیستند.");
  requiredRows.forEach((row) => {
    if (row > rows.length) warnings.push(`سطر ${row} به‌عنوان اجباری تعریف شده ولی هنوز اضافه نشده است.`);
  });
  const requiredColumns = columns.filter((column) => column.required);
  if (!rows.length && requiredColumns.length) warnings.push("برای ستون‌های اجباری هنوز ردیفی وارد نشده است.");
  rows.forEach((row, index) => {
    const missing = columns.filter((column) => (column.required || requiredRows.includes(index + 1))
      && isTableAnswerEmpty(row?.[column.value], column.type));
    if (missing.length) warnings.push(`سطر ${index + 1}: پاسخ ${missing.map((column) => `«${column.label}»`).join("، ")} تکمیل نشده است.`);
  });
  return warnings;
};
