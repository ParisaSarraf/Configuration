// Keep server descriptors intact: names alone lose download URLs and field IDs.
export const attachmentItems = (raw) => {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) return raw.filter((item) => item != null && item !== "");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return attachmentItems(parsed);
    } catch { /* Legacy comma-separated names are not JSON. */ }
    return raw.split("،").map((item) => item.trim()).filter(Boolean);
  }
  return [raw];
};

export const attachmentName = (item) => {
  if (typeof item === "string") return item;
  const name = item?.original_filename || item?.name || item?.file_name || item?.originFileObj?.name;
  if (name) return name;
  const path = item?.url || item?.file_url || item?.file;
  if (typeof path !== "string") return "فایل";
  const tail = path.split(/[?#]/)[0].split("/").pop();
  try { return decodeURIComponent(tail) || "فایل"; } catch { return tail || "فایل"; }
};

export const attachmentUrl = (item, baseUrl = "") => {
  // Plain strings can be legacy names: do not turn them into broken links.
  const raw = typeof item === "string"
    ? (/^(https?:\/\/|\/)/i.test(item) ? item : "")
    : item?.url || item?.file_url || item?.file;
  if (typeof raw !== "string" || !raw.trim()) return "";
  const path = raw.trim();
  if (/^https?:\/\//i.test(path)) return path;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith("//")) return "";
  try {
    const api = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : undefined);
    return new URL(path.startsWith("/") ? path : `/${path}`, api.origin).href;
  } catch { return path.startsWith("/") ? path : `/${path}`; }
};

export const mergeSubmissionAttachments = (fields, formData, attachments = []) => {
  let source = formData;
  if (typeof source === "string") {
    try { source = JSON.parse(source); } catch { source = {}; }
  }
  const values = source && typeof source === "object" && !Array.isArray(source) ? { ...source } : {};
  const grouped = new Map();
  attachmentItems(attachments).forEach((item) => {
    const id = item?.field?.id ?? item?.field ?? item?.field_id;
    if (id == null) return;
    const key = String(id);
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
  });
  (fields || []).forEach((field) => {
    const files = grouped.get(String(field?.id));
    const key = field?.field_name || String(field?.id ?? "");
    if (key && files?.length) values[key] = files.map((file) => ({ ...file, name: attachmentName(file) }));
  });
  return values;
};
