import React from "react";
import EditableCell from "./EditableCell";

interface Props {
  vendor: string;
  objective: string;
  onChange: (val: string) => void;
}

const ObjectiveCard: React.FC<Props> = ({ vendor, objective, onChange }) => (
  <div className="border border-gray-300">
    <div className="bg-gray-100 p-3 border-b">
      <h3 className="font-medium text-gray-800">{vendor || ""}</h3>
    </div>
    <div
      style={{ backgroundColor: "#a0bf3f" }}
      className="p-3 text-white text-center font-medium"
    >
      Objective
    </div>
    <div className="p-3">
      <EditableCell
        value={objective}
        onChange={onChange}
        placeholder="Enter objective details..."
        multiline
      />
    </div>
  </div>
);

export default ObjectiveCard;
