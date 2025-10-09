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

export function convertApiToMaterialFormat(api: any): { apiData: APIMaterial[], months: string[], mainMaterialPriceHistory: any[] } {
  // 1. Gather all months
  const allMonthsSet = new Set<string>();
  if (api.raw_materials) {
    Object.values(api.raw_materials).forEach((arr: any) => {
      (arr as any[]).forEach(entry => allMonthsSet.add(entry.month));
    });
  }
  if (api.material_price_history) {
    api.material_price_history.forEach((entry: any) => allMonthsSet.add(entry.month));
  }
  const months = Array.from(allMonthsSet);
  months.sort((a, b) => new Date("1 " + a) > new Date("1 " + b) ? 1 : -1);

  // 2. Main material prices (from procurement history)
  const mainMaterialPriceHistory = api.material_price_history || [];

  // 3. Substitutes
  const substitutes: APISubstitute[] = api.raw_materials
  ? Object.entries(api.raw_materials).map(([name, arr]) => {
      const prices: RMPrices = {};
      (arr as any[]).forEach(entry => {
        prices[entry.month] = parseFloat(entry.price_per_uom);
      });
      return {
        name,
        chemical: "",
        moles: 1,
        molecular_weight: 125,
        prices,
      };
    })
  : [];

  // 4. Compose apiData array
  const apiData: APIMaterial[] = [
    {
      mainMaterial: api.main_material_name,
      chemical: "",
      moles: 1,
      molecular_weight: 125,
      prices: {}, // not used for main material, only for substitutes
      substitutes,
    }
  ];

  return { apiData, months, mainMaterialPriceHistory };
}