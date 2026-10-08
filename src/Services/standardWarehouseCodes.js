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

const readStandardCodes = (payload, parentId, codesKey, label) => {
  const data = unwrap(payload);
  const records = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : data
        ? [data]
        : [];
  const parent =
    records.find((record) => String(record?.id) === String(parentId)) ||
    (records.length === 1 && records[0]?.id == null ? records[0] : null);
  if (!parent)
    throw new Error(`پاسخ استانداردها متعلق به ${label} انتخاب‌شده نیست.`);
  const rawCodes = parent[codesKey];
  const codes = Array.isArray(rawCodes) ? rawCodes : rawCodes?.results;
  if (!Array.isArray(codes))
    throw new Error(`فهرست کدهای استاندارد ${label} کامل دریافت نشد.`);
  return {
    parent,
    codes,
    next: Array.isArray(rawCodes) ? null : rawCodes.next,
    count: Array.isArray(rawCodes) ? null : rawCodes.count,
  };
};

export const readPersonalityStandardCodes = (payload, id) =>
  readStandardCodes(payload, id, "personality_codes", "هویت");

export const readGenusStandardCodes = (payload, id) =>
  readStandardCodes(payload, id, "genus_codes", "ماده اولیه");

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

const fetchStandardWarehouseCodes = async (
  client,
  id,
  signal,
  base,
  readCodes,
  label,
) => {
  if (!/^\d+$/.test(String(id)) || BigInt(String(id)) <= 0n)
    throw new Error(`شناسهٔ ${label} برای دریافت استانداردها معتبر نیست.`);
  const visited = new Set();
  const codes = [];
  let endpoint = base;
  let parent = null;
  let expectedCount = null;
  while (endpoint) {
    if (visited.has(endpoint))
      throw new Error(`صفحه‌بندی استانداردهای ${label} تکراری است.`);
    visited.add(endpoint);
    const response = await client.get(endpoint, { signal });
    const page = readCodes(response.data, id);
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
        throw new Error(`آدرس صفحهٔ بعدی استانداردهای ${label} معتبر نیست.`);
      endpoint = `${base}${next.search}`;
    }
  }
  if (expectedCount !== null && codes.length < expectedCount)
    throw new Error(`فهرست استانداردهای ${label} کامل دریافت نشد.`);
  return { parent, codes };
};

export const fetchPersonalityStandardWarehouseCodes = (client, id, signal) =>
  fetchStandardWarehouseCodes(
    client,
    id,
    signal,
    `/core/get-personality-by-id/${id}`,
    readPersonalityStandardCodes,
    "هویت",
  );

export const fetchGenusStandardWarehouseCodes = (client, id, signal) =>
  fetchStandardWarehouseCodes(
    client,
    id,
    signal,
    `/product/get-genus-by-id/${id}`,
    readGenusStandardCodes,
    "ماده اولیه",
  );
