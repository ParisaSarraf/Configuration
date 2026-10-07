const PERSONALITIES_ENDPOINT = "/core/get-personality/";

export const normalizePersonalityWarehouseCode = (value) =>
  String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .trim();

const identityCodes = (items = []) =>
  items
    .flatMap((item) => [
      normalizePersonalityWarehouseCode(item?.warehouse_code),
      ...identityCodes(Array.isArray(item?.children) ? item.children : []),
    ])
    .filter(Boolean);

export const getPersonalityWarehouseProposal = (items = []) => {
  const codes = identityCodes(items);
  let highest = null;
  let lastCode = null;
  let nonNumericCount = 0;

  codes.forEach((code) => {
    if (!/^\d+$/.test(code)) {
      nonNumericCount += 1;
      return;
    }
    const number = BigInt(code);
    if (
      highest === null ||
      number > highest ||
      (number === highest && code.length > lastCode.length)
    ) {
      highest = number;
      lastCode = code;
    }
  });

  // کدهای دارای پیشوند یا ساختار غیرعددی بدون دانستن قاعده حدس زده نمی‌شوند.
  const nextCode = nonNumericCount
    ? null
    : highest === null
      ? "1"
      : (highest + 1n).toString().padStart(lastCode.length, "0");
  return { lastCode, nextCode, nonNumericCount };
};

export const personalityWarehouseCodeExists = (items, value) => {
  const candidate = normalizePersonalityWarehouseCode(value);
  if (!candidate) return false;
  const numeric = /^\d+$/.test(candidate);
  return identityCodes(items).some((code) =>
    numeric && /^\d+$/.test(code)
      ? BigInt(code) === BigInt(candidate)
      : code === candidate,
  );
};

/** تمام صفحه‌های فهرست هویت‌ها، نه کد محصول یا کدهای استاندارد هویت. */
export const fetchPersonalityWarehouseList = async (client, signal) => {
  const items = [];
  const visited = new Set();
  let endpoint = PERSONALITIES_ENDPOINT;
  let expectedCount = null;

  while (endpoint) {
    if (visited.has(endpoint))
      throw new Error("صفحه‌بندی فهرست هویت‌ها تکراری است.");
    visited.add(endpoint);
    const { data } = await client.get(endpoint, { signal });
    const page = Array.isArray(data) ? data : data?.results;
    if (!Array.isArray(page))
      throw new Error("قالب فهرست هویت‌ها قابل شناسایی نیست.");
    items.push(...page);
    if (Number.isFinite(data?.count)) expectedCount = data.count;
    const next = Array.isArray(data) ? null : data.next;
    if (!next) {
      endpoint = null;
    } else {
      const url = new URL(
        next,
        `https://pagination.invalid${PERSONALITIES_ENDPOINT}`,
      );
      if (!url.pathname.endsWith(PERSONALITIES_ENDPOINT) || !url.search)
        throw new Error("آدرس صفحهٔ بعدی هویت‌ها معتبر نیست.");
      // فقط پارامترهای صفحه‌بندی روی همان سرویس فعلی اجرا می‌شوند.
      endpoint = `${PERSONALITIES_ENDPOINT}${url.search}`;
    }
  }

  if (expectedCount !== null && items.length < expectedCount)
    throw new Error("فهرست هویت‌ها کامل دریافت نشد.");
  return items;
};