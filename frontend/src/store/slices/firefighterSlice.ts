import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { Firefighter } from "../../types"
import { firefighterService } from "../../services/firefighterService"

interface FirefightersState {
  firefighters: Firefighter[]
  loading: boolean
  error: string | null
}

const initialState: FirefightersState = {
  firefighters: [],
  loading: false,
  error: null,
}

export const fetchFirefighters = createAsyncThunk("firefighters/fetchFirefighters", async () => {
  const response = await firefighterService.getFirefighters()
  return response.data
})

export const addFirefighter = createAsyncThunk(
  "firefighters/addFirefighter",
  async (firefighter: Omit<Firefighter, "id">) => {
    const response = await firefighterService.addFirefighter(firefighter)
    return response.data
  },
)

export const deleteFirefighter = createAsyncThunk("firefighters/deleteFirefighter", async (id: string) => {
  await firefighterService.deleteFirefighter(id)
  return id
})

const firefightersSlice = createSlice({
  name: "firefighters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirefighters.fulfilled, (state, action) => {
        state.firefighters = action.payload
        state.loading = false
      })
      .addCase(addFirefighter.fulfilled, (state, action) => {
        state.firefighters.push(action.payload)
      })
      .addCase(deleteFirefighter.fulfilled, (state, action) => {
        state.firefighters = state.firefighters.filter((f) => f.id !== action.payload)
      })
  },
})

export default firefightersSlice.reducer
