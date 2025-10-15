import React from "react";
import { Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery } from "@tanstack/react-query";

const { Title, Text } = Typography;

interface DailyUpdate {
  material_description: string;
  summary: string;
  tag: string;
  timeframe: string;
}

interface ProcurementNewsProps {
  materialId: string;
  region: string;
}

const ProcurementNews: React.FC<ProcurementNewsProps> = ({ materialId, region }) => {
  const { getDailyUpdate } = useBusinessAPI();

  const { data: dailyUpdates, isLoading: isLoadingDailyUpdates } = useQuery<DailyUpdate[]>({
    queryKey: ["dailyUpdates", materialId, region],
    queryFn: () => getDailyUpdate(materialId, region),
    enabled: !!materialId && !!region,
  });

  return (
    <Card
      style={{ height: "500px", display: "flex", flexDirection: "column", padding: 16 }}
      bodyStyle={{ flexGrow: 1, overflowY: "auto" }}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        Procurement News
      </Title>
      {dailyUpdates?.length ? (
        <div className="flex flex-col gap-3">
          {dailyUpdates.map((update, index) => (
            <Link
              key={index}
              to="/news" // Update to your actual route if needed
              style={{
                display: "block",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f0f9f4",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #d0eddc",
                  transition: "background-color 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#d0eddc";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f9f4";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 12,
                      backgroundColor: "#dcedc8",
                      color: "#558b2f",
                    }}
                  >
                    {update.material_description}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 12,
                      backgroundColor: "#e8f5e9",
                      color: "#558b2f",
                    }}
                  >
                    {update.tag}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {update.timeframe}
                  </Text>
                </div>
                <Text style={{ fontSize: 14, color: "#4a4a4a" }}>{update.summary}</Text>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Text type="secondary">No procurement news available.</Text>
      )}
    </Card>
  );
};

export default ProcurementNews;
