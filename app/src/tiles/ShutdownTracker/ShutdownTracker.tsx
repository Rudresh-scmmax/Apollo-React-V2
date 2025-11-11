import React, { useEffect, useState } from "react";
import { Table, DatePicker, message, Spin } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { RootState } from "../../store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../common/RegionSelector";
import dayjs from "dayjs";

const ShutdownTracker: React.FC<any> = () => {
  const { getShutdownTracking, getShutdownRegions, updateShutdownTracking } =
    useBusinessAPI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: regions } = useQuery<
    { location_id: number; location_name: string }[]
  >({
    queryKey: ["regions", selectedMaterial?.material_id],
    queryFn: () => getShutdownRegions(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [editing, setEditing] = useState<{ key: number; field: string } | null>(
    null
  );
  const [editValue, setEditValue] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedMaterial) navigate("/dashboard");
  }, [selectedMaterial, navigate]);

  useEffect(() => {
    if (regions && regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0].location_name);
      setSelectedRegionId(regions[0].location_id);
    }
  }, [regions, selectedRegion]);

  const { data: shutdownTracking, isLoading } = useQuery({
    queryKey: [
      "shutdownTracking",
      selectedMaterial?.material_id,
      selectedRegionId,
    ],
    queryFn: () =>
      getShutdownTracking(
        selectedMaterial?.material_id,
        selectedRegionId?.toString() || ""
      ),
    enabled: !!selectedMaterial?.material_id && !!selectedRegionId,
  });

  // ✅ handleUpdate corrected
  const handleUpdate = async (
    record: any,
    field: "shutdown_from" | "shutdown_to",
    value: string | null
  ) => {
    if (!value) {
      message.error("Please select a date.");
      return;
    }

    setUpdating(true);
    try {
      await updateShutdownTracking({
        id: record.id, // ✅ added proper ID
        [field]: value,
      });

      message.success("Shutdown date updated successfully");
      setEditing(null);
      setEditValue(null);

      // ✅ refresh
      queryClient.invalidateQueries({
        queryKey: [
          "shutdownTracking",
          selectedMaterial?.material_id ?? "",
          selectedRegionId,
        ],
      });
    } catch (err: any) {
      message.error(err.message || "Failed to update shutdown date");
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "published_date",
      key: "published_date",
      render: (published_date: string) => new Date(published_date).toLocaleDateString(),
    },
    {
      title: "Producer",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    {
      title: "Shutdown From",
      dataIndex: "shutdown_from",
      key: "shutdown_from",
      render: (shutdown_from: string, record: any, idx: number) => {
        const isEditing =
          editing && editing.key === idx && editing.field === "shutdown_from";
        return isEditing ? (
          <span className="flex items-center gap-2">
            <DatePicker
              value={
                editValue
                  ? dayjs(editValue)
                  : shutdown_from
                  ? dayjs(shutdown_from)
                  : null
              }
              onChange={(date) =>
                setEditValue(date ? date.format("YYYY-MM-DD") : null)
              }
              disabled={updating}
              allowClear={false}
              autoFocus
              size="small"
            />
            <button
              className="ml-1 text-green-600"
              onClick={() => handleUpdate(record, "shutdown_from", editValue)}
              disabled={updating}
            >
              {updating ? <Spin size="small" /> : <CheckOutlined />}
            </button>
            <button
              className="ml-1 text-gray-500"
              onClick={() => {
                setEditing(null);
                setEditValue(null);
              }}
              disabled={updating}
            >
              <CloseOutlined />
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {shutdown_from
              ? new Date(shutdown_from).toLocaleDateString()
              : "-"}
            <EditOutlined
              className="cursor-pointer text-blue-500"
              onClick={() => {
                setEditing({ key: idx, field: "shutdown_from" });
                setEditValue(
                  shutdown_from
                    ? dayjs(shutdown_from).format("YYYY-MM-DD")
                    : null
                );
              }}
            />
          </span>
        );
      },
    },
    {
      title: "Shutdown To",
      dataIndex: "shutdown_to",
      key: "shutdown_to",
      render: (shutdown_to: string, record: any, idx: number) => {
        const isEditing =
          editing && editing.key === idx && editing.field === "shutdown_to";
        return isEditing ? (
          <span className="flex items-center gap-2">
            <DatePicker
              value={
                editValue
                  ? dayjs(editValue)
                  : shutdown_to
                  ? dayjs(shutdown_to)
                  : null
              }
              onChange={(date) =>
                setEditValue(date ? date.format("YYYY-MM-DD") : null)
              }
              disabled={updating}
              allowClear={false}
              autoFocus
              size="small"
            />
            <button
              className="ml-1 text-green-600"
              onClick={() => handleUpdate(record, "shutdown_to", editValue)}
              disabled={updating}
            >
              {updating ? <Spin size="small" /> : <CheckOutlined />}
            </button>
            <button
              className="ml-1 text-gray-500"
              onClick={() => {
                setEditing(null);
                setEditValue(null);
              }}
              disabled={updating}
            >
              <CloseOutlined />
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {shutdown_to ? new Date(shutdown_to).toLocaleDateString() : "-"}
            <EditOutlined
              className="cursor-pointer text-blue-500"
              onClick={() => {
                setEditing({ key: idx, field: "shutdown_to" });
                setEditValue(
                  shutdown_to ? dayjs(shutdown_to).format("YYYY-MM-DD") : null
                );
              }}
            />
          </span>
        );
      },
    },
    {
      title: "Impact",
      dataIndex: "impact",
      key: "impact",
    },
    {
      title: "Key Takeaway",
      dataIndex: "key_takeaway",
      key: "key_takeaway",
    },
    {
      title: "Link",
      dataIndex: "source_link",
      key: "source_link",
      render: (source_link: string) => (
        <a
          href={source_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View Article
        </a>
      ),
    },
  ];

  const dataSource = shutdownTracking?.map((item: any, index: number) => ({
    key: index,
    id: item.id, // ✅ required for updates
    published_date: item.published_date,
    supplier_name: item.supplier_name,
    key_takeaway: item.key_takeaway,
    source_link: item.source_link,
    shutdown_from: item.shutdown_from,
    shutdown_to: item.shutdown_to,
    impact: item.impact,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Shutdown Tracker for:{" "}
          {selectedMaterial?.material_description || "All Material"}
        </h1>
        <RegionSelector
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={(regionName: string) => {
            setSelectedRegion(regionName);
            const region = regions?.find(
              (r) => r.location_name === regionName
            );
            if (region) {
              setSelectedRegionId(region.location_id);
            }
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default ShutdownTracker;
