import React, { useEffect, useState } from "react";
import { Select, DatePicker, Input, Button, message, Card, Table } from "antd";
import dayjs from "dayjs";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { useQuery } from "@tanstack/react-query";

const { Option } = Select;
const { TextArea } = Input;

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  placeholder,
  style,
  multiline = false,
}) => {
  if (multiline) {
    return (
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ border: "none", background: "transparent", ...style }}
        autoSize={{ minRows: 2, maxRows: 4 }}
      />
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ border: "none", background: "transparent", ...style }}
    />
  );
};

const NegotiationObjectives: React.FC<any> = () => {
  const { getVendors, getNegotiationObjectives, createNegotiationObjectives } =
    useBusinessAPI();

  const [loading, setLoading] = useState(false);

  const { data: vendorsData = [], isLoading } = useQuery({
    queryKey: ["vendorsData"],
    queryFn: getVendors,
  });

  const [date, setDate] = useState<string | null>(null);
  const [vendor, setVendor] = useState<string>(vendorsData[0] || "");

  const initialNegotiationData = {
    // vendor: "",
    // date: "",
    objective: "",
    tco: {
      pastPeriod: "",
      current: "",
      forecast: "",
    },
    cleanSheetPrice: {
      routeA: {
        pastPeriod: "",
        current: "",
        forecast: "",
      },
      routeB: {
        pastPeriod: "",
        current: "",
        forecast: "",
      },
    },
    importExportData: {
      import: {
        pastPeriod: "",
        current: "",
        forecast: "",
      },
      export: {
        pastPeriod: "",
        current: "",
        forecast: "",
      },
    },
    targetNegotiation: {
      min: "",
      max: "",
    },
    wishlists: {
      wishlist: {
        paymentTerms: { levers: "", remarks: "" },
        security: { levers: "", remarks: "" },
      },
      concession: {
        paymentTerms: { levers: "", remarks: "" },
        security: { levers: "", remarks: "" },
      },
    },
    strategy: {
      supplierSOB: "",
      whatWeWant: "",
      whatTheyWant: "",
      whatWeWantToAvoid: "",
      whatTheyWantToAvoid: "",
    },
    marketUpdate: {
      myInfo: "",
      questionsToAsk: "",
    },
  };

  const [data, setData] = useState<NegotiationData>(initialNegotiationData);

  const { data: negotiationObjectives } =
    useQuery<NegotiationObjectivesResponse>({
      queryKey: ["vendorsData", vendor || "", date || ""],
      queryFn: () => getNegotiationObjectives(vendor || "", date || ""),
      enabled: !!vendor && !!date,
    });

  useEffect(() => {
    if (negotiationObjectives) {
      const { objectives } = negotiationObjectives;
      setData({ ...objectives });
    } else {
      setData(initialNegotiationData);
    }
  }, [negotiationObjectives]);

  const handleSave = async () => {
    if (!vendor || !date) {
      message.error("Please select vendor and date");
      return;
    }

    setLoading(true);
    try {
      console.log("Saving data:", data);

      await createNegotiationObjectives(vendor, date, data);

      message.success("Negotiation objectives saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      message.error("Failed to save data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateNestedValue = (path: string[], value: string) => {
    setData((prev) => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  // Table configurations
  const tcoColumns = [
    {
      title: "Past Period",
      dataIndex: "pastPeriod",
      key: "pastPeriod",
      render: (text: string) => (
        <EditableCell
          value={data.tco.pastPeriod}
          onChange={(value) => updateNestedValue(["tco", "pastPeriod"], value)}
          placeholder="Past period value"
        />
      ),
    },
    {
      title: "Current",
      dataIndex: "current",
      key: "current",
      render: (text: string) => (
        <EditableCell
          value={data.tco.current}
          onChange={(value) => updateNestedValue(["tco", "current"], value)}
          placeholder="Current value"
        />
      ),
    },
    {
      title: "Forecast",
      dataIndex: "forecast",
      key: "forecast",
      render: (text: string) => (
        <EditableCell
          value={data.tco.forecast}
          onChange={(value) => updateNestedValue(["tco", "forecast"], value)}
          placeholder="Forecast value"
        />
      ),
    },
  ];

  const tcoData = [{ key: "1" }];

  const cleanSheetColumns = [
    {
      title: "Route",
      dataIndex: "route",
      key: "route",
      width: "25%",
    },
    {
      title: "Past Period",
      dataIndex: "pastPeriod",
      key: "pastPeriod",
      width: "25%",
    },
    {
      title: "Current",
      dataIndex: "current",
      key: "current",
      width: "25%",
    },
    {
      title: "Forecast",
      dataIndex: "forecast",
      key: "forecast",
      width: "25%",
    },
  ];

  const cleanSheetData = [
    {
      key: "1",
      route: "Route A",
      pastPeriod: (
        <EditableCell
          value={data.cleanSheetPrice.routeA.pastPeriod}
          onChange={(value) =>
            updateNestedValue(
              ["cleanSheetPrice", "routeA", "pastPeriod"],
              value
            )
          }
          placeholder="Past period"
        />
      ),
      current: (
        <EditableCell
          value={data.cleanSheetPrice.routeA.current}
          onChange={(value) =>
            updateNestedValue(["cleanSheetPrice", "routeA", "current"], value)
          }
          placeholder="Current"
        />
      ),
      forecast: (
        <EditableCell
          value={data.cleanSheetPrice.routeA.forecast}
          onChange={(value) =>
            updateNestedValue(["cleanSheetPrice", "routeA", "forecast"], value)
          }
          placeholder="Forecast"
        />
      ),
    },
    {
      key: "2",
      route: "Route B",
      pastPeriod: (
        <EditableCell
          value={data.cleanSheetPrice.routeB.pastPeriod}
          onChange={(value) =>
            updateNestedValue(
              ["cleanSheetPrice", "routeB", "pastPeriod"],
              value
            )
          }
          placeholder="Past period"
        />
      ),
      current: (
        <EditableCell
          value={data.cleanSheetPrice.routeB.current}
          onChange={(value) =>
            updateNestedValue(["cleanSheetPrice", "routeB", "current"], value)
          }
          placeholder="Current"
        />
      ),
      forecast: (
        <EditableCell
          value={data.cleanSheetPrice.routeB.forecast}
          onChange={(value) =>
            updateNestedValue(["cleanSheetPrice", "routeB", "forecast"], value)
          }
          placeholder="Forecast"
        />
      ),
    },
  ];

  const importExportColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "25%",
    },
    {
      title: "Past Period",
      dataIndex: "pastPeriod",
      key: "pastPeriod",
      width: "25%",
    },
    {
      title: "Current",
      dataIndex: "current",
      key: "current",
      width: "25%",
    },
    {
      title: "Forecast",
      dataIndex: "forecast",
      key: "forecast",
      width: "25%",
    },
  ];

  const importExportData = [
    {
      key: "1",
      type: "Import",
      pastPeriod: (
        <EditableCell
          value={data.importExportData.import.pastPeriod}
          onChange={(value) =>
            updateNestedValue(
              ["importExportData", "import", "pastPeriod"],
              value
            )
          }
          placeholder="Past period"
        />
      ),
      current: (
        <EditableCell
          value={data.importExportData.import.current}
          onChange={(value) =>
            updateNestedValue(["importExportData", "import", "current"], value)
          }
          placeholder="Current"
        />
      ),
      forecast: (
        <EditableCell
          value={data.importExportData.import.forecast}
          onChange={(value) =>
            updateNestedValue(["importExportData", "import", "forecast"], value)
          }
          placeholder="Forecast"
        />
      ),
    },
    {
      key: "2",
      type: "Export",
      pastPeriod: (
        <EditableCell
          value={data.importExportData.export.pastPeriod}
          onChange={(value) =>
            updateNestedValue(
              ["importExportData", "export", "pastPeriod"],
              value
            )
          }
          placeholder="Past period"
        />
      ),
      current: (
        <EditableCell
          value={data.importExportData.export.current}
          onChange={(value) =>
            updateNestedValue(["importExportData", "export", "current"], value)
          }
          placeholder="Current"
        />
      ),
      forecast: (
        <EditableCell
          value={data.importExportData.export.forecast}
          onChange={(value) =>
            updateNestedValue(["importExportData", "export", "forecast"], value)
          }
          placeholder="Forecast"
        />
      ),
    },
  ];

  const targetNegotiationColumns = [
    {
      title: "Min (in Rs./$)",
      dataIndex: "min",
      key: "min",
      width: "50%",
      render: () => (
        <EditableCell
          value={data.targetNegotiation.min}
          onChange={(value) =>
            updateNestedValue(["targetNegotiation", "min"], value)
          }
          placeholder="Minimum value"
        />
      ),
    },
    {
      title: "Max (in Rs./$)",
      dataIndex: "max",
      key: "max",
      width: "50%",
      render: () => (
        <EditableCell
          value={data.targetNegotiation.max}
          onChange={(value) =>
            updateNestedValue(["targetNegotiation", "max"], value)
          }
          placeholder="Maximum value"
        />
      ),
    },
  ];

  const targetNegotiationData = [{ key: "1" }];

  const strategyColumns = [
    {
      title: "Supplier's SOB",
      dataIndex: "supplierSOB",
      key: "supplierSOB",
      width: "33.33%",
      render: () => (
        <EditableCell
          value={data.strategy.supplierSOB}
          onChange={(value) =>
            updateNestedValue(["strategy", "supplierSOB"], value)
          }
          placeholder="Enter supplier's SOB"
          multiline
        />
      ),
    },
    {
      title: "What we want to avoid",
      dataIndex: "whatWeWantToAvoid",
      key: "whatWeWantToAvoid",
      width: "33.33%",
      render: () => (
        <EditableCell
          value={data.strategy.whatWeWantToAvoid}
          onChange={(value) =>
            updateNestedValue(["strategy", "whatWeWantToAvoid"], value)
          }
          placeholder="What we want to avoid"
          multiline
        />
      ),
    },
    {
      title: "What they want to avoid",
      dataIndex: "whatTheyWantToAvoid",
      key: "whatTheyWantToAvoid",
      width: "33.33%",
      render: () => (
        <EditableCell
          value={data.strategy.whatTheyWantToAvoid}
          onChange={(value) =>
            updateNestedValue(["strategy", "whatTheyWantToAvoid"], value)
          }
          placeholder="What they want to avoid"
          multiline
        />
      ),
    },
  ];

  const strategyData = [{ key: "1" }];

  const marketUpdateColumns = [
    {
      title: "My Info",
      dataIndex: "myInfo",
      key: "myInfo",
      width: "50%",
      render: () => (
        <EditableCell
          value={data.marketUpdate.myInfo}
          onChange={(value) =>
            updateNestedValue(["marketUpdate", "myInfo"], value)
          }
          placeholder="Enter your market information"
          multiline
        />
      ),
    },
    {
      title: "Questions to ask",
      dataIndex: "questionsToAsk",
      key: "questionsToAsk",
      width: "50%",
      render: () => (
        <EditableCell
          value={data.marketUpdate.questionsToAsk}
          onChange={(value) =>
            updateNestedValue(["marketUpdate", "questionsToAsk"], value)
          }
          placeholder="Enter questions to ask"
          multiline
        />
      ),
    },
  ];

  const marketUpdateData = [{ key: "1" }];

  // Common table styles
  const tableStyle = {
    ".ant-table-thead > tr > th": {
      backgroundColor: "#a0bf3f !important",
      color: "white !important",
      fontWeight: "bold",
      textAlign: "center" as const,
    },
    ".ant-table-tbody > tr > td": {
      padding: "12px",
    },
  };

  return (
    <div className="container mx-auto p-6">
      <style>
        {`
          .custom-table .ant-table-thead > tr > th {
            background-color: #a0bf3f !important;
            color: white !important;
            font-weight: bold;
            text-align: center;
          }
          .custom-table .ant-table-tbody > tr > td {
            padding: 12px;
          }
          .custom-table .ant-table-tbody > tr > td:first-child {
            background-color: #f5f5f5;
            font-weight: 500;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Negotiation Objectives:
        </h1>
      </div>

      {/* Vendor and Date Selection */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vendor
            </label>
            <Select
              placeholder="Choose vendor"
              value={vendor}
              onChange={(value) => setVendor(value)}
              className="w-full"
              size="large"
            >
              {vendorsData.map((vendor) => (
                <Option key={vendor} value={vendor}>
                  {vendor}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <DatePicker
              value={date ? dayjs(date) : null}
              onChange={(date) =>
                setDate(date ? date.format("YYYY-MM-DD") : "")
              }
              className="w-full"
              size="large"
              placeholder="Select date"
            />
          </div>
        </div>
      </Card>

      {/* Kraljic Box Position */}
      <Card className="mb-6">
        <div className="border border-gray-300">
          <div className="bg-gray-100 p-3 border-b">
            <h3 className="font-medium text-gray-800">{vendor || ""}</h3>
          </div>
          <div
            style={{ backgroundColor: "#a0bf3f" }}
            className="p-3 text-white text-center font-medium"
          >
            Objective
          </div>
          <div className="p-3">
            <EditableCell
              value={data.objective}
              onChange={(value) =>
                setData((prev) => ({ ...prev, objective: value }))
              }
              placeholder="Enter objective details..."
              multiline
            />
          </div>
        </div>
      </Card>

      {/* TCO Section */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">1. TCO</h3>
        </div>
        <Table
          className="custom-table"
          columns={tcoColumns}
          dataSource={tcoData}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Clean Sheet Price */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">
            2. Clean sheet price with 10% margin
          </h3>
        </div>
        <Table
          className="custom-table"
          columns={cleanSheetColumns}
          dataSource={cleanSheetData}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Import/Export Data */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">
            3. Import/Export Data Analysis
          </h3>
        </div>
        <Table
          className="custom-table"
          columns={importExportColumns}
          dataSource={importExportData}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Target Negotiation Window */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">
            4. Target negotiation window
          </h3>
        </div>
        <Table
          className="custom-table"
          columns={targetNegotiationColumns}
          dataSource={targetNegotiationData}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Wishlists and Concessions */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">
            5. Wishlists and Concessions
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div
              style={{ backgroundColor: "#a0bf3f" }}
              className="p-3 text-white text-center font-medium mb-2"
            >
              Wishlist
            </div>
            <div className="border border-gray-300">
              <div className="grid grid-cols-2 bg-gray-50 border-b">
                <div className="p-2 border-r font-medium">Payment terms</div>
                <div className="p-2 font-medium">SOB</div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="p-2 border-r">
                  <EditableCell
                    value={data.wishlists.wishlist.paymentTerms.levers}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "wishlist", "paymentTerms", "levers"],
                        value
                      )
                    }
                    placeholder="Enter levers"
                  />
                </div>
                <div className="p-2">
                  <EditableCell
                    value={data.wishlists.wishlist.paymentTerms.remarks}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "wishlist", "paymentTerms", "remarks"],
                        value
                      )
                    }
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 bg-gray-50 border-b">
                <div className="p-2 border-r font-medium">Security</div>
                <div className="p-2 font-medium">Recycling</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 border-r">
                  <EditableCell
                    value={data.wishlists.wishlist.security.levers}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "wishlist", "security", "levers"],
                        value
                      )
                    }
                    placeholder="Enter levers"
                  />
                </div>
                <div className="p-2">
                  <EditableCell
                    value={data.wishlists.wishlist.security.remarks}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "wishlist", "security", "remarks"],
                        value
                      )
                    }
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{ backgroundColor: "#a0bf3f" }}
              className="p-3 text-white text-center font-medium mb-2"
            >
              Concession
            </div>
            <div className="border border-gray-300">
              <div className="grid grid-cols-2 bg-gray-50 border-b">
                <div className="p-2 border-r font-medium">Levers</div>
                <div className="p-2 font-medium">Remarks</div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="p-2 border-r">
                  <EditableCell
                    value={data.wishlists.concession.paymentTerms.levers}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "concession", "paymentTerms", "levers"],
                        value
                      )
                    }
                    placeholder="Enter levers"
                  />
                </div>
                <div className="p-2">
                  <EditableCell
                    value={data.wishlists.concession.paymentTerms.remarks}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "concession", "paymentTerms", "remarks"],
                        value
                      )
                    }
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="p-2 border-r">
                  <EditableCell
                    value={data.wishlists.concession.security.levers}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "concession", "security", "levers"],
                        value
                      )
                    }
                    placeholder="Enter levers"
                  />
                </div>
                <div className="p-2">
                  <EditableCell
                    value={data.wishlists.concession.security.remarks}
                    onChange={(value) =>
                      updateNestedValue(
                        ["wishlists", "concession", "security", "remarks"],
                        value
                      )
                    }
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Strategy */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">6. Strategy</h3>
        </div>
        <Table
          className="custom-table"
          columns={strategyColumns}
          dataSource={strategyData}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Market Update */}
      <Card className="mb-6">
        <div className="bg-gray-100 p-3 border-b">
          <h3 className="font-medium text-gray-800">7. Market Update</h3>
        </div>
        <Table
          className="custom-table"
          columns={marketUpdateColumns}
          dataSource={marketUpdateData}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Save Template Button */}
      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          loading={loading}
          style={{
            backgroundColor: "#ff7a00",
            borderColor: "#ff7a00",
            fontSize: "16px",
            height: "45px",
            paddingLeft: "30px",
            paddingRight: "30px",
          }}
        >
          Save Template
        </Button>
      </div>
    </div>
  );
};

export default NegotiationObjectives;
