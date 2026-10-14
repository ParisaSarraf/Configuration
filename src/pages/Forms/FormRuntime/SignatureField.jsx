import { createContext, useContext, useState } from "react";
import { getUserFromToken } from "@/utils/ExportFromToken";
import { BASEURL } from "@/Services/axiosInstance";
import { appendSignature, currentSignatureActor, legacySignature, queueSignature, signatureEntries, signatureRecord, signatureUrl } from "./signatureValue";
import "./signature-field.css";

export const SignatureContext = createContext({ defer: false, disabled: false });
export default function SignatureField({ value, onChange, readOnly = false }) {
  const { defer, disabled } = useContext(SignatureContext);
  const actor = currentSignatureActor(getUserFromToken(), BASEURL);
  const record = signatureRecord(value);
  const entries = signatureEntries(value);
  const legacy = legacySignature(value);
  const legacyImage = typeof legacy === "string" && /^(https?:|\/|data:image\/)/i.test(legacy) ? signatureUrl(legacy, BASEURL) : "";
  const pending = Boolean(actor && record?.pending_user_id === actor.user_id);
  return <div className="fr-sign fr-user-signature">
    {legacy && (legacyImage ? <SignatureImage src={legacyImage} name="امضای قبلی" /> : <span className="fr-signature-legacy">{String(legacy)}</span>)}
    {entries.map((entry, index) => <div className="fr-signature-entry" key={`${entry.event_key || entry.signed_at}-${index}`}>
      <SignatureImage src={signatureUrl(entry.image, BASEURL)} name={`امضای ${entry.name || "کاربر"}`} />
      <span>{entry.name}{entry.state_name ? ` — ${entry.state_name}` : ""}</span>
      {entry.signed_at && <time dateTime={entry.signed_at}>{new Date(entry.signed_at).toLocaleString("fa-IR")}</time>}
    </div>)}
    {pending && <span className="fr-signature-note fr-no-print">امضای {actor.name} پس از ارجاع موفق ثبت می‌شود.</span>}
    {!readOnly && !disabled && <div className="fr-signature-controls fr-no-print">
      {actor ? <button type="button" className="fr-chip" disabled={pending} onClick={() => onChange?.(defer ? queueSignature(value, actor) : appendSignature(value, actor))}>
        {pending ? "محل امضا انتخاب شد" : defer ? "انتخاب برای امضای این ارجاع" : "درج امضای من"}
      </button> : <span className="fr-signature-note">تصویر امضا در حساب کاربر فعلی موجود نیست؛ امضا را در پروفایل ثبت کنید.</span>}
      {pending && <button type="button" className="fr-chip" onClick={() => onChange?.({ ...record, pending_user_id: undefined })}>لغو انتخاب امضای این ارجاع</button>}
    </div>}
    {!legacy && !entries.length && !pending && readOnly && <span>امضا ثبت نشده</span>}
  </div>;
}
function SignatureImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img src={src} alt={name} onError={() => setFailed(true)} /> : <span role="status">تصویر امضا در دسترس نیست ({name})</span>;
}
