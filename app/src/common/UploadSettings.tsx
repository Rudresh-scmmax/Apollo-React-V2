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
    material_price_type_period_id: "MPTP0001",
    material_id: "100724-000000",
    period_start_date: "2025-09-11",
    period_end_date: "2025-09-11",
    country: "",
    price: 1250.0,
    price_currency: "",
    price_history_source: "External Source",
    price_type: "Standard",
    location_id: 212,
  },
  {
    material_price_type_period_id: "MPTP0002",
    material_id: "100724-000000",
    period_start_date: "2025-05-08",
    period_end_date: "2025-05-08",
    country: "",
    price: 859.00,
    price_currency: "USD",
    price_history_source: "External Source",
    price_type: "Standard",
    location_id: 212,
  },
  {
    material_price_type_period_id: "MPTP0003",
    material_id: "100724-000000",
    period_start_date: "2025-08-01",
    period_end_date: "2025-08-01",
    country: "",
    price: 1120.0,
    price_currency: "USD",
    price_history_source: "External Source",
    price_type: "Standard",
    location_id: 212,
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
      <h3 className="text-lg font-semibold mb-2">Upload Material Price History</h3>
      <input
        type="file"
        accept=".csv, .xlsx"
        ref={fileUploadRef}
        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
      />
      <div className="text-xs text-gray-500 mt-1 mb-2">
        Upload CSV or Excel files with material price history data.
      </div>
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
