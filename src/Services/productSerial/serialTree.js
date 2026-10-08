export const getProductSerialTree = async (client, serialId) => {
  const id = Number(serialId);
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error("شناسهٔ سریال معتبر نیست.");
  // فرض اتصال، مطابق سایر routeهای by-id پروژه: GET و شناسه در انتهای مسیر.
  const response = await client.get(`/product/get-product-serial-tree-by-id/${id}`);
  return response.data;
};