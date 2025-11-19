import React, { useState, useEffect } from "react";
import { Table, Input, Select, message, Spin, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useBusinessAPI } from "../../../services/BusinessProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import TextArea from "antd/es/input/TextArea";

interface GlycerinePriceChartProps {
  locationId: number | null;
}

interface NewsHighlight {
  url: string;
  tags: string[];
  title: string;
  published_date: string;
  type_of_impact: string;
}

interface MaterialPriceHistory {
  id: number;
  material_id: string;
  date: string;
  price_per_uom: string;
  currency: string;
  region: string;
  news_insights: NewsHighlight[] | null;
  date_month: string;
  demand_summary: string | null;
  supply_summary: string | null;
  combined_summary?: string | null;
  demand_count?: number | null;
  supply_count?: number | null;
  source: string;
  month: string;
}

const formStyles = {
  button: `w-auto bg-gradient-to-r from-[#4A5A1E] to-[#5B6E25] px-4 py-3 
             rounded-lg hover:from-[#3D4A19] hover:to-[#4A5A1E] focus:outline-none 
             focus:ring-2 focus:ring-[#4A5A1E] focus:ring-offset-2 focus:ring-offset-[#A0BF3F]
             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
             font-semibold text-white`,
};

const { Option } = Select;

const EditableMaterialTable: React.FC<GlycerinePriceChartProps> = ({
  locationId,
}) => {
  const { updateMaterialPriceHistory, updateMaterialPriceHistoryBulk, getMaterialPriceHistory } =
    useBusinessAPI();
  const queryClient = useQueryClient();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const [editingData, setEditingData] = useState<
    Record<number, Partial<MaterialPriceHistory>>
  >({});
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [materialPriceHistoryData, setMaterialPriceHistoryData] =
    useState<any>();

  const { data: materialPriceHistory, isLoading } = useQuery({
    queryKey: ["materialPriceHistory", selectedMaterial, locationId],
    queryFn: () =>
      getMaterialPriceHistory(selectedMaterial?.material_id, locationId?.toString(), 24),
    enabled: !!selectedMaterial && locationId !== null,
  });

  useEffect(() => {
    if (materialPriceHistory) {
      setMaterialPriceHistoryData(materialPriceHistory);
    }
  }, [materialPriceHistory]);

  const mutation = useMutation({
    mutationFn: async () => {
      console.log("Selected Material:", selectedMaterial);
      console.log("Location ID:", locationId);
      
      if (!selectedMaterial) {
        throw new Error("No material selected. Please select a material first.");
      }
      
      if (!selectedMaterial.material_id) {
        throw new Error("Material ID is missing. Please select a valid material.");
      }
      
      if (!locationId) {
        throw new Error("Location is required. Please select a location.");
      }

      // Prepare news insights from the editing data
      const newsInsights: any[] = [];
      const demandSupplySummaries: any[] = [];

      Object.entries(editingData).forEach(([id, fields]) => {
        const record = materialPriceHistoryData?.find((item: any) => item.id === Number(id));
        if (!record) return;

        // Process news insights
        if (fields.news_insights) {
          try {
            const newsData = typeof fields.news_insights === 'string' 
              ? JSON.parse(fields.news_insights) 
              : fields.news_insights;
            
            if (Array.isArray(newsData)) {
              newsData.forEach((newsItem: any) => {
                if (newsItem && newsItem.title) {
                  newsInsights.push({
                    title: newsItem.title,
                    source: newsItem.source || newsItem.source_link || '',
                    source_link: newsItem.url || newsItem.source_link || '',
                    published_date: newsItem.published_date || record.date,
                    news_tag: newsItem.type_of_impact || newsItem.news_tag || '',
                    sentiment: newsItem.sentiment,
                    impact_score: newsItem.impact_score,
                    relevance_score: newsItem.relevance_score
                  });
                }
              });
            }
          } catch (e) {
            console.error('Error parsing news insights:', e);
          }
        }

        // Process demand/supply summaries
        if (fields.demand_summary || fields.supply_summary) {
          demandSupplySummaries.push({
            summary_date: record.date,
            demand_summary: fields.demand_summary || record.demand_summary,
            supply_summary: fields.supply_summary || record.supply_summary,
            combined_summary: fields.combined_summary || record.combined_summary,
            demand_count: fields.demand_count || record.demand_count,
            supply_count: fields.supply_count || record.supply_count
          });
        }
      });

      // Use the new bulk update API
      const materialIdStr = selectedMaterial.material_id;
      console.log("Material ID string:", materialIdStr, "Type:", typeof materialIdStr);
      
      if (!materialIdStr || materialIdStr === 'null' || materialIdStr === 'undefined') {
        throw new Error("Material ID is null or undefined. Please select a valid material.");
      }
      
      // The API expects material_id as a string, so we'll use it as-is
      const materialId = String(materialIdStr);
      console.log("Material ID for API:", materialId);

      const request = {
        material_id: materialId,
        location_id: locationId,
        ...(newsInsights.length > 0 && { news_insights: newsInsights }),
        ...(demandSupplySummaries.length > 0 && { 
          demand_supply_summary: demandSupplySummaries[0] // Take the first one for now
        })
      };

      console.log("API Request:", request);

      return updateMaterialPriceHistoryBulk(request);
    },
    onSuccess: (response) => {
      message.success(`Material price history updated successfully. ${response.updated_news_count ? `Updated ${response.updated_news_count} news insights.` : ''}`);
      queryClient.invalidateQueries({ queryKey: ["materialPriceHistory"] });
      queryClient.invalidateQueries({ queryKey: ["materialPrices"] });
      queryClient.invalidateQueries({ queryKey: ["recomendations"] });
      setEditingData({});
      setEditingKey(null);
      setEditingColumn(null);
    },
    onError: (error) => {
      message.error(`Error updating material price history: ${error.message}`);
    },
  });

  const handleInputChange = (
    value: any,
    key: number,
    column: keyof MaterialPriceHistory
  ) => {
    let parsedValue = value;

    // Parse JSON input for specific fields
    if (["demand_summary", "supply_summary"].includes(column)) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // If parsing fails, keep the raw value
        parsedValue = value;
      }
    }

    setEditingData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [column]: parsedValue },
    }));
    setMaterialPriceHistoryData((prevData: any[]) =>
      prevData.map((e) => (e.id === key ? { ...e, [column]: parsedValue } : e))
    );
  };

  const columns: ColumnsType<MaterialPriceHistory> = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Price Per UOM",
      dataIndex: "price_per_uom",
      key: "price_per_uom",
    },
    ...[
      "demand_summary",
      "supply_summary",
      "news_insights",
    ].map((key) => ({
      title: key.replace(/_/g, " ").toUpperCase(),
      dataIndex: key,
      key,
      render: (text: any, record: MaterialPriceHistory) => {
        const isEditing = editingKey === record.id && editingColumn === key;
        const isLinkField = ["demand_summary", "supply_summary"].includes(key);
        const isNewsLikeField = [
          "news_insights",
          "demand_summary",
          "supply_summary",
        ].includes(key);
        // ...existing code...
        const isEditableNewsField = [
          "demand_summary",
          "supply_summary",
          "news_insights",
        ].includes(key);

        // ...inside the render function for news-like fields...
        if (isNewsLikeField) {
          let newsData: NewsHighlight[] | string = text;

          if (key === "news_insights") {
            newsData = text;
            // Filter to show ONLY news items that have tags
            if (Array.isArray(newsData)) {
              newsData = newsData.filter((newsItem: any) => {
                // Check if the news item has tags
                if (
                  newsItem &&
                  typeof newsItem === "object" &&
                  "tags" in newsItem &&
                  Array.isArray(newsItem.tags) &&
                  newsItem.tags.length > 0
                ) {
                  return true; // Show this news item - it has tags
                }
                return false; // Hide this news item - no tags
              });
            }
          } else {
            // For demand_summary and supply_summary, keep as string
            newsData = text;
          }

          const hasNews =
            Array.isArray(newsData) &&
            newsData.length > 0 &&
            newsData[0] !== null;

          const content = Array.isArray(newsData) ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {hasNews ? (
                newsData.map((news, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "flex-start" }}
                  >
                    <span style={{ marginRight: "8px" }}>•</span>
                    <a
                      href={news?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: "blue",
                        textDecoration: "underline",
                        display: "block",
                        textAlign: "left",
                        marginRight: "15px",
                      }}
                    >
                      {news?.title}
                    </a>
                  </div>
                ))
              ) : (
                <span style={{ color: "#bbb" }}>[Double click to edit]</span>
              )}
            </div>
          ) : text && text !== "" ? (
            <span>{newsData}</span>
          ) : (
            <span style={{ color: "#bbb" }}>[Double click to edit]</span>
          );

          if (
            isEditableNewsField &&
            editingKey === record.id &&
            editingColumn === key
          ) {
            let raw =
              editingData[record.id]?.[key as keyof MaterialPriceHistory] ??
              text ??
              "";
            let valueStr = "";
            if (typeof raw === "string") {
              valueStr = raw;
            } else if (typeof raw === "object" && raw !== null) {
              valueStr = JSON.stringify(raw, null, 2);
            } else {
              valueStr = "";
            }
            return (
              <TextArea
                autoSize={{ minRows: 3 }}
                value={valueStr}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    record.id,
                    key as keyof MaterialPriceHistory
                  )
                }
              />
            );
          }

          // Optional: tooltip for extra info (show individual news items with their tags)
          if (
            key === "news_insights" &&
            Array.isArray(newsData) &&
            newsData.length > 0
          ) {
            const tooltipContent = (
              <div style={{ 
                maxWidth: 500, 
                fontSize: 14,
                color: '#fff',
                backgroundColor: '#1e293b',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #475569'
              }}>
                {newsData.map((newsItem: any, index: number) => (
                  <div key={index} style={{ 
                    marginBottom: 12, 
                    padding: 12, 
                    backgroundColor: '#334155', 
                    borderRadius: 6,
                    border: '1px solid #475569'
                  }}>
                    <div style={{ color: '#f1f5f9', marginBottom: 6 }}>
                      <strong style={{ color: '#60a5fa' }}>Title:</strong> {newsItem.title}
                    </div>
                    <div style={{ color: '#f1f5f9', marginBottom: 6 }}>
                      <strong style={{ color: '#60a5fa' }}>Date:</strong> {newsItem.published_date}
                    </div>
                    <div style={{ color: '#f1f5f9', marginBottom: 6 }}>
                      <strong style={{ color: '#60a5fa' }}>Type:</strong> {newsItem.type_of_impact}
                    </div>
                    {newsItem.tags && newsItem.tags.length > 0 && (
                      <div style={{ color: '#f1f5f9' }}>
                        <strong style={{ color: '#5B6E25' }}>Tags:</strong> 
                        <span style={{ 
                          color: '#A0BF3F',
                          fontWeight: 'bold',
                          marginLeft: 8,
                          padding: '2px 6px',
                          backgroundColor: '#4A5A1E',
                          borderRadius: 4
                        }}>
                          {newsItem.tags.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
            return (
              <Tooltip placement="left" title={tooltipContent}>
                <span
                  onDoubleClick={(e) => {
                    if (isEditableNewsField) {
                      e.preventDefault();
                      setEditingKey(record.id);
                      setEditingColumn(key);
                    }
                  }}
                  style={{
                    cursor: isEditableNewsField ? "pointer" : "default",
                  }}
                >
                  {content}
                </span>
              </Tooltip>
            );
          }

          return (
            <span
              onDoubleClick={(e) => {
                if (isEditableNewsField) {
                  e.preventDefault();
                  setEditingKey(record.id);
                  setEditingColumn(key);
                }
              }}
              style={{ cursor: isEditableNewsField ? "pointer" : "default" }}
            >
              {content}
            </span>
          );
        }

        // For other fields
        return isEditing ? (
          <Input
            value={
              editingData[record.id]?.[key as keyof MaterialPriceHistory] ||
              text
            }
            onChange={(e) =>
              handleInputChange(
                e.target.value,
                record.id,
                key as keyof MaterialPriceHistory
              )
            }
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              if (isEditableNewsField) {
                e.preventDefault();
                setEditingKey(record.id);
                setEditingColumn(key);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: isEditableNewsField ? "pointer" : "default",
              minHeight: 32,
              color:
                (text === undefined || text === null || text === "") &&
                isEditableNewsField
                  ? "#bbb"
                  : undefined,
            }}
          >
            {text && text !== "" ? (
              text
            ) : (
              <span style={{ color: "#bbb" }}>[Double click to edit]</span>
            )}
          </span>
        );
        // ...rest of the file remains unchanged...
      },
    })),
  ];

  return (
    <>
      <style>
        {`
        .ant-table-cell {
          vertical-align: top !important;
        }
      `}
      </style>
      <div>
        <Table
          columns={columns}
          dataSource={materialPriceHistoryData}
          rowKey="id"
          pagination={false}
          scroll={{ x: "100%" }}
        />
        {materialPriceHistoryData?.length ? (
          <div className="text-right mt-4 mr-4">
            <button
              onClick={() =>
                Object.keys(editingData).length && mutation.mutate()
              }
              disabled={
                Object.keys(editingData).length === 0 || 
                mutation.isPending ||
                !selectedMaterial?.material_id
              }
              className={formStyles.button}
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default EditableMaterialTable;
