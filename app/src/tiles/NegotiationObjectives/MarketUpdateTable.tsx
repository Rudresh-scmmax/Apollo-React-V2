import React from "react";
import { Table } from "antd";
import EditableCell from "./EditableCell";

interface Props {
  marketUpdate: any;
  onChange: (path: string[], value: string) => void;
}

const MarketUpdateTable: React.FC<Props> = ({ marketUpdate, onChange }) => {
  const columns = [
    {
      title: "My Info",
      render: () => (
        <EditableCell value={marketUpdate.myInfo} onChange={(v) => onChange(["marketUpdate", "myInfo"], v)} multiline placeholder="My info" />
      ),
    },
    {
      title: "Questions to Ask",
      render: () => (
        <EditableCell value={marketUpdate.questionsToAsk} onChange={(v) => onChange(["marketUpdate", "questionsToAsk"], v)} multiline placeholder="Questions to ask" />
      ),
    },
  ];
  return <Table className="custom-table" columns={columns} dataSource={[{ key: "1" }]} pagination={false} bordered size="middle" />;
};

export default MarketUpdateTable;
