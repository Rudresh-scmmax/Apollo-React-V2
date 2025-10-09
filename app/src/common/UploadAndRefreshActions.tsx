import React from "react";
import { Button } from "antd";
import { ReloadOutlined, MailOutlined } from "@ant-design/icons";

interface UploadAndRefreshActionsProps {
  onRefresh: () => void;
  onUpload: () => void;
  uploadLabel?: string;
  refreshTitle?: string;
  uploadLoading?: boolean;
}
const formStyles = {
    button: `w-auto bg-[#8baf1b] hover:bg-[#C3D675] text-[#4A5A1E] font-semibold px-4 py-2
      rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2
      focus:ring-[#8baf1b] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-none`,
  };

  
  const UploadAndRefreshActions: React.FC<UploadAndRefreshActionsProps> = ({
    onRefresh,
    onUpload,
    uploadLabel = "Upload Email",
    refreshTitle = "Refresh",
    uploadLoading = false,
  }) => (
    <div className="flex gap-2">
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        title={refreshTitle}
        className={formStyles.button}
        style={{
          background: "#8baf1b",
          color: "#000",
          border: "none",
        }}
        onMouseOver={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#C3D675";
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#8baf1b";
        }}
      />
      <Button
        icon={<MailOutlined />}
        onClick={onUpload}
        loading={uploadLoading}
        className={formStyles.button}
        style={{
          background: "#8baf1b",
          color: "#000",
          border: "none",
        }}
        onMouseOver={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#C3D675";
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#8baf1b";
        }}
      >
        {uploadLabel}
      </Button>
    </div>
  );
  
  export default UploadAndRefreshActions;