import React, { useState } from "react";
import { X, ChevronRight, MessageSquare } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Part, Vehicle, getConditionText, getWarrantyText, formatCurrency } from "../data/mockData";
import RefundModal from "./RefundModal";

interface PartDrawerProps {
  part: Part;
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

const PartDrawer: React.FC<PartDrawerProps> = ({ part, vehicle, isOpen, onClose }) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleWhatsAppSupport = () => {
    // In a real app, this would open WhatsApp with a prefilled message
    alert("Opening WhatsApp with support message");
  };

  const showSourcerInfo = part.status === "CONFIRMED" || part.status === "DELIVERED" || 
                          part.status === "OUT_FOR_DELIVERY" || part.status === "REFUNDED";
  
  const totalAmount = part.price + part.deliveryFee + part.serviceFee;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{part.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Part Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Part Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge status={part.status} />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{vehicle.make} {vehicle.model} {vehicle.year}</span>
                </div>
                
                {vehicle.vin && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">VIN</span>
                    <span className="font-medium">{vehicle.vin}</span>
                  </div>
                )}
                
                {part.partNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Part Number</span>
                    <span className="font-medium">{part.partNumber}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{part.orderId}</span>
                </div>
                
                {part.expectedDeliveryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected Delivery</span>
                    <span className="font-medium">
                      {new Date(part.expectedDeliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sourcer Info - Only show if confirmed or delivered */}
            {showSourcerInfo && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Sourcer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {/* Photos */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Photos</h4>
                    {part.sourcerPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {part.sourcerPhotos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Part photo ${index + 1}`}
                            className="rounded-md h-32 w-full object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-gray-500">No photos available</p>
                      </div>
                    )}
                  </div>

                  {/* Condition & Warranty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Condition</h4>
                      <p className="font-medium">{getConditionText(part.condition)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Warranty</h4>
                      <p className="font-medium">{getWarrantyText(part.warranty)}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {part.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Notes</h4>
                      <p className="text-sm">{part.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pricing</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Part Price</span>
                    <span className="font-medium">{formatCurrency(part.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{formatCurrency(part.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">{formatCurrency(part.serviceFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Due on Delivery</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Delivery Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Status</span>
                  <StatusBadge status={part.status} />
                </div>

                {/* Proof of pickup photo */}
                {part.proofOfPickup && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Proof of Pickup</h4>
                    <img
                      src={part.proofOfPickup}
                      alt="Proof of pickup"
                      className="rounded-md h-40 w-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Delivery Contact</h4>
                  <p className="font-medium">{part.deliveryContact}</p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleWhatsAppSupport}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Account Manager
              </button>

              {part.status !== "REFUNDED" && part.status !== "CANCELLED" && (
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="w-full py-3 px-4 text-red-600 font-medium border border-red-200 rounded-md hover:bg-red-50"
                >
                  Request Refund / Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        partName={part.name}
      />
    </>
  );
};

export default PartDrawer; 