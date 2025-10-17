import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";

import NegotiationHeader from "./NegotiationHeader";
import VendorDateSelector from "./VendorDateSelector";
import ObjectiveCard from "./ObjectiveCard";
import TcoTable from "./TcoTable";
import CleanSheetPriceTable from "./CleanSheetPriceTable";
import ImportExportTable from "./ImportExportTable";
import TargetNegotiationTable from "./TargetNegotiationTable";
import WishlistConcession from "./WishlistConcession";
import StrategyTable from "./StrategyTable";
import MarketUpdateTable from "./MarketUpdateTable";
import SaveButton from "./SaveButton";
import { Button, Card, message, Alert } from "antd";

interface SelectedMaterial {
  material_id: string;
  material_description: string;
}

type NegotiationData = {
  objective: string;
  tco: Array<{
    materialName: string;
    pastPeriod: string;
    current: string;
    forecast: string;
  }>;
  cleanSheetPrice: {
    routeA: { pastPeriod: string; current: string; forecast: string };
    routeB: { pastPeriod: string; current: string; forecast: string };
  };
  importExportData: {
    import: { pastPeriod: string; current: string; forecast: string };
    export: { pastPeriod: string; current: string; forecast: string };
  };
  targetNegotiation: {
    min_value: number;
    max_value: number;
    min_source: string;
    max_source: string;
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
    whatWeWantToAvoid: string;
    whatTheyWantToAvoid: string;
  };
  marketUpdate: {
    myInfo: string;
    questionsToAsk: string;
  };
};

const initialNegotiationData: NegotiationData = {
  objective: "",
  tco: [
    {
      materialName: "",
      pastPeriod: "",
      current: "",
      forecast: "",
    },
  ],
  cleanSheetPrice: {
    routeA: { pastPeriod: "", current: "", forecast: "" },
    routeB: { pastPeriod: "", current: "", forecast: "" },
  },
  importExportData: {
    import: { pastPeriod: "", current: "", forecast: "" },
    export: { pastPeriod: "", current: "", forecast: "" },
  },
  targetNegotiation: {
    min_value: 0,
    max_value: 0,
    min_source: "",
    max_source: "",
  },
  wishlists: {
    wishlist: {
      paymentTerms: { levers: "", remarks: "" },
      security: { levers: "", remarks: "" },
    },
    concession: {
      paymentTerms: { levers: "", remarks: "" },
      security: { levers: "", remarks: "" },
    },
  },
  strategy: {
    supplierSOB: "",
    whatWeWantToAvoid: "",
    whatTheyWantToAvoid: "",
  },
  marketUpdate: {
    myInfo: "",
    questionsToAsk: "",
  },
};

const NegotiationObjectives: React.FC = () => {
  const { 
    getVendors, 
    getNegotiationObjectives, 
    createNegotiationObjectives, 
    getMaterials, 
    getTargetNegotiation, 
    getTcoPrices, 
    getShouldBePrice, 
    getExportPrice, 
    getImportPrice, 
    refreshRecommendation, 
    negotiationRecommendations 
  } = useBusinessAPI();

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const getGlobalSetMaterial = useSelector((state: RootState) => state.material.globalSelectedMaterial);
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(getGlobalSetMaterial);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationStatus, setRecommendationStatus] = useState<string | null>(null);

  const [date, setDate] = useState<string | null>(null);
  const [vendor, setVendor] = useState<string>("");

  const { data: materials, isLoading: isLoadingMaterials } = useQuery<SelectedMaterial[]>({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  const { data: vendorsData = [] } = useQuery<string[]>({
    queryKey: ["vendorsData", selectedMaterial?.material_id || ""],
    queryFn: () => getVendors(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  const { data: targetNegotiation } = useQuery<{ min_value: number; max_value: number, min_source: string, max_source: string }>({
    queryKey: ["targetNegotiation", selectedMaterial?.material_id, date, vendor],
    queryFn: () => getTargetNegotiation(selectedMaterial?.material_id || "", date || "", vendor || ""),
    enabled: !!selectedMaterial?.material_id && !!date && !!vendor,
  });

  const { data: shouldBePrice } = useQuery<{
    current: number;
    forecast: number;
    pastPeriod: number;
  }>({
    queryKey: ["shouldBePrice", selectedMaterial?.material_id, date],
    queryFn: () => getShouldBePrice(selectedMaterial?.material_id || "", date || ""),
    enabled: !!selectedMaterial?.material_id && !!date,
  });

  const { data: exportPrice } = useQuery<{
    current: number;
    forecast: number;
    pastPeriod: number;
  }>({
    queryKey: ["exportPrice", selectedMaterial?.material_id, date],
    queryFn: () => getExportPrice(selectedMaterial?.material_id || "", date || ""),
    enabled: !!selectedMaterial?.material_id && !!date,
  });

  const { data: importPrice } = useQuery<{
    current: number;
    forecast: number;
    pastPeriod: number;
  }>({
    queryKey: ["importPrice", selectedMaterial?.material_id, date],
    queryFn: () => getImportPrice(selectedMaterial?.material_id || "", date || ""),
    enabled: !!selectedMaterial?.material_id && !!date,
  });

  const { data: negotiationObjectives, isLoading: isLoadingObjectives } = useQuery({
    queryKey: ["negotiationObjectives", vendor || "", date || ""],
    queryFn: () => getNegotiationObjectives(vendor || "", date || ""),
    enabled: !!vendor && !!date,
  });

  const { data: negotiationRecommendationsData, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ["negotiationRecommendations", vendor || "", date || ""],
    queryFn: () => negotiationRecommendations(vendor || "", date || "", selectedMaterial?.material_id || ""),
    enabled: !!vendor && !!date && !!selectedMaterial?.material_id,
  });

  console.log("negotiationRecommendationsData: ", negotiationRecommendationsData);

  const { data: tcoPrices } = useQuery({
    queryKey: ["tcoPrices", vendor || "", date || ""],
    queryFn: () => getTcoPrices(vendor || "", date || ""),
    enabled: !!vendor && !!date,
  });

  console.log("tcoPrices: ", tcoPrices);

  const [data, setData] = useState<NegotiationData>(initialNegotiationData);

  // Update state whenever API data arrives
  useEffect(() => {
    setData((prev) => {
      let updated = { ...prev };

      // Negotiation objectives (objective, strategy, marketUpdate, wishlists)
      if (negotiationObjectives?.objectives) {
        updated = {
          ...updated,
          ...negotiationObjectives.objectives,
        };
      }

      // Target Negotiation
      if (targetNegotiation) {
        updated.targetNegotiation = {
          min_value: targetNegotiation?.min_value ?? 0,
          max_value: targetNegotiation?.max_value ?? 0,
          min_source: targetNegotiation?.min_source ?? "",
          max_source: targetNegotiation?.max_source ?? "",
        };
      }

      // Clean sheet price (routeA)
      if (shouldBePrice) {
        updated.cleanSheetPrice.routeA = {
          pastPeriod: formatTo2DecimalString(shouldBePrice.pastPeriod),
          current: formatTo2DecimalString(shouldBePrice.current),
          forecast: "",
        };
      }

      // Import/Export
      if (importPrice) {
        updated.importExportData.import = {
          pastPeriod: formatTo2DecimalString(importPrice.pastPeriod),
          current: formatTo2DecimalString(importPrice.current),
          forecast: formatTo2DecimalString(importPrice.forecast),
        };
      }
      if (exportPrice) {
        updated.importExportData.export = {
          pastPeriod: formatTo2DecimalString(exportPrice.pastPeriod),
          current: formatTo2DecimalString(exportPrice.current),
          forecast: formatTo2DecimalString(exportPrice.forecast),
        };
      }

      // TCO prices
      if (tcoPrices?.tco?.length) {
        updated.tco = tcoPrices.tco.map((item: any) => ({
          materialName: item.materialName,
          pastPeriod: item.pastPeriod?.toString() || "",
          current: item.current?.toString() || "",
          forecast: item.forecast?.toString() || "",
        }));
      }

      // ✅ FIX: Only update recommendations if they're complete (not in processing state)
      if (negotiationRecommendationsData) {
        // Check if response is in processing state
        if (negotiationRecommendationsData.status === "processing") {
          setRecommendationStatus(
            negotiationRecommendationsData.message || 
            "Recommendations are being generated. Please wait..."
          );
          // Don't update the data - just return current state
          return updated;
        }

        // Clear processing status if we got actual data
        setRecommendationStatus(null);

        // Update strategy only if data exists
        if (negotiationRecommendationsData.strategy) {
          updated.strategy = {
            ...updated.strategy,
            whatWeWantToAvoid:
              negotiationRecommendationsData.strategy.whatWeWantToAvoid || "",
            whatTheyWantToAvoid:
              negotiationRecommendationsData.strategy.whatTheyWantToAvoid || "",
          };
        }

        // Update market update only if data exists
        if (negotiationRecommendationsData.marketUpdate) {
          updated.marketUpdate = {
            ...updated.marketUpdate,
            questionsToAsk:
              negotiationRecommendationsData.marketUpdate.questionsToAsk || "",
          };
        }
      }

      return updated;
    });
  }, [negotiationObjectives, targetNegotiation, shouldBePrice, importPrice, exportPrice, tcoPrices, negotiationRecommendationsData]);

  console.log("data", data);

  // Initialize vendor select if vendorsData fills
  useEffect(() => {
    if (vendorsData.length > 0) {
      setVendor(vendorsData[0]);
    }
    if (vendorsData.length === 0) {
      setVendor("");
    }
  }, [vendorsData]);

  const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

  const updateNestedValue = (path: string[], value: string) => {
    setData((prev) => {
      const newData = deepClone(prev);
      let current: any = newData;

      for (let i = 0; i < path.length - 1; i++) {
        if (!(path[i] in current)) current[path[i]] = {};
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const formatTo2DecimalString = (val: number | string | undefined): string => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return typeof num === "number" && isFinite(num) ? num.toFixed(2) : "";
  };

  const handleSave = async () => {
    if (!vendor || !date) {
      message.error("Please select vendor and date");
      return;
    }
    setLoading(true);
    try {
      await createNegotiationObjectives(vendor, date, data, selectedMaterial?.material_id || "");
      message.success("Negotiation objectives saved successfully!");
    } catch (e) {
      console.error("Error saving data:", e);
      message.error("Failed to save data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      if (!vendor || !date || !selectedMaterial?.material_id) {
        return message.error("Please select material, vendor and date first");
      }
      
      setLoadingRecommendations(true);
      setRecommendationStatus("Generating recommendations...");

      const res = await refreshRecommendation(vendor, date, selectedMaterial.material_id);

      console.log("API Response:", res);

      // Check if recommendations are being processed
      if (res?.status === "processing") {
        message.info(res.message || "Recommendations are being generated. Please wait...");
        
        // Poll for completion every 5 seconds
        const pollInterval = setInterval(async () => {
          try {
            await queryClient.invalidateQueries({
              queryKey: ["negotiationRecommendations", vendor, date],
            });
            
            const latestData = queryClient.getQueryData([
              "negotiationRecommendations", 
              vendor, 
              date
            ]) as any;
            
            // If status is no longer "processing", stop polling
            if (latestData && latestData.status !== "processing") {
              clearInterval(pollInterval);
              setLoadingRecommendations(false);
              setRecommendationStatus(null);
              message.success("Recommendations triggered successfully!");
            }
          } catch (err) {
            console.error("Polling error:", err);
            clearInterval(pollInterval);
            setLoadingRecommendations(false);
            setRecommendationStatus(null);
          }
        }, 5000); // Poll every 5 seconds

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setLoadingRecommendations(false);
          setRecommendationStatus(null);
        }, 120000);
        
      } else {
        // Recommendations generated immediately
        message.success("Recommendations generated successfully");
        setRecommendationStatus(null);
        await queryClient.invalidateQueries({
          queryKey: ["negotiationRecommendations", vendor, date],
        });
        setLoadingRecommendations(false);
      }
      
    } catch (err) {
      console.error("Error generating recommendations:", err);
      message.error("Failed to generate recommendations");
      setLoadingRecommendations(false);
      setRecommendationStatus(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <style>
        {`
          .custom-table .ant-table-thead > tr > th {
            background-color: #a0bf3f !important;
            color: white !important;
            font-weight: bold;
            text-align: center;
          }
          .custom-table .ant-table-tbody > tr > td {
            padding: 12px;
          }
          .custom-table .ant-table-tbody > tr > td:first-child {
            background-color: #f5f5f5;
            font-weight: 500;
          }
        `}
      </style>

      {/* Header and material selector */}
      <NegotiationHeader 
        selectedMaterial={selectedMaterial} 
        materials={materials || []} 
        onMaterialChange={setSelectedMaterial} 
      />

      {/* Vendor and Date selectors */}
      <Card className="mb-6">
        <VendorDateSelector 
          vendor={vendor} 
          date={date} 
          vendors={vendorsData} 
          onVendorChange={setVendor} 
          onDateChange={setDate} 
        />
      </Card>

      {/* Processing Status Alert */}
      {recommendationStatus && (
        <Alert
          message="Generating Recommendations"
          description={recommendationStatus}
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      {/* Objective Card */}
      <Card className="mb-6">
        <ObjectiveCard 
          vendor={vendor} 
          objective={data.objective} 
          onChange={(val) => setData((prev) => ({ ...prev, objective: val }))} 
        />
      </Card>

      {/* TCO Section */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">1. Market Price</h3>
        <TcoTable data={data.tco} onChange={updateNestedValue} />
      </Card>

      {/* Clean Sheet Price */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">2. Should be cost from Cost sheet</h3>
        <CleanSheetPriceTable 
          routeA={data.cleanSheetPrice.routeA} 
          routeB={data.cleanSheetPrice.routeB} 
          onChange={updateNestedValue} 
        />
      </Card>

      {/* Import/Export Data */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">3. Import/Export Data Analysis</h3>
        <ImportExportTable 
          importData={data.importExportData.import} 
          exportData={data.importExportData.export} 
          onChange={updateNestedValue} 
        />
      </Card>

      {/* Target Negotiation Window */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">4. Target negotiation window</h3>
        <TargetNegotiationTable
          targetValues={data.targetNegotiation}
          onChange={updateNestedValue}
        />
      </Card>

      {/* Wishlists and Concessions */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">5. Wishlists and Concessions</h3>
        <WishlistConcession wishlists={data.wishlists} onChange={updateNestedValue} />
      </Card>

      {/* Generate Recommendations Button */}
      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          onClick={handleGenerateRecommendations}
          loading={loadingRecommendations}
          disabled={!selectedMaterial?.material_id || !vendor || !date}
          style={{ 
            backgroundColor: "#ff7a00", 
            borderColor: "#ff7a00", 
            fontSize: "16px", 
            height: "45px", 
            paddingLeft: "30px", 
            paddingRight: "30px" 
          }}>
          <span style={{ color: "white" }}>
            {loadingRecommendations ? "Generating..." : "Generate Recommendations"}
          </span>
        </Button>
      </div>

      {/* Strategy Section */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">6. Strategy</h3>
        <StrategyTable
          strategy={data.strategy}
          onChange={updateNestedValue}
          isLoadingAvoids={loadingRecommendations}
        />
      </Card>

      {/* Market Update Section */}
      <Card className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">7. Market Update</h3>
        <MarketUpdateTable marketUpdate={data.marketUpdate} onChange={updateNestedValue} />
      </Card>

      {/* Save Button */}
      <SaveButton onSave={handleSave} loading={loading} />
    </div>
  );
};

export default NegotiationObjectives;