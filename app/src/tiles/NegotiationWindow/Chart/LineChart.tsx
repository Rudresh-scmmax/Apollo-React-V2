import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import {
  StrategyRecommendation,
  useBusinessAPI,
} from "../../../services/BusinessProvider";
import CostumTextField from "../../../common/CostumTextField";
import { message } from "antd";

interface DataPoint {
  x: string;
  y: number;
  news?: string;
}


interface GlycerinePriceChartProps {
  locationId: number | null;
  model: string;
  onModelChange?: (modelName: string) => void;
}

const GlycerinePriceChart: React.FC<GlycerinePriceChartProps> = ({
  locationId,
  model,
  onModelChange,
}) => {
  const { getMaterialPrices, getLatestNews, getKeyMetrics, triggerForecast } =
    useBusinessAPI();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const queryClient = useQueryClient();
  const [isTriggering, setIsTriggering] = useState(false);

  const { data: materialPriceHistory } = useQuery<MaterialPriceResponse>({
    queryKey: ["materialPrices", selectedMaterial, locationId, model],
    queryFn: () => getMaterialPrices(selectedMaterial?.material_id, locationId?.toString(), model),
    enabled: !!selectedMaterial && locationId !== null,
  });

  const { data: latestNews } = useQuery<{ latest_news_title: string }>({
    queryKey: ["latestNews", selectedMaterial, locationId],
    queryFn: () => getLatestNews(selectedMaterial?.material_id, locationId?.toString()),
    enabled: !!selectedMaterial && locationId !== null,
  });

  const { data: keyMetrics } = useQuery<{
    current_price: string;
    currency: string;
    price_change_from_month: string | null;
    ytd_change: string;
    volatility_6m: string;
    conversion_spread: string | null;
    conversion_change_from_month: string | null;
  }>({
    queryKey: ["keyMetrics", selectedMaterial, locationId],
    queryFn: () => getKeyMetrics(selectedMaterial?.material_id, locationId?.toString()),
    enabled: !!selectedMaterial && locationId !== null,
  });

  const handleTriggerForecast = async () => {
    setIsTriggering(true);
    try {
      const response = await triggerForecast(
        selectedMaterial?.material_id || "",
        locationId?.toString() || "",
        model || ""
      );
      message.success("Forecast triggered successfully");
      console.log("Forecast response:", response);

      queryClient.invalidateQueries({
        queryKey: ["materialPrices", selectedMaterial, locationId, model],
      });
    } catch (error) {
      console.error("Failed to trigger forecast", error);
      message.error("Failed to trigger forecast");
    } finally {
      setIsTriggering(false);
    }
  };

  // Sort data by date to ensure correct ordering
  const sortedData =
    materialPriceHistory?.data?.slice().sort((a: MaterialPriceItem, b: MaterialPriceItem) => {
      const parseDate = (dateStr: string) => {
        const [month, year] = dateStr.split(" ");
        const monthMap: { [key: string]: number } = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        return new Date(parseInt(year), monthMap[month]);
      };
      return parseDate(a.month).getTime() - parseDate(b.month).getTime();
    }) || [];

  // Create arrays for historical and forecast data points
  const historicalData: DataPoint[] = [];
  const shortTermData: DataPoint[] = [];
  const longTermData: DataPoint[] = [];
  const averageData: DataPoint[] = [];
  console.log("sortedData: ", sortedData);
  // Process each data point
  sortedData.forEach((item: MaterialPriceItem) => {
    if (item.price) {
      // Historical data
      historicalData.push({
        x: item.month,
        y: parseFloat(item.price),
        news: Array.isArray(item.news) && item.news.length > 0
          ? item.news.map((n) => `• ${n.title}`).join("<br/>")
          : "No news available",
      });
    } else if (item.forecast_value) {
      // Forecast data
      averageData.push({
        x: item.month,
        y: parseFloat(item.forecast_value),
      });
    }
  });

  // Get all unique months from the data in chronological order
  const monthCategories = Array.from(
    new Set([
      ...historicalData.map((d) => d.x),
      ...shortTermData.map((d) => d.x),
      ...longTermData.map((d) => d.x),
      ...averageData.map((d) => d.x),
    ])
  ).sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    const monthOrder: { [key: string]: number } = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    return (
      monthOrder[monthA as keyof typeof monthOrder] -
      monthOrder[monthB as keyof typeof monthOrder]
    );
  });

  // Create arrays with null values for all months
  const createDataArray = () => Array(monthCategories.length).fill(null);

  // Map data to correct positions
  const mappedHistoricalData = createDataArray();
  const mappedShortTermData = createDataArray();
  const mappedLongTermData = createDataArray();
  const mappedAverageData = createDataArray();

  // Get the last historical data point and its index
  const lastHistoricalPoint =
    historicalData.length > 0
      ? historicalData[historicalData.length - 1]
      : null;
  const lastHistoricalIndex = lastHistoricalPoint
    ? monthCategories.indexOf(lastHistoricalPoint.x)
    : -1;

  // Fill historical data
  historicalData.forEach((point) => {
    const index = monthCategories.indexOf(point.x);
    if (index !== -1) {
      mappedHistoricalData[index] = point.y;
    }
  });

  // Add the last historical point to the start of forecast lines
  if (lastHistoricalPoint && lastHistoricalIndex !== -1) {
    mappedShortTermData[lastHistoricalIndex] = lastHistoricalPoint.y;
    mappedLongTermData[lastHistoricalIndex] = lastHistoricalPoint.y;
    mappedAverageData[lastHistoricalIndex] = lastHistoricalPoint.y;
  }

  // Fill forecast data
  shortTermData.forEach((point) => {
    const index = monthCategories.indexOf(point.x);
    if (index !== -1) {
      mappedShortTermData[index] = point.y;
    }
  });

  longTermData.forEach((point) => {
    const index = monthCategories.indexOf(point.x);
    if (index !== -1) {
      mappedLongTermData[index] = point.y;
    }
  });

  averageData.forEach((point) => {
    const index = monthCategories.indexOf(point.x);
    if (index !== -1) {
      mappedAverageData[index] = point.y;
    }
  });

  const series = [
    {
      name: "Historical Price",
      type: "line",
      data: mappedHistoricalData,
      color: "#4B9EFF",
    },
    // {
    //   name: "Short-Term Forecast",
    //   type: "line",
    //   data: mappedShortTermData,
    //   color: "#FF9B6E",
    // },
    // {
    //   name: "Long-Term Forecast",
    //   type: "line",
    //   data: mappedLongTermData,
    //   color: "#9B6EFF",
    // },
    {
      name: "Forecast Average",
      type: "line",
      data: mappedAverageData,
      color: "#808080",
      dashArray: 5,
    },
  ];

  const getLastMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Move to last month

    const lastMonthName = date.toLocaleString("default", { month: "long" });
    return lastMonthName;
  };

  // const latestData = historicalData[historicalData.length - 1] || {};
  // Get currency from API response or default to USD
  const currency = keyMetrics?.currency || "USD";
  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
  
  const currentPriceValue = keyMetrics?.current_price
    ? `${currencySymbol}${keyMetrics?.current_price}`
    : "--";
  const currentPriceUnit = keyMetrics?.current_price ? `${currency}/tonne` : "";

  const priceChange = keyMetrics?.price_change_from_month
    ? `${keyMetrics?.price_change_from_month}%`
    : "--";

  const volatility = keyMetrics?.volatility_6m
    ? `${keyMetrics?.volatility_6m}%`
    : "--";

  const conversionSpread = keyMetrics?.conversion_spread
    ? `${currencySymbol}${keyMetrics?.conversion_spread}`
    : "--";

  const ytdChange = keyMetrics?.ytd_change
    ? `${keyMetrics?.ytd_change}%`
    : "--";

  const conversionChangeText = `${keyMetrics?.conversion_change_from_month
    }% from ${getLastMonth()}`;

  // Get model name from API response
  const modelName = materialPriceHistory?.model_name || "Unknown";

  // Update parent component when model name changes
  useEffect(() => {
    if (modelName && modelName !== "Unknown" && onModelChange) {
      onModelChange(modelName);
    }
  }, [modelName, onModelChange]);

  const allValues = series.flatMap((s) => s.data).filter((v) => v != null);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const buffer = (maxValue - minValue) * 0.1;
  const dynamicMin = Math.floor(minValue - buffer);
  const dynamicMax = Math.ceil(maxValue + buffer);

  const options: ApexOptions = {
    chart: {
      height: 400,
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [2, 2, 2, 2],
      curve: "smooth",
      dashArray: [0, 0, 0, 5],
    },
    markers: {
      size: [4, 4, 4, 4],
      hover: {
        size: 6,
      },
      strokeWidth: 2,
      strokeColors: ["#4B9EFF", "#808080"],
    },
    xaxis: {
      type: "category",
      categories: monthCategories,
      tickPlacement: "on",
      // tickAmount: Math.ceil(monthCategories.length / 3), // Show approximately every 3rd month
      labels: {
        rotate: -45,
        style: {
          colors: "#666",
          fontSize: "12px",
        },
        formatter: function (value: string, timestamp?: number, opts?: any) {
          const index = monthCategories.indexOf(value);
          return index % 3 === 0 ? value : "";
        },
      },
      axisBorder: {
        show: true,
        color: "#78909C",
      },
      axisTicks: {
        show: true,
        color: "#78909C",
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: "USD/tonne",
        style: {
          color: "#666",
          fontSize: "12px",
        },
      },
      min: dynamicMin,
      max: dynamicMax,
      tickAmount: 10,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ series, dataPointIndex }) {
        let content = `<div style="padding: 10px;">`;

        content += `<div style="margin-bottom: 8px; font-weight: bold;">${monthCategories[dataPointIndex]}</div>`;

        const historical = series[0]?.[dataPointIndex];
        const news = historicalData[dataPointIndex]?.news;

        if (historical !== null && historical !== undefined) {
          content += `<div style="margin-bottom: 5px;">
                        <span style="color: #4B9EFF">●</span> <b>Historical Price:</b> ${historical.toFixed(
            2
          )} USD/tonne
                    </div>`;

          content += `
                        <div style="padding-top: 5px; border-top: 1px solid #e0e0e0; margin-top: 5px;">
                            <b>News:</b><br/>
                            ${news}
                        </div>
                    `;
        } else {
          const forecastNames = [
            // "Short-Term Forecast",
            // "Long-Term Forecast",
            "Forecast Average",
          ];
          const forecastColors = [
            // "#FF9B6E",
            "#9B6EFF",
            "#808080",
          ];

          for (let i = 1; i <= 3; i++) {
            const value = series[i]?.[dataPointIndex];
            if (value !== null && value !== undefined) {
              content += `<div style="margin-bottom: 5px;">
                                <span style="color: ${forecastColors[i - 1]
                }">●</span> <b>${forecastNames[i - 1]
                }:</b> ${value.toFixed(2)} USD/tonne
                            </div>`;
            }
          }
        }

        content += `</div>`;
        return content;
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          backgroundColor: "#F0F2F5",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>{latestNews?.latest_news_title}</div>
        <button
          onClick={handleTriggerForecast}
          disabled={isTriggering}
          style={{
            backgroundColor: isTriggering ? "#ccc" : "#a0bf3f",
            borderColor: isTriggering ? "#ccc" : "#a0bf3f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            height: "40px",
            paddingLeft: "30px",
            paddingRight: "30px",
            cursor: isTriggering ? "not-allowed" : "pointer",
            marginLeft: "20px",
            opacity: isTriggering ? 0.7 : 1,
          }}
        >
          <span style={{ color: "white" }}>
            {isTriggering ? "Triggering..." : "Trigger Forecast"}
          </span>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ flex: "0 1 65%" }}>
          <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
            <strong>Model:</strong> {modelName}
          </div>
          <Chart options={options} series={series} type="line" height={400} />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            Note: Select a data point to view specific remarks and insights.
          </div>
        </div>
        <div
          style={{
            flex: "0 1 30%",
            minWidth: "300px",
            padding: "20px",
            border: "1px solid #eee",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Key Metrics</h3>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
              }}
            >
              <div style={{ flex: "1", minWidth: "140px" }}>
                <div style={{ fontSize: "14px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Current Price
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentPriceValue}
                </div>
                {currentPriceUnit && (
                  <div style={{ fontSize: "16px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    {currentPriceUnit}
                  </div>
                )}
                <div style={{ color: "green", fontSize: "14px", whiteSpace: "nowrap" }}>
                  {currentPriceValue !== "--" &&
                    `${priceChange} from ${getLastMonth()}`}
                </div>
              </div>
              <div style={{ flex: "1", minWidth: "120px" }}>
                <div style={{ fontSize: "14px", color: "#666", whiteSpace: "nowrap" }}>
                  YTD Change
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "green",
                  }}
                >
                  {ytdChange}
                </div>
                {ytdChange !== "--" && (
                  <div style={{ color: "green", fontSize: "14px" }}>
                    Significant increase
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div style={{ flex: "1", minWidth: "140px" }}>
              <div style={{ fontSize: "14px", color: "#666", whiteSpace: "nowrap" }}>
                Volatility (6M)
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                {volatility}
              </div>
              {volatility !== "--" && (
                <div style={{ color: "orange", fontSize: "14px", whiteSpace: "nowrap" }}>
                  Increased volatility
                </div>
              )}
            </div>
            <div style={{ flex: "1", minWidth: "120px" }}>
              <div style={{ fontSize: "14px", color: "#666", whiteSpace: "nowrap" }}>
                Conversion Spread
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                {conversionSpread}
              </div>
              {conversionSpread !== "--" && (
                <div style={{ color: "red", fontSize: "14px", whiteSpace: "nowrap" }}>
                  {conversionChangeText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlycerinePriceChart;
