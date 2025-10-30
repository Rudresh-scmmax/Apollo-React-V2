import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import type { Key } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { Option } from "antd/es/mentions";

const months = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
];

interface TradeDataRow {
  source: string;
  region: string;
  type: "Qty in MT" | "Price in $/MT";
  grand_total: string;
  [key: string]: any;
}

interface ApiTradeData {
  location_id: number;
  material_id: string;
  hsn_code: string;
  quantity: string;
  currency: string;
  created_at: string;
  id: number;
  month_year: string;
  price_per_quantity: string;
  unit: string;
  source: string;
  updated_at: string;
  material_description: string;
  region: string;
}

// Function to generate a simple best price insight
function getBestPriceInsight(tradeData: { data?: ApiTradeData[]; rows?: ApiTradeData[] }): string {
  const dataArray = tradeData?.rows || tradeData?.data;
  if (!dataArray?.length) return "No data available for insights.";

  const avgPrices: { [key: string]: { total: number; count: number } } = {};
  
  dataArray.forEach((record: ApiTradeData) => {
    const price = Number(record.price_per_quantity);
    if (!isNaN(price) && price > 0) {
      if (!avgPrices[record.source]) {
        avgPrices[record.source] = { total: 0, count: 0 };
      }
      avgPrices[record.source].total += price;
      avgPrices[record.source].count += 1;
    }
  });

  let minAvgPrice = Infinity;
  let bestSource = "";
  
  Object.entries(avgPrices).forEach(([source, data]) => {
    const avgPrice = data.total / data.count;
    if (avgPrice < minAvgPrice) {
      minAvgPrice = avgPrice;
      bestSource = source;
    }
  });

  if (bestSource) {
    return `Best average price offered by ${bestSource} at $${minAvgPrice.toFixed(2)}/MT.`;
  } else {
    return "No valid price data to generate insights.";
  }
}

const TradeDataAnalysis: React.FC = () => {
  const { getTradeData } = useBusinessAPI();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const {
    data: tradeData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tradeData", selectedMaterial?.material_id, selectedYear],
    queryFn: () =>
      getTradeData(selectedMaterial?.material_id || "", selectedYear.toString()),
    enabled: !!selectedMaterial,
  });

  // Transform API data to two rows per source
  const tableData: TradeDataRow[] = [];
  const dataArray = tradeData?.rows || tradeData?.data;
  
  if (dataArray) {
    // Group by source and region
    const sourceData: { [key: string]: { region: string; months: { [month: string]: { qty: number; price: number } } } } = {};
    let totalQty: { [key: string]: number } = {};
    let totalPrice: { [key: string]: number } = {};
    
    dataArray.forEach((record: ApiTradeData) => {
      if (!sourceData[record.source]) {
        sourceData[record.source] = { region: record.region, months: {} };
        totalQty[record.source] = 0;
        totalPrice[record.source] = 0;
      }
      
      // Parse month from month_year (e.g., "Sep-2025", "Apr-2025")
      const monthMatch = record.month_year.match(/\w+/);
      let month = monthMatch ? monthMatch[0].toLowerCase().substring(0, 3) : "";
      
      // Map full month names to 3-letter abbreviations
      const monthMap: { [key: string]: string } = {
        'jan': 'jan', 'feb': 'feb', 'mar': 'mar', 'apr': 'apr',
        'may': 'may', 'jun': 'jun', 'jul': 'jul', 'aug': 'aug',
        'sep': 'sep', 'oct': 'oct', 'nov': 'nov', 'dec': 'dec'
      };
      
      month = monthMap[month] || month;
      
      if (month && months.includes(month)) {
        const qty = Number(record.quantity) || 0;
        const price = Number(record.price_per_quantity) || 0;
        
        if (!sourceData[record.source].months[month]) {
          sourceData[record.source].months[month] = { qty: 0, price: 0 };
        }
        
        sourceData[record.source].months[month].qty += qty;
        sourceData[record.source].months[month].price = price; // Take the latest price for the month
        totalQty[record.source] += qty;
        totalPrice[record.source] += price;
      }
    });
    
    // Create table rows
    Object.entries(sourceData).forEach(([source, sourceInfo]) => {
      tableData.push({
        source: source,
        region: sourceInfo.region,
        type: "Qty in MT",
        ...months.reduce((acc, m) => ({ ...acc, [m]: sourceInfo.months[m]?.qty || 0 }), {}),
        grand_total: totalQty[source].toFixed(2),
        _rowSpan: 2,
      });
      tableData.push({
        source: source,
        region: sourceInfo.region,
        type: "Price in $/MT",
        ...months.reduce((acc, m) => ({ ...acc, [m]: sourceInfo.months[m]?.price || 0 }), {}),
        grand_total: (totalPrice[source] / dataArray.filter((r: ApiTradeData) => r.source === source).length).toFixed(2),
        _rowSpan: 0,
      });
    });
  }

  const columns: ColumnsType<TradeDataRow> = [
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      fixed: "left",
      width: 180,
      render: (text, record, index) => {
        const obj: any = {
          children: text,
          props: {} as any,
        };
        // Only show source name for the first row (Qty in MT)
        if (record.type === "Qty in MT") {
          obj.props.rowSpan = 2;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      fixed: "left",
      width: 150,
      render: (text, record, index) => {
        const obj: any = {
          children: text,
          props: {} as any,
        };
        // Only show region name for the first row (Qty in MT)
        if (record.type === "Qty in MT") {
          obj.props.rowSpan = 2;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      fixed: "left",
      width: 120,
    },
    ...months.map((month) => ({
      title: month.charAt(0).toUpperCase() + month.slice(1),
      dataIndex: month,
      key: month,
      width: 110,
      render: (val:any) => (
        <div style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {val !== undefined && val !== 0 ? Number(val).toFixed(2) : "-"}
        </div>
      ),
    })),
    {
      title: "Grand Total",
      dataIndex: "grand_total",
      key: "grand_total",
      width: 130,
      render: (val: any) => (
        <div style={{ whiteSpace: 'nowrap', textAlign: 'right', fontWeight: 'bold' }}>
          {val}
        </div>
      ),
    },
  ];

  useEffect(() => {
    refetch();
  }, [selectedYear]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Trade Data Analysis for:{" "}
          {selectedMaterial?.material_description || "All Material"}
        </h1>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e)}
        >
          {years.map((year) => (
            <Option key={year.toString()} value={year.toString()}>
              {year}
            </Option>
          ))}
        </Select>
      </div>
      <h3 className="text-1xl text-gray-800">
        <b>Key Insights:</b> {getBestPriceInsight(tradeData)}
      </h3>

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
        rowKey={(_, idx) => idx as Key}
        loading={isLoading}
        scroll={{ x: 1470 }}
      />
    </div>
  );
};

export default TradeDataAnalysis;