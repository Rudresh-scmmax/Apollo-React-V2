import React, { useEffect, useState } from "react";
import { Table, Input, message } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface VendorData {
  key: number;
  supplier_name: string;
  supplier_site: string;
  capacity_mn_tons: string;
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
  const [value, setValue] = useState(record?.[dataIndex as keyof VendorData] || '');
  const [isEditing, setIsEditing] = useState(editing);

  useEffect(() => {
    if (record && dataIndex) {
      setValue(record[dataIndex as keyof VendorData] || '');
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
        setValue(record[dataIndex as keyof VendorData] || '');
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
    queryKey: ["vendorKeyInformation", selectedMaterial?.material_code],
    queryFn: () =>
      getVendorKeyInformation(selectedMaterial?.material_code || ""),
    enabled: !!selectedMaterial?.material_code,
  });

  useEffect(() => {
    if (vendorInfo) {
      const formattedData = vendorInfo.map((item: any, index: number) => ({
        key: index,
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
      const updateData = {
        material_code: selectedMaterial?.material_code,
        supplier_name: updatedRecord.supplier_name,
        supplier_site: updatedRecord.supplier_site,
        capacity_mn_tons: updatedRecord.capacity_mn_tons,
        capacity_expansion_plans: updatedRecord.capacity_expansion_plans,
        fta_benefit: updatedRecord.fta_benefit,
        remarks: updatedRecord.remarks,
      };

      // Call the API to update the data
      await updateVendorKeyInformation(updateData);
      
      // Update the local state only if API call is successful
      const newDataSource = dataSource.map((item) =>
        item.key === updatedRecord.key ? updatedRecord : item
      );
      setDataSource(newDataSource);
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