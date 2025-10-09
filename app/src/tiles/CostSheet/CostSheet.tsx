import React, { useEffect, useState } from "react";
import { Table, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const { Option } = Select;

interface TableRow {
  key: number;
  material: string;
  [month: string]: string | number | undefined;
}

const CostSheetDashboard: React.FC = () => {
  const [data, setData] = useState<TableRow[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const navigate = useNavigate();
  const { getRegions, getMaterialPriceHistory } = useBusinessAPI();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  // Fetch regions and set selectedRegion if needed
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        if (!selectedMaterial?.material_id) return;
        const regionData = await getRegions(selectedMaterial.material_id);
        const sortedRegions = regionData.sort();
        setRegions(sortedRegions);

        // If selectedRegion is not in the new list, set to first region
        if (!sortedRegions.includes(selectedRegion)) {
          setSelectedRegion(sortedRegions[0] || "");
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch regions");
      }
    };

    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterial?.material_id]);

  // Fetch price data when region changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          !selectedMaterial?.material_id ||
          !selectedMaterial?.material_description ||
          !selectedRegion
        ) {
          message.warning("No material or region selected");
          return;
        }

        const priceData = await getMaterialPriceHistory(
          selectedMaterial.material_id,
          selectedRegion
        );

        const allMonthSet = new Set<string>();
        const row: TableRow = {
          key: 0,
          material: selectedMaterial.material_description,
        };

        priceData.forEach((entry: any) => {
          if (entry.month && entry.price_per_uom !== null) {
            row[entry.month] = parseFloat(entry.price_per_uom.toString());
            allMonthSet.add(entry.month);
          }
        });

        const sortedMonths = Array.from(allMonthSet).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );

        setMonths(sortedMonths);
        setData([row]);
      } catch (err) {
        console.error(err);
        message.error("Error loading material price data");
      }
    };

    if (selectedRegion) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, selectedMaterial?.material_id, selectedMaterial?.material_description]);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (!previous) return "-";
    const change = ((current - previous) / previous) * 100;
    return `${change.toFixed(2)}%`;
  };

  const columns: ColumnsType<TableRow> = [
    {
      title: "Material",
      dataIndex: "material",
      key: "material",
      fixed: "left",
    },
    ...months.map((month, idx) => ({
      title: month,
      dataIndex: month,
      key: month,
      render: (val: number | undefined, record: TableRow) => {
        const prevMonth = months[idx + 1];
        const prevVal = record[prevMonth] as number | undefined;
        const percentChange =
          val !== undefined && prevVal !== undefined
            ? calculatePercentageChange(val, prevVal)
            : "-";

        return (
          <div>
            {val !== undefined ? val.toFixed(4) : "-"}
            <div
              style={{
                fontSize: "12px",
                color:
                  percentChange !== "-" && !isNaN(parseFloat(percentChange))
                    ? parseFloat(percentChange) > 0
                      ? "green"
                      : parseFloat(percentChange) < 0
                      ? "red"
                      : "gray"
                    : "#888",
              }}
            >
              {percentChange !== "-" && `(${percentChange})`}
            </div>
          </div>
        );
      },
    })),
  ];

  return (
    <div style={{ padding: "24px", overflowX: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Material Price History (Prices in USD)
        </h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>Select Region:</span>
          <Select
            style={{ width: 300 }}
            value={selectedRegion}
            onChange={(val) => setSelectedRegion(val)}
            showSearch
            optionFilterProp="children"
            placeholder="Select region"
          >
            {regions.map((region) => (
              <Option key={region} value={region}>
                {region}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        scroll={{ x: "max-content" }}
        rowKey="key"
        onRow={(record: TableRow) => ({
          onClick: () =>
            navigate(`/material/${encodeURIComponent(record.material)}`),
        })}
        rowClassName={() => "cursor-pointer"}
      />
    </div>
  );
};

export default CostSheetDashboard;