// store/slices/departmentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/config/baseUrl"; 
import type { User } from "@/types"; 
import type { RootState } from "../store";

export const fetchDepartments = createAsyncThunk("departments/fetch", async () => {
  const response = await API.get("/api/v1/user/departments");
  return response.data.data; 
});

interface DepartmentsState {
  departments: User[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  departments: [],
  loading: false,
  error: null,
};

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch departments";
      });
  },
});

export const selectDepartments = (state: RootState) =>
  state.departments.departments;


export default departmentsSlice.reducer;
