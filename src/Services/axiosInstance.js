import axios from "axios";

// export const BASEURL = "http://87.248.150.51:8000/api/v1";
export const BASEURL = "http://127.0.0.1:8000//api/v1";

const myAxios = axios.create({
  baseURL: BASEURL,
  timeout: 50000,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

export default myAxios;
