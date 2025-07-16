import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"; // ✅ Only types
import toast from "react-hot-toast";


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


// Response Interceptor (for showing backend errors)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || "An error occurred";
      toast.error(message); // or use any inline display
    } else if (error.request) {
      toast.error("Something went wrong. Please try again later ");
    } else {
      toast.error("Request setup error.");
    }

    return Promise.reject(error); // important to propagate to your catch blocks
  }
);


export default API;
