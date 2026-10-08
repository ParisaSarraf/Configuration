const idKey = (value) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) && numeric > 0
    ? String(numeric)
    : String(value).trim() || null;
};

const scalarText = (value) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const isNode = (value) =>
  value && typeof value === "object" && (
    value.serial_id != null || value.id != null || value.serial != null ||
    value.full_serial != null || Array.isArray(value.children)
  );

const rootsOf = (payload, depth = 0) => {
  if (payload == null || depth > 8) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];
  for (const key of ["tree", "root", "data", "results"])
    if (payload[key] != null && !isNode(payload))
      return rootsOf(payload[key], depth + 1);
  return isNode(payload) ? [payload] : [];
};

// ساختار مبنا: نود تو در تو با children؛ product_id یا product.id.
// تطبیق product_id به‌تنهایی ادعای یک اتصال جدید ایجاد نمی‌کند.
export const buildSerialTreeData = (payload, productId, clickedSerialId) => {
  const targetProduct = idKey(productId);
  const targetSerial = idKey(clickedSerialId);
  const matchedKeys = [];
  const clickedKeys = [];
  const expandedKeys = new Set();
  let totalNodes = 0;
  const seen = new WeakSet();

  const visit = (node, path, ancestors = []) => {
    if (!isNode(node) || seen.has(node)) return null;
    seen.add(node);
    const nestedSerial =
      node.serial && typeof node.serial === "object" ? node.serial : null;
    const serialId = node.serial_id ?? node.id ?? nestedSerial?.id ?? null;
    const product = node.product ?? nestedSerial?.product;
    const nodeProductId = node.product_id ?? nestedSerial?.product_id ??
      (product && typeof product === "object" ? product.id : product) ?? null;
    const key = `serial-${idKey(serialId) ?? "unknown"}-${path}`;
    const isProductMatch = targetProduct !== null && idKey(nodeProductId) === targetProduct;
    const isClickedSerial = targetSerial !== null && idKey(serialId) === targetSerial;
    totalNodes += 1;
    if (isProductMatch) matchedKeys.push(key);
    if (isClickedSerial) clickedKeys.push(key);
    if (isProductMatch || isClickedSerial)
      ancestors.forEach((ancestor) => expandedKeys.add(ancestor));
    const serialLabel = scalarText(
      node.full_serial ?? nestedSerial?.full_serial ??
      nestedSerial?.serial ?? node.serial ?? node.serial_number,
    ) || `سریال ${serialId ?? "بدون شناسه"}`;
    const productLabel = scalarText(
      product?.persian_title ?? product?.name ?? node.product_name,
    );
    return {
      key, serialId, productId: nodeProductId,
      serialLabel, productLabel, isProductMatch, isClickedSerial,
      children: (Array.isArray(node.children) ? node.children : [])
        .map((child, index) => visit(child, `${path}.${index}`, [...ancestors, key]))
        .filter(Boolean),
    };
  };

  const treeData = rootsOf(payload)
    .map((node, index) => visit(node, String(index)))
    .filter(Boolean);
  treeData.forEach((node) => expandedKeys.add(node.key));
  return { treeData, matchedKeys, clickedKeys, expandedKeys: [...expandedKeys], totalNodes };
};