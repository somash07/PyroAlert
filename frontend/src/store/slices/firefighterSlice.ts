import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Firefighter } from "../../types";
import { firefighterService } from "../../services/firefighterService";
import { resetAll } from "../actions/resetAction";
import type { RootState } from "../store";

interface FirefightersState {
  firefighters: Firefighter[];
  loading: boolean;
  error: string | null;
}

const initialState: FirefightersState = {
  firefighters: [],
  loading: false,
  error: null,
};

export const fetchFirefightersByDepartment = createAsyncThunk(
  "firefighters/getFirefightersByDepartment",
  async (id: string) => {
    const response = await firefighterService.getFirefightersByDepartment(id);
    return response.data.data;
  }
);

export const addFirefighter = createAsyncThunk(
  "firefighters/addFirefighter",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await firefighterService.addFirefighter(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || "Add failed");
    }
  }
);

export const updateFirefighter = createAsyncThunk(
  "firefighters/updateFirefighter",
  async (firefighter: {
    _id: string;
    name: string;
    email: string;
    contact: string;
    departmentId: string;
    image?: string;
  }) => {
    const response = await firefighterService.updateFirefighter(
      firefighter._id,
      firefighter
    );
    return response.data;
  }
);

export const deleteFirefighter = createAsyncThunk(
  "firefighters/deleteFirefighter",
  async (id: string) => {
    await firefighterService.deleteFirefighter(id);
    return id;
  }
);

const firefightersSlice = createSlice({
  name: "firefighters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Firefighters
      .addCase(fetchFirefightersByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFirefightersByDepartment.fulfilled, (state, action) => {
        state.firefighters = action.payload ?? [];
        state.loading = false;
      })
      .addCase(fetchFirefightersByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch firefighters";
      })

      // Add Firefighter
      .addCase(addFirefighter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFirefighter.fulfilled, (state, action) => {
        state.firefighters.push(action.payload);
        state.loading = false;
      })
      .addCase(addFirefighter.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to add firefighter";
      })
      // Delete Firefighter
      .addCase(deleteFirefighter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteFirefighter.fulfilled, (state, action) => {
        state.firefighters = state.firefighters.filter(
          (f) => f._id !== action.payload // Use _id here!
        );
        state.loading = false;
      })
      .addCase(deleteFirefighter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete firefighter";
      })
      .addCase(resetAll, () => initialState)

      //update firefighter

      .addCase(updateFirefighter.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFirefighter.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateFirefighter.rejected, (state) => {
        state.loading = false;
      });
  },
});
export const fetchFirefigthers = (state: RootState) =>
  state.firefighters.firefighters;

export default firefightersSlice.reducer;
