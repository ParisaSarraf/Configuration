const exportId = (id) => {
  const value = Number(id);
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new Error("شناسهٔ معتبر برای خروجی سریال در دسترس نیست.");
  return value;
};

const getCsv = async (client, endpoint, id) => {
  const response = await client.get(`${endpoint}/${exportId(id)}`, {
    responseType: "blob",
  });
  // پاسخ خطای JSON نباید با پسوند CSV دانلود شود.
  const contentType = String(
    response.headers?.["content-type"] ?? response.data?.type ?? "",
  ).toLowerCase();
  if (contentType.includes("json"))
    throw new Error("سرور به‌جای فایل خروجی، پاسخ خطا برگرداند.");
  return response.data;
};

// مطابق الگوی سایر APIهای by-id پروژه، شناسه در انتهای مسیر GET قرار می‌گیرد.
export const getProductSerialsCsv = (client, productId) =>
  getCsv(client, "/product/get-product-serials-csv-by-id", productId);

export const getSerialDescendantsCsv = (client, serialId) =>
  getCsv(client, "/product/get-product-serial-Descendants-csv-by-id", serialId);