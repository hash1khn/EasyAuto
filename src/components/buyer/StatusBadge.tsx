import { Badge } from "@/components/ui/badge";
import { PartStatus } from "@/lib/order"

interface StatusBadgeProps {
  status: PartStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: PartStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          variant: "outline" as const,
          icon: "🔹",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          variant: "secondary" as const,
          icon: "✅",
        };
      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          variant: "default" as const,
          icon: "🚚",
        };
      case "delivered":
        return {
          label: "Delivered",
          variant: "secondary" as const,
          icon: "✔️",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          icon: "❌",
        };
      case "refunded":
        return {
          label: "Refunded",
          variant: "warning" as const,
          icon: "💸",
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: "❓",
        };
    }
  };

  const { label, variant, icon } = getStatusConfig(status);

  return (
    <Badge variant={variant} className="text-xs font-medium">
      {icon} {label}
    </Badge>
  );
};