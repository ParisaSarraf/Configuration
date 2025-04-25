import { useContext, useEffect } from "react";
import { MainContext } from "../Services/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const BASEURL = "http://87.248.150.51:8000/api/v1";

const myAxios = axios.create({
  baseURL: BASEURL,
  timeout: 50000,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

export const useMyAxios = () => {
  const { authToken, setAuthToken } = useContext(MainContext);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/sign-in");
    } else {
      myAxios.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }, [authToken, navigate]);

  myAxios.interceptors.request.use(async (config) => {
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
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await refreshAccessToken();
          setAuthToken(newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return myAxios(originalRequest);
        } catch (refreshError) {
          console.error("Unable to refresh token:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/sign-in");
        }
      }
      return Promise.reject(error);
    }
  );

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    try {
      await myAxios.post("/user/blacklist/", {
        refresh: refreshToken,
      });
      setAuthToken(null);
      navigate("/sign-in");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return { myAxios, handleLogout };
};

export const SignInFn = async (usersData) => {
  try {
    const response = await myAxios.post("/user/login-user/", usersData);
    const { access, refresh } = response.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    // todo
    // const decode = jwtDecode(access);
    // console.log(decode);
    return response.data;
  } catch (error) {
    console.error("Error in SignIn:", error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await myAxios.post("/user/refresh/", {
      refresh: refreshToken,
    });

    const { access } = response.data;
    localStorage.setItem("accessToken", access);
    return access;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};
