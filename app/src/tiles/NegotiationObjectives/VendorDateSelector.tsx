import React from "react";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface Props {
  vendor: string;
  date: string | null;
  vendors: string[];
  onVendorChange: (val: string) => void;
  onDateChange: (val: string | null) => void;
}

const VendorDateSelector: React.FC<Props> = ({
  vendor,
  date,
  vendors,
  onVendorChange,
  onDateChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Vendor
      </label>
      <Select
        placeholder="Choose vendor"
        value={vendor}
        onChange={onVendorChange}
        className="w-full"
        size="large"
      >
        {vendors.map((vendor) => (
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
        onChange={(d) => onDateChange(d ? d.format("YYYY-MM-DD") : null)}
        className="w-full"
        size="large"
        placeholder="Select date"
      />
    </div>
  </div>
);

export default VendorDateSelector;
