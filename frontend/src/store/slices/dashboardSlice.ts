import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { DashboardStats } from "../../types"
// import { dashboardService } from "../../services/dashboardService"

interface DashboardState {
  stats: DashboardStats
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: DashboardState = {
  stats: {
    activeIncidents: 0,
    availableFirefighters: 0,
    averageResponseTime: 0,
    incidentsToday: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
}

export const fetchDashboardStats = createAsyncThunk("dashboard/fetchStats", async () => {
//   const response = await dashboardService.getStats()
//   return response.data
})

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = action.payload
      state.lastUpdated = new Date().toISOString()
    },
    incrementActiveIncidents: (state) => {
      state.stats.activeIncidents += 1
      state.stats.incidentsToday += 1
      state.lastUpdated = new Date().toISOString()
    },
    decrementActiveIncidents: (state) => {
      if (state.stats.activeIncidents > 0) {
        state.stats.activeIncidents -= 1
      }
      state.lastUpdated = new Date().toISOString()
    },
    updateFirefighterCount: (state, action: PayloadAction<{ available: number; busy?: number }>) => {
      state.stats.availableFirefighters = action.payload.available
      state.lastUpdated = new Date().toISOString()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch dashboard stats"
      })
  },
})

export const { updateStats, incrementActiveIncidents, decrementActiveIncidents, updateFirefighterCount } =
  dashboardSlice.actions
export default dashboardSlice.reducer
