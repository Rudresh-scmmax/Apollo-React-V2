import React, { useState } from "react";
import { Table, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

const formStyles = {
  button: `w-auto bg-[#8baf1b] hover:bg-[#C3D675] text-[#4A5A1E] font-semibold px-4 py-2
      rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2
      focus:ring-[#8baf1b] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-none`,
};

const FactPack: React.FC = () => {
  const queryClient = useQueryClient();
  const { getFactPackData, uploadFactPackFile } = useBusinessAPI();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: factPackData, isLoading } = useQuery({
    queryKey: ["factPackData", selectedMaterial?.material_code],
    queryFn: () => getFactPackData(selectedMaterial?.material_code || ""),
    enabled: !!selectedMaterial,
  });

  const uploadPDFMutation = useMutation({
    mutationFn: (params: { file: File }) =>
      uploadFactPackFile(params.file, selectedMaterial?.material_code || ""),
    onSuccess: (response) => {
      message.success("PDF successfully uploaded and processing started!", 5);
      queryClient.invalidateQueries({
        queryKey: ["factPackData", selectedMaterial?.material_code],
      });
      queryClient.invalidateQueries({ queryKey: ["processingPDFs"] });
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to upload PDF", 5);
    },
  });

  const handleUpload = (info: any) => {
    if (info.file.status === "done") {
      uploadPDFMutation.mutate({
        file: info.file.originFileObj,
      });
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Prepared by",
      dataIndex: "prepared_by_name",
      key: "prepared_by_name",
    },
    {
      title: "PPT link",
      dataIndex: "ppt_link",
      key: "ppt_link",
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View PPT
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Key highlights",
      dataIndex: "key_highlights",
      key: "highlights",
      render: (text: string) => {
        if (!text) return <div className="text-gray-700">-</div>;
        return (
          <div className="text-gray-700">
            {text.split("\n").map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Fact Pack for:{" "}
          {selectedMaterial?.material_description || "All Material"}
        </h1>
        <Upload
          showUploadList={false}
          customRequest={({ file, onSuccess }) => {
            // Implement your upload logic here
            setTimeout(() => {
              onSuccess && onSuccess("ok");
            }, 1000);
          }}
          onChange={handleUpload}
        >
          <Button
            className={formStyles.button}
            style={{
              background: "#8baf1b",
              color: "#000",
              border: "none",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#C3D675";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#8baf1b";
            }}
            icon={<UploadOutlined />}
          >
            Upload New Fact Pack
          </Button>
        </Upload>
      </div>
      <Table
        columns={columns}
        dataSource={factPackData?.data}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default FactPack;
