import React, { useEffect, useState } from "react";
import { Table, Input, DatePicker, Button, message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

const ESGTracker: React.FC = () => {
  const { getESGTracker, updateESGTracker } = useBusinessAPI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string>("");

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  // Fetch ESG tracker data
  const { data: esgData, isLoading } = useQuery({
    queryKey: ["esgTracker", selectedMaterial?.material_id],
    queryFn: () => getESGTracker(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateESGTracker(id, data),
    onSuccess: () => {
      message.success("Record updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["esgTracker", selectedMaterial?.material_id],
      });
      setEditingKey("");
    },
    onError: (error: any) => {
      message.error(`Failed to update: ${error.message || "Unknown error"}`);
    },
  });

  const isEditing = (record: any) => record.key === editingKey;

  const edit = (record: any) => {
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (record: any) => {
    try {
      const row = await new Promise<any>((resolve) => {
        const updatedData = { ...record };
        resolve(updatedData);
      });

      const updateData: any = {};
      if (row.vendor !== undefined) updateData.vendor = row.vendor;
      if (row.location !== undefined) updateData.location = row.location;
      if (row.co2_emission_per_ton !== undefined)
        updateData.co2_emission_per_ton = row.co2_emission_per_ton;
      if (row.certificate !== undefined) updateData.certificate = row.certificate;
      if (row.certificate_validity !== undefined)
        updateData.certificate_validity = row.certificate_validity
          ? dayjs(row.certificate_validity).format("YYYY-MM-DD")
          : null;
      if (row.quantity_purchased_tons !== undefined)
        updateData.quantity_purchased_tons = row.quantity_purchased_tons;
      if (row.quantity_previous_year_tons !== undefined)
        updateData.quantity_previous_year_tons = row.quantity_previous_year_tons;
      if (row.quantity_previous_to_previous_year_tons !== undefined)
        updateData.quantity_previous_to_previous_year_tons = row.quantity_previous_to_previous_year_tons;

      updateMutation.mutate({ id: record.id, data: updateData });
    } catch (errInfo) {
      console.error("Validate Failed:", errInfo);
    }
  };

  const EditableCell: React.FC<{
    editing?: boolean;
    dataIndex?: string;
    title?: string;
    inputType?: "text" | "number" | "date";
    record?: any;
    children: React.ReactNode;
    onSave?: (record: any) => void;
  }> = ({
    editing = false,
    dataIndex,
    title,
    inputType = "text",
    record,
    children,
    onSave,
    ...restProps
  }) => {
    // If this is not an editable cell, just render children
    if (!editing || !dataIndex || !record) {
      return <td {...restProps}>{children}</td>;
    }

    const [value, setValue] = useState<any>(
      record[dataIndex] || (inputType === "number" ? 0 : "")
    );

    const handleChange = (val: any) => {
      setValue(val);
      if (record && dataIndex) {
        record[dataIndex] = val;
      }
    };

    let inputNode: React.ReactNode;
    if (inputType === "date") {
      inputNode = (
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(date) => handleChange(date ? date.format("YYYY-MM-DD") : null)}
          format="YYYY-MM-DD"
        />
      );
    } else if (inputType === "number") {
      inputNode = (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onPressEnter={() => onSave && onSave(record)}
        />
      );
    } else {
      inputNode = (
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onPressEnter={() => onSave && onSave(record)}
        />
      );
    }

    return (
      <td {...restProps}>
        {editing ? (
          <div style={{ margin: 0 }}>{inputNode}</div>
        ) : (
          <div>{children}</div>
        )}
      </td>
    );
  };

  const columns = [
    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: "vendor",
        title: "Vendor",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: "location",
        title: "Location",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "CO2 emission / ton of product",
      dataIndex: "co2_emission_per_ton",
      key: "co2_emission_per_ton",
      editable: true,
      render: (value: any) => {
        const num = Number(value);
        return Number.isFinite(num) ? num.toFixed(3) : "-";
      },
      onCell: (record: any) => ({
        record,
        inputType: "number",
        dataIndex: "co2_emission_per_ton",
        title: "CO2 emission / ton of product",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "CO2 emission in KG / KG of product",
      dataIndex: "co2_emission_per_kg",
      key: "co2_emission_per_kg",
      editable: false,
      render: (_: any, record: any) => {
        const co2PerTon = Number(record.co2_emission_per_ton);
        if (Number.isFinite(co2PerTon)) {
          // If co2_emission_per_ton stores "tons CO2 per ton product":
          // The value stays the same (2 tons/ton = 2000kg/1000kg = 2 kg/kg)
          // If co2_emission_per_ton stores "kg CO2 per ton product":
          // Divide by 1000 (2500 kg/ton = 2.5 kg/1000kg = 2.5 kg/kg)
          // Assuming it stores "tons CO2 per ton product", value stays same
          // If your data stores "kg CO2 per ton product", change to: co2PerTon / 1000
          const co2PerKg = co2PerTon; // Same value (tons/ton = kg/kg)
          return co2PerKg.toFixed(6);
        }
        return "-";
      },
    },
    {
      title: "Certificate",
      dataIndex: "certificate",
      key: "certificate",
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: "certificate",
        title: "Certificate",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Certificate validity",
      dataIndex: "certificate_validity",
      key: "certificate_validity",
      editable: true,
      render: (value: string) => (value ? new Date(value).toLocaleDateString() : "-"),
      onCell: (record: any) => ({
        record,
        inputType: "date",
        dataIndex: "certificate_validity",
        title: "Certificate validity",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Quantity purchased till date",
      dataIndex: "quantity_purchased_tons",
      key: "quantity_purchased_tons",
      editable: true,
      render: (value: any) => {
        const num = Number(value);
        return Number.isFinite(num) ? `${num.toLocaleString()} tons` : "-";
      },
      onCell: (record: any) => ({
        record,
        inputType: "number",
        dataIndex: "quantity_purchased_tons",
        title: "Quantity purchased till date",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Quantity purchased - Previous Year",
      dataIndex: "quantity_previous_year_tons",
      key: "quantity_previous_year_tons",
      editable: true,
      render: (value: any) => {
        const num = Number(value);
        return Number.isFinite(num) ? `${num.toLocaleString()} tons` : "-";
      },
      onCell: (record: any) => ({
        record,
        inputType: "number",
        dataIndex: "quantity_previous_year_tons",
        title: "Quantity purchased - Previous Year",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Quantity purchased - Previous to Previous Year",
      dataIndex: "quantity_previous_to_previous_year_tons",
      key: "quantity_previous_to_previous_year_tons",
      editable: true,
      render: (value: any) => {
        const num = Number(value);
        return Number.isFinite(num) ? `${num.toLocaleString()} tons` : "-";
      },
      onCell: (record: any) => ({
        record,
        inputType: "number",
        dataIndex: "quantity_previous_to_previous_year_tons",
        title: "Quantity purchased - Previous to Previous Year",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              type="link"
              onClick={() => save(record)}
              style={{ marginRight: 8 }}
            >
              Save
            </Button>
            <Button type="link" onClick={cancel}>
              Cancel
            </Button>
          </span>
        ) : (
          <Button
            type="link"
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => col.onCell!(record),
    };
  });

  // Map API data to table format
  const dataSource = esgData?.data?.map((item: any, idx: number) => ({
    key: idx,
    id: item.id,
    vendor: item.vendor,
    location: item.location,
    co2_emission_per_ton: item.co2_emission_per_ton,
    certificate: item.certificate,
    certificate_validity: item.certificate_validity,
    quantity_purchased_tons: item.quantity_purchased_tons,
    quantity_previous_year_tons: item.quantity_previous_year_tons,
    quantity_previous_to_previous_year_tons: item.quantity_previous_to_previous_year_tons,
  })) || [];

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">
        Carbon footprint tracker
        {selectedMaterial?.material_description
          ? `: ${selectedMaterial.material_description}`
          : ""}
      </h1>

      <Table
        components={components}
        columns={mergedColumns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default ESGTracker;
