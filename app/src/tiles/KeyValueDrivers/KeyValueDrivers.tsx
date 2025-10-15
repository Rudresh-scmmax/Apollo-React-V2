import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useBusinessAPI, Material as BusinessMaterial } from "../../services/BusinessProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";

const KeyValueDrivers: React.FC = () => {
  const { getCorrelationMaterialPrice, getMaterials } = useBusinessAPI();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  // State for manual correlated material selection
  const [manualCorrelated, setManualCorrelated] = useState<string>("");

  const { data: materials, isLoading: isLoadingMaterials } = useQuery<BusinessMaterial[]>({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  // Query for correlation material price, passing correlated_material_id if selected
  const { data, isLoading } = useQuery({
    queryKey: [
      "correlation-material-price",
      selectedMaterial?.material_id,
      manualCorrelated,
    ],
    queryFn: () =>
      getCorrelationMaterialPrice(
        selectedMaterial?.material_id || "",
        manualCorrelated || undefined
      ),
    enabled: !!selectedMaterial?.material_id,
  });

  // Prepare chart data
  const keys = React.useMemo(() => Object.keys(data?.data || {}), [data]);
  const allMonths = React.useMemo(
    () =>
      Array.from(
        new Set(
          keys.flatMap((desc) =>
            (data?.data?.[desc] || []).map((row: any) => row.month)
          )
        )
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [data, keys]
  );

  const chartSeries = React.useMemo(
    () =>
      keys.map((desc) => ({
        name: desc,
        data: allMonths.map((month) => {
          const found = (data?.data?.[desc] || []).find(
            (row: any) => row.month === month
          );
          return found ? Number(found.price) : null;
        }),
      })),
    [data, keys, allMonths]
  );

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#228B22", "#FFA500", "#1E90FF", "#FF6347"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 5 },
    xaxis: {
      categories: allMonths,
      title: { text: "Time" },
      tooltip: { enabled: false },
    },
    yaxis: {
      title: { text: "Price" },
      min: 0,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Key Value Drivers for: {selectedMaterial?.material_description}
        </h1>
        <div>
          <label className="mr-2 font-medium">Compare with:</label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
            value={manualCorrelated}
            onChange={(e) => setManualCorrelated(e.target.value)}
            disabled={isLoadingMaterials}
          >
            <option value="">Auto (Most Correlated)</option>
            {materials
              ?.filter((mat) => mat.material_id !== selectedMaterial?.material_id)
              .map((material) => (
                <option key={material.material_id} value={material.material_id}>
                  {material.material_description}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="flex bg-white rounded-xl shadow p-8">
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-20">Loading chart...</div>
          ) : (
            <ReactApexChart
              options={options}
              series={chartSeries}
              type="line"
              height={350}
            />
          )}
          <div className="text-xs text-gray-500 mt-3">
            Note: Select a data point to view specific price details.
          </div>
        </div>
        <div className="w-1/3 pl-8 flex flex-col justify-start">
          <h2 className="font-bold text-lg mb-2">Key takeaways:</h2>
          <div className="text-gray-700 text-base mb-2">
            {data?.key_takeaway || "No key takeaway available."}
          </div>
          <span className="text-xs italic text-gray-400">
            Auto generated from correlation analysis
          </span>
        </div>
      </div>
    </div>
  );
};

export default KeyValueDrivers;