import {
  getPersonalityWarehouseProposal,
  normalizePersonalityWarehouseCode,
  personalityWarehouseCodeExists,
} from "./personalityWarehouseCodes";

export const getServerFullWarehouseCode = (record) => {
  const code = record?.full_ware_house_code;
  return code === undefined || code === null || String(code).trim() === ""
    ? null
    : String(code);
};

const unwrap = (payload) => payload?.data ?? payload?.result ?? payload;

export const readPersonalityStandardCodes = (payload, personalityId) => {
  const data = unwrap(payload);
  const records = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : data
        ? [data]
        : [];
  const parent =
    records.find((record) => String(record?.id) === String(personalityId)) ||
    (records.length === 1 && records[0]?.id == null ? records[0] : null);
  if (!parent)
    throw new Error("پاسخ استانداردها متعلق به هویت انتخاب‌شده نیست.");
  const rawCodes = parent.personality_codes;
  const codes = Array.isArray(rawCodes) ? rawCodes : rawCodes?.results;
  if (!Array.isArray(codes))
    throw new Error("فهرست کدهای استاندارد هویت کامل دریافت نشد.");
  return {
    parent,
    codes,
    next: Array.isArray(rawCodes) ? null : rawCodes.next,
    count: Array.isArray(rawCodes) ? null : rawCodes.count,
  };
};

export const getStandardWarehouseProposal = (codes = []) => {
  // فقط کد انبار خودِ استانداردها، نه کد کامل یا کد طبقه‌بندی هویت.
  const proposal = getPersonalityWarehouseProposal(
    codes.map((code) => ({ warehouse_code: code.warehouse_code })),
  );
  const last = codes.find(
    (code) =>
      normalizePersonalityWarehouseCode(code.warehouse_code) ===
      proposal.lastCode,
  );
  return { ...proposal, lastFullCode: getServerFullWarehouseCode(last) };
};

export const standardWarehouseCodeExists = (codes, value) =>
  personalityWarehouseCodeExists(
    codes.map((code) => ({ warehouse_code: code.warehouse_code })),
    value,
  );

export const fetchPersonalityStandardWarehouseCodes = async (
  client,
  id,
  signal,
) => {
  if (!/^\d+$/.test(String(id)) || BigInt(String(id)) <= 0n)
    throw new Error("شناسهٔ هویت برای دریافت استانداردها معتبر نیست.");
  const base = `/core/get-personality-by-id/${id}`;
  const visited = new Set();
  const codes = [];
  let endpoint = base;
  let parent = null;
  let expectedCount = null;
  while (endpoint) {
    if (visited.has(endpoint))
      throw new Error("صفحه‌بندی استانداردهای هویت تکراری است.");
    visited.add(endpoint);
    const response = await client.get(endpoint, { signal });
    const page = readPersonalityStandardCodes(response.data, id);
    parent = parent || page.parent;
    codes.push(...page.codes);
    if (Number.isFinite(page.count)) expectedCount = page.count;
    if (!page.next) {
      endpoint = null;
    } else {
      const next = new URL(page.next, `https://pagination.invalid${base}`);
      if (
        ![base, `${base}/`].some((path) => next.pathname.endsWith(path)) ||
        !next.search
      )
        throw new Error("آدرس صفحهٔ بعدی استانداردهای هویت معتبر نیست.");
      endpoint = `${base}${next.search}`;
    }
  }
  if (expectedCount !== null && codes.length < expectedCount)
    throw new Error("فهرست استانداردهای هویت کامل دریافت نشد.");
  return { parent, codes };
};
