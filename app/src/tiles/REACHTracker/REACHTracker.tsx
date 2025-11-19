import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Button, message, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const REACHTracker: React.FC = () => {
  const { getREACHTracker, updateREACHTracker, uploadREACHDocument } =
    useBusinessAPI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string>("");
  const coverLetterFileInputRef = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const euSdsFileInputRef = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  // Fetch REACH tracker data
  const { data: reachData, isLoading } = useQuery({
    queryKey: ["reachTracker", selectedMaterial?.material_id],
    queryFn: () => getREACHTracker(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateREACHTracker(id, data),
    onSuccess: () => {
      message.success("Record updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["reachTracker", selectedMaterial?.material_id],
      });
      setEditingKey("");
    },
    onError: (error: any) => {
      message.error(`Failed to update: ${error.message || "Unknown error"}`);
    },
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: ({
      id,
      file,
      documentType,
    }: {
      id: number;
      file: File;
      documentType: "cover_letter" | "eu_sds";
    }) => uploadREACHDocument(id, file, documentType),
    onSuccess: () => {
      message.success("Document uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["reachTracker", selectedMaterial?.material_id],
      });
    },
    onError: (error: any) => {
      message.error(`Failed to upload document: ${error.message || "Unknown error"}`);
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
      if (row.volume_band !== undefined) updateData.volume_band = row.volume_band;
      if (row.coverage_letter !== undefined)
        updateData.coverage_letter = row.coverage_letter;
      if (row.eu_sds !== undefined) updateData.eu_sds = row.eu_sds;
      if (row.certificate_type !== undefined)
        updateData.certificate_type = row.certificate_type;
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

  const handleDocumentUpload = (
    record: any,
    documentType: "cover_letter" | "eu_sds"
  ) => {
    const fileInput =
      documentType === "cover_letter"
        ? coverLetterFileInputRef.current[record.id]
        : euSdsFileInputRef.current[record.id];

    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    record: any,
    documentType: "cover_letter" | "eu_sds"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({
        id: record.id,
        file,
        documentType,
      });
    }
    // Reset input
    e.target.value = "";
  };

  const EditableCell: React.FC<{
    editing?: boolean;
    dataIndex?: string;
    title?: string;
    inputType?: "text" | "number" | "select";
    selectOptions?: { label: string; value: string }[];
    record?: any;
    children: React.ReactNode;
    onSave?: (record: any) => void;
  }> = ({
    editing = false,
    dataIndex,
    title,
    inputType = "text",
    selectOptions,
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
    if (inputType === "select" && selectOptions) {
      inputNode = (
        <Select
          value={value}
          onChange={handleChange}
          style={{ width: "100%" }}
          options={selectOptions}
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
      title: "Volume band",
      dataIndex: "volume_band",
      key: "volume_band",
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: "volume_band",
        title: "Volume band",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Coverage letter",
      dataIndex: "coverage_letter",
      key: "coverage_letter",
      editable: true,
      render: (_: any, record: any) => (
        <span>
          {record.coverage_letter}
          {record.cover_letter_link && (
            <a
              className="ml-2 text-blue-600 underline"
              href={record.cover_letter_link}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
          )}
          {!isEditing(record) && (
            <>
              <input
                type="file"
                ref={(el) => {
                  coverLetterFileInputRef.current[record.id] = el;
                }}
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, record, "cover_letter")}
              />
              <Button
                type="link"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => handleDocumentUpload(record, "cover_letter")}
                loading={uploadMutation.isPending}
              >
                Upload
              </Button>
            </>
          )}
        </span>
      ),
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: "coverage_letter",
        title: "Coverage letter",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "SDS",
      dataIndex: "eu_sds",
      key: "eu_sds",
      editable: true,
      render: (_: any, record: any) => (
        <span>
          {record.eu_sds}
          {record.eu_sds_link && (
            <a
              className="ml-2 text-blue-600 underline"
              href={record.eu_sds_link}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
          )}
          {!isEditing(record) && (
            <>
              <input
                type="file"
                ref={(el) => {
                  euSdsFileInputRef.current[record.id] = el;
                }}
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, record, "eu_sds")}
              />
              <Button
                type="link"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => handleDocumentUpload(record, "eu_sds")}
                loading={uploadMutation.isPending}
              >
                Upload
              </Button>
            </>
          )}
        </span>
      ),
      onCell: (record: any) => ({
        record,
        inputType: "text",
        dataIndex: "eu_sds",
        title: "EU SDS",
        editing: isEditing(record),
        onSave: save,
      }),
    },
    {
      title: "Certificate Type",
      dataIndex: "certificate_type",
      key: "certificate_type",
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: "select",
        dataIndex: "certificate_type",
        title: "Certificate Type",
        editing: isEditing(record),
        onSave: save,
        selectOptions: [
          { label: "KReach", value: "KReach" },
          { label: "EUreach", value: "EUreach" },
          { label: "PhilippinesReach", value: "PhilippinesReach" },
        ],
      }),
    },
    {
      title: "Quantity purchased till date",
      dataIndex: "quantity_purchased_tons",
      key: "quantity_purchased_tons",
      editable: true,
      render: (value: number) =>
        value ? `${Number(value).toLocaleString()} tons` : "-",
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
      render: (value: number) =>
        value ? `${Number(value).toLocaleString()} tons` : "-",
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
      render: (value: number) =>
        value ? `${Number(value).toLocaleString()} tons` : "-",
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
              loading={updateMutation.isPending}
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
  const dataSource = reachData?.data?.map((item: any, idx: number) => ({
    key: idx,
    id: item.id,
    vendor: item.vendor,
    volume_band: item.volume_band,
    coverage_letter: item.coverage_letter,
    cover_letter_link: item.cover_letter_link,
    eu_sds: item.eu_sds,
    eu_sds_link: item.eu_sds_link,
    certificate_type: item.certificate_type,
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
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        REACH tracker
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

export default REACHTracker;
