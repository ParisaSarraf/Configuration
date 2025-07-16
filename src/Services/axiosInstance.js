import axios from "axios";

export const BASEURL = "http://172.22.16.215:8020/api/v1";

const myAxios = axios.create({
	baseURL: BASEURL,
	timeout: 50000,
	headers: {
		Accept: "*/*",
		"Content-Type": "application/json",
	},
});

export default myAxios;
