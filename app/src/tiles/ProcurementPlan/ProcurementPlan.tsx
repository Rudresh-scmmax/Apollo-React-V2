import React, { useState, useMemo } from "react";
import { Table } from "antd";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface ProcurementPlanData {
  [key: string]: string;
}

interface ProcurementPlanResponse {
  message: string;
  data: ProcurementPlanData[];
}


const ProcurementPlanTable: React.FC = () => {
  const { getProcurementPlan, getPlantCode } = useBusinessAPI();
  const [selectedPlantCode, setSelectedPlantCode] = useState<string>("");

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: procurementData, isLoading } = useQuery<ProcurementPlanResponse>({
    queryKey: ["procurementPlan", selectedPlantCode, selectedMaterial?.material_id,],
    queryFn: () => getProcurementPlan(selectedPlantCode, selectedMaterial?.material_id,),
    enabled: !!selectedPlantCode && !!selectedMaterial?.material_id,
  });

  const { data: plantCodes } = useQuery<string[]>({
    queryKey: ["plantCodes"],
    queryFn: getPlantCode,
  });

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Plant",
        dataIndex: "plant_code",
        key: "plant_code",
      },
      {
        title: "Material Description",
        dataIndex: "material_description",
        key: "material_description",
      },
      {
        title: "Safety Stock",
        dataIndex: "safety_stock",
        key: "safety_stock",
      },
      {
        title: "Opening Stock",
        dataIndex: "opening_stock",
        key: "opening_stock",
      },
    ];
  
    const firstItem = procurementData?.data?.[0];
    const monthKeys = firstItem
      ? Object.keys(firstItem).filter((key) => key.match(/^[A-Z][a-z]{2} '\d{2}$/))
      : [];
  
    const dynamicMonthColumns = monthKeys.map((month) => ({
      title: month,
      dataIndex: month,
      key: month,
    }));
  
    const totalColumn = {
      title: "Total Price",
      key: "total_price",
      render: (_: any, record: any) => {
        const total = monthKeys.reduce((sum, monthKey) => {
          const value = parseFloat(record[monthKey]) || 0;
          return sum + value;
        }, 0);
        return total.toFixed(2);
      },
    };
  
    return [...baseColumns, ...dynamicMonthColumns, totalColumn];
  }, [procurementData]);
  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Procurement Plan</h2>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          value={selectedPlantCode}
          onChange={(e) => setSelectedPlantCode(e.target.value)}
        >
          <option value="">Select Plant</option>
          {plantCodes?.map((plant, index) => (
            <option key={index} value={plant}>
              Plant {plant}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        dataSource={procurementData?.data?.map((item, index) => ({
          ...item,
          key: index,
        }))}
        loading={isLoading}
        bordered
        pagination={false}
      />
    </div>
  );
};

export default ProcurementPlanTable;
