import React, { useEffect } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const VendorWiseActionPlan: React.FC = () => {
  const { getVendorWiseActionPlan } = useBusinessAPI();
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
    queryKey: ["inventoryLevel", selectedMaterial?.material_id],
    queryFn: () => getVendorWiseActionPlan(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  const columns = [
    {
      title: <span className="font-bold">Open PO</span>,
      dataIndex: "open_po",
      key: "open_po",
    },
    {
      title: <span className="font-bold">Vendor</span>,
      dataIndex: "vendor",
      key: "vendor",
    },
    {
      title: <span className="font-bold">Pending quantity</span>,
      dataIndex: "pending_quantity",
      key: "pending_quantity",
    },
    {
      title: <span className="font-bold">Schedule</span>,
      dataIndex: "schedule",
      key: "schedule",
    },
    {
      title: <span className="font-bold">Remarks</span>,
      dataIndex: "remarks",
      key: "remarks",
    },
  ];

  // Map your API data to table dataSource
  const dataSource = inventoryData?.data?.map((item: any, idx: number) => ({
    key: idx,
    open_po: item.open_po,
    vendor: item.vendor,
    pending_quantity: item.pending_quantity,
    schedule: item.schedule,
    remarks: item.remarks,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
        Vendor Wise Action Plan for: {selectedMaterial?.material_description || "All Material"}
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

export default VendorWiseActionPlan;