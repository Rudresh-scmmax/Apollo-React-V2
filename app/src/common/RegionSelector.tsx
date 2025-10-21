import React, { useEffect } from "react";

interface RegionSelectorProps {
  regions: {location_id: number, location_name: string}[] | undefined;
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
      setSelectedRegion(regions[0].location_name);
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
        <option key={index} value={region.location_name}>
          {region.location_name}
        </option>
      ))}
    </select>
  );
};

export default RegionSelector;