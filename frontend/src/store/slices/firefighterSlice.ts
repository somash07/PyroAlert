import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Firefighter } from "../../types";
import { firefighterService } from "../../services/firefighterService";
import { resetAll } from "../actions/resetAction";

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


export const fetchFirefighters = createAsyncThunk(
  "firefighters/fetchFirefighters",
  async (id? : string ) => {
    const response = await firefighterService.getFirefighters(id);
    return response.data.data;
  }
);

export const addFirefighter = createAsyncThunk(
  "firefighters/addFirefighter",
  async (firefighter: Omit<Firefighter, "_id">) => {
    const response = await firefighterService.addFirefighter(firefighter);
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
      .addCase(fetchFirefighters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFirefighters.fulfilled, (state, action) => {
        state.firefighters = action.payload ?? [];
        state.loading = false;
      })
      .addCase(fetchFirefighters.rejected, (state, action) => {
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
        state.error = action.error.message ?? "Failed to add firefighter";
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
      .addCase(resetAll,()=>initialState)
  },
});

export default firefightersSlice.reducer;
