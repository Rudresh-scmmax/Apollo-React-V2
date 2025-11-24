import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useBusinessAPI, Material as BusinessMaterial } from "../../services/BusinessProvider";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { setGlobalSelectedMaterial } from "../../store/materialSlice";
import { useQuery } from "@tanstack/react-query";
import MaterialSelect from "../../common/MaterialSelect";

const KeyValueDrivers: React.FC = () => {
  const { getCorrelationMaterialPrice, getMaterials } = useBusinessAPI();
  const dispatch = useDispatch();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  // State for manual correlated material selection
  const [manualCorrelated, setManualCorrelated] = useState<BusinessMaterial | null>(null);

  const { data: materials, isLoading: isLoadingMaterials } = useQuery<BusinessMaterial[]>({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  // Query for correlation material price, passing correlated_material_id if selected
  const { data, isLoading } = useQuery({
    queryKey: [
      "correlation-material-price",
      selectedMaterial?.material_id,
      manualCorrelated?.material_id,
    ],
    queryFn: () =>
      getCorrelationMaterialPrice(
        selectedMaterial?.material_id || "",
        manualCorrelated?.material_id || undefined
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

  // Identify primary and correlated material keys
  const primaryMaterialKey = React.useMemo(() => {
    if (!selectedMaterial || !keys.length) return null;
    // Try to match by material description
    const match = keys.find(
      (key) => key.toLowerCase() === selectedMaterial.material_description?.toLowerCase()
    );
    return match || keys[0]; // Fallback to first key if no match
  }, [selectedMaterial, keys]);

  const correlatedMaterialKey = React.useMemo(() => {
    if (!keys.length) return null;
    if (manualCorrelated) {
      // Try to match manually selected correlated material
      const match = keys.find(
        (key) => key.toLowerCase() === manualCorrelated.material_description?.toLowerCase()
      );
      return match || null;
    }
    // If no manual selection, find the key that's not the primary
    return keys.find((key) => key !== primaryMaterialKey) || null;
  }, [keys, primaryMaterialKey, manualCorrelated]);

  const chartSeries = React.useMemo(
    () => {
      // Sort keys to ensure primary comes first, then correlated
      const sortedKeys = [...keys].sort((a, b) => {
        if (a === primaryMaterialKey) return -1;
        if (b === primaryMaterialKey) return 1;
        if (a === correlatedMaterialKey) return -1;
        if (b === correlatedMaterialKey) return 1;
        return 0;
      });

      return sortedKeys.map((desc) => {
        const isPrimary = desc === primaryMaterialKey;
        const isCorrelated = desc === correlatedMaterialKey;
        
        return {
          name: desc,
          data: allMonths.map((month) => {
            const found = (data?.data?.[desc] || []).find(
              (row: any) => row.month === month
            );
            return found ? Number(found.price) : null;
          }),
          // Assign to secondary y-axis if it's the correlated material
          yAxisIndex: isCorrelated ? 1 : 0,
          // Assign color: primary = green, correlated = orange
          color: isPrimary ? "#228B22" : isCorrelated ? "#FFA500" : undefined,
        };
      });
    },
    [data, keys, allMonths, primaryMaterialKey, correlatedMaterialKey]
  );

  // Build colors array based on series order
  const chartColors = React.useMemo(() => {
    return chartSeries.map((series) => series.color || "#1E90FF");
  }, [chartSeries]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    // Colors array must match series order: primary (green) first, then correlated (orange)
    colors: chartColors,
    dataLabels: { enabled: false },
    stroke: { 
      curve: "smooth", 
      width: 3,
    },
    markers: { size: 5 },
    xaxis: {
      categories: allMonths,
      title: { text: "Time" },
      tooltip: { enabled: false },
    },
    yaxis: [
      {
        // Primary y-axis for primary material
        title: { 
          text: primaryMaterialKey || "Price",
          style: { color: "#228B22" }
        },
        min: 0,
        labels: {
          style: { colors: "#228B22" }
        }
      },
      {
        // Secondary y-axis for correlated material
        opposite: true,
        title: { 
          text: correlatedMaterialKey ? `${correlatedMaterialKey} (Secondary)` : "Price (Secondary)",
          style: { color: "#FFA500" }
        },
        min: 0,
        labels: {
          style: { colors: "#FFA500" }
        }
      }
    ],
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
          Key Value Drivers
        </h1>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="font-medium">Compare with:</label>
            <MaterialSelect
              materials={
                materials?.filter(
                  (mat) => mat.material_id !== selectedMaterial?.material_id
                ) || []
              }
              selectedMaterial={manualCorrelated}
              onSelect={(selected) => {
                setManualCorrelated(selected);
              }}
              placeholder="Auto (Most Correlated)"
            />
          </div>
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