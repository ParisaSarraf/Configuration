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
  }
};

export const clearSentItems = (userKey) => {
  try {
    window.localStorage.removeItem(storageKey(userKey));
  } catch {
  }
  return [];
};
