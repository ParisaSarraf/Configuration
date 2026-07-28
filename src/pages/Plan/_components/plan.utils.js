/** سال جاری تقویم جلالی را با اعداد لاتین (نه فارسی) برمی‌گرداند، مثلاً "1405" */
export const getCurrentJalaliYear = () => {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
    }).formatToParts(new Date());
    const yearPart = parts.find((p) => p.type === "year");
    return yearPart ? yearPart.value : "";
  } catch {
    return "";
  }
};
