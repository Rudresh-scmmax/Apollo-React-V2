import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { Select } from "antd";
import PriceTrendChart from "./PriceTrendChart";

const { Option } = Select;

// Types for API responses
type PriceSeries = {
  name: string;
  prices: { [month: string]: number };
};
type PriceHistoryTrendResponse = {
  data: PriceSeries[];
};
type SupplierTrendResponse = {
  data: PriceSeries[];
};

const PriceBenchmarking: React.FC = () => {
  const navigate = useNavigate();
  const { getPriceHistoryTrend, getSupplierTrend } = useBusinessAPI();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const { data: priceHistoryTrend, isLoading: isMarketLoading } =
    useQuery<PriceHistoryTrendResponse>({
      queryKey: [
        "priceHistoryTrend",
        selectedYear,
        selectedMaterial?.material_id,
      ],
      queryFn: () =>
        getPriceHistoryTrend(
          selectedYear,
          selectedMaterial?.material_id || ""
        ),
      enabled: !!selectedYear && !!selectedMaterial?.material_id,
    });

  const { data: supplierTrend, isLoading: isSupplierLoading } =
    useQuery<SupplierTrendResponse>({
      queryKey: [
        "supplierTrend",
        selectedYear,
        selectedMaterial?.material_id,
      ],
      queryFn: () =>
        getSupplierTrend(selectedYear, selectedMaterial?.material_id || ""),
      enabled: !!selectedYear && !!selectedMaterial?.material_id,
    });

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {selectedMaterial?.material_description || ""} Price Trends:
        </h1>
        <Select
          value={selectedYear}
          onChange={(year: number) => setSelectedYear(year)}
          style={{ width: 120 }}
        >
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <div className="bg-white rounded-xl shadow p-8">
          <PriceTrendChart
            supplierData={supplierTrend?.data || []}
            marketData={priceHistoryTrend?.data || []}
          />
        </div>

        {(isMarketLoading || isSupplierLoading) && (
          <div className="text-center text-gray-500 mt-4">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default PriceBenchmarking;
