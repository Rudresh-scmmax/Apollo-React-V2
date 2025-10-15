import React, { useEffect } from "react";

interface PlantSelectorProps {
  plantCodes: string[] | undefined;
  selectedPlantCode: string;
  setSelectedPlantCode: (plantCode: string) => void;
}

const PlantSelector: React.FC<PlantSelectorProps> = ({
  plantCodes,
  selectedPlantCode,
  setSelectedPlantCode,
}) => {
  useEffect(() => {
    if (plantCodes && plantCodes.length > 0 && !selectedPlantCode) {
      setSelectedPlantCode(plantCodes[0]);
    }
  }, [plantCodes, selectedPlantCode, setSelectedPlantCode]);

  return (
    <select
      className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
      value={selectedPlantCode}
      onChange={(e) => setSelectedPlantCode(e.target.value)}
    >
      <option>Select Plant</option>
      {plantCodes?.map((plantCode, index) => (
        <option key={index} value={plantCode}>
          {plantCode}
        </option>
      ))}
    </select>
  );
};

export default PlantSelector;