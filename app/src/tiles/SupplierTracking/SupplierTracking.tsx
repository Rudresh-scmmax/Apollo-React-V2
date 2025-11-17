import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";

const SupplierTracking: React.FC<any> = () => {
  const { getNewsSupplierTracking, getSupplierRegion } = useBusinessAPI();
  const navigate = useNavigate();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: regions } = useQuery<{location_id: number, location_name: string}[]>({
      queryKey: ["regions", selectedMaterial?.material_id],
      queryFn: () => getSupplierRegion(selectedMaterial?.material_id || ""),
      enabled: !!selectedMaterial?.material_id,
    });

  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0].location_name);
      setSelectedLocationId(regions[0].location_id);
    }
  }, [regions, selectedRegion]);

  const { data: supplierTracking, isLoading } = useQuery({
    queryKey: ["supplierTracking", selectedMaterial?.material_id, selectedLocationId],
    queryFn: () => getNewsSupplierTracking(selectedMaterial?.material_id, selectedLocationId),
    enabled: !!selectedMaterial?.material_id && selectedLocationId !== null,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "event_date",
      key: "event_date",
      render: (date: string) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Event Title",
      dataIndex: "event_title",
      key: "event_title",
    },
    {
      title: "Description",
      dataIndex: "event_description",
      key: "event_description",
      render: (text: string) => text || "-",
    },
    {
      title: "Key Takeaway",
      dataIndex: "key_takeaway",
      key: "key_takeaway",
      render: (text: string) => text || "-",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (text: string) => text || "-",
    },
    {
      title: "Link",
      dataIndex: "source_link",
      key: "source_link",
      render: (link: string) => link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View Article
        </a>
      ) : "-",
    },
  ];

  const dataSource = supplierTracking?.map((item: any) => ({
    key: item.id || item.event_title,
    event_date: item.event_date,
    event_title: item.event_title,
    event_description: item.event_description,
    key_takeaway: item.key_takeaway,
    source: item.source,
    source_link: item.source_link,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Supplier Developments for: {selectedMaterial?.material_description || "All Material"}
        </h1>
        <div style={{ width: "300px" }}>
          <RegionSelector
            regions={regions}
            selectedRegion={selectedRegion}
            setSelectedRegion={(regionName: string) => {
              setSelectedRegion(regionName);
              const region = regions?.find(r => r.location_name === regionName);
              if (region) {
                setSelectedLocationId(region.location_id);
              }
            }}
          />
        </div>
      </div>

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

export default SupplierTracking;
