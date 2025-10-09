interface ReportData {
  id: number;
  published_date: string;
  publication: string;
  report_link: string;
  upload_user_email: string;
  update_user_email: string | null;
  takeaway: string;
}

interface Material {
  id: string;
  name: string;
}

interface Tile {
  name: string;
  active: boolean;
}

interface DailyUpdate {
  category: string;
  // headline: string;
  summary: string;
  // impact: "positive" | "negative" | "neutral";
  timeframe: string;
}


interface ProcurementPlanData {
  material_code: string;
  material_description: string;
  plant_code: string;
  safety_stock: string;
  opening_stock: string;
  [month: string]: string; // dynamic months
}

interface ProcurementPlanResponse {
  message: string;
  data: ProcurementPlanData[];
}

interface PriceHistoryTrendResponse {
  message: string;
  data: ProcurementPlanData[];
}

type ShutdownTrackingUpdateInput = {
  material_code: string;
  region: string;
  date: string; // in YYYY-MM-DD format
  shutdown_from?: string; // optional ISO datetime or date string
  shutdown_to?: string;   // optional ISO datetime or date string
};

interface VendorKeyInfoUpdate {
  supplier_name: string;
  supplier_site: string;
  capacity_mn_tons?: string;
  capacity_expansion_plans?: string;
  fta_benefit?: string;
  remarks?: string;
}

interface NegotiationData {
  // vendor: string;
  // date: string;
  objective: string;
  tco: {
    pastPeriod: string;
    current: string;
    forecast: string;
  };
  cleanSheetPrice: {
    routeA: {
      pastPeriod: string;
      current: string;
      forecast: string;
    };
    routeB: {
      pastPeriod: string;
      current: string;
      forecast: string;
    };
  };
  importExportData: {
    import: {
      pastPeriod: string;
      current: string;
      forecast: string;
    };
    export: {
      pastPeriod: string;
      current: string;
      forecast: string;
    };
  };
  targetNegotiation: {
    min: string;
    max: string;
  };
  wishlists: {
    wishlist: {
      paymentTerms: { levers: string; remarks: string };
      security: { levers: string; remarks: string };
    };
    concession: {
      paymentTerms: { levers: string; remarks: string };
      security: { levers: string; remarks: string };
    };
  };
  strategy: {
    supplierSOB: string;
    whatWeWant: string;
    whatTheyWant: string;
    whatWeWantToAvoid: string;
    whatTheyWantToAvoid: string;
  };
  marketUpdate: {
    myInfo: string;
    questionsToAsk: string;
  };
}

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

interface NegotiationObjectivesResponse {
  vendor_name: string;
  date: string;
  objectives: NegotiationData;
}
