import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form, Input, message, Popconfirm } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UploadAndRefreshActions from "../../common/UploadAndRefreshActions";

const MinutesOfMeeting: React.FC<any> = () => {
  const {
    getMinutesOfMeeting,
    uploadEmailContent,
    updateMinutesOfMeeting,
    deleteMinutesOfMeeting,
  } = useBusinessAPI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [momText, setMomText] = useState<string>("");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // For edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  const { data: momData, isLoading } = useQuery({
    queryKey: ["minutesOfMeeting", selectedMaterial?.material_code],
    queryFn: () => getMinutesOfMeeting(selectedMaterial?.material_code || ""),
    enabled: !!selectedMaterial?.material_code,
  });

  const handleViewMom = (text: string) => {
    setMomText(text);
    setModalVisible(true);
  };

  const handleUploadEmail = async (values: any) => {
    setUploadLoading(true);
    try {
      await uploadEmailContent({
        subject: values.subject,
        body: values.body,
      });
      message.success("Email uploaded successfully");
      setUploadModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["minutesOfMeeting"] });
    } catch (err) {
      message.error("Failed to upload email");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await uploadEmailContent({ subject: "", body: "" });
      message.success("Refreshed successfully");
      queryClient.invalidateQueries({ queryKey: ["minutesOfMeeting"] });
    } catch (err) {
      message.error("Failed to refresh");
    }
  };

  // Edit
  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    setEditLoading(true);
    try {
      await updateMinutesOfMeeting(editingRecord.id, values);
      message.success("MOM updated successfully");
      setEditModalVisible(false);
      setEditingRecord(null);
      queryClient.invalidateQueries({ queryKey: ["minutesOfMeeting"] });
    } catch (err) {
      message.error("Failed to update MOM");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    try {
      await deleteMinutesOfMeeting(id);
      message.success("MOM deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["minutesOfMeeting"] });
    } catch (err) {
      message.error("Failed to delete MOM");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Link to MOM",
      dataIndex: "link_to_mom",
      key: "link_to_mom",
      render: (text: string) =>
        text ? (
          <Button type="link" onClick={() => handleViewMom(text)}>
            View MOM
          </Button>
        ) : (
          "-"
        ),
    },
    {
      title: "Key Takeaway",
      dataIndex: "key_takeaway",
      key: "key_takeaway",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this MOM?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const dataSource = momData?.data?.map((item: any, index: number) => ({
    key: item.id ?? index,
    id: item.id,
    date: item.date,
    supplier: item.supplier,
    link_to_mom: item.link_to_mom,
    key_takeaway: item.key_takeaway,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Minutes of Meeting for:{" "}
          {selectedMaterial?.material_description || "All Material"}
        </h1>
        <UploadAndRefreshActions
          onRefresh={handleRefresh}
          onUpload={() => setUploadModalVisible(true)}
          uploadLoading={uploadLoading}
        />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        bordered
      />

      {/* View MOM Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        title="Minutes of Meeting"
      >
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {momText}
        </pre>
      </Modal>

      {/* Upload Email Modal */}
      <Modal
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        title="Upload Email Subject & Body"
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleUploadEmail}>
          <Form.Item
            label="Email Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email Body"
            name="body"
            rules={[{ required: true, message: "Please enter body" }]}
          >
            <Input.TextArea rows={8} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploadLoading}>
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit MOM Modal */}
      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        title="Edit Minutes of Meeting"
        destroyOnClose
      >
        <Form
          layout="vertical"
          initialValues={editingRecord || {}}
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please enter date" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Supplier"
            name="supplier"
            rules={[{ required: true, message: "Please enter supplier" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Link to MOM"
            name="link_to_mom"
            rules={[{ required: true, message: "Please enter MOM link" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Key Takeaway"
            name="key_takeaway"
            rules={[{ required: true, message: "Please enter key takeaway" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={editLoading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MinutesOfMeeting;