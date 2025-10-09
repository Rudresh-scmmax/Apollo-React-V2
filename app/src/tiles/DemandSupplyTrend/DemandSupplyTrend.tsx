import React, { useEffect, useState } from "react";
import { Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";

const DemandSupplyTrend: React.FC<any> = () => {
  const { getDemandSupplyTrends, getRegions } = useBusinessAPI();
  const navigate = useNavigate();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
 
  const { data: regions } = useQuery<string[]>({
      queryKey: ["regions", selectedMaterial?.material_code],
      queryFn: () => getRegions(selectedMaterial?.material_code || "", 'factors_influencing_supply'),
      enabled: !!selectedMaterial?.material_code,
    });

  const [selectedRegion, setSelectedRegion] = useState<string>("");

  useEffect(() => {
    if (!selectedMaterial?.material_description) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0]);
    }
  }, [regions, selectedRegion]);

  const { data: demandSupplyTrends, isLoading } = useQuery({
    queryKey: ["demandSupplyTrends", selectedMaterial, selectedRegion],
    queryFn: () =>
      getDemandSupplyTrends(
        selectedMaterial?.material_code,
        selectedRegion
      ),
    enabled: !!selectedMaterial && !!selectedRegion,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: string) => source,
    },
    {
      title: "Link",
      dataIndex: "news_url",
      key: "news_url",
      render: (news_url: string) => (
        <a
          href={news_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          {news_url ? "View Report" : ""}
        </a>
      ),
    },
    {
      title: "Key Takeaways",
      dataIndex: "title",
      key: "title",
      render: (title: string) => title,
    },
    {
      title: "Impact",
      dataIndex: "impact",
      key: "impact",
      render: (impact: string) => impact,
    },
  ];

  const dataSource = demandSupplyTrends?.map((item: any, index: number) => ({
    key: index,
    date: item.date,
    news_url: item.demand_factor?.news_url || item.supply_factor?.news_url,
    title:
      item.demand_factor?.title ||
      item.supply_factor?.title ||
      item.demand_factor ||
      item.supply_factor,
    impact: item.demand_factor !== null ? "Demand" : "Supply",
    source: item.source,
  }));

  return (
    <div className="container mx-auto p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Demand Supply Trend for: {selectedMaterial?.material_description || "All Material"}
        </h1>
        <RegionSelector
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default DemandSupplyTrend;
