import React from "react";
import { PrinterOutlined } from "@ant-design/icons";
import { Button  } from "antd";
import MaterialSelect from "../../common/MaterialSelect";


interface SelectedMaterial {
  material_id: string;
  material_description: string;
}

interface Props {
  selectedMaterial: SelectedMaterial | null;
  materials: SelectedMaterial[];
  onMaterialChange: (material: SelectedMaterial | null) => void;
}

const NegotiationHeader: React.FC<Props> = ({
  selectedMaterial,
  materials,
  onMaterialChange,
}) => (
  <div className="flex justify-between items-center mb-6 w-full">
    <h1 className="text-2xl font-bold text-gray-800">
      Negotiation Objectives: {selectedMaterial?.material_description}
    </h1>
    <div className="flex items-center gap-4">
      <MaterialSelect
        materials={materials}
        selectedMaterial={selectedMaterial}
        onSelect={onMaterialChange}
        placeholder="Select Material"
      />
      <div className="flex items-center gap-2">
        <Button
          icon={<PrinterOutlined />}
          type="primary"
          style={{
            backgroundColor: "#a0bf3f",
            borderColor: "#a0bf3f",
            fontSize: "16px",
            height: "40px",
            paddingLeft: "30px",
            paddingRight: "30px"
          }}
          onClick={() => window.print()}
        >
          <span style={{ color: "white" }}>Print Page</span>
        </Button>
      </div>
    </div>
  </div>
);

export default NegotiationHeader;
