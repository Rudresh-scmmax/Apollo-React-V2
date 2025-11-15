import { createContext, useContext, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

const businessApiUrl = (import.meta as any).env.VITE_BUSINESS_API_URL;

export type Material = {
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
};

export type Tile = {
  name: string;
  active: boolean;
};

interface BusinessContextType {
  uploadPDF: (file: File, material_id: string) => Promise<any>;
  checkPDFStatus: (id: string) => Promise<any>;
  getTakeaways: (selectedMaterial?: string) => Promise<any[]>;
  getMaterials: () => Promise<Material[]>;
  addMaterial: (material: string) => Promise<void>;
  getDailyUpdate: (material_id: string, region:string) => Promise<any>;
  checkTiles: () => Promise<Tile[]>;
  getMaterialPriceHistory: (
    selectedMaterial?: string,
    location_id?: string, limit?: number
  ) => Promise<any[]>;
  updateMaterialPriceHistory: (
    id?: number,
    field?: string,
    value?: string
  ) => Promise<any[]>;
  updateMaterialPriceHistoryBulk: (
    request: MaterialPriceHistoryUpdateRequest
  ) => Promise<MaterialPriceHistoryUpdateResponse>;
  getMaterialPrices: (
    selectedMaterial?: string,
    location_id?: string,
    model_name?: string
  ) => Promise<MaterialPriceResponse>;
  getRecomendations: (
    selectedMaterial?: string,
    location_id?: string
  ) => Promise<StrategyRecommendation>;
  getLatestNews: (
    material_id?: string,
    location_id?: string
  ) => Promise<{ latest_news_title: string }>;
  getKeyMetrics: (
    material_id?: string,
    location_id?: string
  ) => Promise<{
    current_price: string;
    price_change_from_month: string;
    ytd_change: string;
    volatility_6m: string;
    conversion_spread: string;
    conversion_change_from_month: string;
  }>;
  toggleTile: (tile: string, active: boolean) => Promise<void>;
  uploadPriceHistory: (file: File) => Promise<any>;
  uploadNewsHighlight: (file: File, material_id: string) => Promise<any>;
  updateTakeaway: (id?: number, takeaway?: string) => Promise<any>;
  getDemandSupplyTrends: (
    selectedMaterial?: string,
    location_id?: number
  ) => Promise<any[]>;
  getNewsInsights: (
    selectedMaterial?: string,
    location_id?: number
  ) => Promise<any[]>;
  getNewsSupplierTracking: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  getShutdownTracking: (
    selectedMaterial?: string,
    location_id?: string
  ) => Promise<any[]>;
  getHistoricalPrices: (materalId: string, location_id: string) => Promise<any>;
  getProcurementPlan: (
    plantCode: string,
    materialId?: string
  ) => Promise<ProcurementPlanResponse>;
  getProcurementPlanPlants: (material_id: string) => Promise<string[]>;
  updateProcurementPlan: (
    payload: ProcurementPlanUpdatePayload
  ) => Promise<any>;
  getPlantCode: (material_id: string, notnull_column?: string) => Promise<{plant_id: number, plant_name: string}[]>;
  getMinutesOfMeeting: (materalId: string) => Promise<any>;
  getJointDevelopmentProjects: (materalId: string) => Promise<any>;
  getMultiplePointEngagemeants: (materalId: string) => Promise<any>;
  getRegions: (material_id: string) => Promise<{location_id: number, location_name: string}[]>;
  getAllRegions: () => Promise<{location_id: number, location_name: string}[]>;
  getNewsLocations: (material_id: string) => Promise<{location_id: number, location_name: string}[]>;
  getDemandSupplyLocations: (material_id: string) => Promise<{location_id: number, location_name: string}[]>;
  uploadEmailContent: (data: {
    subject: string;
    body: string;
    image_urls?: string;
  }) => Promise<any>;
  updateMinutesOfMeeting: (id: number, data: any) => Promise<any>;
  deleteMinutesOfMeeting: (id: number) => Promise<any>;
  updateJointDevelopmentProject: (id: number, data: any) => Promise<any>;
  deleteJointDevelopmentProject: (id: number) => Promise<any>;
  updateMultiplePointEngagement: (id: number, data: any) => Promise<any>;
  deleteMultiplePointEngagement: (id: number) => Promise<any>;
  getCorrelationMaterialPrice: (
    materalId: string,
    correlated_material_id?: string
  ) => Promise<any>;
  getProcurementFilters: (
    materalId: string
  ) => Promise<{ years: string[]; buyer_names: string[] }>;
  getProcurementHistory: (params: {
    materalId: string;
    buyerName?: string;
    year?: string;
  }) => Promise<any[]>;
  getSupplierRegion: (material_id: string) => Promise<string[]>;
  getShutdownRegions: (material_id: string) => Promise<{location_id: number, location_name: string}[]>;
  getInventoryLevels: (materalId: string) => Promise<any>;
  getVendorWiseActionPlan: (materalId: string) => Promise<any>;
  getVendorKeyInformation: (materalId: string) => Promise<any>;
  getMaterialSubtituteData: (materalId: string, plant_id: string, location_id?: string) => Promise<any>;
  getFactPackData: (materalId: string) => Promise<any>;
  uploadFactPackFile: (file: File, material_id: string) => Promise<any>;
  processQuotations: (files: string[]) => Promise<any>;
  getQuotations: (material?: string, limit?: number) => Promise<any>;
  getQuotationAnalysis: (material?: string) => Promise<any>;
  uploadQuotationPDF: (ata: FormData) => Promise<any>;
  getTradeData: (material: string, year: string) => Promise<any>;
  getSupplierTrend: (year: number, material: string) => Promise<any>;
  getPriceHistoryTrend: (year: number, material: string) => Promise<any>;
  getPortersAnalysis: (materalId: string) => Promise<any>;
  refreshPortersAnalysis: (materalId: string, forceRefresh?: boolean) => Promise<any>;
  updatePortersAnalysis: (material_id: string, analysis_json: any, analysis_id?: number) => Promise<any>;
  uploadSingleNewsHighlight: (title: string, published_date: string, news_url: string, material_id: string) => Promise<any>;
  updateShutdownTracking: (
    updateData: ShutdownTrackingUpdateInput
  ) => Promise<any>;
  getSeasonalityTrends: (material_id: string, location_id: number) => Promise<any>;
  updateVendorKeyInformation: (
    rowData: VendorKeyInfoUpdate) => Promise<any>;
  getVendors: (material_id: string) => Promise<string[]>;
  getNegotiationAvoids: (vendor: string, date: string, material_id?: string, signals?: any) => Promise<any>;
  uploadSpendAnalysis: (file: File) => Promise<any>;
  triggerForecast: (material_id: string, location_id: string, model_name: string) => Promise<any>;
  getTargetNegotiation: (material_id: string, date: string, vendor_name: string) => Promise<any>;
  getTcoPrices: (vendor_name: string, date: string) => Promise<any>;
  getShouldBePrice: (material_id: string, date: string) => Promise<any>;
  getExportPrice: (material_id: string, date: string) => Promise<any>;
  getImportPrice: (material_id: string, date: string) => Promise<any>;
  refreshRecommendation: (vendor_name: string, date: string, material_id: string) => Promise<any>;
  negotiationRecommendations: (vendor_name: string, date: string, material_id: string) => Promise<any>;
  updatePlanStatus: (planId: string,
    status: string,
    file?: File) => Promise<any>
  createActionPlan: (data: {
    title: string;
    description: string;
    assignedUsers: string[];
  }) => Promise<any>;
  getAllUsers: () => Promise<any>;
  updatePlanAssignments: (planId: number, assignedUsers: string[]) => Promise<any>;
  deleteTakeaway: (id: number) => Promise<any>;
  getUserPreferences: () => Promise<{user_prefered_currency: string}>;
  updateUserPreferences: (preferences: {user_prefered_currency: string}) => Promise<any>;
  getCurrencyMaster: () => Promise<{currency_code: string, currency_name: string}[]>;
};


const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

interface BusinessProviderProps {
  children: React.ReactNode;
}

type ProcurementPlanUpdatePayload = {
  plant_code: string;
  material_id: string;
  safety_stock?: number;
  opening_stock?: number;
  monthly_prices: Record<string, number>;
};

export type StrategyRecommendation = {
  id: number;
  material_id: string;
  location_id: number;
  material_name: string;
  recommendation: string;
  conservative_strategy: string;
  balanced_strategy: string;
  aggressive_strategy: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  latest_news_title: string;
  key_metrics: {
    current_price: string;
    price_change_from_month: string;
    ytd_change: string;
    volatility_6m: string;
    conversion_spread: string;
    conversion_change_from_month: string;
  };
};


export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
}) => {
  const [materials, setMaterials] = useState<string[]>([
    "Acetic Acid",
    "Carbon",
    "Glycerin",
  ]);

  const { getToken } = useAuth();

  const fetchWrapper = async (url: string, options: any) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${await getToken()}`,
      },
    });

    if (response.ok) {
      return response.status === 204 ? null : response.json();
    } else {
      let errorBody = null;

      try {
        errorBody = await response.json(); // Try to parse error body
      } catch (_) {
        // It's not JSON or parsing failed
      }

      const errorMessage =
        errorBody?.error || response.statusText || "Unknown error occurred";

      // Throw custom error with readable message
      throw new Error(errorMessage);
    }
  };

  const getRegions = async (
    material_id: string,
  ): Promise<{location_id: number, location_name: string}[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/price-regions?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getAllRegions = async (): Promise<
    { location_id: number; location_name: string }[]
  > => {
    return fetchWrapper(`${businessApiUrl}/get-regions`, {
      method: "GET",
    });
  };

  const getNewsLocations = async (
    material_id: string,
  ): Promise<{location_id: number, location_name: string}[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/news-locations?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getDemandSupplyLocations = async (
    material_id: string,
  ): Promise<{location_id: number, location_name: string}[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/demand-supply-locations?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getShutdownRegions = async (
    material_id: string
  ): Promise<{location_id: number, location_name: string}[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/shutdown-regions?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getSupplierRegion = async (
    material_id: string
  ): Promise<string[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/supplier_regions?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getPlantCode = async (material_id: string): Promise<{plant_id: number, plant_name: string}[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/get-plantcode?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMaterials = async (): Promise<Material[]> => {
    return fetchWrapper(`${businessApiUrl}/get-materials`, {
      method: "GET",
    });
  };

  const addMaterial = async (material: string): Promise<void> => {
    setMaterials((prev) => [...prev, material]);
  };

  const getDailyUpdate = async (material_id: string, region: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (material_id) queryParams.append("material_id", material_id);
  if (region) queryParams.append("region", region);
  return fetchWrapper(`${businessApiUrl}/dailyUpdates?${queryParams.toString()}`, {
    method: "GET",
  });
};

  const checkTiles = async (): Promise<Tile[]> => {
    return fetchWrapper(`${businessApiUrl}/tiles`, {
      method: "GET",
    });
  };

  const toggleTile = async (tile: string, active: boolean): Promise<void> => {
    return fetchWrapper(`${businessApiUrl}/toggle-tile`, {
      method: "POST",
      body: JSON.stringify({ tile, active }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const uploadPDF = async (file: File, material_id: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("material_id", material_id);

    return fetchWrapper(`${businessApiUrl}/upload-pdf`, {
      method: "POST",
      body: formData,
    });
  };

  const checkPDFStatus = async (id: string): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/pdf-status/${id}`, {
      method: "GET",
    });
  };

  const getTakeaways = async (selectedMaterial?: string): Promise<any[]> => {
    const queryParam = selectedMaterial
      ? `?material_id=${encodeURIComponent(selectedMaterial)}`
      : "";
    return fetchWrapper(`${businessApiUrl}/takeaway${queryParam}`, {
      method: "GET",
    });
  };

  const getMaterialPriceHistory = async (
    selectedMaterial?: string,
    location_id?: string,
    limit?: number
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (location_id) queryParams.append("location_id", location_id);
    if (limit) queryParams.append("limit", limit.toString());


    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(
      `${businessApiUrl}/material-price-history${queryString}`,
      {
        method: "GET",
      }
    );
  };

  const updateMaterialPriceHistory = async (
    id?: number,
    field?: string,
    value?: string
  ): Promise<any[]> => {
    return fetchWrapper(`${businessApiUrl}/update-material-price-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, field, value }),
    });
  };

  const updateMaterialPriceHistoryBulk = async (
    request: MaterialPriceHistoryUpdateRequest
  ): Promise<MaterialPriceHistoryUpdateResponse> => {
    return fetchWrapper(`${businessApiUrl}/update-material-price-history`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  };

  const updateTakeaway = async (
    id?: number,
    takeaway?: string
  ): Promise<any[]> => {
    return fetchWrapper(`${businessApiUrl}/update-takeaway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, takeaway }),
    });
  };


 
  const getMaterialPrices = async (
    selectedMaterial?: string,
    location_id?: string,
    model_name?: string
  ): Promise<MaterialPriceResponse> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (location_id) queryParams.append("location_id", location_id);
    if (model_name) queryParams.append("model_name", model_name);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/material-prices${queryString}`, {
      method: "GET",
    });
  };

  const getRecomendations = async (
    selectedMaterial?: string,
    location_id?: string
  ): Promise<StrategyRecommendation> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (location_id) queryParams.append("location_id", location_id);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/get-recommendation${queryString}`, {
      method: "GET",
    });
  };

  const getLatestNews = async (
    material_id?: string,
    location_id?: string
  ): Promise<{ latest_news_title: string }> => {
    const queryParams = new URLSearchParams();

    if (material_id) queryParams.append("material_id", material_id);
    if (location_id) queryParams.append("location_id", location_id);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/latest-news${queryString}`, {
      method: "GET",
    });
  };

  const getKeyMetrics = async (
    material_id?: string,
    location_id?: string
  ): Promise<{
    current_price: string;
    price_change_from_month: string;
    ytd_change: string;
    volatility_6m: string;
    conversion_spread: string;
    conversion_change_from_month: string;
  }> => {
    const queryParams = new URLSearchParams();

    if (material_id) queryParams.append("material_id", material_id);
    if (location_id) queryParams.append("location_id", location_id);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/key-metrics${queryString}`, {
      method: "GET",
    });
  };

  const uploadPriceHistory = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return fetchWrapper(`${businessApiUrl}/upload-price-history`, {
      method: "POST",
      body: formData,
    });
  };

  const uploadNewsHighlight = async (file: File, material_id: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("material_id", material_id);

    return fetchWrapper(`${businessApiUrl}/upload-news-file`, {
      method: "POST",
      body: formData,
    });
  };

  const getDemandSupplyTrends = async (
    selectedMaterial?: string,
    location_id?: number
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (location_id) queryParams.append("location_id", location_id.toString());

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/demand-supply-trends${queryString}`, {
      method: "GET",
    });
  };

  const getNewsInsights = async (
    selectedMaterial?: string,
    location_id?: number
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (location_id) queryParams.append("location_id", location_id.toString());

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/news-insights${queryString}`, {
      method: "GET",
    });
  };

  const getNewsSupplierTracking = async (
    selectedMaterial?: string,
    region?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/supplier-tracking${queryString}`, {
      method: "GET",
    });
  };

  const getShutdownTracking = async (
    selectedMaterial?: string,
    location_id?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (location_id) queryParams.append("location_id", location_id);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/shutdown-tracking${queryString}`, {
      method: "GET",
    });
  };


  const updateShutdownTracking = async (
    updateData: ShutdownTrackingUpdateInput
  ): Promise<any> => {
    const { id, shutdown_from, shutdown_to } = updateData;


    if (shutdown_from === undefined && shutdown_to === undefined) {
      throw new Error("At least one of 'shutdown_from' or 'shutdown_to' must be provided.");
    }

    return fetchWrapper(`${businessApiUrl}/shutdown-tracking/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
  };


  const getProcurementPlan = async (
    plantCode: string,
    materialCode?: string
  ): Promise<ProcurementPlanResponse> => {
    if (!plantCode) {
      throw new Error("plantCode is required to fetch procurement plans.");
    }

    const queryParams = new URLSearchParams();
    queryParams.append("plant_code", plantCode);
    if (materialCode) queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/procurement-plan?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getProcurementPlanPlants = async (
    materialCode: string
  ): Promise<string[]> => {
    if (!materialCode) {
      throw new Error("materialCode is required to fetch procurement plants.");
    }

    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/procurement-plans/plants?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const updateProcurementPlan = async (
    payload: ProcurementPlanUpdatePayload
  ): Promise<any> => {
    if (!payload.plant_code || !payload.material_id) {
      throw new Error(
        "plant_code and material_id are required to update procurement plans."
      );
    }

    return fetchWrapper(`${businessApiUrl}/procurement-plan`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const getHistoricalPrices = async (
    materalId: string,
    location_id: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    queryParams.append("location_id", location_id);
    queryParams.append("limit", "24");

    return fetchWrapper(
      `${businessApiUrl}/historical-prices?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMinutesOfMeeting = async (materalId: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/minutes-of-meeting?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getJointDevelopmentProjects = async (
    materalId: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/joint-development-projects?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMultiplePointEngagemeants = async (
    materalId: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/multiple-point-engagements?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const uploadEmailContent = async (data: {
    subject: string;
    body: string;
    image_urls?: string;
  }): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/call-read-email-api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  // Minutes of Meeting (MOM)
  const updateMinutesOfMeeting = async (
    id: number,
    data: any
  ): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/minutes-of-meeting/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteMinutesOfMeeting = async (id: number): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/minutes-of-meeting/${id}`, {
      method: "DELETE",
    });
  };

  const deleteTakeaway = async (id: number): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/takeaway/${id}`, {
      method: "DELETE",
    });
  };


  // Joint Development Projects (JDP)
  const updateJointDevelopmentProject = async (
    id: number,
    data: any
  ): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/joint-development-projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteJointDevelopmentProject = async (id: number): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/joint-development-projects/${id}`, {
      method: "DELETE",
    });
  };

  // Multiple Point Engagements (MPE)
  const updateMultiplePointEngagement = async (
    id: number,
    data: any
  ): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/multiple-point-engagements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteMultiplePointEngagement = async (id: number): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/multiple-point-engagements/${id}`, {
      method: "DELETE",
    });
  };

  const getCorrelationMaterialPrice = async (
    materalId: string,
    correlated_material_id?: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    if (correlated_material_id) {
      queryParams.append("correlated_material_id", correlated_material_id);
    }

    return fetchWrapper(
      `${businessApiUrl}/correlation-material-price?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getProcurementFilters = async (
    materalId: string
  ): Promise<{ years: string[]; buyer_names: string[] }> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/procurement-filters?${queryParams.toString()}`,
      { method: "GET" }
    );
  };

  const getInventoryLevels = async (materalId: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/inventory-levels?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  // Get Vendor Wise Action Plan
  const getVendorWiseActionPlan = async (materalId: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    return fetchWrapper(`${businessApiUrl}/plans?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  // Update Plan Status (with optional file upload)
  const updatePlanStatus = async (
    planId: string,
    status: string,
    file?: File
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("status", status);
    
    const url = `${businessApiUrl}/plans/${planId}/status?${queryParams.toString()}`;
    
    if (file) {
      const formData = new FormData();
      formData.append("attachment", file);
      
      return fetchWrapper(url, {
        method: "PUT",
        body: formData,
      });
    } else {
      return fetchWrapper(url, {
        method: "PUT",
      });
    }
  };


  const processQuotations = async (files: string[]): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/process-quotations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    });
  };

  const getQuotations = async (
    material?: string,
    limit: number = 50
  ): Promise<any> => {
    const queryParams = new URLSearchParams();

    if (material) queryParams.append("material", material);
    queryParams.append("limit", limit.toString());

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/quotations${queryString}`, {
      method: "GET",
    });
  };

  const getQuotationAnalysis = async (material?: string): Promise<any> => {
    const queryParams = new URLSearchParams();

    if (material) queryParams.append("material", material);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/quotation-analysis${queryString}`, {
      method: "GET",
    });
  };

  const getProcurementHistory = async ({
    materalId,
    buyerName,
    year,
  }: {
    materalId: string;
    buyerName?: string;
    year?: string;
  }): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    if (buyerName) queryParams.append("buyer_name", buyerName);
    if (year) queryParams.append("year", year);

    const result = await fetchWrapper(
      `${businessApiUrl}/procurement-history?${queryParams.toString()}`,
      { method: "GET" }
    );
    return result.data || [];
  };

  const getVendorKeyInformation = async (
    materalId: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/vendor-key-information?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMaterialSubtituteData = async (
    materalId: string, plant_id: string, location_id?: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    queryParams.append("plant_id", plant_id);
    if (location_id) queryParams.append("location_id", location_id);

    return fetchWrapper(
      `${businessApiUrl}/material-substitutes?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getFactPackData = async (materalId: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);

    return fetchWrapper(
      `${businessApiUrl}/fact-pack?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const uploadFactPackFile = async (
    file: File,
    material_id: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("material_id", material_id);

    return fetchWrapper(`${businessApiUrl}/fact-pack-upload-pdf`, {
      method: "POST",
      body: formData,
    });
  };

  const uploadQuotationPDF = async (formData: FormData): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/upload-quotation-pdf`, {
      method: "POST",
      body: formData,
    });
  };

  const getTradeData = async (material: string, year: string): Promise<any> => {
    const queryParams = new URLSearchParams();

    if (material) queryParams.append("material_id", material);
    if (year) queryParams.append("year", String(year));

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/get-export-data${queryString}`, {
      method: "GET",
    });
  };

  const getSupplierTrend = async (
    year: number,
    material: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();

    if (material) queryParams.append("material_id", material);
    if (year) queryParams.append("year", String(year));

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/supplier-trend${queryString}`, {
      method: "GET",
    });
  };

  const getPriceHistoryTrend = async (
    year: number,
    material: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();

    if (material) queryParams.append("material_id", material);
    if (year) queryParams.append("year", String(year));

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/price-history-trend${queryString}`, {
      method: "GET",
    });
  };


  // Porter's Five Forces Analysis
  const refreshPortersAnalysis = async (materalId: string, forceRefresh?: boolean): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    if (forceRefresh) queryParams.append("force_refresh", "true");
    return fetchWrapper(
      `${businessApiUrl}/porters-analysis?${queryParams.toString()}`,
      { method: "GET" }
    );
  };

  const updatePortersAnalysis = async (material_id: string, analysis_json: any, analysis_id?: number): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    if (analysis_id) {
      queryParams.append("analysis_id", analysis_id.toString());
    }
    
    return fetchWrapper(`${businessApiUrl}/porters-analysis?${queryParams.toString()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ analysis_json }),
    });
  };

  const getUserPreferences = async (): Promise<{user_prefered_currency: string}> => {
    return fetchWrapper(`${businessApiUrl}/user-preferences`, {
      method: "GET",
    });
  };

  const updateUserPreferences = async (preferences: {user_prefered_currency: string}): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/user-preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });
  };

  const getCurrencyMaster = async (): Promise<{currency_code: string, currency_name: string}[]> => {
    return fetchWrapper(`${businessApiUrl}/currency-master`, {
      method: "GET",
    });
  };

  const getPortersAnalysis = async (materalId: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materalId);
    return fetchWrapper(
      `${businessApiUrl}/porters-analysis/result?${queryParams.toString()}`,
      { method: "GET" }
    );
  };

  const uploadSingleNewsHighlight = async (
    title: string, published_date: string, news_url: string, material_id: string
  ): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/upsert-news-highlight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        published_date,
        news_url,
        material_id
      }),
    });
  }

  const updateVendorKeyInformation = async (rowData: VendorKeyInfoUpdate): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/vendor-key-information`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rowData),
    });
  };

  const getVendors = async (material_id: string): Promise<any[]> => {
    console.log("getVendors called with material_id:", material_id);
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    const url = `${businessApiUrl}/get-vendors?${queryParams.toString()}`;
    console.log("getVendors API URL:", url);
    return fetchWrapper(url, {
      method: "GET",
    });
  }


  const refreshRecommendation = async (vendor_name: string, date: string, material_id: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("vendor_name", vendor_name);
    queryParams.append("date", date);
    queryParams.append("material_id", material_id);

    return fetchWrapper(`${businessApiUrl}/refresh-recommendation?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  const negotiationRecommendations = async (vendor_name: string, date: string, material_id: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("vendor_name", vendor_name);
    queryParams.append("date", date);
    queryParams.append("material_id", material_id);
    return fetchWrapper(`${businessApiUrl}/negotiation-recommendations?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  const getSeasonalityTrends = async (material_id: string, location_id: number): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("location_id", location_id.toString());
    return fetchWrapper(`${businessApiUrl}/seasonality-trends?${queryParams.toString()}`, {
      method: "GET",
    });
  };



  const uploadSpendAnalysis = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return fetchWrapper(`${businessApiUrl}/upload-spend-analysis`, {
      method: "POST",
      body: formData,
    });
  };


  const triggerForecast = async (
    material_id: string,
    location_id: string,
    model_name: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("location_id", location_id);
    queryParams.append("model_name", model_name);

    return fetchWrapper(`${businessApiUrl}/trigger-forecast-update?${queryParams.toString()}`, {
      method: "POST",
    });
  };


  const getTargetNegotiation = async (material_id: string, date: string, vendor_name: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("date", date);
    queryParams.append("vendor_name", vendor_name);
    return fetchWrapper(`${businessApiUrl}/target-negotiation?${queryParams.toString()}`, {
      method: "GET",
    });
  };


  const getExportPrice = async (material_id: string, date: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("date", date);
    return fetchWrapper(`${businessApiUrl}/get-export-price?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  const getImportPrice = async (material_id: string, date: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("date", date);
    return fetchWrapper(`${businessApiUrl}/get-import-price?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  const getTcoPrices = async (vendor_name: string, date: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("vendor_name", vendor_name);
    queryParams.append("date", date);
    queryParams.append("location_id", "212")
    return fetchWrapper(`${businessApiUrl}/tco-prices?${queryParams.toString()}`, {
      method: "GET",
    });
  }

  const getShouldBePrice = async (material_id: string, date: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("date", date);
    return fetchWrapper(`${businessApiUrl}/should-be-price?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  const getNegotiationAvoids = async (
    vendor: string,
    date: string,
    material_id?: string,
    signals?: {
      objective?: string;
      market_info?: string;
      inventory_hint?: string;
    }
  ): Promise<any> => {
    const payload: any = {
      action: "negotiation_avoids",
      vendor,
      date,
    };

    if (material_id) {
      payload.material_id = material_id;
    }

    if (signals) {
      payload.signals = signals;
    }


    return fetchWrapper(`${businessApiUrl}/negotiation-avoids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const createActionPlan = async (data: {
    title: string;
    description: string;
    assignedUsers: string[];
  }): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };


  // Fetch all users (for assigning plans) - Admin only
  const getAllUsers = async (): Promise<any> => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }
    return fetchWrapper(`${businessApiUrl}/users`, {
      method: "GET",
    });
  };


  const updatePlanAssignments = async (planId: number, assignedUsers: string[]): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/plans/${planId}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedUsers }),
    });
  };


  const contextValue = {
    uploadPDF,
    checkPDFStatus,
    getTakeaways,
    getMaterials,
    addMaterial,
    getDailyUpdate,
    checkTiles,
    toggleTile,
    getMaterialPriceHistory,
    updateMaterialPriceHistory,
    updateMaterialPriceHistoryBulk,
    getMaterialPrices,
    getRegions,
    getAllRegions,
    getNewsLocations,
    getDemandSupplyLocations,
    getRecomendations,
    getLatestNews,
    getKeyMetrics,
    uploadPriceHistory,
    updateTakeaway,
    getDemandSupplyTrends,
    getNewsInsights,
    getNewsSupplierTracking,
    getHistoricalPrices,
    getShutdownTracking,
    getProcurementPlan,
    getProcurementPlanPlants,
    updateProcurementPlan,
    getPlantCode,
    uploadNewsHighlight,
    getMinutesOfMeeting,
    getJointDevelopmentProjects,
    getMultiplePointEngagemeants,
    uploadEmailContent,
    updateMinutesOfMeeting,
    deleteMinutesOfMeeting,
    updateJointDevelopmentProject,
    deleteJointDevelopmentProject,
    updateMultiplePointEngagement,
    deleteMultiplePointEngagement,
    getCorrelationMaterialPrice,
    getProcurementFilters,
    getProcurementHistory,
    getSupplierRegion,
    getShutdownRegions,
    getInventoryLevels,
    getVendorWiseActionPlan,
    getVendorKeyInformation,
    getMaterialSubtituteData,
    getFactPackData,
    uploadFactPackFile,
    processQuotations,
    getQuotations,
    getQuotationAnalysis,
    uploadQuotationPDF,
    getTradeData,
    getSupplierTrend,
    getPriceHistoryTrend,
    getPortersAnalysis,
    uploadSingleNewsHighlight,
    updateShutdownTracking,
    getSeasonalityTrends,
    updateVendorKeyInformation,
    getVendors,
    getNegotiationAvoids,
    uploadSpendAnalysis,
    triggerForecast,
    getTargetNegotiation,
    getTcoPrices,
    getShouldBePrice,
    getExportPrice,
    getImportPrice,
    refreshRecommendation,
    negotiationRecommendations,
    updatePlanStatus,
    createActionPlan,
    getAllUsers,
    updatePlanAssignments,
    deleteTakeaway,
    refreshPortersAnalysis,
    updatePortersAnalysis,
    getUserPreferences,
    updateUserPreferences,
    getCurrencyMaster,
  };

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessAPI = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusinessAPI must be used within a BusinessProvider");
  }
  return context;
};
