
import myAxios from "./axiosInstance";

export const SignInFn = async (usersData) => {
  const response = await myAxios.post("/user/login-user/", usersData);
  const { access, refresh } = response.data;
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  return response.data;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token found");

  const response = await myAxios.post("/user/refresh/", {
    refresh: refreshToken,
  });
  const { access } = response.data;
  localStorage.setItem("accessToken", access);
  return access;
};

export const logoutFn = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  if (refreshToken) {
    await myAxios.post("/user/blacklist/", { refresh: refreshToken });
  }
};
