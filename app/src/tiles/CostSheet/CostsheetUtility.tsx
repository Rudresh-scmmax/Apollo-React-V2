type RMPrices = { [month: string]: number };

type APISubstitute = {
  name: string;
  chemical: string;
  moles: number;
  molecular_weight: number;
  prices: RMPrices;
};

type APIMaterial = {
  mainMaterial: string;
  chemical: string;
  moles: number;
  molecular_weight: number;
  prices: RMPrices;
  substitutes: APISubstitute[];
};

type SubtractMaterialMeta = {
  subtract_material_id: string | undefined;
  subtract_material_name: string | undefined;
  prices: RMPrices;
};

export function convertApiToMaterialFormat(
  api: any
): {
  apiData: APIMaterial[];
  months: string[];
  mainMaterialPriceHistory: any[];
  subtractMaterialMeta: SubtractMaterialMeta | undefined;
  molecularWeights: Record<string, number>;
} {
  // 1. Extract months from material_price_history AND raw_materials
  const allMonthsSet = new Set<string>();
  
  // Add months from main material price history
  if (api.material_price_history) {
    api.material_price_history.forEach((entry: any) => allMonthsSet.add(entry.month));
  }
  
  // Add months from raw materials price history
  if (api.raw_materials) {
    Object.values(api.raw_materials).forEach((arr: any) => {
      (arr as any[]).forEach((entry) => allMonthsSet.add(entry.month));
    });
  }
  
  // Add months from subtract material price history
  if (api.subtract_material_price_history) {
    api.subtract_material_price_history.forEach((entry: any) => allMonthsSet.add(entry.month));
  }

  const months = Array.from(allMonthsSet);
  months.sort((a, b) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime());
  months.reverse();

  // 2. Main material price history
  const mainMaterialPriceHistory = api.material_price_history || [];

  // 3. Molecular weights from API response
  const molecularWeights: Record<string, number> = api.molecularWeights || {};

  // 4. Build substitutes array from API substitutes with raw_materials prices
  const substitutes: APISubstitute[] = api.substitutes 
    ? api.substitutes.map((sub: any) => {
        // Get prices from raw_materials data using material_name as key
        const prices: RMPrices = {};
        if (api.raw_materials && api.raw_materials[sub.material_name]) {
          api.raw_materials[sub.material_name].forEach((entry: any) => {
            prices[entry.month] = parseFloat(entry.price_per_uom || entry.price || 0);
          });
        }
        
        return {
          name: sub.material_name,
          chemical: sub.material_name,
          moles: 1, // default
          molecular_weight: molecularWeights[sub.material_id] || 0,
          prices,
        };
      })
    : [];

  // 5. Handle subtract material (co-product) if present
  let subtractMaterialMeta: SubtractMaterialMeta | undefined = undefined;
  if (api.subtract_material_id && api.subtract_material_name) {
    const map: RMPrices = {};
    // Get prices from subtract_material_price_history
    if (api.subtract_material_price_history) {
      api.subtract_material_price_history.forEach((entry: any) => {
        map[entry.month] = parseFloat(entry.price_per_uom || entry.price || 0);
      });
    }
    
    subtractMaterialMeta = {
      subtract_material_id: api.subtract_material_id,
      subtract_material_name: api.subtract_material_name,
      prices: map,
    };
  }

  // 6. Build main material prices object
  const mainMaterialPrices: RMPrices = {};
  mainMaterialPriceHistory.forEach((entry: any) => {
    mainMaterialPrices[entry.month] = parseFloat(entry.price);
  });

  // 7. Compose apiData
  const apiData: APIMaterial[] = [
    {
      mainMaterial: api.main_material_name,
      chemical: "",
      moles: 1,
      molecular_weight: molecularWeights[api.main_material_id] || 0,
      prices: mainMaterialPrices,
      substitutes,
    },
  ];

  return {
    apiData,
    months,
    mainMaterialPriceHistory,
    subtractMaterialMeta,
    molecularWeights,
  };
}