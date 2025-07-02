import React from "react";
import { X, Download } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Part, Vehicle, formatCurrency } from "../data/mockData";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: Part[];
  vehicle: Vehicle;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, parts, vehicle }) => {
  if (!isOpen) return null;

  const firstPart = parts[0];
  const deliveryDate = firstPart?.deliveryDate 
    ? new Date(firstPart.deliveryDate).toLocaleDateString()
    : "N/A";
    
  const totalAmount = parts.reduce(
    (sum, part) => sum + part.price + part.deliveryFee + part.serviceFee,
    0
  );

  const handleDownloadReceipt = () => {
    // In a real app, this would download a PDF receipt
    alert("Downloading receipt as PDF");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Receipt</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Receipt Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold text-lg">Order #{firstPart.orderId}</h3>
              <p className="text-gray-600">Delivered on {deliveryDate}</p>
              <p className="text-gray-600 mt-1">
                {vehicle.make} {vehicle.model} {vehicle.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Items</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {parts.map((part) => (
                <div key={part.id} className="flex justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <div className="flex items-center mt-1">
                      <StatusBadge status={part.status} size="sm" />
                    </div>
                    {part.partNumber && (
                      <p className="text-xs text-gray-500 mt-1">Part #: {part.partNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(part.price)}</p>
                    <p className="text-sm text-gray-500">
                      + {formatCurrency(part.deliveryFee + part.serviceFee)} fees
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-3 font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{firstPart.paymentMethod || "Cash on Delivery"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Driver</p>
                <p className="font-medium">Mohammed A.</p>
              </div>
            </div>
          </div>

          {/* Delivery Proof */}
          {firstPart.proofOfPickup && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Proof of Delivery</h3>
              <img
                src={firstPart.proofOfPickup}
                alt="Proof of delivery"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadReceipt}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Receipt PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default ReceiptModal; 