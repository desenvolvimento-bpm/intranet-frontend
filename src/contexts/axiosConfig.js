import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.0.249:3001"
    withCredentials: true, // Permite o envio de cookies
});

export default api;
