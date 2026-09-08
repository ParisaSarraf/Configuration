import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "accessToken";

export const getTokenData = (token) => {
  const storedToken =
    token ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem(ACCESS_TOKEN_KEY)
      : null);

  if (!storedToken) return null;

  try {
    return jwtDecode(storedToken);
  } catch (error) {
    console.error("Error decoding access token:", error);
    return null;
  }
};

export const getTokenField = (field, fallback = null, token) => {
  const tokenData = getTokenData(token);
  return tokenData?.[field] ?? fallback;
};

/**
 * Returns the known access-token fields with stable default values.
 * Property names intentionally match the API payload.
 */
export const getAuthDataFromToken = (token) => {
  const data = getTokenData(token);
  if (!data) return null;

  return {
    token_type: data.token_type ?? null,
    exp: data.exp ?? null,
    iat: data.iat ?? null,
    jti: data.jti ?? null,
    user_id: data.user_id ?? null,
    name: data.name ?? null,
    id: data.id ?? null,
    username: data.username ?? null,
    last_login: data.last_login ?? null,
    is_staff: data.is_staff ?? false,
    is_superuser: data.is_superuser ?? false,
    last_name: data.last_name ?? null,
    signature_image: data.signature_image ?? null,
    temp_image: data.temp_image ?? null,
    accessible_pages: Array.isArray(data.accessible_pages)
      ? data.accessible_pages
      : [],
    view_unaccepted_version: data.view_unaccepted_version ?? false,
  };
};

export const hasPageAccess = (page, token) =>
  getAuthDataFromToken(token)?.accessible_pages.includes(page) ?? false;

export const canViewUnacceptedVersion = (token) =>
  getAuthDataFromToken(token)?.view_unaccepted_version === true;

export const isTokenExpired = (token) => {
  const expiration = getTokenField("exp", null, token);
  return expiration == null || expiration * 1000 <= Date.now();
};

export const getUserFromToken = (token) => {
  const tokenData = getAuthDataFromToken(token);
  if (!tokenData) return null;

  return {
    ...tokenData,
    displayName:
      [tokenData.name, tokenData.last_name].filter(Boolean).join(" ") ||
      tokenData.username ||
      tokenData.fullName ||
      tokenData.sub ||
      "کاربر",
  };
};

export default getTokenData;
