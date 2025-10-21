import React, { useEffect, useState } from "react";
import EditableMaterialTable from "./Table/PricingHistoryTable";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import GlycerinePriceChart from "./Chart/LineChart";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";
import {  FiSettings } from "react-icons/fi";
import RegionSelector from "../../common/RegionSelector";
import ModelSelector from "../../common/ModelSelector";
import UploadSettings from "../../common/UploadSettings";

const NegotiationWindow: React.FC = () => {
  const navigate = useNavigate();
  const { getRegions } = useBusinessAPI();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("Best");
  const [showSettings, setShowSettings] = useState(false);

  const models = [
    "Best",
    "SARIMA", 
    "Linear Regression",
    "Random Forest",
    "XGBoost",
    "N-BEATS"
  ];


  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  const { data: regions } = useQuery<{location_id: number, location_name: string}[]>({
    queryKey: ["regions", selectedMaterial?.material_id],
    queryFn: () => getRegions(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  useEffect(() => {
    if (regions && regions.length > 0 && selectedLocationId === null) {
      setSelectedLocationId(regions[0].location_id);
    }
  }, [regions, selectedLocationId]);


  if (!selectedMaterial) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Price Forecast for: {selectedMaterial?.material_description || ""}
          </h1>

          <div className="flex items-center gap-4">
            <RegionSelector
              regions={regions}
              selectedRegion={regions?.find(loc => loc.location_id === selectedLocationId)?.location_name || ""}
              setSelectedRegion={(locationName: string) => {
                const location = regions?.find(loc => loc.location_name === locationName);
                if (location) {
                  setSelectedLocationId(location.location_id);
                }
              }}
            />

            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />

            <button
              className="text-gray-600 hover:text-gray-900 text-2xl"
              onClick={() => setShowSettings((prev) => !prev)}
            >
              <FiSettings />
            </button>
          </div>
        </div>
        {showSettings && <UploadSettings />}

      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Glycerine Price Trend & Forecast
        </h2>
        <GlycerinePriceChart locationId={selectedLocationId} model={selectedModel} />
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Price Data & Supply Insights
        </h2>
        <EditableMaterialTable locationId={selectedLocationId} />
      </div>
    </div>
  );
};

export default NegotiationWindow;
