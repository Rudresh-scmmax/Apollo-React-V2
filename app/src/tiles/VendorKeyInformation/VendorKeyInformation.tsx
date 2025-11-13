import React, { useEffect, useState } from "react";
import { Table, Input, message } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface VendorData {
  key: number;
  id?: number; // ID from backend for easier updates
  material_code?: string; // Material code from backend
  supplier_name: string;
  supplier_site: string;
  capacity_mn_tons: string | number;
  capacity_expansion_plans: string;
  fta_benefit: string;
  remarks: string;
}

interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: VendorData;
  index: number;
  children: React.ReactNode;
  onSave: (record: VendorData) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  onSave,
  ...restProps
}) => {
  const getInitialValue = () => {
    const val = record?.[dataIndex as keyof VendorData];
    if (val === null || val === undefined) return '';
    // Convert number to string for input field
    return String(val);
  };

  const [value, setValue] = useState(getInitialValue());
  const [isEditing, setIsEditing] = useState(editing);

  useEffect(() => {
    if (record && dataIndex) {
      const val = record[dataIndex as keyof VendorData];
      setValue(val === null || val === undefined ? '' : String(val));
    }
  }, [record, dataIndex]);

  const handleSave = () => {
    if (record && dataIndex) {
      const updatedRecord = { ...record, [dataIndex]: value };
      onSave(updatedRecord);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      if (record && dataIndex) {
        const val = record[dataIndex as keyof VendorData];
        setValue(val === null || val === undefined ? '' : String(val));
      }
      setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    if (['capacity_mn_tons', 'capacity_expansion_plans', 'fta_benefit', 'remarks'].includes(dataIndex)) {
      setIsEditing(true);
    }
  };

  return (
    <td {...restProps}>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          autoFocus
          style={{ margin: 0 }}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: ['capacity_mn_tons', 'capacity_expansion_plans', 'fta_benefit', 'remarks'].includes(dataIndex) 
              ? 'pointer' : 'default',
            minHeight: '22px',
            padding: '4px 8px'
          }}
        >
          {children}
        </div>
      )}
    </td>
  );
};

const VendorKeyInformation: React.FC<any> = () => {
  const { getVendorKeyInformation, updateVendorKeyInformation } = useBusinessAPI();
  const navigate = useNavigate();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<VendorData[]>([]);
  
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  const { data: vendorInfo, isLoading } = useQuery({
    queryKey: ["vendorKeyInformation", selectedMaterial?.material_id],
    queryFn: () =>
      getVendorKeyInformation(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  useEffect(() => {
    if (vendorInfo) {
      const formattedData = vendorInfo.map((item: any, index: number) => ({
        key: item.id || index, // Use id as key if available, fallback to index
        id: item.id, // Store ID for updates
        material_code: item.material_code, // Store material_code
        supplier_name: item.supplier_name,
        supplier_site: item.supplier_site,
        capacity_mn_tons: item.capacity ?? "",
        capacity_expansion_plans: item.capacity_expansion_plans ?? "",
        fta_benefit: item.fta_benefit ?? "",
        remarks: item.remarks ?? "",
      }));
      setDataSource(formattedData);
    }
  }, [vendorInfo]);

  const handleSave = async (updatedRecord: VendorData) => {
    try {
      // Prepare the data for the API call
      // Use id if available (preferred method), otherwise use identifiers
      const updateData: any = {};
      
      if (updatedRecord.id) {
        // Preferred: Use ID to identify record directly
        updateData.id = updatedRecord.id;
      } else {
        // Fallback: Use identifiers (material_code, supplier_name, supplier_site)
        updateData.material_code = updatedRecord.material_code || selectedMaterial?.material_id;
        updateData.supplier_name = updatedRecord.supplier_name;
        updateData.supplier_site = updatedRecord.supplier_site;
      }
      
      // Only include fields that have changed or are being updated
      // Convert capacity_mn_tons to number if it's a valid number string
      if (updatedRecord.capacity_mn_tons !== undefined && updatedRecord.capacity_mn_tons !== null && updatedRecord.capacity_mn_tons !== "") {
        const capacityValue = typeof updatedRecord.capacity_mn_tons === 'string' 
          ? parseFloat(updatedRecord.capacity_mn_tons) 
          : updatedRecord.capacity_mn_tons;
        if (!isNaN(capacityValue)) {
          updateData.capacity = capacityValue;
        }
      }
      
      if (updatedRecord.capacity_expansion_plans !== undefined) {
        updateData.capacity_expansion_plans = updatedRecord.capacity_expansion_plans;
      }
      if (updatedRecord.fta_benefit !== undefined) {
        updateData.fta_benefit = updatedRecord.fta_benefit;
      }
      if (updatedRecord.remarks !== undefined) {
        updateData.remarks = updatedRecord.remarks;
      }

      // Call the API to update the data
      const response = await updateVendorKeyInformation(updateData);
      
      // Update the local state with the response data if available
      if (response?.data) {
        const updatedData = response.data;
        const newDataSource = dataSource.map((item) =>
          item.key === updatedRecord.key 
            ? {
                ...item,
                id: updatedData.id || item.id,
                material_code: updatedData.material_code || item.material_code,
                capacity_mn_tons: updatedData.capacity ?? "",
                capacity_expansion_plans: updatedData.capacity_expansion_plans ?? "",
                fta_benefit: updatedData.fta_benefit ?? "",
                remarks: updatedData.remarks ?? "",
              }
            : item
        );
        setDataSource(newDataSource);
      } else {
        // Fallback: Update with the record we sent
        const newDataSource = dataSource.map((item) =>
          item.key === updatedRecord.key ? updatedRecord : item
        );
        setDataSource(newDataSource);
      }
      
      setEditingKey(null);
      message.success('Data updated successfully!');
    } catch (error) {
      console.error('Error updating vendor information:', error);
      message.error('Failed to update data. Please try again.');
    }
  };

  const columns = [
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    {
      title: "Supplier Site",
      dataIndex: "supplier_site",
      key: "supplier_site",
    },
    {
      title: "Capacity (Mn Tons)",
      dataIndex: "capacity_mn_tons",
      key: "capacity_mn_tons",
      onCell: (record: VendorData) => ({
        record,
        dataIndex: "capacity_mn_tons",
        title: "Capacity (Mn Tons)",
        editing: editingKey === record.key,
        onSave: handleSave,
      }),
    },
    {
      title: "Capacity Expansion Plans",
      dataIndex: "capacity_expansion_plans",
      key: "capacity_expansion_plans",
      onCell: (record: VendorData) => ({
        record,
        dataIndex: "capacity_expansion_plans",
        title: "Capacity Expansion Plans",
        editing: editingKey === record.key,
        onSave: handleSave,
      }),
    },
    {
      title: "FTA Benefit",
      dataIndex: "fta_benefit",
      key: "fta_benefit",
      onCell: (record: VendorData) => ({
        record,
        dataIndex: "fta_benefit",
        title: "FTA Benefit",
        editing: editingKey === record.key,
        onSave: handleSave,
      }),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      onCell: (record: VendorData) => ({
        record,
        dataIndex: "remarks",
        title: "Remarks",
        editing: editingKey === record.key,
        onSave: handleSave,
      }),
    },
  ];

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Vendor Key Information for:{" "}
          {selectedMaterial?.material_description || "All Material"}
        </h1>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <p>💡 Double-click on cells in Capacity, Capacity Expansion Plans, FTA Benefit, or Remarks columns to edit</p>
      </div>
      <Table
        components={components}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default VendorKeyInformation;