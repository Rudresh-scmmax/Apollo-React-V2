import React from "react";
import EditableCell from "./EditableCell";

interface Props {
  wishlists: any;
  onChange: (path: string[], value: string) => void;
}

const WishlistConcession: React.FC<Props> = ({ wishlists, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {["wishlist", "concession"].map((type) => (
        <div key={type}>
          <div
            style={{ backgroundColor: "#a0bf3f" }}
            className="p-3 text-white text-center font-medium mb-2"
          >
            {type === "wishlist" ? "Wishlist" : "Concession"}
          </div>
          <div className="border border-gray-300">
            <div className="grid grid-cols-2 bg-gray-50 border-b">
              <div className="p-2 border-r font-medium">Payment terms</div>
              <div className="p-2 font-medium">Remarks</div>
            </div>
            <div className="grid grid-cols-2 border-b">
              <div className="p-2 border-r">
                <EditableCell value={wishlists[type].paymentTerms.levers} onChange={(v) => onChange(["wishlists", type, "paymentTerms", "levers"], v)} 
                    placeholder="Enter payment terms levers"
                />
              </div>
              <div className="p-2">
                <EditableCell value={wishlists[type].paymentTerms.remarks} onChange={(v) => onChange(["wishlists", type, "paymentTerms", "remarks"], v)} 
                    placeholder="Enter payment terms remarks"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 bg-gray-50 border-b">
              <div className="p-2 border-r font-medium">Security</div>
              <div className="p-2 font-medium">Remarks</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-2 border-r">
                <EditableCell value={wishlists[type].security.levers} onChange={(v) => onChange(["wishlists", type, "security", "levers"], v)} 
                    placeholder="Enter security levers"
                />
              </div>
              <div className="p-2">
                <EditableCell value={wishlists[type].security.remarks} onChange={(v) => onChange(["wishlists", type, "security", "remarks"], v)} 
                    placeholder="Enter security remarks"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistConcession;
