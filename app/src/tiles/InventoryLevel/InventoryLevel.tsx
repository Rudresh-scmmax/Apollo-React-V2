import React, { useEffect } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const InventoryLevel: React.FC = () => {
  const { getInventoryLevels } = useBusinessAPI();
  const navigate = useNavigate();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  // Fetch inventory data
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventoryLevel", selectedMaterial?.material_code],
    queryFn: () => getInventoryLevels(selectedMaterial?.material_code || ""),
    enabled: !!selectedMaterial?.material_code,
  });

  const columns = [
    {
      title: "Batch Number",
      dataIndex: "batch_number",
      key: "batch_number",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: any, record: any) =>
        record.quantity
          ? `${Number(record.quantity).toLocaleString()} ${record.transaction_uom || ""}`.trim()
          : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  // Map your API data to table dataSource
  const dataSource = inventoryData?.data?.map((item: any, idx: number) => ({
    key: idx,
    batch_number: item.batch_number,
    location: item.location,
    quantity: item.quantity,
    transaction_uom: item.transaction_uom,
    status: item.status,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Inventory Level for: {selectedMaterial?.material_description || "All Material"}
        </h1>
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

export default InventoryLevel;