import React from "react";
import { Button } from "antd";

interface Props {
  onSave: () => void;
  loading: boolean;
}

const SaveButton: React.FC<Props> = ({ onSave, loading }) => (
  <div className="flex justify-end">
    <Button type="primary" size="large" onClick={onSave} loading={loading}
      style={{ backgroundColor: "#ff7a00", borderColor: "#ff7a00", fontSize: "16px", height: "45px", paddingLeft: "30px", paddingRight: "30px" }}>
      Save Template
    </Button>
  </div>
);

export default SaveButton;
