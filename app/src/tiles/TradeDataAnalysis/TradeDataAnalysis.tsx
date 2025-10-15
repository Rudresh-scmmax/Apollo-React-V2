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
  supplier_name: string;
  type: "Qty in MT" | "Price in $/MT";
  grand_total: string;
  [key: string]: any;
}

// Function to generate a simple best price insight
function getBestPriceInsight(tradeData: { data?: { supplier_name: string; grand_total_price: number | string }[] }): string {
  if (!tradeData?.data?.length) return "No data available for insights.";

  let minPrice = Infinity;
  let bestSupplier = "";
  tradeData.data.forEach((supplier: { supplier_name: string; grand_total_price: number | string }) => {
    const price = Number(supplier.grand_total_price);
    if (!isNaN(price) && price > 0 && price < minPrice) {
      minPrice = price;
      bestSupplier = supplier.supplier_name;
    }
  });

  if (bestSupplier) {
    return `Best price offered by ${bestSupplier} at $${minPrice.toFixed(2)}.`;
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
      getTradeData(selectedMaterial?.material_id || "", selectedYear),
    enabled: !!selectedMaterial,
  });

  // Transform API data to two rows per supplier
  const tableData: TradeDataRow[] = [];
  if (tradeData?.data) {
    tradeData.data.forEach((supplier: any) => {
      tableData.push({
        supplier_name: supplier.supplier_name,
        type: "Qty in MT",
        ...months.reduce((acc, m) => ({ ...acc, [m]: supplier[`${m}_qty`] }), {}),
        grand_total: supplier.grand_total_qty,
        _rowSpan: 2,
      });
      tableData.push({
        supplier_name: supplier.supplier_name,
        type: "Price in $/MT",
        ...months.reduce((acc, m) => ({ ...acc, [m]: supplier[`${m}_price`] }), {}),
        grand_total: Math.ceil(supplier.grand_total_price).toFixed(2),
        _rowSpan: 0,
      });
    });
  }

  const columns: ColumnsType<TradeDataRow> = [
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      key: "supplier_name",
      fixed: "left",
      width: 220,
      render: (text, record, index) => {
        const obj: any = {
          children: text,
          props: {} as any,
        };
        // Only show supplier name for the first row (Qty in MT)
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
      // width: 70,
    },
    ...months.map((month) => ({
      title: month.charAt(0).toUpperCase() + month.slice(1),
      dataIndex: month,
      key: month,
      // width: 90,
      render: (val:any) => (val !== undefined && val !== 0 ? Math.ceil(val).toFixed(2) : "-"),
    })),
    {
      title: "Grand Total",
      dataIndex: "grand_total",
      key: "grand_total",
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
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default TradeDataAnalysis;