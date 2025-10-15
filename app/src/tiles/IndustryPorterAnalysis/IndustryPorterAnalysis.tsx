import React, { useMemo } from "react";
import { FaExchangeAlt, FaUsers, FaUserTie, FaBalanceScale, FaIndustry } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery } from "@tanstack/react-query";

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
  const { getPortersAnalysis } = useBusinessAPI();
  const selectedMaterial = useSelector((state: RootState) => state.material.globalSelectedMaterial);
  const materialId = selectedMaterial?.material_id;
  const materialDesc = selectedMaterial?.material_description || "All Material";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portersAnalysis", materialId],
    queryFn: () => getPortersAnalysis(materialId!),
    enabled: typeof materialId === "string" && !!materialId,
    retry: false,
  });

  const forces = useMemo(() => {
    if (!data || isError) return null;
    const porters = data.porters_analysis || {};
    const keys = [
      "bargaining_power_suppliers",
      "threat_of_substitution",
      "threat_new_entrants",
      "bargaining_power_buyers",
      "competitive_rivalry",
    ];
    // Only return forces if all keys are present and have data
    const allPresent = keys.every((key) => porters[key]);
    if (!allPresent) return null;
    return keys.map((key) => {
      const force = porters[key];
      let color = "text-lime-700";
      let bar = "w-2/5 bg-lime-400";
      if (force.intensity?.toLowerCase().includes("high")) {
        color = "text-lime-700";
        bar = "w-4/5 bg-lime-600";
      } else if (force.intensity?.toLowerCase().includes("low")) {
        color = "text-lime-700";
        bar = "w-1/5 bg-lime-200";
      }
      return {
        title: force.title || key,
        icon: forceIconMap[key] || null,
        color,
        intensity: force.intensity || "",
        bar,
        description: force.description || "",
        key,
      };
    });
  }, [data, isError]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-lg px-10 py-10 mt-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-10">
          Porter's Five Forces Analysis for: <span className="text-lime-700">{materialDesc}</span>
        </h1>
        {isLoading ? (
          <div className="text-center text-gray-500 py-20">Loading Porter's analysis...</div>
        ) : !forces ? (
          <div className="text-center text-red-500 py-20">No Porter's analysis data available for this material.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12" style={{ minHeight: 420 }}>
            {gridTemplate.flat().map((idx, i) => {
              if (idx !== null && forces[idx]) {
                const { key, ...forceProps } = forces[idx];
                return <ForceCard key={key} forceKey={key} {...forceProps} />;
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
}> = ({ icon, title, description, intensity, bar, color, forceKey }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between min-h-[220px] w-full hover:shadow-md transition-shadow">
    <div className="flex items-center mb-2">
      {icon}
      <span className="font-bold text-lg ml-1" style={{ color: '#7ca200' }}>
        {prettyTitleMap[forceKey] || title}
      </span>
    </div>
    <p className="text-gray-700 text-sm mb-6 leading-relaxed break-words">{description}</p>
    <div className="flex items-center justify-between mt-auto">
      <div className="w-3/5 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
        <div className={`h-1.5 rounded-full ${bar}`}></div>
      </div>
      <span className={`text-xs font-semibold ${color} whitespace-nowrap`}>{intensity}</span>
    </div>
  </div>
);

export default IndustryPorterAnalysis; 