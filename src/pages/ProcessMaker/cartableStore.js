const STORAGE_PREFIX = "process-cartable:sent:";
const MAX_ITEMS = 100;
// رسیدهای تازه علاوه بر متادیتا، خودِ form_data را هم نگه می‌دارند؛ اگر
// سهمیهٔ localStorage پر شود فقط این تعداد رسید آخر داده‌شان را حفظ می‌کنند.
const MAX_ITEMS_WITH_DATA = 20;

const storageKey = (userKey) => `${STORAGE_PREFIX}${userKey || "anonymous"}`;

export const loadSentItems = (userKey) => {
  try {
    const raw = window.localStorage.getItem(storageKey(userKey));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * ذخیره در localStorage با چند تلاش سبک‌تر.
 * خروجی همان فهرستی است که واقعاً ذخیره شد، پس صدازننده می‌تواند
 * مستقیم آن را در state بگذارد.
 */
const persist = (userKey, items) => {
  const key = storageKey(userKey);
  const candidates = [
    items,
    // مرحلهٔ دوم: مقادیر فرمِ رسیدهای قدیمی حذف می‌شود
    items.map((item, index) =>
      index < MAX_ITEMS_WITH_DATA ? item : { ...item, formData: null },
    ),
    // مرحلهٔ سوم: فقط رسیدهای اخیر می‌مانند
    items.slice(0, MAX_ITEMS_WITH_DATA),
  ];

  for (const candidate of candidates) {
    try {
      window.localStorage.setItem(key, JSON.stringify(candidate));
      return candidate;
    } catch {
      /* سهمیه پر است یا localStorage در دسترس نیست؛ سبک‌تر تلاش می‌کنیم */
    }
  }

  // حتی اگر ذخیره نشد، فهرست درست را برمی‌گردانیم تا UI از کار نیفتد
  return items;
};

/** رسید تازه را اضافه می‌کند و همیشه یک آرایه برمی‌گرداند. */
export const appendSentItem = (userKey, item) => {
  const items = [
    { ...item, sentAt: item?.sentAt || new Date().toISOString() },
    ...loadSentItems(userKey),
  ].slice(0, MAX_ITEMS);

  return persist(userKey, items);
};

export const clearSentItems = (userKey) => {
  try {
    window.localStorage.removeItem(storageKey(userKey));
  } catch {
    /* localStorage در دسترس نیست */
  }
  return [];
};
