import React, { useRef, useState } from "react";
import { Button, Input, DatePicker, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useBusinessAPI } from "../services/BusinessProvider";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface UploadNewsInsightProps {
  onUploadSuccess?: () => void;
}

const PRIMARY_COLOR = "#a0bf3f";

const UploadNewsInsight: React.FC<UploadNewsInsightProps> = ({
  onUploadSuccess,
}) => {
  const { uploadNewsHighlight, uploadSingleNewsHighlight } = useBusinessAPI();
  const [mode, setMode] = useState<"file" | "manual">("file");
  const [file, setFile] = useState<File | null>(null);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  // Manual entry states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<any>(null);
  const [newslink, setNewslink] = useState("");

  const handleUpload = async () => {
    if (mode === "file") {
      if (!file) {
        message.error("Please select a file to upload.");
        return;
      }
      try {
        await uploadNewsHighlight(file);
        message.success(`${file.name.split(".")[1]} uploaded successfully`);
        setFile(null);
        if (fileUploadRef.current) fileUploadRef.current.value = "";
        onUploadSuccess?.();
      } catch (err) {
        console.error("Upload Error:", err);
        message.error("Upload failed");
      }
    } else {
      if (!title || !date) {
        message.error("Please enter both title and date.");
        return;
      }
      try {
        await uploadSingleNewsHighlight(
          title,
          dayjs(date).format("YYYY-MM-DD"),
          newslink,
          selectedMaterial?.material_code || ""
        );
        message.success("News insight submitted!");
        setTitle("");
        setDate(null);
        setNewslink("");
        onUploadSuccess?.();
      } catch (err) {
        console.error("Manual Upload Error:", err);
        message.error("Manual upload failed");
      }
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Upload News Insights</h3>
      <div className="mb-4 flex gap-4">
        <Button
          style={{
            background: mode === "file" ? PRIMARY_COLOR : undefined,
            color: mode === "file" ? "#fff" : undefined,
            borderColor: PRIMARY_COLOR,
          }}
          type={mode === "file" ? "primary" : "default"}
          onClick={() => setMode("file")}
        >
          Upload File
        </Button>
        <Button
          style={{
            background: mode === "manual" ? PRIMARY_COLOR : undefined,
            color: mode === "manual" ? "#fff" : undefined,
            borderColor: PRIMARY_COLOR,
          }}
          type={mode === "manual" ? "primary" : "default"}
          onClick={() => setMode("manual")}
        >
          Manual Entry
        </Button>
      </div>
      {mode === "file" ? (
        <>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            ref={fileUploadRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={handleUpload}
            disabled={!file}
            type="primary"
            className="mt-2"
            style={{
              background: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              color: "#fff",
            }}
          >
            Upload
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-3 max-w-md">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
          />
          <Input
            placeholder="News Link"
            value={newslink}
            onChange={(e) => setNewslink(e.target.value)}
          />
          <Button
            type="primary"
            className="mt-2"
            onClick={handleUpload}
            style={{
              background: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              color: "#fff",
            }}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadNewsInsight;