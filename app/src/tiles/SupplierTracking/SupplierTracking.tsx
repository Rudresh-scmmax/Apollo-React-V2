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

  const { data: regions } = useQuery<string[]>({
      queryKey: ["regions", selectedMaterial?.material_code],
      queryFn: () => getSupplierRegion(selectedMaterial?.material_code || ""),
      enabled: !!selectedMaterial?.material_code,
    });

  const [selectedRegion, setSelectedRegion] = useState<string>("");

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0]);
    }
  }, [regions, selectedRegion]);

  const { data: supplierTracking, isLoading } = useQuery({
    queryKey: ["supplierTracking", selectedMaterial?.material_code, selectedRegion],
    queryFn: () => getNewsSupplierTracking(selectedMaterial?.material_code, selectedRegion),
    enabled: !!selectedMaterial?.material_code && !!selectedRegion,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Development",
      dataIndex: "development",
      key: "development",
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
          View Article
        </a>
      ),
    },
  ];

  const dataSource = supplierTracking?.map((item: any, index: number) => ({
    key: index,
    date: item.date,
    supplier: item.supplier,
    development: item.development,
    news_url: item.news_url,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Supplier Developments for: {selectedMaterial?.material_description || "All Material"}
        </h1>
        <RegionSelector
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
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
