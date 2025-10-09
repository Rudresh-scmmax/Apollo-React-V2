import { configureStore } from "@reduxjs/toolkit";
import materialReducer from "./materialSlice"; // Import the material slice
import { saveState } from "./localStorage";

export const store = configureStore({
  reducer: {
    material: materialReducer, 
  },
});

store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
