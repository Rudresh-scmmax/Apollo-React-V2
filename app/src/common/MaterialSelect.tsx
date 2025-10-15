import React, { useState, useRef, useEffect } from "react";

interface Material {
  material_id: string;
  material_description: string;
}

interface MaterialSelectProps {
  materials: Material[];
  selectedMaterial: Material | null;
  onSelect?: (material: Material | null) => void; // optional now
  placeholder?: string;
}

const MaterialSelect: React.FC<MaterialSelectProps> = ({
  materials,
  selectedMaterial,
  onSelect,
  placeholder = "Select Material",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = materials.filter((m) =>
    m.material_description.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-[300px]">
      <div
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {selectedMaterial
          ? selectedMaterial.material_description
          : placeholder}
      </div>

      {open && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full shadow-md max-h-60 overflow-y-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
          />
          {filtered.length > 0 ? (
            filtered.map((m) => (
              <div
                key={m.material_id}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelect?.(m); // safe optional call
                  setOpen(false);
                  setSearch("");
                }}
              >
                {m.material_description}
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

export default MaterialSelect;
