import React, { useState } from "react";

interface MyComponentProps {
  text: string;
}

const CustomTextField: React.FC<MyComponentProps> = ({ text }) => {
  const [isMoreClicked, setIsMoreClicked] = useState(false);

  const textDisplay = () => {
    return (
      <p>
        {isMoreClicked ? text : text.substring(0, 100)}
        <span
          style={{ color: isMoreClicked ? "gray" : "blue" , cursor: "pointer" }}
          onClick={() => setIsMoreClicked(!isMoreClicked)}
        >
          {isMoreClicked ? "  ...less" : "  ...More"}
        </span>
      </p>
    );
  };

  return <div>{text && textDisplay()}</div>;
};

export default CustomTextField;
