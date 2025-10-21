import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";

function getColor(value: number, min: number, max: number) {
  // Green for low, orange for high, interpolate
  if (value == null || isNaN(value)) return "#f3f4f6";
  const percent = (value - min) / (max - min + 0.0001);
  if (percent < 0.5) {
    // green to yellow
    const g = 200 + Math.round(55 * percent * 2);
    const r = 255;
    return `rgb(${r},${g},100)`;
  } else {
    // yellow to orange
    const r = 255;
    const g = 255 - Math.round(155 * (percent - 0.5) * 2);
    return `rgb(${r},${g},100)`;
  }
}

const SeasonalityTrends: React.FC = () => {
  const { getRegions, getSeasonalityTrends } = useBusinessAPI();
  const navigate = useNavigate();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  const { data: regions } = useQuery<{location_id: number, location_name: string}[]>({
    queryKey: ["regions", selectedMaterial?.material_id],
    queryFn: () => getRegions(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  type SeasonalityData = {
    months: { month: string; [year: number]: number | null }[];
    years: number[];
    regions: string[];
  };

  const {
    data: seasonalityDataRaw,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "seasonality-trends",
      selectedMaterial?.material_id,
      selectedRegion,
    ],
    queryFn: () =>
      getSeasonalityTrends(
        selectedMaterial?.material_id!,
        selectedRegion
      ),
    enabled: !!selectedMaterial?.material_id && !!selectedRegion,
  });

  const seasonalityData: SeasonalityData = (seasonalityDataRaw && typeof seasonalityDataRaw === 'object' && 'months' in seasonalityDataRaw && 'years' in seasonalityDataRaw && 'regions' in seasonalityDataRaw)
    ? seasonalityDataRaw as SeasonalityData
    : { months: [], years: [], regions: [] };

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0].location_name);
    }
  }, [regions, selectedRegion]);

  useEffect(() => {
    if (seasonalityData.years && seasonalityData.years.length > 0) {
      setSelectedYears(seasonalityData.years);
    }
  }, [seasonalityData]);

  // Find min/max for color scale
  let min = Infinity,
    max = -Infinity;
  if (seasonalityData.months) {
    for (const row of seasonalityData.months) {
      for (const y of seasonalityData.years) {
        const v = row[y];
        if (typeof v === "number") {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Seasonality Trends for: {selectedMaterial?.material_description || "All Material"}
        </h1>
        <RegionSelector
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      </div>
      <div className="flex items-center mb-4 gap-4">
        <span className="font-medium">Year(s):</span>
        {seasonalityData.years?.map((year: number) => (
          <label key={year} className="mr-2">
            <input
              type="checkbox"
              checked={selectedYears.includes(year)}
              onChange={e => {
                setSelectedYears(ys =>
                  e.target.checked
                    ? [...ys, year]
                    : ys.filter(y => y !== year)
                );
              }}
            />
            <span className="ml-1">{year}</span>
          </label>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center w-full">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error loading data</div>
        ) : seasonalityData.months?.length ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-max border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="px-3 py-2 border" style={{ background: '#b6d44b', color: '#fff' }}>Year</th>
                  {seasonalityData.months.map((row: any) => (
                    <th key={row.month} className="px-3 py-2 border" style={{ background: '#b6d44b', color: '#fff' }}>
                      {row.month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonalityData.years
                  .filter((y: number) => selectedYears.includes(y))
                  .map((year: number) => {
                    // Find the max price for this year (row), robustly, converting strings to numbers
                    let maxVal = -Infinity;
                    seasonalityData.months.forEach((row: any) => {
                      const raw = row[year];
                      const v = raw !== null && raw !== undefined ? Number(raw) : NaN;
                      if (!isNaN(v)) {
                        if (v > maxVal) maxVal = v;
                      }
                    });
                    console.log('Year:', year, 'Max:', maxVal);
                    return (
                      <tr key={year}>
                        <td className="px-3 py-2 border font-semibold" style={{ background: '#e6f4ea' }}>{year}</td>
                        {seasonalityData.months.map((row: any) => {
                          const value = row[year];
                          const numValue = value !== null && value !== undefined ? Number(value) : NaN;
                          const isMax = numValue === maxVal && !isNaN(numValue);
                          return (
                            <td
                              key={row.month}
                              className="px-3 py-2 border text-center font-medium"
                              style={{
                                background: isMax ? '#fde68a' : '#e6f4ea', // yellow for max, green for others
                                color: isMax ? '#000' : undefined,
                                fontWeight: isMax ? 'bold' : undefined,
                              }}
                            >
                              {value != null ? value : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No data available.</div>
        )}
      </div>
    </div>
  );
};

export default SeasonalityTrends; 