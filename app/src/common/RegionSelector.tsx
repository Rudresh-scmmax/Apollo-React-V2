import React, { useEffect, useState, useRef } from "react";

interface RegionSelectorProps {
  regions: {location_id: number, location_name: string}[] | undefined;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  placeholder?: string;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  regions,
  selectedRegion,
  setSelectedRegion,
  placeholder = "Select Region",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0].location_name);
    }
  }, [regions, selectedRegion, setSelectedRegion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRegions =
    regions?.filter((region) =>
      region.location_name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="border border-gray-300 rounded-lg px-4 py-2 bg-white cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedRegion || placeholder}
      </div>

      {open && (
        <div className="absolute z-20 bg-white border border-gray-300 rounded-lg mt-1 w-full shadow-md max-h-60 overflow-y-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search regions..."
            className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
          />
          {filteredRegions.length > 0 ? (
            filteredRegions.map((region) => (
              <div
                key={region.location_id}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedRegion(region.location_name);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {region.location_name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionSelector;