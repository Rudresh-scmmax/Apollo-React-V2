import React from "react";
import { Table } from "antd";
import EditableCell from "./EditableCell";
import { getDynamicWidth } from "./Utils";
import { getCurrencySymbol, getUserUom } from "../../utils/currencyUtils";


interface RouteData {
  pastPeriod: string;
  current: string;
  forecast: string;
}

interface Props {
  routeA: RouteData;
  routeB: RouteData;
  onChange: (path: string[], value: string) => void;
}

const CleanSheetPriceTable: React.FC<Props> = ({
  routeA,
  routeB,
  onChange,
}) => {
  // Render editable input + suffix
  const renderEditableWithSuffix = (
    value: string,
    path: string[],
    placeholder?: string
  ) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <EditableCell
        value={value} // raw value only
        onChange={(v) => onChange(path, v)}
        placeholder={placeholder}
        style={{ width: getDynamicWidth(value, placeholder) }}
      />
      <span style={{ marginLeft: 4 }}>&nbsp;{`${getCurrencySymbol()}/${getUserUom()}`}</span>
    </div>
  );

  const columns = [
    { title: "Route", dataIndex: "route", key: "route" },
    { title: "Pervious to Pervious Month (M-2)", dataIndex: "pastPeriod", key: "pastPeriod" },
    { title: "Previous Month (M-1)", dataIndex: "current", key: "current" },
    { title: "Current Month Forecast (M0)", dataIndex: "forecast", key: "forecast" },
  ];

  const data = [
    {
      key: "1",
      route: "Route A",
      pastPeriod: renderEditableWithSuffix(routeA.pastPeriod, ["cleanSheetPrice", "routeA", "pastPeriod"], "Enter past period"),
      current: renderEditableWithSuffix(routeA.current, ["cleanSheetPrice", "routeA", "current"], "Enter current"),
      forecast: renderEditableWithSuffix(routeA.forecast, ["cleanSheetPrice", "routeA", "forecast"], "Enter forecast"),
    },
    {
      key: "2",
      route: "Route B",
      pastPeriod: renderEditableWithSuffix(routeB.pastPeriod, ["cleanSheetPrice", "routeB", "pastPeriod"], "Enter past period"),
      current: renderEditableWithSuffix(routeB.current, ["cleanSheetPrice", "routeB", "current"], "Enter current"),
      forecast: renderEditableWithSuffix(routeB.forecast, ["cleanSheetPrice", "routeB", "forecast"], "Enter forecast"),
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

export default CleanSheetPriceTable;
