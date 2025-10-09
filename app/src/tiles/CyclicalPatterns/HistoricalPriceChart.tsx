import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";

interface PriceData {
  month: string;
  price: string;
  region: string;
}

interface HistoricalPriceResponse {
  message: string;
  data: PriceData[];
}

interface HistoricalPriceChartProps {
  priceHistory?: HistoricalPriceResponse;
  isLoading?: boolean;
}

const HistoricalPriceChart: React.FC<HistoricalPriceChartProps> = ({
  priceHistory,
  isLoading,
}) => {
  const { getHistoricalPrices } = useBusinessAPI();

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  // Aggregate prices by month (average if duplicates)
  const monthPriceMap = new Map<string, number[]>();
  priceHistory?.data?.forEach((item) => {
    if (!monthPriceMap.has(item.month)) {
      monthPriceMap.set(item.month, []);
    }
    monthPriceMap.get(item.month)!.push(parseFloat(item.price));
  });

  const aggregatedData =
    Array.from(monthPriceMap.entries()).map(([month, prices]) => ({
      x: month,
      y:
        prices.length === 1
          ? prices[0]
          : prices.reduce((a, b) => a + b, 0) / prices.length,
    })) || [];

  // Sort by month (optional, if your backend doesn't guarantee order)
  const monthOrder = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  aggregatedData.sort((a, b) => {
    const [aMonth, aYear] = a.x.split(" ");
    const [bMonth, bYear] = b.x.split(" ");
    if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  const series = [
    {
      name: "Historical Price",
      type: "line",
      data: aggregatedData,
    },
  ];

  // Calculate min and max values for y-axis
  const allValues = series[0].data.map((point) => point.y);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const buffer = (maxValue - minValue) * 0.1;
  const dynamicMin = Math.floor(minValue - buffer);
  const dynamicMax = Math.ceil(maxValue + buffer);

  const dataLength = aggregatedData.length;
  const maxLabels = 8;
  const labelInterval =
    dataLength > maxLabels ? Math.ceil(dataLength / maxLabels) : 1;
  const interval = labelInterval;

  const options: ApexOptions = {
    chart: {
      height: 400,
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    stroke: { width: 2, curve: "smooth" },
    markers: {
      size: 4,
      hover: { size: 6 },
      strokeWidth: 2,
      strokeColors: ["#4B9EFF"],
    },
    xaxis: {
      type: "category",
      categories: aggregatedData.map((item) => item.x),
      tickPlacement: "on",
      labels: {
        rotate: -45,
        hideOverlappingLabels: false,
        showDuplicates: false,
        trim: false,
        style: { colors: "#666", fontSize: "12px" },
        formatter: function (value: string, index: number, opts: any) {
          const categories = opts?.categories || [];
          const total = categories.length;
          if (total <= 8) return value;
          if (index === 0 || index === total - 1) return value;
          if (interval > 1 && index % interval === 0) return value;
          return "";
        },
      },
      axisBorder: { show: true, color: "#78909C" },
      axisTicks: { show: true, color: "#78909C" },
      tooltip: { enabled: false },
    },
    yaxis: {
      title: {
        text: "USD/tonne",
        style: { color: "#666", fontSize: "12px" },
      },
      min: dynamicMin,
      max: dynamicMax,
      tickAmount: 10,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ series, dataPointIndex }) {
        const price = series[0][dataPointIndex];
        return `
          <div style="padding: 10px;">
            <div style="margin-bottom: 8px; font-weight: bold;">
              ${aggregatedData[dataPointIndex]?.x}
            </div>
            <div style="margin-bottom: 5px;">
              <span style="color: #4B9EFF">●</span> 
              <b>Price:</b> ${price?.toFixed(2)} USD/tonne
            </div>
          </div>
        `;
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
    <div className="flex flex-col gap-5">
      <div className="flex-1">
        <Chart options={options} series={series} type="line" height={400} />
        <div className="text-xs text-gray-500 mt-3">
          Note: Select a data point to view specific price details.
        </div>
      </div>
    </div>
  );
};

export default HistoricalPriceChart;