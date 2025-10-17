// src/components/Negotiation/UploadSpendAnalysis.tsx
import React, { useRef, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { message } from "antd";
import * as XLSX from "xlsx";
import { useBusinessAPI } from "../services/BusinessProvider";

interface UploadSpendAnalysisProps {
  onUploadSuccess?: () => void;
}

const exampleData = [
  {
    plant_code: "1001",
    po_number: "21135661",
    po_date: "2023-01-02",
    supplier_id: "12813",
    material_id: "M025",
    quantity: "59200.0000",
    uom: "KILOGRAMS",
    currency: "INR",
    price: "160.0000",
    payment_term: "60 Days Credit from Invoice Date",
    freight_terms_dsp: "To Sellers A/c",
    purchasing_org_id: "1",
    transaction_posting_date: "2023-01-15",
  },
];

const UploadSpendAnalysis: React.FC<UploadSpendAnalysisProps> = ({ onUploadSuccess }) => {
  const { uploadSpendAnalysis } = useBusinessAPI();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    if (!csvFile) return;

    try {
      await uploadSpendAnalysis(csvFile);
      message.success("Spend analysis uploaded successfully");
      setCsvFile(null);
      if (fileUploadRef.current) fileUploadRef.current.value = "";
      onUploadSuccess?.();
    } catch (err) {
      console.error("Upload Error:", err);
      message.error("Upload failed");
    }
  };

  const handleDownloadExample = (type: "csv" | "xlsx") => {
    const cleanedData = exampleData.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([_, v]) => v !== null))
    );
    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Example");

    if (type === "xlsx") {
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "example_spend_analysis.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "example_spend_analysis.csv";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Upload Spend Analysis</h3>
      <input
        type="file"
        accept=".csv, .xlsx"
        ref={fileUploadRef}
        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
      />
      <div className="mt-2 flex gap-4 items-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleUpload}
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

export default UploadSpendAnalysis;
