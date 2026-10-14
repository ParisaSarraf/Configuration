import { resolveType } from "./fieldSchema";
import { parseSheet, toOptions } from "./formElements";
import { objectInputValue } from "./inputIdentity";
import { appendSignature, signatureRecord } from "./signatureValue";

export const signatureLocations = (fields) => fields.flatMap((field) => {
  const type = resolveType(field);
  const key = field.field_name || String(field.id);
  const common = { fieldId: String(field.id), key };
  if (type === "signature") return [common];
  if (type === "sheet_table") return parseSheet(field).matrix.flat()
    .filter((cell) => cell.type === "signature")
    .map((cell) => ({ ...common, slot: cell.name || cell.key }));
  if (type === "date_signature") {
    const options = toOptions(field.choices);
    return (options.length ? options : [{ value: "signature", label: "امضا" }])
      .filter((slot) => !String(slot.value).includes("date") && !String(slot.label).includes("تاریخ") &&
        (String(slot.value).includes("sign") || String(slot.label).includes("امضا")))
      .map((slot) => ({ ...common, slot: String(slot.value) }));
  }
  return [];
});
export const finalizeReferralSignatures = ({ fields, values, actor, lockedFieldIds = [], stageFieldIds = [], meta }) => {
  if (!actor) return { values, count: 0 };
  const locked = new Set(lockedFieldIds.map(String));
  const locations = signatureLocations(fields).filter((loc) => !locked.has(loc.fieldId));
  const get = (loc) => loc.slot ? objectInputValue(values[loc.key])[loc.slot] : values[loc.key];
  const selected = locations.filter((loc) => signatureRecord(get(loc))?.pending_user_id === actor.user_id);
  const stage = new Set(stageFieldIds.map(String));
  const scoped = locations.filter((loc) => stage.has(loc.fieldId));
  // Multiple cells in one sheet can belong to different signatories. Never guess.
  const auto = scoped.length === 1 ? scoped : !stage.size && locations.length === 1 ? locations : [];
  const targets = [...new Map([...selected, ...auto].map((loc) => [`${loc.key}:${loc.slot || ""}`, loc])).values()];
  const next = { ...values };
  targets.forEach((loc) => {
    const stamp = appendSignature(get(loc), actor, meta);
    if (loc.slot) next[loc.key] = { ...objectInputValue(next[loc.key]), [loc.slot]: stamp };
    else next[loc.key] = stamp;
  });
  return { values: next, count: targets.length };
};
