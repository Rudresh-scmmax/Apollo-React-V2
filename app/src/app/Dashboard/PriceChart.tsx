import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { Card, Typography, Spin } from "antd";

const { Title, Text } = Typography;

interface DataPoint {
  x: string;
  y: number;
  news?: string;
}

interface PriceChartWithNewsProps {
  materialId: string;
  locationId: number;
}

const PriceChartWithNews: React.FC<PriceChartWithNewsProps> = ({ materialId, locationId }) => {
  const { getMaterialPrices } = useBusinessAPI();

  const { data: materialPriceHistory, isLoading } = useQuery({
    queryKey: ["materialPrices", materialId, locationId],
    queryFn: () => getMaterialPrices(materialId, locationId.toString()),
    enabled: !!materialId && !!locationId,
  });

  const currentDate = new Date();

  const parseMonthYear = (monthYear: string) => {
    const [month, year] = monthYear.split(" ");
    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    return new Date(parseInt(year), monthMap[month]);
  };

  // Filter for last 12 months + future forecasts
  const filteredSortedData = (materialPriceHistory?.data || []).filter(item => {
    const itemDate = parseMonthYear(item.month);
    const diffMonths =
      (itemDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (itemDate.getMonth() - currentDate.getMonth());
    return diffMonths >= -11;
  }).sort((a, b) => parseMonthYear(a.month).getTime() - parseMonthYear(b.month).getTime());

  const historicalData: DataPoint[] = [];
  const shortTermData: DataPoint[] = [];
  const longTermData: DataPoint[] = [];
  const averageData: DataPoint[] = [];

  filteredSortedData.forEach((item) => {
    if (item.price) {
      // Historical data
      historicalData.push({
        x: item.month,
        y: parseFloat(item.price),
        news: Array.isArray(item.news) && item.news.length > 0
          ? item.news.map((n: any) => `• ${n.title}`).join("<br/>")
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

  const monthCategories = Array.from(
    new Set([
      ...historicalData.map((d) => d.x),
      ...averageData.map((d) => d.x),
    ])
  ).sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    const monthOrder: { [key: string]: number } = {
      Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
      Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
    };
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder[monthA as keyof typeof monthOrder] - monthOrder[monthB as keyof typeof monthOrder];
  });

  const createDataArray = () => Array(monthCategories.length).fill(null);

  const mappedHistoricalData = createDataArray();
  const mappedAverageData = createDataArray();

  const lastHistoricalPoint = historicalData.length > 0 ? historicalData[historicalData.length - 1] : null;
  const lastHistoricalIndex = lastHistoricalPoint ? monthCategories.indexOf(lastHistoricalPoint.x) : -1;

  historicalData.forEach(({ x, y }) => {
    const idx = monthCategories.indexOf(x);
    if (idx !== -1) mappedHistoricalData[idx] = y;
  });

  if (lastHistoricalPoint && lastHistoricalIndex !== -1) {
    mappedAverageData[lastHistoricalIndex] = lastHistoricalPoint.y;
  }

  averageData.forEach(({ x, y }) => {
    const idx = monthCategories.indexOf(x);
    if (idx !== -1) mappedAverageData[idx] = y;
  });

  const series = [
    {
      name: "Historical Price",
      type: "line" as const,
      data: mappedHistoricalData,
      color: "#a0bf3f",
    },
    {
      name: "Forecast",
      type: "line" as const,
      data: mappedAverageData,
      color: "#808080",
      dashArray: 5,
    },
  ];

  const allValues = series.flatMap((s) => s.data).filter((v) => v != null) as number[];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const buffer = (maxVal - minVal) * 0.1;
  const yMin = Math.floor(minVal - buffer);
  const yMax = Math.ceil(maxVal + buffer);

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [2, 2],
      curve: "smooth",
      dashArray: [0, 5],
    },
    markers: {
      size: [4, 4],
      hover: {
        size: 6,
      },
      strokeWidth: 2,
      strokeColors: ["#a0bf3f", "#808080"],
    },
    xaxis: {
      type: "category",
      categories: monthCategories,
      tickPlacement: "on",
      labels: {
        rotate: -45,
        style: {
          colors: "#666",
          fontSize: "12px",
        },
        formatter: function (value: string) {
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
      min: yMin,
      max: yMax,
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
                        <span style="color: #a0bf3f">●</span> <b>Historical Price:</b> ${historical.toFixed(
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
          const forecast = series[1]?.[dataPointIndex];
          if (forecast !== null && forecast !== undefined) {
            content += `<div style="margin-bottom: 5px;">
                                <span style="color: #808080">●</span> <b>Forecast:</b> ${forecast.toFixed(2)} USD/tonne
                            </div>`;
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
    <Card style={{ height: "500px", display: "flex", flexDirection: "column", padding: 16 }}>
      <Title level={4} style={{ marginBottom: 16 }}>Price Trend & Forecast</Title>
      {isLoading ? (
        <Spin tip="Loading chart..." />
      ) : (
        <div style={{ width: "100%", height: "350px" }}>
          <Chart options={options} series={series} type="line" height={350} />
        </div>
      )}
    </Card>
  );
};

export default PriceChartWithNews;