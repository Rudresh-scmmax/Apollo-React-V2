import React, { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaCubes,
  FaExternalLinkAlt,
  FaFileUpload,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import { BsFileEarmarkText } from "react-icons/bs";
import { Material, useBusinessAPI } from "../../services/BusinessProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "../../services/StorageProvider";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { message } from "antd";
import EditableTakeawayTable from "./Table/TakeawaysTable";
import MaterialSelect from "../../common/MaterialSelect";

// type Material = {
// 	material_description: string;
// 	material_id: string;
//   };

const MarketResearchReport: React.FC = () => {
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getGlobalSetMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { getTakeaways, addMaterial, uploadPDF, checkPDFStatus, getMaterials, deleteTakeaway } =
    useBusinessAPI();
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [newmaterialId, setNewmaterialId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    getGlobalSetMaterial
  );

  const [processingPdfIds, setProcessingPdfIds] = useLocalStorage(
    "processingPDFs",
    []
  );
  // const [uploadStatus, setUploadStatus] = useState<{
  //   visible: boolean;
  //   success: boolean;
  //   message: string;
  // }>({ visible: false, success: false, message: "" });

  const { data: materials, isLoading: isLoadingMaterials } = useQuery<
    Material[]
  >({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  const uploadPDFMutation = useMutation({
    mutationFn: (params: { file: File; material_id: string }) =>
      uploadPDF(params.file, params.material_id),
    onSuccess: (response) => {
      setSelectedFile(null);
      setNewmaterialId("");

      if (response?.id) {
        setProcessingPdfIds((prev: any) => [
          ...prev,
          { id: response.id, status: "processing" },
        ]);
      }

      message.success("PDF successfully uploaded and processing started!", 5);

      queryClient.invalidateQueries({ queryKey: ["processingPDFs"] });
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to upload PDF", 5);
    },
  });

  const {
    data: marketData,
    isPending,
    refetch,
  } = useQuery<ReportData[]>({
    queryKey: ["takeaways", selectedMaterial],
    queryFn: () => getTakeaways(selectedMaterial?.material_id),
  });

  const addMaterialMutation = useMutation({
    mutationFn: addMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setNewmaterialId("");
      setShowAddOptions(false);
    },
  });

  const deleteTakeawayMutation = useMutation({
    mutationFn: (id: number) => deleteTakeaway(id),
    onSuccess: () => {
      message.success("Takeaway deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["takeaways", selectedMaterial] });
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to delete takeaway");
    }
  });

  const handleDeleteTakeaway = (id: number) => {
    deleteTakeawayMutation.mutate(id);
  };


  const handleAddMaterial = () => {
    if (newmaterialId?.trim()) {
      addMaterialMutation.mutate(newmaterialId);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadPDF = () => {
    if (selectedFile && newmaterialId) {
      uploadPDFMutation.mutate({
        file: selectedFile,
        material_id: newmaterialId,
      });
    } else {
      message.error("material or file should not be empty");
    }
  };

  const { data: processingPDFs, isLoading: isLoadingProcessingPDFs } = useQuery(
    {
      queryKey: ["processingPDFs", processingPdfIds],
      queryFn: async () => {
        // If no IDs to check, return empty array
        if (processingPdfIds.length === 0) return [];

        // Fetch status for each ID
        const statusPromises = processingPdfIds.map((pdf: any) =>
          checkPDFStatus(pdf.id)
        );
        const results = await Promise.all(statusPromises);

        return results;
      },
      refetchInterval: processingPdfIds.length > 0 ? 5000 : false,
      enabled: processingPdfIds.length > 0,
    }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAddOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-lg font-semibold">Loading...</div>
      </div>
    );
  }*/

  console.log(marketData);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Market Research Report for:{" "}
            {selectedMaterial?.material_description || "All Material"}
          </h1>
          <div className="flex gap-4">

            <MaterialSelect
              materials={materials || []}
              selectedMaterial={selectedMaterial}
              onSelect={(selected) => {
                setSelectedMaterial(selected);
              }}
            />

            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowAddOptions(!showAddOptions)}
              >
                <FaPlus />
                Add Data & Track
              </button>
              {showAddOptions && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-4 space-y-4">
                    {/* Add Material */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Add New Material
                      </h3>
                      <div className="flex gap-2">
                        <MaterialSelect
                          materials={materials || []}
                          selectedMaterial={selectedMaterial}
                          onSelect={(selected) => {
                            setSelectedMaterial(selected);
                            if (selected) {
                              setNewmaterialId(selected.material_id);
                            }
                          }}
                        />
                        {/* <input
													type="text"
													className="border border-gray-300 rounded px-3 py-1 flex-grow"
													placeholder="Material name"
													value={newmaterialId}
													onChange={(e) => setNewmaterialId(e.target.value)}
												/> */}
                        <button
                          onClick={handleAddMaterial}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          disabled={addMaterialMutation.isPending}
                        >
                          <FaCubes />
                        </button>
                      </div>
                    </div>

                    {/* Upload PDF */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Upload PDF
                      </h3>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="text-sm text-gray-600"
                        />
                        <button
                          onClick={handleUploadPDF}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                          disabled={
                            !selectedFile || uploadPDFMutation.isPending
                          }
                        >
                          {uploadPDFMutation.isPending ? (
                            <>
                              <FaSpinner className="animate-spin" />{" "}
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FaFileUpload /> Upload
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {processingPDFs && processingPDFs.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              {processingPDFs.every((pdf) => pdf.status === "completed") ? (
                <FaCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FaSpinner className="animate-spin mr-2" />
              )}
              Processing Documents
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">
                      Document Name
                    </th>
                    <th className="py-2 px-4 border text-left">Status</th>
                    <th className="py-2 px-4 border text-left">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {processingPDFs.map((pdf, index) => (
                    <tr
                      key={pdf.id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 border">
                        {pdf.name || "Document"}
                      </td>
                      <td className="py-2 px-4 border">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {pdf.status || "processing"}
                        </span>
                      </td>
                      <td className="py-2 px-4 border text-gray-500 text-sm">
                        {pdf.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <EditableTakeawayTable
          marketData={marketData ?? []}
          onDelete={handleDeleteTakeaway}
        />

      </div>
    </div>
  );
};

export default MarketResearchReport;
