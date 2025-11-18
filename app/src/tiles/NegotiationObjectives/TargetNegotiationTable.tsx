import React from "react";
import { Table, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import EditableCell from "./EditableCell"; // Use your EditableCell here
import { getDynamicWidth } from "./Utils";
import { getCurrencySymbol, getUserUom } from "../../utils/currencyUtils";

interface Props {
  targetValues: {
    max_value: number | string;
    min_value: number | string;
    min_source: string;
    max_source: string;
  };
  onChange: (path: string[], value: string) => void;
}

const TargetNegotiationTable: React.FC<Props> = ({ targetValues, onChange }) => {
  // Render editable input with suffix + source in brackets
  const renderEditableWithSuffixAndSource = (
    value: string | number,
    onChangeFn: (v: string) => void,
    source: string,
    placeholder?: string
  ) => {
    const stringValue = value?.toString() || "";
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <EditableCell
          value={stringValue}
          onChange={onChangeFn}
          placeholder={placeholder}
          style={{ width: getDynamicWidth(stringValue, placeholder) }}
        />
        <span style={{ marginLeft: 4 }}>
          {`${getCurrencySymbol()}/${getUserUom()}`} {source ? `(${source})` : ""}
        </span>
      </div>
    );
  };

  const columns = [
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Min (in {`${getCurrencySymbol()}/${getUserUom()}`})
          <Tooltip
            title={
              <>
                Min (in Rs./$) = min(
                <br />• Should-be cost of previous month,
                <br />• Min import price of previous month,
                <br />• Min export price of previous month,
                <br />• Min material price history price
                )
              </>
            }
          >
            <QuestionCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </div>
      ),
      key: "min",
      render: () =>
        renderEditableWithSuffixAndSource(
          targetValues.min_value,
          (v) => onChange(["targetNegotiation", "min_value"], v),
          targetValues.min_source,
          "Enter min value"
        ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Max (in {`${getCurrencySymbol()}/${getUserUom()}`})
          <Tooltip
            title={
              <>
                Max (in Rs./$) = min(
                <br />• Max material price history,
                <br />• Avg import price of last month,
                <br />• Avg export price of previous month
                )
              </>
            }
          >
            <QuestionCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </div>
      ),
      key: "max",
      render: () =>
        renderEditableWithSuffixAndSource(
          targetValues.max_value,
          (v) => onChange(["targetNegotiation", "max_value"], v),
          targetValues.max_source,
          "Enter max value"
        ),
    },
  ];

  const data = [{ key: "1" }];

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

export default TargetNegotiationTable;
