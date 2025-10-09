import React from "react";
import Chart from "react-apexcharts";

type PriceSeries = {
  name: string;
  prices: { [month: string]: number | null | undefined };
};

type PriceTrendChartProps = {
  supplierData: PriceSeries[];
  marketData: PriceSeries[];
};

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ supplierData, marketData }) => {
  const allMonthsSet = new Set<string>();
  [...supplierData, ...marketData].forEach(series => {
    Object.keys(series.prices).forEach(month => allMonthsSet.add(month));
  });
  const months = Array.from(allMonthsSet).sort(
    (a, b) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime()
  );

  // Build series for ApexCharts, filling missing months with null
  const supplierSeries = supplierData.map(supplier => ({
    name: supplier.name,
    type: "column" as const,
    data: months.map(month => supplier.prices[month] ?? null)
  }));
  const marketSeries = marketData.map(market => ({
    name: market.name,
    type: "line" as const,
    data: months.map(month => market.prices[month] ?? null)
  }));

  const series = [...supplierSeries, ...marketSeries];

  // Dynamically calculate min and max price for y-axis
  const allPrices = [
    ...supplierSeries.flatMap(s => s.data),
    ...marketSeries.flatMap(m => m.data)
  ].filter((v): v is number => typeof v === "number" && !isNaN(v));

  const minPrice = allPrices.length ? Math.floor(Math.min(...allPrices) / 10) * 10 : 0;
  const maxPrice = allPrices.length ? Math.ceil(Math.max(...allPrices) / 10) * 10 : 1000;

  const options = {
    chart: {
      height: 450,
      type: "bar" as "bar",
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent"
    },
    stroke: {
      width: [...Array(supplierSeries.length).fill(0), ...Array(marketSeries.length).fill(2)],
      curve: [
        ...Array(supplierSeries.length).fill("smooth"),
        ...Array(marketSeries.length).fill("smooth")
      ] as ("smooth" | "straight" | "stepline" | "linestep" | "monotoneCubic")[]
    },
    plotOptions: {
      bar: {
        columnWidth: "20%",
        borderRadius: 0,
        grouped: true
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: months,
      labels: { rotate: -45 },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      title: {
        text: "Price (USD/MT)",
        style: { fontWeight: 600 },
        rotate: -90,
        offsetX: 0,
        offsetY: 0
      },
      min: 0,
      max: maxPrice,
      labels: {
        style: { fontWeight: 600 }
      }
    },
    legend: {
      position: "bottom" as "bottom",
      horizontalAlign: "left" as "left",
      fontSize: '13px',
      
      markers: {
        size: 10
      },
      itemMargin: {
        horizontal: 12,
        vertical: 5
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      row: { colors: ['transparent'], opacity: 0.5 }
    },
    tooltip: {
      shared: true,
      intersect: false
    }
  };

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={450} />
    </div>
  );
};

export default PriceTrendChart;