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
  uom_symbol?: string | null;
}

interface MaterialState {
  globalSelectedMaterial: Material;
}

// Default material to set on first load when nothing is in persisted state
export const defaultMaterial: Material = {
  material_id: "100724-000000",
  material_description: "Glycerine",
  material_type_id: 1,
  material_status: "active",
  base_uom_id: 4,
  user_defined_material_desc: null,
  material_category: "Category - D",
  cas_no: "56-81-5",
  unspsc_code: null,
  hsn_code: "290545",
};

const initialState: MaterialState = {
  globalSelectedMaterial:
    selectedMaterial?.material?.globalSelectedMaterial || defaultMaterial,
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
