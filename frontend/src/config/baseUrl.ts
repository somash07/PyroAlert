import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"; // ✅ Only types


const API: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.log("--Error in request interceptor", error);
    return Promise.reject(error);
  }
);

export default API;
