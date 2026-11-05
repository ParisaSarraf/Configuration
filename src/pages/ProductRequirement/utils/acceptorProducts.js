// The acceptor endpoint returns a flat array of product objects for one edition.
export function mapAcceptorProducts(data) {
  if (!Array.isArray(data)) return null;
  return data.map((product, index) => ({
    key: `product-${product?.id ?? "unknown"}-${index}`,
    id: product?.id,
    title: product?.persian_title || product?.title || product?.name || "محصول بدون عنوان",
    code: product?.code,
  }));
}
