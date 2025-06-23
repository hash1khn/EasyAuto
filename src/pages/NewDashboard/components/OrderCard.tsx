import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PartDrawer from "./PartDrawer";
import { Order, Part, Vehicle, getGroupStatus, getVehicleById, getPartById } from "../data/mockData";

interface OrderCardProps {
  order: Order;
  parts: Part[];
  vehicle: Vehicle;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, parts, vehicle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const groupStatus = getGroupStatus(parts);
  const formattedDate = new Date(order.date).toLocaleDateString();

  const handlePartClick = (partId: string) => {
    const part = getPartById(partId);
    if (part) {
      setSelectedPart(part);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      {/* Order Header */}
      <div
        className="p-4 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">
                {vehicle.make} {vehicle.year}
              </h3>
              <StatusBadge status={groupStatus} size="sm" />
            </div>
            
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Parts List */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {parts.map((part) => (
            <div
              key={part.id}
              className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              onClick={() => handlePartClick(part.id)}
            >
              <span className="font-medium">{part.name}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={part.status} size="sm" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Part Drawer */}
      {selectedPart && (
        <PartDrawer
          part={selectedPart}
          vehicle={vehicle}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderCard; 