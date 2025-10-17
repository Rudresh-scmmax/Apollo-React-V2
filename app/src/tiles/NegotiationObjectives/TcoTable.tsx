import React from "react";
import { Table } from "antd";
import EditableCell from "./EditableCell";
import { getDynamicWidth } from "./Utils";


interface TcoItem {
  materialName: string;
  pastPeriod: string;
  current: string;
  forecast: string;
}

interface Props {
  data: TcoItem[];
  onChange: (path: string[], value: string) => void;
}

const TcoTable: React.FC<Props> = ({ data, onChange }) => {
  // Renders editable input + suffix
  const renderEditableWithSuffix = (
    value: string,
    path: string[],
    placeholder?: string
  ) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <EditableCell
        value={value}
        onChange={(v) => onChange(path, v)}
        placeholder={placeholder}
        style={{ width: getDynamicWidth(value, placeholder) }}
      />
      <span style={{ marginLeft: 4 }}>&nbsp;$/MT</span>
    </div>
  );

  const columns = [
    { title: "Material Name", dataIndex: "materialName", key: "materialName" },
    {
      title: "Pervious to Pervious Month (M-2)",
      dataIndex: "pastPeriod",
      key: "pastPeriod",
      render: (_: any, record: TcoItem, idx: number) =>
        renderEditableWithSuffix(
          record.pastPeriod,
          ["tco", idx.toString(), "pastPeriod"],
          "Enter past period"
        ),
    },
    {
      title: "Previous Month (M-1)",
      dataIndex: "current",
      key: "current",
      render: (_: any, record: TcoItem, idx: number) =>
        renderEditableWithSuffix(
          record.current,
          ["tco", idx.toString(), "current"],
          "Enter current"
        ),
    },
    {
      title: "Current Month Forecast (M0)",
      dataIndex: "forecast",
      key: "forecast",
      render: (_: any, record: TcoItem, idx: number) =>
        renderEditableWithSuffix(
          record.forecast,
          ["tco", idx.toString(), "forecast"],
          "Enter forecast"
        ),
    },
  ];

  return (
    <Table
      className="custom-table"
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      size="middle"
    />
  );
};

export default TcoTable;
