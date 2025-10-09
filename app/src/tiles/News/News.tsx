import React, { useEffect, useState } from "react";
import { Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";
import { FiSettings } from "react-icons/fi";
import UploadNewsInsight from "../../common/UploadNewsInsight";

const News: React.FC<any> = () => {
  const { getNewsInsights, getRegions } = useBusinessAPI();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: regions } = useQuery<string[]>({
      queryKey: ["regions", selectedMaterial?.material_id],
      queryFn: () => getRegions(selectedMaterial?.material_id || "", "news_highlight"),
      enabled: !!selectedMaterial?.material_id,
    });

  const [selectedRegion, setSelectedRegion] = useState<string>("");

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0]);
    }
  }, [regions, selectedRegion]);

  const { data: newsInsights, isLoading } = useQuery({
    queryKey: ["newsInsights", selectedMaterial?.material_id, selectedRegion],
    queryFn: () =>
      getNewsInsights(selectedMaterial?.material_id, selectedRegion),
    enabled: !!selectedMaterial?.material_id && !!selectedRegion,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: string) => source,
    },
    {
      title: "Link",
      dataIndex: "news_url",
      key: "news_url",
      render: (news_url: string) => (
        <a
          href={news_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          {news_url ? "View Report" : ""}
        </a>
      ),
    },
    {
      title: "News",
      dataIndex: "title",
      key: "title",
      render: (title: string) => title,
    },
  ];

  const dataSource = newsInsights?.map((item: any, index: number) => ({
    key: index,
    date: item.date,
    news_url: item.news_url,
    title: item.title,
    source: item.source,
  }));

  return (
    <div className="container mx-auto p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          News Takeaway for:{" "}
          {selectedMaterial?.material_description || "All Material"}
        </h1>
        <div className="flex items-center gap-4">
        <RegionSelector
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
        <button
          className="text-gray-600 hover:text-gray-900 text-2xl"
          onClick={() => setShowSettings((prev) => !prev)}
        >
          <FiSettings />
        </button>
      </div>
      </div>
      {showSettings && <UploadNewsInsight />}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default News;
