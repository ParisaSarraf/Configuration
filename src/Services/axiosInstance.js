import axios from "axios";

export const BASEURL = import.meta.env.VITE_APP_BASE_URL;

// export const BASEURL = "http://10.250.87.36:8000/api/v1";


const myAxios = axios.create({
    baseURL: BASEURL,
    timeout: 50000,
    headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
    },
});

export default myAxios;
