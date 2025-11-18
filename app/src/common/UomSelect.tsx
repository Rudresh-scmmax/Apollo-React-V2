import React, { useState, useRef, useEffect } from "react";

interface UomOption {
  uom_id: number;
  uom_name: string;
  uom_symbol: string;
}

interface UomSelectProps {
  uoms: UomOption[];
  selectedUom: number | null;
  onChange: (uomId: number) => void;
  loading?: boolean;
  placeholder?: string;
}

const UomSelect: React.FC<UomSelectProps> = ({
  uoms,
  selectedUom,
  onChange,
  loading = false,
  placeholder = "Select UOM",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUoms = uoms.filter((uom) =>
    `${uom.uom_name} ${uom.uom_symbol}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectedUomData = uoms.find((u) => u.uom_id === selectedUom);

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={`border border-gray-300 rounded-lg px-4 py-2 bg-white cursor-pointer ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (!loading) setOpen((prev) => !prev);
        }}
      >
        {selectedUomData
          ? `${selectedUomData.uom_name} (${selectedUomData.uom_symbol})`
          : placeholder}
      </div>

      {open && !loading && (
        <div className="absolute z-20 bg-white border border-gray-300 rounded-lg mt-1 w-full shadow-md max-h-60 overflow-y-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search UOMs..."
            className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
          />
          {filteredUoms.length > 0 ? (
            filteredUoms.map((uom) => (
              <div
                key={uom.uom_id}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(uom.uom_id);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {uom.uom_name} ({uom.uom_symbol})
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UomSelect;

