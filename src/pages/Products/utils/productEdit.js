export function unwrapProductResponse(response, expectedId) {
  const value = response?.data ?? response?.result ?? response?.results ?? response;
  const product = Array.isArray(value)
    ? value.find((item) => String(item?.id) === String(expectedId))
    : value;
  return product && typeof product === "object" && !Array.isArray(product) &&
    String(product.id) === String(expectedId) ? product : null;
}

export function relationSelection(product, relation) {
  const raw = relation === "parent" ? (product?.parent ?? product?.parent_id) :
    (product?.parent_code ?? product?.parent_code_id);
  const id = raw && typeof raw === "object" ? (raw.id ?? raw.value) : raw;
  if (id == null || id === "") return null;
  const text = raw && typeof raw === "object"
    ? (raw.persian_title || raw.title || raw.name || raw.label) : null;
  const code = raw && typeof raw === "object" ? (raw.final_code || raw.code) : null;
  const label = text && code && text !== code ? `${text} (${code})` : text || code || `محصول ${id}`;
  return { value: id, label };
}

export function relationshipId(product, relation) {
  return relationSelection(product, relation)?.value ?? null;
}

export function productTreeSelection(tree, id) {
  if (id == null || id === "") return null;

  const pending = Array.isArray(tree) ? [...tree] : [];
  while (pending.length) {
    const node = pending.pop();
    const value = node?.value ?? node?.id ?? node?.key;
    if (value != null && String(value) === String(id)) {
      const label = node?.title ?? node?.label;
      return label ? { value, label } : null;
    }
    if (Array.isArray(node?.children)) pending.push(...node.children);
  }
  return null;
}

export function productTreeParent(tree, id) {
  if (id == null || id === "") return null;

  const visit = (nodes, parent = null) => {
    for (const node of Array.isArray(nodes) ? nodes : []) {
      const nodeId = node?.productData?.id ?? node?.id ?? node?.value ?? node?.key;
      if (nodeId != null && String(nodeId) === String(id)) {
        return { found: true, parent };
      }
      const nested = visit(node?.children, node);
      if (nested.found) return nested;
    }
    return { found: false, parent: null };
  };

  const result = visit(tree);
  return result.found ? result.parent : null;
}

export function includeProductSelectionsInTree(tree, selections = []) {
  const result = Array.isArray(tree) ? [...tree] : [];
  const knownValues = new Set();
  const visit = (nodes = []) => {
    nodes.forEach((node) => {
      const value = node?.value ?? node?.id ?? node?.key;
      if (value != null) knownValues.add(String(value));
      if (Array.isArray(node?.children)) visit(node.children);
    });
  };
  visit(result);

  selections.forEach((selection) => {
    const value = selection?.value;
    if (value == null || knownValues.has(String(value))) return;
    result.push({
      title: selection.label || `محصول ${value}`,
      value,
      key: String(value),
      id: value,
      isLeaf: true,
    });
    knownValues.add(String(value));
  });

  return result;
}

export function flattenLookupItems(payload) {
  const asItems = (value) => {
    if (Array.isArray(value)) return value.filter((item) => item && typeof item === "object");
    if (!value || typeof value !== "object") return [];

    for (const key of ["results", "data", "result", "items"]) {
      if (value[key] !== undefined && value[key] !== value) {
        return asItems(value[key]);
      }
    }

    if (value.id != null) return [value];
    return Object.values(value).filter(
      (item) => item && typeof item === "object",
    );
  };

  return asItems(payload).flatMap((item) => [
    item,
    ...flattenLookupItems(item.children),
  ]);
}

export function buildFinalProductCode(parentCode, code) {
  return [parentCode, code].filter((part) => part != null && String(part) !== "").join("-");
}
