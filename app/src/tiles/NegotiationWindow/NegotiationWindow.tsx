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
import UploadSettings from "../../common/UploadSettings";

const NegotiationWindow: React.FC = () => {
  const navigate = useNavigate();
  const { getRegions } = useBusinessAPI();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);


  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  const { data: regions } = useQuery<string[]>({
    queryKey: ["regions", selectedMaterial?.material_id],
    queryFn: () => getRegions(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0]);
    }
  }, [regions, selectedRegion]);


  if (!selectedMaterial) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Negotiation Window for: {selectedMaterial?.material_description || ""}
          </h1>

          <div className="flex items-center gap-4">
            <RegionSelector
              regions={regions}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
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
        <GlycerinePriceChart region={selectedRegion} />
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Price Data & Supply Insights
        </h2>
        <EditableMaterialTable region={selectedRegion} />
      </div>
    </div>
  );
};

export default NegotiationWindow;
