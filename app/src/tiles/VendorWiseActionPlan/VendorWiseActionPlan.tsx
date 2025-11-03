import React, { useState, useEffect } from "react";
import { Table, Select, Upload, Button, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminActionPlanForm from "./AdminActionPlanForm";

const VendorWiseActionPlan: React.FC = () => {
  const { getVendorWiseActionPlan, updatePlanStatus } = useBusinessAPI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
  const currentUser = localStorage.getItem('role')

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ["vendorPlans", selectedMaterial?.material_id],
    queryFn: () =>
      getVendorWiseActionPlan(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  const mutation = useMutation({
    mutationFn: async ({ planId, status, file }: any) =>
      updatePlanStatus(planId, status, file),
    onSuccess: () => {
      message.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["vendorPlans"] });
    },
    onError: () => {
      message.error("Update failed");
    },
  });

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const columns: any[] = [
    {
      title: <span className="font-bold">Title</span>,
      dataIndex: "title",
      key: "title",
      onCell: () => ({
        style: {
          maxWidth: 200, // 👈 set max width
          whiteSpace: "normal", // 👈 allow wrapping
          wordWrap: "break-word",
        },
      }),
    },
    {
      title: <span className="font-bold">Description</span>,
      dataIndex: "description",
      key: "description",
      onCell: () => ({
        style: {
          maxWidth: 300,
          whiteSpace: "normal",
          wordWrap: "break-word",
        },
      }),
    },
    {
      title: <span className="font-bold">Created By</span>,
      dataIndex: "created_by_email",
      key: "created_by_email",
      onCell: () => ({
        style: {
          maxWidth: 200,
          whiteSpace: "normal",
          wordWrap: "break-word",
        },
      }),
    },
    {
      title: <span className="font-bold">Assigned Users</span>,
      dataIndex: "assigned_user_email",
      key: "assigned_user_email",
      onCell: () => ({
        style: {
          maxWidth: 250,
          whiteSpace: "normal",
          wordWrap: "break-word",
        },
      }),
    },
  ];

  columns.push(
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string, record: any) => {
        if (currentUser === "user") {
          return (
            <Select
              defaultValue={text || "Pending"}
              style={{ width: 150 }}
              onChange={(value) =>
                mutation.mutate({ planId: record.id, status: value })
              }
              options={statusOptions}
            />
          );
        }
        // For admin → read-only status
        return <span>{text || "Pending"}</span>;
      },
    },
    {
      title: "Attachment",
      dataIndex: "attachment_url",
      key: "attachment_url",
      render: (url: string, record: any) => {
        if (currentUser === "user") {
          return (
            <div className="flex gap-2">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  View File
                </a>
              ) : (
                <span className="text-gray-400">No file</span>
              )}
              <Upload
                beforeUpload={(file) => {
                  mutation.mutate({
                    planId: record.id,
                    status: record.status,
                    file,
                  });
                  return false;
                }}
                showUploadList={false}
              >
                <Button size="small" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </div>
          );
        }
        // For admin → read-only
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        ) : (
          <span className="text-gray-400">No file</span>
        );
      },
    }
  );


  if (currentUser === "admin") {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button
          type="link"
          onClick={() => {
            setEditingPlan(record);
            setFormOpen(true);
          }}
        >
          Edit
        </Button>
      ),
    });
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Vendor Wise Action Plan for: {selectedMaterial?.material_description || "All Material"}

      </h1>

      {currentUser === "admin" && (
        <Button
          type="primary"
          onClick={() => {
            setEditingPlan(null);
            setFormOpen(true);
          }}
          style={{
            backgroundColor: "#a0bf3f",
            borderColor: "#a0bf3f",
            fontSize: "16px",
            height: "40px",
            paddingLeft: "30px",
            paddingRight: "30px"
          }}
        >
          Create Plan
        </Button>
      )}

      <Card className="shadow-lg rounded-xl mt-4">
        <Table
          columns={columns}
          dataSource={plansData}
          loading={isLoading}
          rowKey="id"
          bordered
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Card>


      {/* Drawer Form */}
      <AdminActionPlanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialValues={editingPlan || undefined}
      />
    </div>
  );
};

export default VendorWiseActionPlan;
