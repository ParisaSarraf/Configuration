// Local option-label search; no search API call.
export const normalizeContractorSearch = (value) => String(value ?? "")
  .normalize("NFKC")
  .replace(/[ك]/g, "ک")
  .replace(/[يى]/g, "ی")
  .replace(/[\u064b-\u065f\u0670\u0640]/g, "")
  .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
  .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
  .replace(/[\s\u200c\u200d\u200e\u200f]+/g, "")
  .toLocaleLowerCase();

