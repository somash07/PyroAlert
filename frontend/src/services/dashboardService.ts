
import API from "@/config/baseUrl"
import type { DashboardStats } from "../types"

export const dashboardService = {
  getStats: () => API.get<DashboardStats>("/dashboard/stats"),
}
