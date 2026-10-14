// Signature snapshots live in existing form_data, not a new API field.
// This is a visual signature record, NOT a cryptographic/server audit proof.
export const SIGNATURE_KIND = "user-signature-v1";
export const parseSignature = (raw) => {
  if (typeof raw !== "string") return raw;
  try { return JSON.parse(raw); } catch { return raw; }
};
export const signatureUrl = (raw, base = "") => {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const text = raw.trim();
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(text)) return text;
  // Never use javascript, SVG data, blob URLs or protocol-relative URLs.
  if (/^\/\//.test(text) || /^[a-z][\w+.-]*:/i.test(text) && !/^https?:/i.test(text)) return "";
  const origin = base.replace(/\/api\/v1\/?$/, "");
  try {
    const url = new URL(text, origin || (typeof window !== "undefined" ? window.location.origin : "http://localhost"));
    return /^https?:$/.test(url.protocol) ? url.href : "";
  } catch { return ""; }
};
export const currentSignatureActor = (user, base) => {
  const id = user?.user_id ?? user?.id;
  const image = signatureUrl(user?.signature_image, base);
  if (id == null || !image) return null;
  return { user_id: String(id), name: user.displayName || user.username || "کاربر", image };
};
export const signatureRecord = (raw) => {
  const value = parseSignature(raw);
  return value?.kind === SIGNATURE_KIND && Array.isArray(value.entries) ? value : null;
};
export const signatureEntries = (raw) => signatureRecord(raw)?.entries || [];
export const legacySignature = (raw) => {
  const value = parseSignature(raw);
  if (signatureRecord(value)) return value.legacy || "";
  if (value && typeof value === "object") return value.value ?? value.text ?? value.name ?? "";
  return value == null ? "" : String(value);
};
export const queueSignature = (raw, actor) => {
  const record = signatureRecord(raw);
  return { kind: SIGNATURE_KIND, entries: record?.entries || [], legacy: legacySignature(raw), pending_user_id: actor.user_id };
};
export const appendSignature = (raw, actor, meta = {}) => {
  if (!actor) return raw;
  const entries = signatureEntries(raw);
  const eventKey = meta.event_key;
  if (eventKey && entries.some((entry) => entry.event_key === eventKey)) return { ...signatureRecord(raw), pending_user_id: undefined };
  return { kind: SIGNATURE_KIND, legacy: legacySignature(raw), entries: [...entries, { ...actor, ...meta, signed_at: meta.signed_at || new Date().toISOString() }] };
};
export const encodeSignature = (raw) => {
  const record = signatureRecord(raw);
  if (!record) return raw == null ? null : String(legacySignature(raw)).trim() || null;
  // A local selection must never become a stored signature before referral succeeds.
  if (!record.entries.length) return record.legacy || null;
  return JSON.stringify({ kind: SIGNATURE_KIND, legacy: record.legacy || "", entries: record.entries });
};
