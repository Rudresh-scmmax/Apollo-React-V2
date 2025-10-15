import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadState } from "./localStorage";

const selectedMaterial = loadState("appState");
interface Material {
  material_description: string;
  material_id: string;
}

interface MaterialState {
  globalSelectedMaterial: Material | null;
}

const initialState: MaterialState = {
  globalSelectedMaterial: selectedMaterial?.material?.globalSelectedMaterial,
};

const materialSlice = createSlice({
  name: "material",
  initialState,
  reducers: {
    setGlobalSelectedMaterial: (state, action: PayloadAction<Material>) => {
      state.globalSelectedMaterial = action.payload;
    },
  },
});

export const { setGlobalSelectedMaterial } = materialSlice.actions;
export default materialSlice.reducer;
