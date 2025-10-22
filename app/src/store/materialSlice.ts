import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadState } from "./localStorage";

const selectedMaterial = loadState("appState");
interface Material {
  material_id: string;
  material_description: string;
  material_type_id: number;
  material_status: string;
  base_uom_id: number;
  user_defined_material_desc: string | null;
  material_category: string;
  cas_no: string | null;
  unspsc_code: string | null;
  hsn_code: string | null;
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
