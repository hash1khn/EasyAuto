import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface OrderHistoryCardProps {
  order: any // This is now an invoice-based "order"
  onViewDetails: (partId: string) => void
  onShowReceipt: (invoiceId: string) => void
  onShowRefundReceipt: (refundId: string) => void
}

export function OrderHistoryCard({ order, onViewDetails, onShowReceipt, onShowRefundReceipt }: OrderHistoryCardProps) {
  const hasRefunds = order.refund_requests.length > 0
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // Since we're now grouping by invoice, the invoice is the order itself
  const invoiceForReceipt = order.invoice_url ? order : null

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Order #{order.id}</h3>
            <p className="text-sm text-muted-foreground">Placed on {orderDate}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
          >
            {order.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {order.line_items.map((item: any) => (
          <div key={item.part.id} className="mb-4">
            <p className="font-medium">{item.part.name}</p>
            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
          </div>
        ))}
        <p className="text-sm text-muted-foreground">Total: ${order.total_amount}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => onViewDetails(order.id)}>View Details</Button>
        {order.status === "completed" && invoiceForReceipt && (
          <>
            <Button variant="outline" onClick={() => onShowReceipt(order.id)}>
              <FileText className="mr-2 h-4 w-4" />
              Receipt
            </Button>
            {hasRefunds && (
              <Button variant="destructive" onClick={() => onShowRefundReceipt(order.refund_requests[0].id)}>
                <FileText className="mr-2 h-4 w-4" />
                Refund Receipt
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
