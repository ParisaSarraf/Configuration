import { useEffect, useContext } from "react";
import { MainContext } from "../Servises/AuthContext";
import axios from "axios";

export const BASEURL = "http://87.248.150.51:8000/api/v1";

// Create a custom Axios instance
const myAxios = axios.create({
  baseURL: BASEURL,
  timeout: 50000,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json", 
  },
});

export const useMyAxios = () => {
  const { authToken } = useContext(MainContext);

  useEffect(() => {
    if (authToken) {
      myAxios.defaults.headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete myAxios.defaults.headers["Authorization"]; 
    }
  }, [authToken]);

  return myAxios;
};

export const SignInFn = async (usersData) => {
  try {
    const response = await myAxios.post("/user/login-user/", usersData);
    const { access, refresh } = response.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    return response.data;
  } catch (error) {
    console.error("Error in SignIn:", error);
    throw error;
  }
};