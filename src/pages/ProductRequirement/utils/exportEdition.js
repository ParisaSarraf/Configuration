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

export function buildExportEditionFormData(editionId, values) {
  if (editionId == null || editionId === "") throw new Error("نسخه الزام انتخاب نشده است");
  if (values.to_product_id == null || values.to_product_id === "") throw new Error("محصول مقصد انتخاب نشده است");
  const form = new FormData();
  form.append("product_requirement_edition_id", String(editionId));
  form.append("to_product_id", String(values.to_product_id));
  form.append("state", "10");
  if (values.pass_comment != null && values.pass_comment !== "") form.append("pass_comment", values.pass_comment);
  const file = values.file_1?.[0]?.originFileObj;
  if (file) form.append("file_1", file);
  return form;
}
