import React, { useState, useMemo, useEffect } from "react";
import { Table, Input, Button, message } from "antd";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const ProcurementPlanTable: React.FC = () => {
  const {
    getProcurementPlan,
    getProcurementPlanPlants,
    updateProcurementPlan,
  } = useBusinessAPI();
  const [selectedPlantCode, setSelectedPlantCode] = useState<string>("");
  const [editingKey, setEditingKey] = useState<string>("");
  const [editingData, setEditingData] = useState<any>({});
  const queryClient = useQueryClient();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: procurementData, isLoading } =
    useQuery<ProcurementPlanResponse>({
      queryKey: [
        "procurementPlan",
        selectedPlantCode,
        selectedMaterial?.material_id,
      ],
      queryFn: () =>
        getProcurementPlan(selectedPlantCode, selectedMaterial?.material_id),
      enabled: !!selectedPlantCode && !!selectedMaterial?.material_id,
    });

  const { data: plantCodes } = useQuery<string[]>({
    queryKey: ["procurementPlanPlants", selectedMaterial?.material_id],
    queryFn: () =>
      selectedMaterial?.material_id
        ? getProcurementPlanPlants(selectedMaterial.material_id)
        : Promise.resolve([]),
    enabled: !!selectedMaterial?.material_id,
  });

  useEffect(() => {
    setEditingKey("");
    setEditingData({});
    setSelectedPlantCode("");
  }, [selectedMaterial?.material_id]);

  useEffect(() => {
    if (plantCodes && plantCodes.length > 0) {
      setSelectedPlantCode((prev) =>
        prev && plantCodes.includes(prev) ? prev : plantCodes[0]
      );
    } else {
      setSelectedPlantCode("");
    }
  }, [plantCodes]);

  const handleEdit = (record: any) => {
    setEditingKey(record.id);
    setEditingData({ ...record });
  };

  const handleDoubleClick = (record: any) => {
    setEditingKey(record.id);
    setEditingData({ ...record });
  };

  const handleCancel = () => {
    setEditingKey("");
    setEditingData({});
  };

  const handleSave = async (record: ProcurementPlanData) => {
    try {
      const monthKeys: string[] = procurementData?.months ?? [];

      const monthlyPrices: Record<string, number> = {};
      monthKeys.forEach((monthKey: string) => {
        if (editingData[monthKey] !== undefined) {
          const value = parseFloat(editingData[monthKey]);
          if (!Number.isNaN(value)) {
            monthlyPrices[monthKey] = value;
          }
        }
      });

      if (!record.material_id) {
        message.error("Material ID is missing for this record.");
        return;
      }

      const payload = {
        plant_code: record.plant_code,
        material_id: record.material_id as string,
        safety_stock:
          editingData.safety_stock !== undefined
            ? Number(editingData.safety_stock)
            : undefined,
        opening_stock:
          editingData.opening_stock !== undefined
            ? Number(editingData.opening_stock)
            : undefined,
        monthly_prices: monthlyPrices,
      };

      await updateProcurementPlan(payload);
      
      message.success("Procurement plan updated successfully!");
      setEditingKey("");
      setEditingData({});
      queryClient.invalidateQueries({ 
        queryKey: ["procurementPlan", selectedPlantCode, selectedMaterial?.material_id] 
      });
    } catch (error) {
      message.error("Failed to update procurement plan");
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditingData((prev: any) => ({ ...prev, [field]: value }));
  };

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
        render: (text: string, record: any) => {
          const isEditing = editingKey === record.id;
          if (isEditing) {
            return (
              <Input
                value={editingData.safety_stock !== undefined ? editingData.safety_stock : text}
                onChange={(e) => handleFieldChange('safety_stock', e.target.value)}
                style={{ width: '100px' }}
              />
            );
          }
          return text;
        },
      },
      {
        title: "Opening Stock",
        dataIndex: "opening_stock",
        key: "opening_stock",
        render: (text: string, record: any) => {
          const isEditing = editingKey === record.id;
          if (isEditing) {
            return (
              <Input
                value={editingData.opening_stock !== undefined ? editingData.opening_stock : text}
                onChange={(e) => handleFieldChange('opening_stock', e.target.value)}
                style={{ width: '100px' }}
              />
            );
          }
          return text;
        },
      },
      {
        title: "Actions",
        key: "actions",
        render: (text: string, record: any) => {
          const isEditing = editingKey === record.id;
          if (isEditing) {
            return (
              <div className="flex gap-2">
                <Button
                  size="small"
                  icon={<FaSave />}
                  onClick={() => handleSave(record)}
                  type="primary"
                >
                  Save
                </Button>
                <Button
                  size="small"
                  icon={<FaTimes />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            );
          }
          return (
            <Button
              size="small"
              icon={<FaEdit />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          );
        },
      },
    ];

    const monthKeys: string[] = procurementData?.months ?? [];

    const dynamicMonthColumns = monthKeys.map((month: string) => ({
      title: month,
      dataIndex: month,
      key: month,
      render: (text: string, record: any) => {
        const isEditing = editingKey === record.id;
        if (isEditing) {
          return (
            <Input
              value={editingData[month] !== undefined ? editingData[month] : text}
              onChange={(e) => handleFieldChange(month, e.target.value)}
              style={{ width: '80px' }}
            />
          );
        }
        return text;
      },
    }));

    const totalColumn = {
      title: "Total Price",
      key: "total_price",
      render: (_: any, record: any) => {
        const total = monthKeys.reduce((sum: number, monthKey: string) => {
          const rawValue = record[monthKey];
          const numericValue = parseFloat(
            rawValue !== undefined ? String(rawValue) : ""
          );
          return sum + (Number.isNaN(numericValue) ? 0 : numericValue);
        }, 0);
        return total.toFixed(2);
      },
    };

    return [...baseColumns, ...dynamicMonthColumns, totalColumn];
  }, [procurementData, editingKey, editingData]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Procurement Plan</h2>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          value={selectedPlantCode}
          onChange={(e) => setSelectedPlantCode(e.target.value)}
          disabled={!plantCodes?.length}
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
        dataSource={procurementData?.data?.map((item) => ({
          ...item,
          key: item.id, // Use the unique ID from backend
        }))}
        loading={isLoading}
        bordered
        pagination={false}
        onRow={(record) => ({
          onDoubleClick: () => handleDoubleClick(record),
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
};

export default ProcurementPlanTable;
