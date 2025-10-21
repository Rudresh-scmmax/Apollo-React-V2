import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { Card, Typography, Spin } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

interface VendorWiseActionPlanProps {
  materialId: string;
  locationId: number;
}

const VendorWiseActionPlanList: React.FC<VendorWiseActionPlanProps> = ({ materialId, locationId }) => {
  const { getVendorWiseActionPlan } = useBusinessAPI();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: plansData, isLoading } = useQuery({
    queryKey: ["vendorPlans", materialId],
    queryFn: () => getVendorWiseActionPlan(materialId),
    enabled: !!materialId
  });


  // Limit to first 5 plans
  const displayPlans = plansData?.slice(0, 5) || [];

  return (
    <Card
      style={{ height: "500px", display: "flex", flexDirection: "column", padding: 16 }}
      bodyStyle={{ flexGrow: 1, overflowY: "auto" }}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        Vendor Action Plans
      </Title>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
          <Spin tip="Loading action plans..." />
        </div>
      ) : plansData?.length > 0 ? (
        <div className="flex flex-col gap-3">
          {plansData.map((plan: any) => (
            <Link
              key={plan.id}
              to="/vendor-wise-action-plan"
              style={{ display: "block", textDecoration: "none", cursor: "pointer" }}
            >
              <div
                style={{
                  backgroundColor: "#e8f5e9",
                  padding: "12px 16px",
                  borderRadius: 10,
                  boxShadow: "inset 1px 1px 5px rgba(0,0,0,0.05)",
                  transition: "background-color 0.2s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "#c8e6c9")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "#e8f5e9")
                }
              >
                <Text
                  style={{
                    color: "#4a4a4a",
                    fontWeight: 600,
                    fontSize: 14,
                    flex: 1,
                    marginRight: 12,
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                  }}
                >
                  {plan.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2e7d32",
                    backgroundColor: "#c8e6c9",
                    padding: "3px 8px",
                    borderRadius: 12,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {plan.status || "Pending"}
                </Text>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Text type="secondary" style={{ textAlign: "center", marginTop: 40 }}>
          No action plans found.
        </Text>
      )}
    </Card>
  );
};

export default VendorWiseActionPlanList;
