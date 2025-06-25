import { Card, CardContent } from "@/components/ui/card";
import { Archive, Clock, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface OrderHistorySummaryProps {
  parts: any[];
}

export const OrderHistorySummary = ({ parts }: OrderHistorySummaryProps) => {
  // Calculate counts based on shipping status
  const totalOrders = new Set(parts.map(part => part.invoice_id)).size;
  const deliveredCount = parts.filter(part => part.parts?.shipping_status === 'delivered').length;
  const refundedCount = parts.filter(part => part.parts?.shipping_status === 'refunded').length;
  const cancelledCount = parts.filter(part => part.parts?.shipping_status === 'cancelled').length;

  const summaryData = [
    { 
      title: "Total Orders", 
      value: totalOrders.toString(), 
      icon: Archive, 
      color: "text-blue-500", 
      bgColor: "bg-blue-50" 
    },
    { 
      title: "Delivered", 
      value: deliveredCount.toString(), 
      icon: CheckCircle, 
      color: "text-green-500", 
      bgColor: "bg-green-50" 
    },
    { 
      title: "Refunded", 
      value: refundedCount.toString(), 
      icon: RefreshCw, 
      color: "text-orange-500", 
      bgColor: "bg-orange-50" 
    },
    { 
      title: "Cancelled", 
      value: cancelledCount.toString(), 
      icon: XCircle, 
      color: "text-red-500", 
      bgColor: "bg-red-50" 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {summaryData.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
            <div className={`p-3 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};