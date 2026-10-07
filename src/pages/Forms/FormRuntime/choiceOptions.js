let choiceSequence = 0;

/** شناسه از متن گزینه مستقل است و فقط هنگام ایجاد گزینه ساخته می‌شود. */
export const createChoiceValue = (usedValues = new Set()) => {
  const crypto = globalThis.crypto;
  let token;
  if (typeof crypto?.randomUUID === "function") {
    token = crypto.randomUUID();
  } else if (typeof crypto?.getRandomValues === "function") {
    token = Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) =>
      part.toString(16).padStart(8, "0"),
    ).join("");
  } else {
    token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }

  const base = `option_${token}`;
  let value = base;
  while (usedValues.has(value)) value = `${base}_${++choiceSequence}`;
  return value;
};

const isTechnicalChoiceValue = (value) =>
  /^option[-_][a-z0-9_-]+$/i.test(value);

/** عنوان فنی حتی در داده‌های قدیمی یا ناقص به کاربر نمایش داده نمی‌شود. */
export const choiceDisplayLabel = (choice, index) => {
  const label = String(
    typeof choice === "string" ? choice : (choice?.label ?? ""),
  ).trim();
  if (label && !isTechnicalChoiceValue(label)) return label;
  const legacyValue = String(choice?.value ?? choice?.key ?? "").trim();
  if (legacyValue && !isTechnicalChoiceValue(legacyValue)) return legacyValue;
  return `گزینه ${index + 1}`;
};

/** مقدارهای موجود حفظ می‌شوند؛ فقط گزینه‌های بدون شناسه شناسه می‌گیرند. */
export const buildChoiceList = (items = []) => {
  const options = items.filter(
    (item) => item && String(item.label ?? "").trim(),
  );
  const usedValues = new Set(
    options
      .map((item) => String(item.value ?? item.key ?? "").trim())
      .filter(Boolean),
  );
  return options.map((item) => {
    const existing = String(item.value ?? item.key ?? "").trim();
    const value = existing || createChoiceValue(usedValues);
    usedValues.add(value);
    return { value, label: String(item.label).trim() };
  });
};