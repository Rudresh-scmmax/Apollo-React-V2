import React from "react";
import { Table, Input } from "antd";
import EditableCell from "./EditableCell"; // Should render input, not formatted value
import { getDynamicWidth } from "./Utils";

interface TradeData {
  pastPeriod: string;
  current: string;
  forecast: string;
}

interface Props {
  importData: TradeData;
  exportData: TradeData;
  onChange: (path: string[], value: string) => void;
}

// Pass only raw value to EditableCell, show suffix outside
const ImportExportTable: React.FC<Props> = ({
  importData,
  exportData,
  onChange,
}) => {
  const columns = [
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Pervious to Pervious Month (M-2)", dataIndex: "pastPeriod", key: "pastPeriod" },
    { title: "Previous Month (M-1)", dataIndex: "current", key: "current" },
    { title: "Current Month Forecast (M0)", dataIndex: "forecast", key: "forecast" },
  ];

  

  // Helper to render EditableCell with static $/MT suffix
  const renderEditableWithSuffix = (value: string, onChangeFn: (v: string) => void, placeholder?: string) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* EditableCell should NOT get $/MT in the value */}
      <EditableCell
        value={value}
        onChange={onChangeFn}
        placeholder={placeholder}
        style={{ width: getDynamicWidth(value, placeholder) }}
      />
      <span style={{ marginLeft: 4 }}>&nbsp;$/MT</span>
    </div>
  );

  const data = [
    {
      key: "1",
      type: "Import",
      pastPeriod: renderEditableWithSuffix(
        importData.pastPeriod,
        v => onChange(["importExportData", "import", "pastPeriod"], v),
        "Enter past period"
      ),
      current: renderEditableWithSuffix(
        importData.current,
        v => onChange(["importExportData", "import", "current"], v),
        "Enter current"
      ),
      forecast: renderEditableWithSuffix(
        importData.forecast,
        v => onChange(["importExportData", "import", "forecast"], v),
        "Enter forecast"
      ),
    },
    {
      key: "2",
      type: "Export",
      pastPeriod: renderEditableWithSuffix(
        exportData.pastPeriod,
        v => onChange(["importExportData", "export", "pastPeriod"], v),
        "Enter past period"
      ),
      current: renderEditableWithSuffix(
        exportData.current,
        v => onChange(["importExportData", "export", "current"], v),
        "Enter current"
      ),
      forecast: renderEditableWithSuffix(
        exportData.forecast,
        v => onChange(["importExportData", "export", "forecast"], v),
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

export default ImportExportTable;
