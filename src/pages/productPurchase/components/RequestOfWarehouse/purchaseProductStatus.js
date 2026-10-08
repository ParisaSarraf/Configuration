// وضعیت خرید از status همان ردیف پاسخ API خوانده می‌شود، نه محصول انتخاب‌شده.
// نبود وضعیت یا هر مقدار دیگری مانند temp / inactive به معنی بسته‌بودن است.
export const isActivePurchaseProduct = (product) =>
  typeof product?.status === "string" &&
  product.status.trim().toLowerCase() === "active";