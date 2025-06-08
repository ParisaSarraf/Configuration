import axios from "axios";

export const BASEURL = "http://192.168.128.67:8000/api/v1";

const myAxios = axios.create({
	baseURL: BASEURL,
	timeout: 50000,
	headers: {
		Accept: "*/*",
		"Content-Type": "application/json",
	},
});

export default myAxios;
