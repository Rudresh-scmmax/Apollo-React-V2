import React, { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FiSettings } from "react-icons/fi";
import UploadSpendAnalysis from "../../common/UploadSpendAnalysis";

const SpendAnalytics: React.FC = () => {
  const { getProcurementFilters, getProcurementHistory } = useBusinessAPI();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  // Dropdown state
  const [years, setYears] = useState<string[]>([]);
  const [buyers, setBuyers] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("All");
  const [showSettings, setShowSettings] = useState(false);

  // Procurement data
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch filters on mount
  useEffect(() => {
    if (selectedMaterial?.material_id) {
      getProcurementFilters(selectedMaterial.material_id).then((res) => {
        const yearsList = res.years && res.years.length > 0 ? res.years : [];
        setYears(["All", ...yearsList]);
        const buyersList =
          res.buyer_names && res.buyer_names.length > 0 ? res.buyer_names : [];
        setBuyers(["All", ...buyersList]);
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedYear && !selectedBuyer) return;
    setLoading(true);
    getProcurementHistory({
      materalId: selectedMaterial?.material_id ?? "",
      year: selectedYear === "All" ? "" : selectedYear,
      buyerName: selectedBuyer === "All" ? "" : selectedBuyer,
    })
      .then((res) => setHistory(res || []))
      .finally(() => setLoading(false));
  }, [selectedYear, selectedBuyer]);

  // Pie chart data by region (use plant_name)
  const pieData = useMemo(() => {
    const regionMap: Record<string, number> = {};
    history.forEach((row) => {
      const region = row.plant_name || "Unknown";
      regionMap[region] = (regionMap[region] || 0) + Number(row.quantity || 0);
    });
    return Object.entries(regionMap).map(([name, value]) => ({ name, value }));
  }, [history]);

  // Pie chart for value by region (use total_cost)
  const pieValueData = useMemo(() => {
    const regionMap: Record<string, number> = {};
    history.forEach((row) => {
      const region = row.plant_name || "Unknown";
      const value = Number(row.total_cost || 0);
      regionMap[region] = (regionMap[region] || 0) + value;
    });
    return Object.entries(regionMap).map(([name, value]) => ({ name, value }));
  }, [history]);

  // Bar/line chart data by month
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const barData = useMemo(() => {
    const quantity: number[] = Array(12).fill(0);
    const value: number[] = Array(12).fill(0);
    history.forEach((row) => {
      const date = new Date(row.purchase_date);
      const monthIdx = date.getMonth();
      quantity[monthIdx] += Number(row.quantity || 0);
      value[monthIdx] += Number(row.total_cost || 0);
    });
    return { quantity, value };
  }, [history]);

  // Chart options
  const pieOptions = {
    chart: { type: "pie" as const },
    labels: pieData.map((d) => d.name),
    legend: { position: "bottom" as const, height: 100 },
    noData: {
      text: "No data available",
      align: "center" as "center",
      verticalAlign: "middle" as "middle",
      style: { fontSize: "18px" },
    },
  };
  const pieValueOptions = {
    ...pieOptions,
    labels: pieValueData.map((d) => d.name),
  };
  const barOptions = {
    chart: {
      type: "bar" as const,
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: { bar: { horizontal: false, columnWidth: "40%" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: [0, 2], colors: ["#8BC34A", "#1976D2"] },
    xaxis: { categories: months },
    yaxis: [
      { title: { text: "Quantity (MT)" }, min: 0 },
      { opposite: true, title: { text: "Total Value" }, min: 0 },
    ],
    legend: { position: "top" as const },
    colors: ["#8BC34A", "#1976D2"],
    tooltip: { shared: true, intersect: false },
    noData: {
      text: "No data available",
      align: "center" as "center",
      verticalAlign: "middle" as "middle",
      style: { fontSize: "18px" },
    },
  };
  const barSeries = [
    { name: "Quantity (MT)", type: "column" as const, data: barData.quantity },
    { name: "Total Value", type: "line" as const, data: barData.value },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Spend Analytics for: {selectedMaterial?.material_description}
        </h1>
        <div className="flex gap-4">
          <select
            className="border border-orange-400 rounded px-3 py-1 bg-white"
            value={selectedBuyer}
            onChange={(e) => setSelectedBuyer(e.target.value)}
            disabled={buyers.length === 0}
          >
            {buyers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            className="border border-orange-400 rounded px-3 py-1 bg-white"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={years.length === 0}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            className="text-gray-600 hover:text-gray-900 text-2xl"
            onClick={() => setShowSettings((prev) => !prev)}
          >
            <FiSettings />
          </button>
        </div>
      </div>
      {showSettings && <UploadSpendAnalysis />}
      <div className="bg-white rounded-xl shadow p-8 flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-8 mb-4">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="font-semibold mb-2 text-center text-sm">
              Total Quantity of Imports from different Regions
            </span>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ReactApexChart
                options={pieOptions}
                series={pieData.length ? pieData.map((d) => d.value) : []}
                type="pie"
                height={320}
              />
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="font-semibold mb-2 text-center text-sm">
              Total Value of Imports from different Regions
            </span>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ReactApexChart
                options={pieValueOptions}
                series={
                  pieValueData.length ? pieValueData.map((d) => d.value) : []
                }
                type="pie"
                height={320}
              />
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <span className="font-semibold mb-2 block text-center text-sm">
            Total Value and Quantity (MT) by Year and Month
          </span>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ReactApexChart
              options={barOptions}
              series={
                barData.quantity.some((v) => v > 0) ||
                barData.value.some((v) => v > 0)
                  ? barSeries
                  : []
              }
              type="line"
              height={300}
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendAnalytics;
