import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import {
  StrategyRecommendation,
  useBusinessAPI,
} from "../../../services/BusinessProvider";
import CostumTextField from "../../../common/CostumTextField";

interface DataPoint {
  x: string;
  y: number;
  news?: string;
}

interface GlycerinePriceChartProps {
  region: string;
}

const GlycerinePriceChart: React.FC<GlycerinePriceChartProps> = ({
  region,
}) => {
  const { getMaterialPrices, getRecomendations } = useBusinessAPI();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: materialPriceHistory } = useQuery({
    queryKey: ["materialPrices", selectedMaterial, region],
    queryFn: () => getMaterialPrices(selectedMaterial?.material_id, region),
    enabled: !!selectedMaterial && !!region,
  });

  const { data: recomendations } = useQuery<StrategyRecommendation>({
    queryKey: ["recomendations", selectedMaterial, region],
    queryFn: () => getRecomendations(selectedMaterial?.material_id, region),
    enabled: !!selectedMaterial && !!region,
  });
  // Sort data by date to ensure correct ordering
  const sortedData =
    materialPriceHistory?.slice().sort((a, b) => {
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
  sortedData.forEach((item) => {
    if (item.price) {
      historicalData.push({
        x: item.month,
        y: parseFloat(item.price),
        news: Array.isArray(item.news)
          ? item.news.map((n: any) => `• ${n.title}`).join("<br/>")
          : item.news?.title
          ? `• ${item.news.title}`
          : "No news available",
      });
    } else {
      // Process forecast data
      if (item.short_forecast) {
        shortTermData.push({
          x: item.month,
          y: parseFloat(item.short_forecast),
        });
      }
      if (item.long_forecast) {
        longTermData.push({
          x: item.month,
          y: parseFloat(item.long_forecast),
        });
      }
      if (item.forecast_average) {
        averageData.push({
          x: item.month,
          y: parseFloat(item.forecast_average),
        });
      }
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
  const currentPrice = recomendations?.key_metrics?.current_price
    ? `$${recomendations?.key_metrics?.current_price}`
    : "--";

  const priceChange = recomendations?.key_metrics?.price_change_from_month
    ? `${recomendations?.key_metrics?.price_change_from_month}%`
    : "--";

  const volatility = recomendations?.key_metrics?.volatility_6m
    ? `${recomendations?.key_metrics?.volatility_6m}%`
    : "--";

  const conversionSpread = recomendations?.key_metrics?.conversion_spread
    ? `$${recomendations?.key_metrics?.conversion_spread}`
    : "--";

  const ytdChange = recomendations?.key_metrics?.ytd_change
    ? `${recomendations?.key_metrics?.ytd_change}%`
    : "--";

  const conversionChangeText = `${
    recomendations?.key_metrics?.conversion_change_from_month
  }% from ${getLastMonth()}`;

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
            "#808080"];

          for (let i = 1; i <= 3; i++) {
            const value = series[i]?.[dataPointIndex];
            if (value !== null && value !== undefined) {
              content += `<div style="margin-bottom: 5px;">
                                <span style="color: ${
                                  forecastColors[i - 1]
                                }">●</span> <b>${
                forecastNames[i - 1]
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
        }}
      >
        {recomendations?.latest_news_title}
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
          <Chart options={options} series={series} type="line" height={400} />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            Note: Select a data point to view specific remarks and insights.
          </div>
        </div>
        <div
          style={{
            flex: "0 1 30%",
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
                alignItems: "baseline",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Current Price
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {currentPrice}
                </div>
                <div style={{ color: "green", fontSize: "14px" }}>
                  {currentPrice !== "--" &&
                    `${priceChange} from ${getLastMonth()}`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#666" }}>
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
              marginBottom: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Volatility (6M)
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {volatility}
              </div>
              {volatility !== "--" && (
                <div style={{ color: "orange", fontSize: "14px" }}>
                  Increased volatility
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Conversion Spread
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {conversionSpread}
              </div>
              {conversionSpread !== "--" && (
                <div style={{ color: "red", fontSize: "14px" }}>
                  {conversionChangeText}
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: "10px" }}>
              {recomendations?.recommendation?.recommendation}
            </h4>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontWeight: "bold" }}>Conservative</div>
              <CostumTextField
                text={recomendations?.recommendation?.strategies?.conservative || ""}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontWeight: "bold" }}>Balanced</div>
              <CostumTextField
                text={recomendations?.recommendation?.strategies?.balanced || ""}
              />
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>Aggressive</div>
              <CostumTextField
                text={recomendations?.recommendation?.strategies?.aggressive || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlycerinePriceChart;
