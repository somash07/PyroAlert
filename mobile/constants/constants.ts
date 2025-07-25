export const PRIMARY_COLOR = "#DC2626";
export const SECONDARY_COLOR = "#EF4444";
export const SUCCESS_COLOR = "#10B981";
export const WARNING_COLOR = "#F59E0B";
export const ERROR_COLOR = "#EF4444";
export const GRAY_COLOR = "#6B7280";
export const LIGHT_GRAY = "#F3F4F6";
export const WHITE = "#FFFFFF";
export const BLACK = "#000000";

const isDevelopment = __DEV__;
export const API_BASE_URL = isDevelopment
  ? // ? "http://192.168.1.2:8080/api/v1" // Development - use your computer's IP
    "https://pyroalert-tdty.onrender.com/api/v1" // Development - use your computer's IP
  : "https://pyroalert-tdty.onrender.com/api/v1"; // Production
