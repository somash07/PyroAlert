import { configureStore } from "@reduxjs/toolkit";
import incidentsReducer from "./slices/incidentsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import firefightersReducer from "./slices/firefighterSlice"
import authReducer from "./slices/authSlice"

export const store = configureStore({
  reducer: {
    incidents: incidentsReducer,
    firefighters: firefightersReducer,
    dashboard: dashboardReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
