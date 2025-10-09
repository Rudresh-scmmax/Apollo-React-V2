import React, { useEffect } from "react";

interface RegionSelectorProps {
  regions: string[] | undefined;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  regions,
  selectedRegion,
  setSelectedRegion,
}) => {
  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0]);
    }
  }, [regions, selectedRegion, setSelectedRegion]);

  return (
    <select
      className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
      value={selectedRegion}
      onChange={(e) => setSelectedRegion(e.target.value)}
    >
      <option>Select Region</option>
      {regions?.map((region, index) => (
        <option key={index} value={region}>
          {region}
        </option>
      ))}
    </select>
  );
};

export default RegionSelector;