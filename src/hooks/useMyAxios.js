import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainContext } from "../Services/Context/AuthContext";
import myAxios from "../Services/axiosInstance";

export const useMyAxios = () => {
  const { authToken, setAuthToken } = useContext(MainContext);
  const navigate = useNavigate();
  let isGettingNewToken = false;

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/sign-in");
    } else {
      myAxios.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }, [authToken, navigate]);

  myAxios.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  });

  myAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          if (!isGettingNewToken) {
            isGettingNewToken = true;
            const newAccessToken = await refreshAccessToken();
            setAuthToken(newAccessToken);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return myAxios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Unable to refresh token:", refreshError);
          await logoutFn();
          navigate("/sign-in");
          window.location.reload();
        }
      }
      return Promise.reject(error);
    }
  );

  const handleLogout = async () => {
    try {
      await logoutFn();
      setAuthToken(null);
      navigate("/sign-in");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return { myAxios, handleLogout };
};
