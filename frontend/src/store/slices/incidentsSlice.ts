import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import {
  fetchActiveIncidents,
  fetchPendingIncidents,
  respondToIncident,
  fetchAllIncidents,
  createAlert,
  updateIncident,
  assignFirefighters,
  fetchAssignedincidents,
  completeIncident,
} from "@/services/incidentService";
import type { Incident } from "@/types";

interface IncidentsState {
  incidents: Incident[];
  active: Incident[];
  pending: Incident[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: IncidentsState = {
  incidents: [],
  active: [],
  pending: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

export const loadPendingIncidents = createAsyncThunk(
  "incidents/fetchPending",
  async (department_id: string) => {
    const res = await fetchPendingIncidents(department_id);
    return res.data;
  }
);

export const loadActiveIncidents = createAsyncThunk(
  "incidents/fetchActive",
  async () => {
    const res = await fetchActiveIncidents();
    return res.data;
  }
);

export const loadAllIncidents = createAsyncThunk(
  "incidents/fetchAll",
  async () => {
    const res = await fetchAllIncidents();
    return res.data;
  }
);

export const createNewIncident = createAsyncThunk(
  "incidents/create",
  async (data: any, thunkAPI) => {
    try {
      const res = await createAlert(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  "incidents/update",
  async ({ id, data }: { id: string; data: any }, thunkAPI) => {
    try {
      const res = await updateIncident(id, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const respondToIncidentThunk = createAsyncThunk(
  "incidents/respond",
  async (
    {
      id,
      departmentId,
      action,
      notes,
    }: {
      id: string;
      departmentId: string;
      action: "accept" | "reject";
      notes?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await respondToIncident(id, departmentId, action, notes);
      return { id, departmentId, result: res.data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const assignFirefighterss = createAsyncThunk(
  "incidents/assignFirefighters",
  async ({
    incidentId,
    firefighterIds,
    leaderId,
  }: {
    incidentId: string;
    firefighterIds: string[];
    leaderId: string;
  }) => {
    const response = await assignFirefighters(
      incidentId,
      firefighterIds,
      leaderId
    );
    return response.data;
  }
);

export const getAssignedIncidents = createAsyncThunk(
  "assignedIncidents/fetchAll",
  async (departmentId: string) => {
    const res = await fetchAssignedincidents(departmentId);
    return res.data;
  }
);

export const completeIncidentThunk = createAsyncThunk(
  "incidents/complete",
  async (
    {
      id,
      notes,
      responseTime,
    }: { id: string; notes: string; responseTime: number },
    thunkAPI
  ) => {
    try {
      const res = await completeIncident(id, notes, responseTime);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const incidentSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    addNewIncident: (state, action: PayloadAction<Incident>) => {
      state.pending.unshift(action.payload);
    },

    // ✅ Local reducer to update incident status immediately
    updateIncidentStatusLocal: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      const { id, status } = action.payload;
      const target =
        state.active.find((i) => i._id === id) ||
        state.pending.find((i) => i._id === id);
      if (target) {
        target.status = status as
          | "pending_response"
          | "accepted"
          | "rejected"
          | "assigned"
          | "dispatched"
          | "completed"
          | "acknowledged"
          | "unassigned";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPendingIncidents.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPendingIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload;
      })
      .addCase(loadPendingIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to load pending incidents";
      })

      .addCase(loadActiveIncidents.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadActiveIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(loadActiveIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load active incidents";
      })

      .addCase(completeIncidentThunk.fulfilled, (state, action) => {
        const completed = action.payload.data;
        // Remove from active
        state.active = state.active.filter((i) => i._id !== completed._id);
      })

      .addCase(getAssignedIncidents.pending, (state) => {
        state.loading = true;
      })

      .addCase(getAssignedIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })

      .addCase(getAssignedIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load active incidents";
      })

      .addCase(loadAllIncidents.fulfilled, (state, action) => {
        state.incidents = action.payload.filter(
          (i: Incident) => i.status !== "resolved"
        );
      })

      .addCase(createNewIncident.fulfilled, (state, action) => {
        const newIncident = action.payload;
        if (newIncident.status === "pending_response") {
          state.pending.unshift(newIncident);
        } else {
          state.active.unshift(newIncident);
        }
      })

      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const inPendingIndex = state.pending.findIndex(
          (i) => i._id === updated._id
        );
        const inActiveIndex = state.active.findIndex(
          (i) => i._id === updated._id
        );

        if (inPendingIndex !== -1) state.pending.splice(inPendingIndex, 1);

        if (inActiveIndex !== -1) {
          state.active[inActiveIndex] = updated;
        } else {
          state.active.unshift(updated);
        }
      })

      .addCase(respondToIncidentThunk.pending, (state) => {
        state.loading = true;
      })
      
      .addCase(respondToIncidentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to respond to incident";
      })

      .addCase(respondToIncidentThunk.fulfilled, (state, action) => {
        state.pending = state.pending.filter(
          (i) => i._id !== action.payload.id
        );
        if (action.payload.result?.data?.status === "acknowledged") {
          state.active.unshift(action.payload.result.data);
        }
      });

    // .addCase(assignFirefighters.fulfilled, (state, action) => {
    //   const index = state.pending.findIndex((incident) => incident._id === action.payload.id)
    //   if (index !== -1) {
    //     state.pending[index] = action.payload
    //   }
    // })
  },
});

export const { addNewIncident, updateIncidentStatusLocal } =
  incidentSlice.actions;
export default incidentSlice.reducer;

export const selectPendingIncidents = (state: RootState) =>
  state.incidents.pending;

export const selectActiveIncidents = (state: RootState) =>
  state.incidents.active;