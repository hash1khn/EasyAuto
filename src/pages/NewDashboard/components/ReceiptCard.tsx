import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import ReceiptModal from "./ReceiptModal";
import { Part, Vehicle, formatCurrency } from "../data/mockData";

interface ReceiptCardProps {
  parts: Part[];
  vehicle: Vehicle;
  deliveryDate: string;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ parts, vehicle, deliveryDate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalAmount = parts.reduce(
    (sum, part) => sum + part.price + part.deliveryFee + part.serviceFee,
    0
  );

  const formattedDate = new Date(deliveryDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine status - if any part is refunded, show refunded status
  const hasRefundedParts = parts.some(part => part.status === "REFUNDED");
  const status = hasRefundedParts ? "REFUNDED" : "DELIVERED";
  
  const orderId = parts[0]?.orderId || "N/A";

  return (
    <>
      <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white p-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{formattedDate}</h3>
              <StatusBadge status={status} size="sm" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Order #{orderId}
            </p>
            <p className="text-sm text-gray-600">
              {vehicle.make} {vehicle.model} {vehicle.year}
            </p>
            <p className="text-sm text-gray-600">
              {parts.length} part{parts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="mt-3 md:mt-0 md:text-right">
            <p className="font-semibold">{formatCurrency(totalAmount)}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              View Receipt
            </button>
          </div>
        </div>
      </div>

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parts={parts}
        vehicle={vehicle}
      />
    </>
  );
};

export default ReceiptCard; 