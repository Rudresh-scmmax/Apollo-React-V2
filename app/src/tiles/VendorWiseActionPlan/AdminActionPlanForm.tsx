// AdminActionPlanForm.tsx
import React, { useEffect } from "react";
import { Form, Input, Button, Select, message, Drawer } from "antd";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

const { TextArea } = Input;

interface AdminActionPlanFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: {
    id?: number;
    title: string;
    description: string;
    assignedUsers: string[];
  };
}
const AdminActionPlanForm: React.FC<AdminActionPlanFormProps> = ({
  open,
  onClose,
  initialValues,
}) => {
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
  const { createActionPlan, getAllUsers, updatePlanAssignments } = useBusinessAPI();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const currentUser = localStorage.getItem('role');
  const isAdmin = currentUser === 'admin';

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: isAdmin, // Only fetch users if user is admin
  });

  const mutation = useMutation({
    mutationFn: async (values: {
      title: string;
      description: string;
      assignedUsers: string[];
      material_id: string;
    }) => {
      if (initialValues?.id) {
        // Update assignments only
        await updatePlanAssignments(initialValues.id, values.assignedUsers);
        return { updated: true };
      } else {
        return createActionPlan(values);
      }
    },
    onSuccess: (res) => {
      if (res?.updated) {
        message.success("Assignments updated successfully");
      } else {
        message.success("Plan created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["vendorPlans"] });
      onClose();
      form.resetFields();
    },
    onError: () => {
      message.error("Failed to save plan");
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const onFinish = (values: any) => {
    // Add material_id from selectedMaterial to form values before submitting
    mutation.mutate({
      ...values,
      material_id: selectedMaterial?.material_id || "",
    });
  };

  return (
    <Drawer
      title={initialValues?.id ? "Edit Action Plan" : "Create Action Plan"}
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ assignedUsers: [] }}
      >
        {!initialValues?.id && (
          <>
            <Form.Item
              name="title"
              label="Plan Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Enter plan title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Plan Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea rows={4} placeholder="Enter plan description" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="assignedUsers"
          label="Assign To Users"
          rules={[{ required: true, message: "Please select at least one user" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select users"
            loading={isLoading}
            options={usersData?.map((u: any) => ({
              label: u.name || u.email,
              value: u.id,
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
            backgroundColor: "#a0bf3f",
            borderColor: "#a0bf3f",
            fontSize: "16px",
            height: "40px",
            paddingLeft: "30px",
            paddingRight: "30px"
          }}
            loading={mutation.isPending}
          >
            {initialValues?.id ? "Update Assignments" : "Create Plan"}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AdminActionPlanForm;
