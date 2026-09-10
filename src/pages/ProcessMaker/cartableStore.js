// =====================================================================
// کارتابل فرآیندساز — نگهداری «ارسال‌شده‌های من»
//
// بک‌اند فعلاً endpointی برای گرفتن فهرست submissionها ندارد
// (فقط POST /forms/add-form-submission/ موجود است)، بنابراین رسید هر
// ارسال موفق در مرورگر همان کاربر نگه داشته می‌شود تا کارتابل، تب
// «ارسال‌شده‌ها» را هم داشته باشد.
//
// به‌محض اضافه‌شدن API فهرست submission، فقط کافی است در
// ProcessMaker.jsx به‌جای loadSentItems از همان query استفاده شود.
// =====================================================================

const STORAGE_PREFIX = "process-cartable:sent:";
const MAX_ITEMS = 100;

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

export const appendSentItem = (userKey, item) => {
  const items = [
    { ...item, sentAt: item.sentAt || new Date().toISOString() },
    ...loadSentItems(userKey),
  ];
  const trimmed = items.slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(storageKey(userKey), JSON.stringify(trimmed));
  } catch {
    // پر بودن حافظه‌ی مرورگر نباید جلوی ارسال فرم را بگیرد.
  }
  return trimmed;
};

export const clearSentItems = (userKey) => {
  try {
    window.localStorage.removeItem(storageKey(userKey));
  } catch {
    // بی‌اهمیت
  }
  return [];
};
