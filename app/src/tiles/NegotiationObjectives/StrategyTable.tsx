import React from "react";
import { Table } from "antd";
import EditableCell from "./EditableCell";

interface Props {
  strategy: any;
  onChange: (path: string[], value: string) => void;
  isLoadingAvoids?: boolean;
}

const StrategyTable: React.FC<Props> = ({ strategy, onChange, isLoadingAvoids = false }) => {
  const columns = [
    {
      title: "Supplier's SOB",
      render: () => (
        <EditableCell value={strategy.supplierSOB} onChange={(v) => onChange(["strategy", "supplierSOB"], v)} multiline placeholder="Supplier's SOB" />
      ),
    },
    {
      title: "What we want to avoid",
      render: () => (
        <div>
          {isLoadingAvoids && (
            <div className="text-sm text-gray-500 mb-2">Generating AI suggestions...</div>
          )}
          <EditableCell 
            value={strategy.whatWeWantToAvoid} 
            onChange={(v) => onChange(["strategy", "whatWeWantToAvoid"], v)} 
            multiline 
            placeholder={isLoadingAvoids ? "Generating..." : "Avoid"} 
          />
        </div>
      ),
    },
    {
      title: "What they want to avoid",
      render: () => (
        <div>
          {isLoadingAvoids && (
            <div className="text-sm text-gray-500 mb-2">Generating AI suggestions...</div>
          )}
          <EditableCell 
            value={strategy.whatTheyWantToAvoid} 
            onChange={(v) => onChange(["strategy", "whatTheyWantToAvoid"], v)} 
            multiline 
            placeholder={isLoadingAvoids ? "Generating..." : "Avoid"} 
          />
        </div>
      ),
    },
  ];

  return <Table className="custom-table" columns={columns} dataSource={[{ key: "1" }]} pagination={false} bordered size="middle" />;
};

export default StrategyTable;
