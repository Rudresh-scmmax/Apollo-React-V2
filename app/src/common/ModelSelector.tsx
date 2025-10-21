import React from "react";

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  setSelectedModel,
}) => {
  return (
    <select
      className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
    >
      {models.map((model, index) => (
        <option key={index} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;
