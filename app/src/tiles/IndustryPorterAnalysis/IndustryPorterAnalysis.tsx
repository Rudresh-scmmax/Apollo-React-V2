import React, { useMemo, useState } from "react";
import { FaExchangeAlt, FaUsers, FaUserTie, FaBalanceScale, FaIndustry } from "react-icons/fa";
import { ReloadOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Select, message } from "antd";

// Icon mapping
const forceIconMap: Record<string, React.ReactNode> = {
  bargaining_power_suppliers: <FaUserTie size={22} className="text-gray-500 mr-2" />,
  threat_of_substitution: <FaExchangeAlt size={22} className="text-gray-500 mr-2" />,
  threat_new_entrants: <FaIndustry size={22} className="text-gray-500 mr-2" />,
  bargaining_power_buyers: <FaUsers size={22} className="text-gray-500 mr-2" />,
  competitive_rivalry: <FaBalanceScale size={22} className="text-gray-500 mr-2" />,
};

const prettyTitleMap: Record<string, string> = {
  bargaining_power_suppliers: "Bargaining Power of Suppliers",
  threat_of_substitution: "Threat of Substitution",
  threat_new_entrants: "Threat of New Entrants",
  bargaining_power_buyers: "Bargaining Power of Buyers",
  competitive_rivalry: "Competitive Rivalry",
};

const gridTemplate = [
  [0, 1, 2],
  [3, 4, null],
];

const IndustryPorterAnalysis: React.FC = () => {
  const { getPortersAnalysis, refreshPortersAnalysis, updatePortersAnalysis } = useBusinessAPI();
  const selectedMaterial = useSelector((state: RootState) => state.material.globalSelectedMaterial);
  const materialCode = selectedMaterial?.material_id;
  const materialDesc = selectedMaterial?.material_description || "All Material";

  const [regenLoading, setRegenLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portersAnalysis", materialCode],
    queryFn: () => getPortersAnalysis(materialCode || ""),
    enabled: typeof materialCode === "string" && !!materialCode,
    retry: false,
  });


  const handleRegenerate = async () => {
    setRegenLoading(true);
    try {
      if (typeof materialCode === "string" && materialCode) {
        await queryClient.fetchQuery({
          queryKey: ["portersAnalysis", materialCode],
          queryFn: () => refreshPortersAnalysis(materialCode, true),
          staleTime: 0,
        });
        queryClient.invalidateQueries({ queryKey: ["portersAnalysis", materialCode] });
      }
    } finally {
      setRegenLoading(false);
    }
  };

  const handleEdit = () => {
    if (data) {
      setAnalysisId(data.id);
      setEditedData(JSON.parse(JSON.stringify(data.analysis_json)));
      setIsEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!editedData || !materialCode) return;
    
    setSaveLoading(true);
    try {
      await updatePortersAnalysis(materialCode, editedData, analysisId || undefined);
      message.success("Porter's analysis updated successfully!");
      setIsEditMode(false);
      setEditedData(null);
      setAnalysisId(null);
      queryClient.invalidateQueries({ queryKey: ["portersAnalysis", materialCode] });
    } catch (error) {
      message.error("Failed to update Porter's analysis");
      console.error("Error updating analysis:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedData(null);
    setAnalysisId(null);
  };

  const handleFieldChange = (forceKey: string, field: string, value: string) => {
    if (editedData) {
      setEditedData((prev: any) => ({
        ...prev,
        [forceKey]: {
          ...prev[forceKey],
          [field]: value
        }
      }));
    }
  };

  const forces = useMemo(() => {
    if (!data || isError) return null;

    // Use edited data if in edit mode, otherwise use original data
    const porters = isEditMode ? editedData : data.analysis_json;

    // Check if porters exists and is an object
    if (!porters || typeof porters !== 'object') return null;

    const keys = [
      "bargaining_power_suppliers",
      "threat_of_substitution",
      "threat_new_entrants",
      "bargaining_power_buyers",
      "competitive_rivalry",
    ];

    const allPresent = keys.every((key) => porters[key]);
    if (!allPresent) return null;

    return keys.map((key) => {
      const force = porters[key] || {};
      let color = "text-lime-700";
      let bar = "w-2/5 bg-lime-400";
      if (force?.intensity?.toLowerCase().includes("high")) {
        color = "text-lime-700";
        bar = "w-4/5 bg-lime-600";
      } else if (force?.intensity?.toLowerCase().includes("low")) {
        color = "text-lime-700";
        bar = "w-1/5 bg-lime-200";
      }
      return {
        title: force?.title || key,
        icon: forceIconMap[key] || null,
        color,
        intensity: force?.intensity || "",
        bar,
        description: force?.description || "",
        key,
      };
    });
  }, [data, isError, isEditMode, editedData]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-lg px-10 py-10 mt-10">
        {/* Header row with flex alignment */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Porter's Five Forces Analysis for: <span className="text-lime-700">{materialDesc}</span>
            </h1>
            {isEditMode && (
              <p className="text-sm text-blue-600 mt-1">
                ✏️ Edit Mode - You can modify the analysis below
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditMode ? (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    fontSize: "16px",
                    height: "40px",
                    paddingLeft: "30px",
                    paddingRight: "30px"
                  }}
                >
                  Edit Analysis
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  loading={regenLoading}
                  onClick={handleRegenerate}
                  style={{
                    backgroundColor: "#a0bf3f",
                    borderColor: "#a0bf3f",
                    fontSize: "16px",
                    height: "40px",
                    paddingLeft: "30px",
                    paddingRight: "30px"
                  }}
                >
                  Regenerate Analysis
                </Button>
              </>
            ) : (
              <>
                <Button
                  icon={<SaveOutlined />}
                  loading={saveLoading}
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    fontSize: "16px",
                    height: "40px",
                    paddingLeft: "30px",
                    paddingRight: "30px"
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#ff4d4f",
                    borderColor: "#ff4d4f",
                    fontSize: "16px",
                    height: "40px",
                    paddingLeft: "30px",
                    paddingRight: "30px"
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Card grid below header row */}
        {isLoading ? (
          <div className="text-center text-gray-500 py-20">Loading Porter's analysis...</div>
        ) : !forces ? (
          <div className="text-center text-red-500 py-20">No Porter's analysis data available for this material.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12" style={{ minHeight: 420 }}>
            {gridTemplate.flat().map((idx, i) => {
              if (idx !== null && forces[idx]) {
                const { key, ...forceProps } = forces[idx];
                return (
                  <ForceCard 
                    key={key} 
                    forceKey={key} 
                    {...forceProps} 
                    isEditMode={isEditMode}
                    onFieldChange={handleFieldChange}
                  />
                );
              } else {
                return <div key={`empty-${i}`} />;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ForceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  intensity: string;
  bar: string;
  color: string;
  forceKey: string;
  isEditMode?: boolean;
  onFieldChange?: (forceKey: string, field: string, value: string) => void;
}> = ({ icon, title, description, intensity, bar, color, forceKey, isEditMode = false, onFieldChange }) => {
  const intensityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const getBarClass = (intensity: string) => {
    if (intensity?.toLowerCase().includes("high")) {
      return "w-4/5 bg-lime-600";
    } else if (intensity?.toLowerCase().includes("low")) {
      return "w-1/5 bg-lime-200";
    }
    return "w-2/5 bg-lime-400";
  };

  return (
  <div className={`bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-between min-h-[220px] w-full hover:shadow-md transition-shadow ${
    isEditMode ? 'border-blue-300 border-2' : 'border-gray-200'
  }`}>
    <div className="flex items-center mb-2">
      {icon}
      <span className="font-bold text-lg ml-1" style={{ color: '#7ca200' }}>
        {prettyTitleMap[forceKey] || title}
      </span>
    </div>
    
    {isEditMode ? (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <Input.TextArea
          value={description}
          onChange={(e) => onFieldChange?.(forceKey, "description", e.target.value)}
          placeholder="Enter description"
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="mb-4"
        />
      </div>
    ) : (
      <p className="text-gray-700 text-sm mb-6 leading-relaxed break-words">{description}</p>
    )}
    
    <div className="flex items-center justify-between mt-auto">
      <div className="w-3/5 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
        <div className={`h-1.5 rounded-full ${isEditMode ? getBarClass(intensity) : bar}`}></div>
      </div>
      
      {isEditMode ? (
        <Select
          value={intensity}
          onChange={(value) => onFieldChange?.(forceKey, "intensity", value)}
          options={intensityOptions}
          className="w-20"
          size="small"
        />
      ) : (
        <span className={`text-xs font-semibold ${color} whitespace-nowrap`}>{intensity}</span>
      )}
    </div>
  </div>
  );
};

export default IndustryPorterAnalysis;
