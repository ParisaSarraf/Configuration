import axios from "axios";
import { trackRequests } from "./requestActivity.js";

export const BASEURL = import.meta.env.VITE_APP_BASE_URL;

// export const BASEURL = "http://127.0.0.1:8000/api/v1";


const myAxios = axios.create({
    baseURL: BASEURL,
    timeout: 50000,
    adapter: trackRequests((config) => axios.getAdapter(axios.defaults.adapter, config)(config)),
    headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
    },
});

export default myAxios;
