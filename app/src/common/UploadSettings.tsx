// src/components/Negotiation/UploadSettings.tsx
import React, { useRef, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { message } from "antd";
import * as XLSX from "xlsx";
import { useBusinessAPI } from "../services/BusinessProvider";

interface UploadSettingsProps {
  onUploadSuccess?: () => void;
}

const exampleData = [
  {
    material_id: "M0003",
    date: "2024-12-01",
    price_per_uom: 1025.5,
    currency: "USD",
    region: "IN",
    frequency: "Monthly",
    capacity_utilization: 85,
    conversion_spread: 120.5,
    business_cycle: "High",
    demand_outlook: "Stable",
    supply_disruption: "NO",
  },
  {
    material_id: "M0003",
    date: "2025-01-01",
    price_per_uom: 830.75,
    currency: "USD",
    region: "IN",
    frequency: "Quarterly",
    capacity_utilization: 90,
    conversion_spread: 130.2,
    business_cycle: "Low",
    demand_outlook: "Low",
    supply_disruption: "YES",
  },
  {
    material_id: "M0003",
    date: "2025-02-15",
    price_per_uom: 676.3,
    currency: "USD",
    region: "IN",
    frequency: "Monthly",
    capacity_utilization: 80,
    conversion_spread: 110.8,
    business_cycle: "Rise",
    demand_outlook: "High",
    supply_disruption: "NO",
  },
  {
    material_id: "M0003",
    date: "2025-03-10",
    price_per_uom: 945.0,
    currency: "USD",
    region: "IN",
    frequency: "Monthly",
    capacity_utilization: 75,
    conversion_spread: 140.0,
    business_cycle: "Peak",
    demand_outlook: "Medium",
    supply_disruption: "YES",
  },
];

const UploadSettings: React.FC<UploadSettingsProps> = ({ onUploadSuccess }) => {
  const { uploadPriceHistory } = useBusinessAPI();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  const handleCSVUpload = async () => {
    if (!csvFile) return;

    try {
      await uploadPriceHistory(csvFile);
      message.success(`${csvFile.name.split(".")[1]} uploaded successfully`);
      setCsvFile(null);
      if (fileUploadRef.current) {
        fileUploadRef.current.value = "";
      }
      onUploadSuccess?.();
    } catch (err) {
      console.error("CSV Upload Error:", err);
      message.error("CSV upload failed");
    }
  };

  const handleDownloadExample = (type: "csv" | "xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Example");

    if (type === "xlsx") {
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "example.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "example.csv";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Upload CSV Price History</h3>
      <input
        type="file"
        accept=".csv, .xlsx"
        ref={fileUploadRef}
        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
      />
      <div className="mt-2 flex gap-4 items-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleCSVUpload}
          disabled={!csvFile}
        >
          Upload
        </button>
        <button
          className="flex items-center text-sm text-blue-700 underline"
          onClick={() => handleDownloadExample("csv")}
        >
          <FiDownload className="mr-1" /> Example CSV
        </button>
        <button
          className="flex items-center text-sm text-green-700 underline"
          onClick={() => handleDownloadExample("xlsx")}
        >
          <FiDownload className="mr-1" /> Example Excel
        </button>
      </div>
    </div>
  );
};

export default UploadSettings;
