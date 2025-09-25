import axios from "axios";

// export const BASEURL = "http://10.33.107.36:8000/api/v1";
export const BASEURL = "http://172.22.16.215:8888/api/v1";

// http://10.115.97.112:5173/

const myAxios = axios.create({
    baseURL: BASEURL,
    timeout: 50000,
    headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
    },
});

export default myAxios;
