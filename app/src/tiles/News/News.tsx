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
  const { getNewsInsights, getNewsLocations } = useBusinessAPI();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: locations } = useQuery<{location_id: number, location_name: string}[]>({
      queryKey: ["newsLocations", selectedMaterial?.material_id],
      queryFn: () => getNewsLocations(selectedMaterial?.material_id || ""),
      enabled: !!selectedMaterial?.material_id,
    });

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (locations && locations.length > 0 && selectedLocationId === null) {
      setSelectedLocationId(locations[0].location_id);
    }
  }, [locations, selectedLocationId]);

  const { data: newsInsights, isLoading } = useQuery({
    queryKey: ["newsInsights", selectedMaterial?.material_id, selectedLocationId],
    queryFn: () =>
      getNewsInsights(selectedMaterial?.material_id, selectedLocationId || undefined),
    enabled: !!selectedMaterial?.material_id && selectedLocationId !== null,
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
      dataIndex: "source_link",
      key: "source_link",
      render: (source_link: string) => (
        <a
          href={source_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          {source_link ? "View Report" : ""}
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
    date: item.published_date,
    source_link: item.source_link,
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
          regions={locations}
          selectedRegion={locations?.find(loc => loc.location_id === selectedLocationId)?.location_name || ""}
          setSelectedRegion={(locationName: string) => {
            const location = locations?.find(loc => loc.location_name === locationName);
            if (location) {
              setSelectedLocationId(location.location_id);
            }
          }}
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
