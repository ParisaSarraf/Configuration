import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainContext } from "../Services/Context/AuthContext";
import myAxios from "../Services/axiosInstance";
import { logoutFn, refreshAccessToken } from "../Services/authService";

let refreshPromise = null;

export const useMyAxios = () => {
  const { authToken, setAuthToken } = useContext(MainContext);
  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/sign-in");
      return undefined;
    }

    myAxios.defaults.headers.Authorization = `Bearer ${accessToken}`;

    const requestInterceptor = myAxios.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    const responseInterceptor = myAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            if (!refreshPromise) {
              refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
              });
            }
            const newAccessToken = await refreshPromise;
            setAuthToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return myAxios(originalRequest);
          } catch (refreshError) {
            console.error("Unable to refresh token:", refreshError);
            await logoutFn();
            setAuthToken(null);
            navigate("/sign-in", { replace: true });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      myAxios.interceptors.request.eject(requestInterceptor);
      myAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [authToken, navigate, setAuthToken]);

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
