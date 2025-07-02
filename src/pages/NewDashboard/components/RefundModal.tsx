import React from "react";
import { X, MessageSquare } from "lucide-react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  partName: string;
}

const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose, partName }) => {
  if (!isOpen) return null;

  const handleWhatsAppRefund = () => {
    // In a real app, this would open WhatsApp with a prefilled refund request message
    alert("Opening WhatsApp with refund request message");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Request Refund</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              You are requesting a refund for <span className="font-semibold">{partName}</span>.
            </p>
            <p className="text-gray-700 mb-4">
              To process your refund request, our account manager will contact you via WhatsApp to
              understand the reason and provide assistance.
            </p>
            <p className="text-gray-700">
              Please note that refund eligibility depends on the part's condition and status.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleWhatsAppRefund}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Continue to WhatsApp
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 text-gray-700 font-medium border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundModal; 