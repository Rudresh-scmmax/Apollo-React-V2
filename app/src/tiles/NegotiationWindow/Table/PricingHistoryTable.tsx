import React, { useState, useEffect } from "react";
import { Table, Input, Select, message, Spin, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useBusinessAPI } from "../../../services/BusinessProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import TextArea from "antd/es/input/TextArea";

interface GlycerinePriceChartProps {
  region: string;
}

interface NewsHighlight {
  title: string;
  news_url: string;
}

interface MaterialPriceHistory {
  id: number;
  month: string;
  price_per_uom: string;
  capacity_utilization: string;
  conversion_spread: string;
  factors_influencing_demand: NewsHighlight[] | string;
  demand_outlook: string;
  factors_influencing_supply: NewsHighlight[] | string;
  supply_disruption: string;
  business_cycle: string;
  news_highlight: NewsHighlight[] | string;
  news_insights_obj: {};
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
  region,
}) => {
  const { updateMaterialPriceHistory, getMaterialPriceHistory } =
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
    queryKey: ["materialPriceHistory", selectedMaterial, region],
    queryFn: () =>
      getMaterialPriceHistory(selectedMaterial?.material_id, region),
    enabled: !!selectedMaterial && !!region,
  });

  useEffect(() => {
    if (materialPriceHistory) {
      const parsed = materialPriceHistory.map((row: any) => ({
        ...row,
        news_highlight:
          typeof row.news_highlight === "string"
            ? JSON.parse(row.news_highlight)
            : row.news_highlight,
      }));
      setMaterialPriceHistoryData(parsed);
    }
  }, [materialPriceHistory]);

  const mutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(editingData);
      await Promise.all(
        updates.map(([id, fields]) =>
          Promise.all(
            Object.entries(fields).map(([field, value]) =>
              updateMaterialPriceHistory(Number(id), field, value as string)
            )
          )
        )
      );
    },
    onSuccess: () => {
      message.success("Material price history updated successfully");
      queryClient.invalidateQueries({ queryKey: ["materialPriceHistory"] });
      queryClient.invalidateQueries({ queryKey: ["materialPrices"] });
      queryClient.invalidateQueries({ queryKey: ["recomendations"] });
      setEditingData({});
      setEditingKey(null);
      setEditingColumn(null);
    },
    onError: () => {
      message.error("Error updating material price history");
    },
  });

  const handleInputChange = (
    value: any,
    key: number,
    column: keyof MaterialPriceHistory
  ) => {
    let parsedValue = value;

    // Parse JSON input for specific fields
    if (
      ["factors_influencing_demand", "factors_influencing_supply"].includes(
        column
      )
    ) {
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
      title: "PricePerUom",
      dataIndex: "price_per_uom",
      key: "price_per_uom",
    },
    ...[
      "capacity_utilization",
      "conversion_spread",
      "factors_influencing_demand",
      "demand_outlook",
      "factors_influencing_supply",
      "supply_disruption",
      "business_cycle",
      "news_highlight",
    ].map((key) => ({
      title: key.replace(/_/g, " ").toUpperCase(),
      dataIndex: key,
      key,
      render: (text: any, record: MaterialPriceHistory) => {
        const isEditing = editingKey === record.id && editingColumn === key;
        const isLinkField = [
          "factors_influencing_demand",
          "factors_influencing_supply",
        ].includes(key);
        const isNewsLikeField = [
          "news_highlight",
          "factors_influencing_demand",
          "factors_influencing_supply",
        ].includes(key);
        // ...existing code...
const isEditableNewsField = [
  "factors_influencing_demand",
  "factors_influencing_supply",
  "news_highlight",
].includes(key);

// ...inside the render function for news-like fields...
if (isNewsLikeField) {
  let newsData: NewsHighlight[] | string = text;

  try {
    newsData = typeof text === "string" ? JSON.parse(text) : text;
    newsData = Array.isArray(newsData)
      ? newsData.filter(
          (item): item is NewsHighlight =>
            typeof item === "object" &&
            item !== null &&
            "title" in item &&
            "news_url" in item
        )
      : newsData[0];
  } catch (e) {
    newsData = text;
  }

  const hasNews =
    Array.isArray(newsData) &&
    newsData.length > 0 &&
    newsData[0] !== null;

  const content = Array.isArray(newsData) ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {hasNews
        ? newsData.map((news, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "flex-start" }}
            >
              <span style={{ marginRight: "8px" }}>•</span>
              <a
                href={news?.news_url}
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
        : <span style={{ color: "#bbb" }}>[Double click to edit]</span>}
    </div>
  ) : (
    text && text !== "" ? (
      <span>{newsData}</span>
    ) : (
      <span style={{ color: "#bbb" }}>[Double click to edit]</span>
    )
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

  // Optional: tooltip for extra info (news_insights_obj shown only for news_highlight)
  if (
    key === "news_highlight" &&
    record.news_insights_obj &&
    Object.keys(record.news_insights_obj).length > 0
  ) {
    const tooltipContent = (
      <pre
        style={{ maxWidth: 500, whiteSpace: "pre-wrap", fontSize: 12 }}
      >
        {JSON.stringify(record.news_insights_obj, null, 2)}
      </pre>
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
          style={{ cursor: isEditableNewsField ? "pointer" : "default" }}
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

// ...for other editable fields (like demand_outlook, supply_disruption)...
return isEditing ||
  ["demand_outlook", "supply_disruption"].includes(key) ? (
  ["demand_outlook", "supply_disruption"].includes(key) ? (
    <Select
      value={
        editingData[record.id]?.[key as keyof MaterialPriceHistory] ||
        text
      }
      onChange={(value) =>
        handleInputChange(
          value,
          record.id,
          key as keyof MaterialPriceHistory
        )
      }
    >
      {["Low", "Medium", "High"].map((option) => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  ) : (
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
  )
) : (
  <span
    onDoubleClick={(e) => {
      if (
        key === "demand_outlook" ||
        key === "supply_disruption" ||
        isEditableNewsField
      ) {
        e.preventDefault();
        setEditingKey(record.id);
        setEditingColumn(key);
      }
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      cursor:
        key === "demand_outlook" ||
        key === "supply_disruption" ||
        isEditableNewsField
          ? "pointer"
          : "default",
      minHeight: 32,
      color:
        (text === undefined || text === null || text === "") &&
        (isEditableNewsField ||
          key === "demand_outlook" ||
          key === "supply_disruption")
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
                Object.keys(editingData).length === 0 || mutation.isPending
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
