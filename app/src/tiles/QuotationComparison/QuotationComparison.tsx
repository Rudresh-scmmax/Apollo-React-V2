import React, { useState } from "react";
import { Button, Modal, Upload, message, Card, Typography } from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const { Title, Text } = Typography;

const QuotationComparison: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);

  const { uploadQuotationPDF } = useBusinessAPI();

  // Get material code from redux
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  // Updated: Send all files in one request as "files"
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select at least one PDF file to upload.");
      return;
    }
    if (!selectedMaterial?.material_id) {
      message.warning("No material selected. Please select a material first.");
      return;
    }
    setUploading(true);
    setResponse(null);
    setSummaryData(null);
    try {
      // Prepare FormData with all files under "files"
      const formData = new FormData();
      fileList.forEach((fileObj) => {
        const file = fileObj.originFileObj || fileObj;
        formData.append("files", file);
      });
      formData.append("material_id", selectedMaterial.material_id);

      const res = await uploadQuotationPDF(formData);

      // Parse lambdaResponse.body if it's a string
      let parsedRes = res;
      if (
        parsedRes &&
        parsedRes.lambdaResponse &&
        typeof parsedRes.lambdaResponse.body === "string"
      ) {
        try {
          parsedRes = {
            ...parsedRes,
            lambdaResponse: {
              ...parsedRes.lambdaResponse,
              body: JSON.parse(parsedRes.lambdaResponse.body),
            },
          };
        } catch (e) {}
      }
      setResponse(parsedRes);

      // Extract summary info for the summary card
      const lambdaBody = parsedRes?.lambdaResponse?.body || {};
      const analysis = lambdaBody.analysis || {};
      const bestChoice = analysis.best_choice || {};
      const priceComparison = analysis.price_comparison || [];
      const recommendation =
        analysis.recommendation || lambdaBody.recommendation || lambdaBody.message;

      setSummaryData({
        recommendation,
        priceComparison,
        bestChoice,
        ...bestChoice, // flatten for easy access
        ...lambdaBody, // include any other top-level fields
      });

      message.success("PDFs uploaded successfully");
      setModalVisible(false);
      setFileList([]);
    } catch (error: any) {
      setResponse(null);
      setSummaryData(null);
      message.error("Failed to upload quotations: " + (error?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isPDF = file.type === "application/pdf";
    if (!isPDF) {
      message.error("You can only upload PDF files!");
      return false;
    }
    return true;
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f5f5f5",
        minHeight: "calc(100vh - 200px)",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "40px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <Title level={2}>
          Upload Quotation PDFs
        </Title>

        <Card style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Upload Quotation PDFs
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#999",
                }}
              >
                {fileList.length > 0
                  ? `${fileList.length} file(s) selected`
                  : "no files selected"}
              </span>
            </div>
            <Button
              onClick={() => setModalVisible(true)}
              style={{
                backgroundColor: "#A0BF3F",
                borderColor: "#A0BF3F",
                color: "white",
                height: "40px",
                padding: "0 24px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "6px",
              }}
            >
              Upload PDFs
            </Button>
          </div>
        </Card>

        {/* --- Analysis Summary Card --- */}
        {summaryData && (
          <>
            {/* Analysis Summary Card */}
            <Card
              style={{
                marginBottom: 32,
                background: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                width: "100%",
              }}
              bodyStyle={{ padding: 32 }}
            >
              <div>
                <Title level={4} style={{ marginBottom: 16 }}>Analysis Summary</Title>
                <div style={{ marginBottom: 18 }}>
                  <b>Recommendation:</b> {summaryData.recommendation || "-"}
                </div>
                <div>
                  <b>Price Comparison</b>
                  <div style={{ marginTop: 8 }}>
                    {summaryData.priceComparison && summaryData.priceComparison.length > 0 ? (
                      summaryData.priceComparison.map((item: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                          {item.vendor || "-"}: {item.price || "-"} {summaryData.currency || ""}
                        </div>
                      ))
                    ) : (
                      <div>-: -</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quote Details Card */}
            <Card
              style={{
                border: "1.5px solid #b5d19c",
                background: "#fff",
                borderRadius: 8,
                marginBottom: 32,
                width: "100%",
              }}
              bodyStyle={{ padding: 32 }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Quote Details</div>
                <div style={{ marginBottom: 8 }}>
                  <b>Raw Material:</b> {summaryData.raw_material || summaryData.material_id || "-"}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Vendor Name:</b> {summaryData.vendor_name || "-"}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Price per Unit:</b> {summaryData.pricing || "-"} {summaryData.currency || ""}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Country of Origin:</b> {Array.isArray(summaryData.country_of_origin) ? summaryData.country_of_origin.join(', ') : (summaryData.country_of_origin || "-")}
                </div>
              </div>
            </Card>
          </>
        )}
        {/* --- End Analysis Summary Card --- */}

        {/**
        {response && (
          <Card>
            <Title level={4}>Upload Response</Title>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Card>
        )}
        */}

        <Modal
          open={modalVisible}
          title="Upload Quotation PDFs"
          onCancel={() => setModalVisible(false)}
          onOk={handleUpload}
          confirmLoading={uploading}
          okText="Upload"
          okButtonProps={{
            style: {
              backgroundColor: "#A0BF3F",
              borderColor: "#A0BF3F",
            },
          }}
          width={500}
        >
          <Upload
            beforeUpload={beforeUpload}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            onRemove={(file) =>
              setFileList(fileList.filter((f) => f.uid !== file.uid))
            }
            accept="application/pdf"
            multiple={true}
            maxCount={10}
          >
            <Button icon={<UploadOutlined />}>Select PDF Files</Button>
          </Upload>
          <Text type="secondary" style={{ display: "block", marginTop: "8px" }}>
            Select one or more PDF quotation files to upload.
          </Text>
        </Modal>
      </div>
    </div>
  );
};

export default QuotationComparison;