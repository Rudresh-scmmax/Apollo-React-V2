import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";
import HistoricalPriceChart from "./HistoricalPriceChart";
import { FiSettings } from "react-icons/fi";
import UploadSettings from "../../common/UploadSettings";

const CyclicalPatterns: React.FC = () => {
  const { getRegions, getHistoricalPrices } = useBusinessAPI();
  const navigate = useNavigate();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const [showSettings, setShowSettings] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const { data: regions } = useQuery<{location_id: number, location_name: string}[]>({
    queryKey: ["regions", selectedMaterial?.material_id],
    queryFn: () => getRegions(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  const { data: priceHistory, isLoading: isPriceLoading } = useQuery({
    queryKey: [
      "historicalPrices",
      selectedMaterial?.material_id,
      selectedLocationId,
    ],
    queryFn: () =>
      getHistoricalPrices(
        selectedMaterial?.material_id || "",
        selectedLocationId?.toString() || ""
      ),
    enabled: !!selectedMaterial?.material_id && selectedLocationId !== null,
  });

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && selectedLocationId === null) {
      setSelectedLocationId(regions[0].location_id);
    }
  }, [regions, selectedLocationId]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Cyclical Patterns for:{" "}
          {selectedMaterial?.material_description || "All Material"}
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

          <button
            className="text-gray-600 hover:text-gray-900 text-2xl"
            onClick={() => setShowSettings((prev) => !prev)}
          >
            <FiSettings />
          </button>
        </div>
      </div>
      {showSettings && <UploadSettings />}
      <div className="flex bg-white rounded-xl shadow p-8">
        <div className="flex-1">
          {selectedMaterial && selectedLocationId !== null && (
            <HistoricalPriceChart
              priceHistory={priceHistory}
              isLoading={isPriceLoading}
            />
          )}
        </div>
        <div className="w-1/3 pl-8 flex flex-col justify-start">
          <h2 className="font-bold text-lg mb-2">Key takeaways:</h2>
          <ul className="text-gray-700 text-base mb-2">
            <li>{priceHistory?.takeaway}</li>
          </ul>
          <span className="text-xs italic text-gray-400">
            Auto populated based on cyclical patterns in historical data
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyclicalPatterns;
