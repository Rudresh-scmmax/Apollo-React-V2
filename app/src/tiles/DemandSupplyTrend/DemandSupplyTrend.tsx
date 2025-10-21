import React, { useEffect, useState } from "react";
import { Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";

const DemandSupplyTrend: React.FC<any> = () => {
  const { getDemandSupplyTrends, getDemandSupplyLocations } = useBusinessAPI();
  const navigate = useNavigate();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
 
  const { data: locations } = useQuery<{location_id: number, location_name: string}[]>({
      queryKey: ["demandSupplyLocations", selectedMaterial?.material_id],
      queryFn: () => getDemandSupplyLocations(selectedMaterial?.material_id || ""),
      enabled: !!selectedMaterial?.material_id,
    });

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedMaterial?.material_description) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (locations && locations.length > 0 && selectedLocationId === null) {
      setSelectedLocationId(locations[0].location_id);
    }
  }, [locations, selectedLocationId]);

  const { data: demandSupplyTrends, isLoading } = useQuery({
    queryKey: ["demandSupplyTrends", selectedMaterial?.material_id, selectedLocationId],
    queryFn: () =>
      getDemandSupplyTrends(
        selectedMaterial?.material_id,
        selectedLocationId || undefined
      ),
    enabled: !!selectedMaterial?.material_id && selectedLocationId !== null,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "source_published_date",
      key: "source_published_date",
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
      dataIndex: "source_link",
      key: "source_link",
      render: (source_link: string) => (
        <a
          href={source_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          {source_link ? "View Report" : ""}
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
    source_published_date: item.source_published_date,
    source_link: item.source_link,
    title: item.demand_impact || item.supply_impact,
    impact: item.demand_impact !== null ? "Demand" : "Supply",
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
          regions={locations}
          selectedRegion={locations?.find(loc => loc.location_id === selectedLocationId)?.location_name || ""}
          setSelectedRegion={(locationName: string) => {
            const location = locations?.find(loc => loc.location_name === locationName);
            if (location) {
              setSelectedLocationId(location.location_id);
            }
          }}
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
