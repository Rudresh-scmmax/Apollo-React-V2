import React, { useEffect, useRef, useState } from "react";
import {
  FaChartLine,
  FaBalanceScale,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFolder,
  FaNewspaper,
  FaUserTie,
  FaTasks,
  FaCalendarAlt,
  FaHandshake,
  FaKey,
  FaUsers,
  FaBoxes,
  FaChartBar,
  FaFileContract,
  FaGlobe,
  FaProjectDiagram,
  FaSearchDollar,
  FaPowerOff,
  FaBullseye,
  FaAddressCard,
  FaClipboardList,
  FaSitemap,
  FaIndustry,
  FaClipboardCheck,
  FaPlus,
  FaChartArea,
  FaToggleOn,
  FaToggleOff,
  FaFileUpload,
  FaCubes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Material, useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "../../services/StorageProvider";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setGlobalSelectedMaterial } from "../../store/materialSlice";
import ProcurementNews from "./ProcurementNews";
import PriceChartWithNews from "./PriceChart";
import VendorWiseActionPlanList from "./VendorWiseActionPlanList";
import MaterialSelect from "../../common/MaterialSelect";

interface TileProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive: boolean;
  onToggle: (title: string, newState: boolean) => void;
}

const Tile: React.FC<TileProps> = ({ icon, title, onClick, isActive, onToggle }) => {
  const accent = "#a0bf3f";

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl transition-all cursor-pointer select-none
        bg-white border hover:shadow-lg
      `}
      style={{
        borderColor: isActive ? accent : "#e0e0e0",
        borderTop: `3px solid ${accent}`,
        boxShadow: isActive
          ? `0 6px 16px rgba(85, 139, 47, 0.25)`
          : `0 4px 12px rgba(0, 0, 0, 0.06)`,
        padding: "22px 18px 18px 18px",
        height: 130,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(title, !isActive);
        }}
        aria-label={`Toggle ${title}`}
        className="absolute top-2 right-3 transition-colors"
        style={{
          color: isActive ? accent : "#b0bec5",
        }}
      >
        {isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
      </button>

      {/* Content */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="text-3xl transition-colors"
          style={{ color: isActive ? accent : "#cfd8dc" }}
        >
          {icon}
        </div>
        <span
          className="text-[15px] font-semibold transition-colors"
          style={{ color: isActive ? "black" : "#37474f" }}
        >
          {title}
        </span>
      </div>
    </div>
  );
};


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const getGlobalSetMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const queryClient = useQueryClient();
  const {
    getMaterials,
    addMaterial,
    checkTiles,
    toggleTile,
    checkPDFStatus,
  } = useBusinessAPI();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    getGlobalSetMaterial || { 
      material_id: "100724-000000",
      material_description: "Glycerine",
      material_type_id: 1,
      material_status: "active",
      base_uom_id: 4,
      user_defined_material_desc: null,
      material_category: "Category - D",
      cas_no: "56-81-5",
      unspsc_code: null,
      hsn_code: "290545"
    }
  );
  console.log("selectedMaterial", selectedMaterial)
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });

  const [processingPdfIds, setProcessingPdfIds] = useLocalStorage(
    "processingPDFs",
    []
  );

  // Fetch materials using React Query
  const { data: materials, isLoading: isLoadingMaterials } = useQuery<
    Material[]
  >({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });


  // Fetch tile status using React Query
  const { data: tiles_data, isLoading: isLoadingTiles } = useQuery<Tile[]>({
    queryKey: ["tiles"],
    queryFn: checkTiles,
  });

  // Fetch processing PDFs - only if a PDF was uploaded
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

  // Add material mutation
  const addMaterialMutation = useMutation({
    mutationFn: addMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setNewMaterialName("");
      setShowAddOptions(false);
    },
  });

  // Toggle tile mutation
  const toggleTileMutation = useMutation({
    mutationFn: ({ title, active }: { title: string; active: boolean }) =>
      toggleTile(title, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiles"] });
    },
  });


  const handleToggleTile = (title: string, active: boolean) => {
    toggleTileMutation.mutate({ title, active });
  };

  const handleAddMaterial = () => {
    if (newMaterialName.trim()) {
      addMaterialMutation.mutate(newMaterialName);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // const handleUploadPDF = () => {
  //   if (selectedFile) {
  //     uploadPDFMutation.mutate(selectedFile);
  //   }
  // };

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

  const tiles = [
    {
      icon: <FaChartLine />,
      title: "Market Research Report",
      link: "/market-research-report",
    },
    {
      icon: <FaBalanceScale />,
      title: "Demand Supply Trends",
      link: "/demand-suppy-trend",
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Spend Analytics",
      link: "/spend-analytics",
    },
    { icon: <FaFileInvoiceDollar />, title: "Cost Sheet", link: "/costsheet" },
    { icon: <FaFolder />, title: "Fact Packs", link: "/fact-pack" },
    { icon: <FaNewspaper />, title: "News", link: "/news" },
    {
      icon: <FaUserTie />,
      title: "Supplier Tracking",
      link: "/supplier-tracking",
    },
    { icon: <FaTasks />, title: "Procurement Plan", link: "/procurement-plan" },
    {
      icon: <FaCalendarAlt />,
      title: "Seasonality Trends",
      link: "/seasonality-trends",
    },
    {
      icon: <FaHandshake />,
      title: "Price Forecast",
      link: "/price-forecast",
    },
    { icon: <FaKey />, title: "Key Value Drivers", link: "/key-value-drivers" },
    {
      icon: <FaUsers />,
      title: "Multiple Point Engagements",
      link: "/multiple-point-engagements",
    },
    { icon: <FaBoxes />, title: "Inventory Levels", link: "/inventory-levels" },

    { icon: <FaChartBar />, title: "Cyclical Patterns", link: "/cyclical-patterns" },
    { icon: <FaFileContract />, title: "Quotation Comparison", link: "/quotation-comparison" },
    { icon: <FaGlobe />, title: "Trade Data Analysis", link: "/trade-data-analysis" },
    { icon: <FaProjectDiagram />, title: "Joint Development Projects", link: "/joint-development-projects" },
    { icon: <FaSearchDollar />, title: "Price Benchmarking", link: "/price-benchmarking" },
    {
      icon: <FaPowerOff />,
      title: "Shutdown Tracker",
      link: "/shutdown-tracker",
    },
    { icon: <FaBullseye />, title: "Negotiation Templates", link: "/negotiation-objectives" },
    {
      icon: <FaAddressCard />,
      title: "Vendor Key Information",
      link: "/vendor-key-info",
    },
    {
      icon: <FaClipboardList />,
      title: "Vendors Minutes of Meeting",
      link: "/minutes-of-meeting",
    },
    {
      icon: <FaSitemap />,
      title: "Vendor Wise Action Plan",
      link: "/vendor-wise-action-plan",
    },
    { icon: <FaIndustry />, title: "Industry Porter Analysis", link: "/industry-porter-analysis" },
    { icon: <FaClipboardCheck />, title: "Internal Reviews Tracker" },
    
    { icon: <FaClipboardCheck />, title: "ESG Tracker", link: "/esg-tracker" },
    { icon: <FaCubes />, title: "REACH Tracker", link: "/reach-tracker" },
  ];



  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Upload Status Notification */}
        {uploadStatus.visible && (
          <div
            className={`p-4 rounded-lg ${uploadStatus.success
              ? "bg-green-100 border border-green-300 text-green-700"
              : "bg-red-100 border border-red-300 text-red-700"
              } flex items-center justify-between transition-all duration-300`}
          >
            <div className="flex items-center">
              {uploadStatus.success ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaExclamationCircle className="mr-2" />
              )}
              {uploadStatus.message}
            </div>
            <button
              onClick={() =>
                setUploadStatus((prev) => ({ ...prev, visible: false }))
              }
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Supply Chain Overview
          </h1>

          {/* Material Selector */}
          <div className="flex gap-4">
            <MaterialSelect
              materials={materials || []}
              selectedMaterial={selectedMaterial}
              onSelect={(selected) => {
                setSelectedMaterial(selected);
                if (selected) {
                  dispatch(setGlobalSelectedMaterial(selected));
                }
              }}
            />


          </div>
        </div>
        {/* Material Information Tiles */}
        {selectedMaterial && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {/* Material Name Tile */}
            <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
                  <FaCubes className="text-white text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                    Material Name
                  </h3>
                  <p className="text-lg font-bold text-gray-800 leading-tight truncate">
                    {selectedMaterial.material_description}
                  </p>
                </div>
              </div>
            </div>

            {/* CAS Number Tile */}
            <div className="bg-gradient-to-br from-green-50 via-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-sm">
                  <FaKey className="text-white text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">
                    CAS Number
                  </h3>
                  <p className="text-lg font-bold text-gray-800 leading-tight">
                    {selectedMaterial.cas_no|| 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* HSN Number Tile */}
            <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-sm">
                  <FaFileContract className="text-white text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">
                    HSN Number
                  </h3>
                  <p className="text-lg font-bold text-gray-800 leading-tight">
                    {selectedMaterial.hsn_code || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "30% 40% 30%" }}
        >
          <ProcurementNews materialId={selectedMaterial?.material_id || ""} locationId={212} />
          <PriceChartWithNews materialId={selectedMaterial?.material_id || ""} locationId={212} />
          <VendorWiseActionPlanList materialId={selectedMaterial?.material_id || ""} locationId={212} />
        </div>



        {/* Analytics Grid */}
        {selectedMaterial && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Analytics Overview for: {selectedMaterial?.material_description}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {tiles.map((tile, index) => {
                const tileInfo = tiles_data?.find((m) => m.name === tile.title);
                const isActive = tileInfo?.active || false;

                return (
                  <Tile
                    key={index}
                    icon={tile.icon}
                    title={tile.title}
                    onClick={() => tile.link && isActive && navigate(tile.link)}
                    isActive={isActive}
                    onToggle={handleToggleTile}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
