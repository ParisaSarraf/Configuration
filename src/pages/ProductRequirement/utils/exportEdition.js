const asArray = (value) => Array.isArray(value) ? value : [];

// Called only on the current product's child endpoint (then on those children's
// endpoints), so unrelated root products are never exposed as destinations.
export function mapDestinationProducts(products, currentProductId, ancestors = []) {
  return asArray(products).flatMap((product) => {
    if (product?.id == null) return [];
    const id = String(product.id);
    if (id === String(currentProductId) || ancestors.includes(id)) return [];
    const nextAncestors = [...ancestors, id];
    const children = mapDestinationProducts(product.children, currentProductId, nextAncestors);
    const title = product.persian_title || product.title || product.name || "محصول بدون عنوان";
    const code = product.final_code || product.code;
    return [{
      key: id, value: product.id, id: product.id,
      title: code ? `${title} (${code})` : title,
      isLeaf: product.has_children === false && !children.length,
      ...(children.length ? { children } : {}),
    }];
  });
}

export function replaceDestinationChildren(nodes, id, children) {
  return nodes.map((node) => String(node.id) === String(id)
    ? { ...node, children, isLeaf: children.length === 0 }
    : node.children ? { ...node, children: replaceDestinationChildren(node.children, id, children) } : node);
}

// The API accepts one destination per request and a list of edition IDs.
export function buildExportEditionPayload(editionId, destinationId, comment) {
  if (editionId == null || String(editionId).trim() === "") throw new Error("نسخه الزام انتخاب نشده است");
  const destination = Number(destinationId);
  if (!Number.isSafeInteger(destination) || destination <= 0) throw new Error("محصول مقصد معتبر نیست");
  const payload = {
    product_requirement_edition_ids: [String(editionId)],
    to_product_id: destination,
    state: 10,
  };
  if (typeof comment === "string" && comment.trim()) payload.pass_comment = comment;
  return payload;
}

// Never automatically resend successful or ambiguous operations.
export function retryableDestinationIds(ids, results) {
  return ids.filter((id) => !results[String(id)] || results[String(id)].status === "failed");
}

export function exportFailureStatus(error) {
  const status = Number(error?.response?.status);
  return status >= 400 && status < 500 && status !== 408 ? "failed" : "unknown";
}
