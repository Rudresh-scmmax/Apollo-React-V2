import React from "react";
import { Input } from "antd";

const { TextArea } = Input;

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  placeholder,
  style,
  multiline = false,
}) => {
  if (multiline) {
    return (
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: 2 }} // ✅ auto grows infinitely
        style={{
          border: "none",
          background: "transparent",
          overflow: "hidden",
          resize: "none",
          transition: "height 0.1s ease-in-out",
          ...style,
        }}
      />
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ border: "none", background: "transparent", ...style }}
    />
  );
};

export default EditableCell;
