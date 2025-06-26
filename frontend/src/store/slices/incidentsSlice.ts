import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { FireIncident } from "../../types"
// import { incidentService } from "../../services/incidentService"

interface IncidentsState {
  incidents: FireIncident[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: IncidentsState = {
  incidents: [],
  loading: false,
  error: null,
  lastUpdated: null,
}

export const fetchIncidents = createAsyncThunk("incidents/fetchIncidents", async () => {
//   const response = await incidentService.getIncidents()
//   return response.data
})

export const acceptIncident = createAsyncThunk("incidents/acceptIncident", async (incidentId: string) => {
//   const response = await incidentService.acceptIncident(incidentId)
//   return response.data
})

export const assignFirefighters = createAsyncThunk(
  "incidents/assignFirefighters",
  async ({ incidentId, firefighterIds }: { incidentId: string; firefighterIds: string[] }) => {
    // const response = await incidentService.assignFirefighters(incidentId, firefighterIds)
    // return response.data
  },
)

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    addIncident: (state, action: PayloadAction<FireIncident>) => {
      // Check if incident already exists to avoid duplicates
      const existingIndex = state.incidents.findIndex((incident) => incident.id === action.payload.id)
      if (existingIndex === -1) {
        state.incidents.unshift(action.payload)
        console.log("✅ New incident added to store:", action.payload.id)
      } else {
        console.log("⚠️ Incident already exists, skipping:", action.payload.id)
      }
      state.lastUpdated = new Date().toISOString()
    },
    updateIncident: (state, action: PayloadAction<FireIncident>) => {
      const index = state.incidents.findIndex((incident) => incident.id === action.payload.id)
      if (index !== -1) {
        state.incidents[index] = action.payload
        console.log("✅ Incident updated in store:", action.payload.id)
      } else {
        // If incident doesn't exist, add it
        state.incidents.unshift(action.payload)
        console.log("✅ New incident added via update:", action.payload.id)
      }
      state.lastUpdated = new Date().toISOString()
    },
    removeIncident: (state, action: PayloadAction<string>) => {
      state.incidents = state.incidents.filter((incident) => incident.id !== action.payload)
      state.lastUpdated = new Date().toISOString()
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false
        state.incidents = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch incidents"
      })
      .addCase(acceptIncident.fulfilled, (state, action) => {
        const index = state.incidents.findIndex((incident) => incident.id === action.payload.id)
        if (index !== -1) {
          state.incidents[index] = action.payload
        }
      })
      .addCase(assignFirefighters.fulfilled, (state, action) => {
        const index = state.incidents.findIndex((incident) => incident.id === action.payload.id)
        if (index !== -1) {
          state.incidents[index] = action.payload
        }
      })
  },
})

export const { addIncident, updateIncident, removeIncident, clearError } = incidentsSlice.actions
export default incidentsSlice.reducer
