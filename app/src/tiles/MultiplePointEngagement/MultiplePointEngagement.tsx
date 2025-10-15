import React, { useEffect, useState } from "react";
import { Table, Modal, Button, message, Input, Form, Popconfirm } from "antd";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UploadAndRefreshActions from "../../common/UploadAndRefreshActions";

const MultiplePointEngagement: React.FC<any> = () => {
  const {
    getMultiplePointEngagemeants,
    uploadEmailContent,
    updateMultiplePointEngagement,
    deleteMultiplePointEngagement,
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
  const [photosModalVisible, setPhotosModalVisible] = useState(false);
  const [photosToShow, setPhotosToShow] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedMaterial) {
      navigate("/dashboard");
    }
  }, [selectedMaterial, navigate]);

  const { data: momData, isLoading } = useQuery({
    queryKey: ["multiplePointEngagement", selectedMaterial?.material_id],
    queryFn: () =>
      getMultiplePointEngagemeants(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
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
        image_urls: values.image_urls.join(","),
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
    setEditingRecord({
      ...record,
      photos_links: Array.isArray(record.photos_link)
        ? record.photos_link
        : typeof record.photos_link === "string" && record.photos_link
        ? record.photos_link.split(",").map((url: string) => url.trim())
        : [""],
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    setEditLoading(true);
    try {
      await updateMultiplePointEngagement(editingRecord.id, {
        ...values,
        photos_link: values.photos_links.join(","),
      });
      message.success("Engagement updated successfully");
      setEditModalVisible(false);
      setEditingRecord(null);
      queryClient.invalidateQueries({ queryKey: ["multiplePointEngagement"] });
    } catch (err) {
      message.error("Failed to update engagement");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    try {
      await deleteMultiplePointEngagement(id);
      message.success("Engagement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["multiplePointEngagement"] });
    } catch (err) {
      message.error("Failed to delete engagement");
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
      title: "Event",
      dataIndex: "event",
      key: "event",
    },
    {
      title: "MOM link",
      dataIndex: "mom_link",
      key: "mom_link",
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
      title: "Key takeaway",
      dataIndex: "key_takeaway",
      key: "key_takeaway",
    },
    {
      title: "Photos link",
      dataIndex: "photos_link",
      key: "photos_link",
      render: (links: string) => {
        const arr = links
          ? links
              .split(",")
              .map((url: string) => url.trim())
              .filter(Boolean)
          : [];
        return arr.length ? (
          <Button
            type="link"
            onClick={() => {
              setPhotosToShow(arr);
              setPhotosModalVisible(true);
            }}
          >
            View Photos
          </Button>
        ) : (
          "-"
        );
      },
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
            title="Are you sure to delete this engagement?"
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
    event: item.event,
    mom_link: item.mom_link,
    key_takeaway: item.key_takeaway,
    photos_link: item.photos_link,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Multiple Point Engagements for:{" "}
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
  <Form.List name="image_urls" initialValue={[""]}>
    {(fields, { add, remove }) => (
      <>
        {fields.map((field, idx) => (
          <Form.Item
            key={field.key}
            label={idx === 0 ? "Image URLs" : ""}
            required={false}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Form.Item
                {...field}
                name={[field.name]}
                rules={[{ required: true, message: "Please enter image URL or remove this field" }]}
                noStyle
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
              {fields.length > 1 && (
                <Button danger onClick={() => remove(field.name)} type="dashed">
                  Remove
                </Button>
              )}
            </div>
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="dashed" onClick={() => add()} block>
            Add Image URL
          </Button>
        </Form.Item>
      </>
    )}
  </Form.List>
  <Form.Item>
    <Button htmlType="submit" type="primary" loading={uploadLoading}>
      Upload
    </Button>
  </Form.Item>
</Form>
      </Modal>

      {/* Edit Engagement Modal */}
      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        title="Edit Multiple Point Engagement"
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
            label="Event"
            name="event"
            rules={[{ required: true, message: "Please enter event" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="MOM link"
            name="mom_link"
            rules={[{ required: true, message: "Please enter MOM link" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Key takeaway"
            name="key_takeaway"
            rules={[{ required: true, message: "Please enter key takeaway" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.List
            name="photos_links"
            initialValue={editingRecord?.photos_links || [""]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, idx) => (
                  <Form.Item
                    key={field.key}
                    label={idx === 0 ? "Photo URLs" : ""}
                    required={false}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      <Form.Item
                        {...field}
                        name={[field.name]}
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter photo URL or remove this field",
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder="https://example.com/photo.jpg" />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          danger
                          onClick={() => remove(field.name)}
                          type="dashed"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Photo URL
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={editLoading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={photosModalVisible}
        onCancel={() => setPhotosModalVisible(false)}
        footer={null}
        title="Photos"
        width={600}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {photosToShow.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Photo ${idx + 1}`}
              style={{
                maxWidth: 250,
                maxHeight: 180,
                borderRadius: 8,
                border: "1px solid #eee",
              }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default MultiplePointEngagement;
