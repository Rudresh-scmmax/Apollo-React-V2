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
import { Material, useBusinessAPI } from "../services/BusinessProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "../services/StorageProvider";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setGlobalSelectedMaterial } from "../store/materialSlice";

interface TileProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive: boolean;
  onToggle: (name: string, active: boolean) => void;
}

const Tile: React.FC<TileProps> = ({
  icon,
  title,
  onClick,
  isActive,
  onToggle,
}) => (
  <div className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
    <div className="absolute top-2 right-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(title, !isActive);
        }}
        className="text-blue-600 hover:text-blue-800"
      >
        {isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
      </button>
    </div>
    <div
      onClick={onClick}
      className="flex flex-col items-center text-center gap-3 cursor-pointer pt-3"
    >
      <div
        className={`text-2xl ${isActive ? "text-blue-600" : "text-gray-400"}`}
      >
        {icon}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? "text-gray-800" : "text-gray-400"
        }`}
      >
        {title}
      </span>
    </div>
  </div>
);

const NewsUpdateCard: React.FC<{
  category: string;
  // headline: string;
  summary: string;
  // impact: "positive" | "negative" | "neutral";
  timeframe: string;
}> = ({ category, /* headline,*/ summary, /*impact,*/ timeframe }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
        {category}
      </span>
      <span className="text-xs text-gray-400">{timeframe}</span>
    </div>
    <p className="text-sm text-gray-600 mb-3">{summary}</p>
    <div className="flex items-center"></div>
  </div>
);
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
    uploadPDF,
    getDailyUpdate,
    addMaterial,
    checkTiles,
    toggleTile,
    checkPDFStatus,
  } = useBusinessAPI();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    getGlobalSetMaterial
  );
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

  // Fetch daily updates using React Query
  const { data: dailyUpdates, isLoading: isLoadingDailyUpdates } = useQuery<
    DailyUpdate[]
  >({
    queryKey: ["dailyUpdates"],
    queryFn: getDailyUpdate,
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
      title: "Negotiation Window",
      link: "/negotiation-window",
    },
    { icon: <FaKey />, title: "Key Value Drivers", link: "/key-value-drivers" },
    {
      icon: <FaUsers />,
      title: "Multiple Point Engagements",
      link: "/multiple-point-engagements",
    },
    { icon: <FaBoxes />, title: "Inventory Levels", link: "/inventory-levels" },

    {
      icon: <FaChartBar />,
      title: "Cyclical Patterns",
      link: "/cyclical-patterns",
    },
    {
      icon: <FaFileContract />,
      title: "Quotation Comparison",
      link: "/quotation-comparison",
    },
    {
      icon: <FaGlobe />,
      title: "Trade Data Analysis",
      link: "/trade-data-analysis",
    },
    {
      icon: <FaProjectDiagram />,
      title: "Joint Development Projects",
      link: "/joint-development-projects",
    },
    {
      icon: <FaSearchDollar />,
      title: "Price Benchmarking",
      link: "/price-benchmarking",
    },
    {
      icon: <FaPowerOff />,
      title: "Shutdown Tracker",
      link: "/shutdown-tracker",
    },
    {
      icon: <FaBullseye />,
      title: "Negotiation Objectives",
      link: "/negotiation-objectives",
    },
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
    {
      icon: <FaIndustry />,
      title: "Industry Porter Analysis",
      link: "/industry-porter-analysis",
    },
    { icon: <FaClipboardCheck />, title: "Internal Reviews Tracker" },
  ];

  if (isLoadingMaterials || isLoadingDailyUpdates || isLoadingTiles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Upload Status Notification */}
        {uploadStatus.visible && (
          <div
            className={`p-4 rounded-lg ${
              uploadStatus.success
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
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white max-w-[250px] truncate"
              value={selectedMaterial?.material_id || ""}
              onChange={(e) => {
                const selected = materials?.find(
                  (material) => material.material_id === e.target.value
                );
                setSelectedMaterial(selected ?? null);
                if (selected) {
                  dispatch(setGlobalSelectedMaterial(selected));
                }
              }}
            >
              <option value="">Select Material</option>
              {materials?.map((material, index) => (
                <option
                  key={index}
                  value={material?.material_id}
                  title={material?.material_description} // Show full on hover
                >
                  {material?.material_description?.slice(0, 50)}
                  {/* Optional manual trim */}
                </option>
              ))}
            </select>
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

        {/* Daily Updates */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Procurement News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyUpdates?.map((update, index) => (
              <NewsUpdateCard key={index} {...update} />
            ))}
          </div>
        </div>

        {/* Analytics Grid */}
        {selectedMaterial && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Analytics Dashboard for: {selectedMaterial?.material_description}
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
