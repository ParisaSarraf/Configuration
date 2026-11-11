// Accept the current product + requirement_tree response, and legacy flat products.
export function mapAcceptorProducts(data) {
  if (!Array.isArray(data)) return null;
  const products = [];
  for (const [index, item] of data.entries()) {
    const nested = item && Object.prototype.hasOwnProperty.call(item, "product");
    const product = nested ? item.product : item;
    if (!product || typeof product !== "object" || Array.isArray(product) || product.id == null) return null;
    if (nested && !Array.isArray(item.requirement_tree)) return null;
    products.push({
      key: `product-${product.id}-${index}`,
      id: product.id,
      title: product.persian_title || product.title || product.name || "محصول بدون عنوان",
      code: product.code,
      product,
      requirementTree: nested ? item.requirement_tree : [],
    });
  }
  return products;
}
