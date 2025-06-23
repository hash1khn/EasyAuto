import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag, ChevronDown, ChevronUp, FileText } from "lucide-react"
import { OrderDetailsTable } from "./OrderDetailsTable"

const getStatusStyle = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800 border-green-200"
    case "completed":
    case "delivered":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

interface OrderHistoryCardProps {
  order: any
  onViewDetails: (partId: string) => void
  onShowReceipt: (orderId: string) => void
  onShowRefundReceipt: (orderId: string) => void
}

export const OrderHistoryCard = ({
  order,
  onViewDetails,
  onShowReceipt,
  onShowRefundReceipt,
}: OrderHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasRefunds = order.refund_requests.length > 0
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
              <Badge className={getStatusStyle(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{orderDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>
                  {order.parts_count} part{order.parts_count !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="font-bold text-green-600">AED {order.total_amount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              More Details
            </Button>
            {order.status === "completed" && (
              <>
                <Button variant="outline" onClick={() => onShowReceipt(order.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Receipt
                </Button>
                {hasRefunds && (
                  <Button variant="destructive" onClick={() => onShowRefundReceipt(order.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Refund Receipt
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        {isExpanded && <OrderDetailsTable order={order} onViewDetails={onViewDetails} />}
      </CardContent>
    </Card>
  )
}
