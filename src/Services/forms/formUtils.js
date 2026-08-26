export const getApiErrorMessage = (
  error,
  fallback = "خطایی در ارتباط با سرور رخ داد.",
) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (data && typeof data === "object") {
    const firstError = Object.entries(data).find(([, value]) => value != null);
    if (firstError) {
      const [field, value] = firstError;
      return `${field}: ${Array.isArray(value) ? value.join("، ") : String(value)}`;
    }
  }
  return error?.message || fallback;
};

export const extractEntityId = (response) => {
  const candidates = [response?.id, response?.pk, response?.data?.id, response?.data?.pk, response?.result?.id, response?.result?.pk, response?.[0]?.id, response?.[0]?.pk, response?.data?.result?.id, response?.data?.result?.pk];
  const value = candidates.find(
    (candidate) => candidate !== undefined && candidate !== null,
  );
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};
