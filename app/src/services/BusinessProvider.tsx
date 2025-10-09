import { createContext, useContext, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

const businessApiUrl = (import.meta as any).env.VITE_BUSINESS_API_URL;

export type Material = {
  material_description: string;
  material_id: string;
};

export type Tile = {
  name: string;
  active: boolean;
};

interface BusinessContextType {
  uploadPDF: (file: File, material_id: string) => Promise<any>;
  checkPDFStatus: (id: string) => Promise<any>;
  getReports: (selectedMaterial?: string) => Promise<any[]>;
  getMaterials: () => Promise<Material[]>;
  addMaterial: (material: string) => Promise<void>;
  getDailyUpdate: () => Promise<any>;
  checkTiles: () => Promise<Tile[]>;
  getMaterialPriceHistory: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  updateMaterialPriceHistory: (
    id?: number,
    field?: string,
    value?: string
  ) => Promise<any[]>;
  getMaterialPrices: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  getRecomendations: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<StrategyRecommendation>;
  toggleTile: (tile: string, active: boolean) => Promise<void>;
  uploadPriceHistory: (file: File) => Promise<any>;
  uploadNewsHighlight: (file: File) => Promise<any>;
  updateTakeaway: (id?: number, takeaway?: string) => Promise<any>;
  getDemandSupplyTrends: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  getNewsInsights: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  getNewsSupplierTracking: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  getShutdownTracking: (
    selectedMaterial?: string,
    region?: string
  ) => Promise<any[]>;
  getHistoricalPrices: (materialCode: string, region: string) => Promise<any>;
  getProcurementPlan: (
    PlantCode?: string,
    selectedMaterial?: string
  ) => Promise<ProcurementPlanResponse>;
  getPlantCode: () => Promise<string[]>;
  getMinutesOfMeeting: (materialCode: string) => Promise<any>;
  getJointDevelopmentProjects: (materialCode: string) => Promise<any>;
  getMultiplePointEngagemeants: (materialCode: string) => Promise<any>;
  getRegions: (material_id: string, notnull_column?: string) => Promise<any>;
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
    materialCode: string,
    correlated_material_id?: string
  ) => Promise<any>;
  getProcurementFilters: (
    materialCode: string
  ) => Promise<{ years: string[]; buyer_names: string[] }>;
  getProcurementHistory: (params: {
    materialCode: string;
    buyerName?: string;
    year?: string;
  }) => Promise<any[]>;
  getSupplierRegion: (material_id: string) => Promise<string[]>;
  getShutdownRegions: (material_id: string) => Promise<string[]>;
  getInventoryLevels: (materialCode: string) => Promise<any>;
  getVendorWiseActionPlan: (materialCode: string) => Promise<any>;
  getVendorKeyInformation: (materialCode: string) => Promise<any>;
  getMaterialSubtituteData: (materialCode: string) => Promise<any>;
  getFactPackData: (materialCode: string) => Promise<any>;
  uploadFactPackFile: (file: File, material_id: string) => Promise<any>;
  processQuotations: (files: string[]) => Promise<any>;
  getQuotations: (material?: string, limit?: number) => Promise<any>;
  getQuotationAnalysis: (material?: string) => Promise<any>;
  uploadQuotationPDF: (ata: FormData) => Promise<any>;
  getTradeData: (material: string, year: number) => Promise<any>;
  getSupplierTrend: (year: number, material: string) => Promise<any>;
  getPriceHistoryTrend: (year: number, material: string) => Promise<any>;
  getPortersAnalysis: (materialCode: string) => Promise<any>;
  uploadSingleNewsHighlight: (title: string, published_date: string, news_url: string, material_id: string) => Promise<any>;
  updateShutdownTracking: (
    updateData: ShutdownTrackingUpdateInput
  ) => Promise<any>;
  getSeasonalityTrends: (material_id: string, region: string) => Promise<any>;
  updateVendorKeyInformation: (
    rowData: VendorKeyInfoUpdate) => Promise<any>;
  getVendors: () => Promise<string[]>;
  getNegotiationObjectives: (vendor_name: string, date: string) => Promise<any>;
  createNegotiationObjectives: (vendor_name: string, date: string, objectives: NegotiationData) => Promise<any>;
  uploadSpendAnalysis: (file: File) => Promise<any>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

interface BusinessProviderProps {
  children: React.ReactNode;
}

export type StrategyRecommendation = {
  recommendation: {
    strategies: {
      conservative: string;
      aggressive: string;
      balanced: string;
    };
    generated_at: string;
    recommendation: string;
  };
  material: string;

  key_metrics: {
    conversion_change_from_month: string;
    conversion_spread: string;
    current_price: string;
    price_change_from_month: string;
    volatility_6m: string;
    ytd_change: string;
  };

  latest_news_title: string;
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
    notnull_column?: string
  ): Promise<string[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    notnull_column &&
      queryParams.append("column_not_tobe_null", notnull_column);
    return fetchWrapper(
      `${businessApiUrl}/price_regions?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getShutdownRegions = async (
    material_id: string
  ): Promise<string[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    return fetchWrapper(
      `${businessApiUrl}/shutdown_regions?${queryParams.toString()}`,
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

  const getPlantCode = async (): Promise<string[]> => {
    return fetchWrapper(`${businessApiUrl}/get-plantcode`, {
      method: "GET",
    });
  };

  const getMaterials = async (): Promise<Material[]> => {
    return fetchWrapper(`${businessApiUrl}/get-materials`, {
      method: "GET",
    });
  };

  const addMaterial = async (material: string): Promise<void> => {
    setMaterials((prev) => [...prev, material]);
  };

  const getDailyUpdate = async (): Promise<any> => {
    return fetchWrapper(`${businessApiUrl}/dailyUpdates`, {
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
    formData.append("material_id", material_id); //only here

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

  const getReports = async (selectedMaterial?: string): Promise<any[]> => {
    const queryParam = selectedMaterial
      ? `?material_id=${encodeURIComponent(selectedMaterial)}`
      : "";
    return fetchWrapper(`${businessApiUrl}/get-reports${queryParam}`, {
      method: "GET",
    });
  };

  const getMaterialPriceHistory = async (
    selectedMaterial?: string,
    region?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

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

  const updateTakeaway = async (
    id?: number,
    takeaway?: string
  ): Promise<any[]> => {
    return fetchWrapper(`${businessApiUrl}/update-takeaway`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, takeaway }),
    });
  };

  const getMaterialPrices = async (
    selectedMaterial?: string,
    region?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/material-prices${queryString}`, {
      method: "GET",
    });
  };

  const getRecomendations = async (
    selectedMaterial?: string,
    region?: string
  ): Promise<StrategyRecommendation> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/get-recommendation${queryString}`, {
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

  const uploadNewsHighlight = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return fetchWrapper(`${businessApiUrl}/upload-news-file`, {
      method: "POST",
      body: formData,
    });
  };

  const getDemandSupplyTrends = async (
    selectedMaterial?: string,
    region?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/demand-supply-trend${queryString}`, {
      method: "GET",
    });
  };

  const getNewsInsights = async (
    selectedMaterial?: string,
    region?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

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
    region?: string
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();

    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);
    if (region) queryParams.append("region", region);

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
  const { material_id, region, date, shutdown_from, shutdown_to } = updateData;

  if (!material_id || !region || !date) {
    throw new Error("Fields 'material_id', 'region', and 'date' are required.");
  }

  if (shutdown_from === undefined && shutdown_to === undefined) {
    throw new Error("At least one of 'shutdown_from' or 'shutdown_to' must be provided.");
  }

  return fetchWrapper(`${businessApiUrl}/shutdown-tracking`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
};


  const getProcurementPlan = async (
    PlantCode?: string,
    selectedMaterial?: string
  ): Promise<ProcurementPlanResponse> => {
    const queryParams = new URLSearchParams();

    if (PlantCode) queryParams.append("plant_code", PlantCode);
    if (selectedMaterial) queryParams.append("material_id", selectedMaterial);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/procurement-plan${queryString}`, {
      method: "GET",
    });
  };

  const getHistoricalPrices = async (
    materialCode: string,
    region: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);
    queryParams.append("region", region);

    return fetchWrapper(
      `${businessApiUrl}/historical-prices?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMinutesOfMeeting = async (materialCode: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/minutes-of-meeting?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getJointDevelopmentProjects = async (
    materialCode: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/joint-development-projects?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMultiplePointEngagemeants = async (
    materialCode: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

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
    materialCode: string,
    correlated_material_id?: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);
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
    materialCode: string
  ): Promise<{ years: string[]; buyer_names: string[] }> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/procurement-filters?${queryParams.toString()}`,
      { method: "GET" }
    );
  };

  const getInventoryLevels = async (materialCode: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/inventory-levels?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getVendorWiseActionPlan = async (
    materialCode: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/vendor-wise-action-plan?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
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
    materialCode,
    buyerName,
    year,
  }: {
    materialCode: string;
    buyerName?: string;
    year?: string;
  }): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);
    if (buyerName) queryParams.append("buyer_name", buyerName);
    if (year) queryParams.append("year", year);

    const result = await fetchWrapper(
      `${businessApiUrl}/procurement-history?${queryParams.toString()}`,
      { method: "GET" }
    );
    return result.data || [];
  };

  const getVendorKeyInformation = async (
    materialCode: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/vendor-key-information?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getMaterialSubtituteData = async (
    materialCode: string
  ): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

    return fetchWrapper(
      `${businessApiUrl}/material-substitutes?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  };

  const getFactPackData = async (materialCode: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);

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
    formData.append("materialCode", material_id);

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

  const getTradeData = async (material: string, year: number): Promise<any> => {
    const queryParams = new URLSearchParams();

    if (material) queryParams.append("material", material);
    if (year) queryParams.append("year", String(year));

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    return fetchWrapper(`${businessApiUrl}/trade-data${queryString}`, {
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
  const getPortersAnalysis = async (materialCode: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", materialCode);
    return fetchWrapper(
      `${businessApiUrl}/porters-analysis?${queryParams.toString()}`,
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

const getVendors = async (): Promise<any[]> => {
  return fetchWrapper(`${businessApiUrl}/get-vendors`, {
    method: "GET",
  });
}

const getNegotiationObjectives = async (vendor_name: string, date: string): Promise<any> => {
  const queryParams = new URLSearchParams();
  queryParams.append("vendor_name", vendor_name);
  queryParams.append("date", date);
  return fetchWrapper(`${businessApiUrl}/negotiation-objectives?${queryParams.toString()}`, {
    method: "GET",
  });
}
  
  const getSeasonalityTrends = async (material_id: string, region: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("material_id", material_id);
    queryParams.append("region", region);
    return fetchWrapper(`${businessApiUrl}/seasonality-trends?${queryParams.toString()}`, {
      method: "GET",
    });
  };

  const createNegotiationObjectives = async (
  vendor_name: string,
  date: string,
  objectives: NegotiationData
): Promise<any> => {
  return fetchWrapper(`${businessApiUrl}/create-negotiation-objectives`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vendor_name, date, objectives }),
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



  const contextValue = {
    uploadPDF,
    checkPDFStatus,
    getReports,
    getMaterials,
    addMaterial,
    getDailyUpdate,
    checkTiles,
    toggleTile,
    getMaterialPriceHistory,
    updateMaterialPriceHistory,
    getMaterialPrices,
    getRegions,
    getRecomendations,
    uploadPriceHistory,
    updateTakeaway,
    getDemandSupplyTrends,
    getNewsInsights,
    getNewsSupplierTracking,
    getHistoricalPrices,
    getShutdownTracking,
    getProcurementPlan,
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
    getNegotiationObjectives,
    createNegotiationObjectives,
    uploadSpendAnalysis
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
