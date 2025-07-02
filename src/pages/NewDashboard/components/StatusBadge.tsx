import React from "react";
import { PartStatus, GroupStatus } from "../data/mockData";

interface StatusBadgeProps {
  status: PartStatus | GroupStatus;
  size?: "sm" | "md";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "PENDING_REVIEW":
        return {
          label: "Pending Review",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
        };
      case "CONFIRMED":
        return {
          label: "Confirmed",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
        };
      case "DELIVERED":
        return {
          label: "Delivered",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
        };
      case "REFUNDED":
        return {
          label: "Refunded",
          bgColor: "bg-orange-100",
          textColor: "text-orange-700",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
        };
      case "COMPLETE":
        return {
          label: "Complete",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
        };
      case "NEW":
        return {
          label: "New",
          bgColor: "bg-purple-100",
          textColor: "text-purple-700",
        };
      default:
        return {
          label: "Unknown",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
        };
    }
  };

  const { label, bgColor, textColor } = getStatusConfig();
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${bgColor} ${textColor} ${sizeClasses}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge; 