import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface RefundReceiptModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  orderId: string | null
}

export const RefundReceiptModal = ({ isOpen, onOpenChange, orderId }: RefundReceiptModalProps) => {
  const { user } = useAuth()
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && orderId && user) {
      fetchOrderData()
    }
  }, [isOpen, orderId, user])

  const fetchOrderData = async () => {
    if (!orderId || !user) return

    setLoading(true)
    try {
      const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          refund_requests (*),
          parts (
            *,
            bids!part_id (price, status)
          )
        `)
        .eq("id", orderId)
        .single()

      if (error) throw error

      setOrderData({ ...data, userProfile })
    } catch (error) {
      console.error("Error fetching refund data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!orderData || loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">Loading refund receipt...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const approvedRefunds = orderData.refund_requests?.filter((r: any) => r.status === "approved") || []

  if (approvedRefunds.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">No approved refunds found for this order.</div>
        </DialogContent>
      </Dialog>
    )
  }

  const refundDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate refund total (simplified - in real app you'd track which specific parts were refunded)
  const refundTotal =
    orderData.parts?.reduce((sum: number, part: any) => {
      const winningBid = part.bids?.find((bid: any) => bid.status === "accepted")
      return sum + (winningBid?.price || 0) * part.quantity
    }, 0) || 0

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col max-h-[90vh]">
        <div id="refund-receipt-content" className="p-8 overflow-y-auto">
          {/* Header */}
          <DialogHeader className="mb-8 text-left">
            <DialogTitle className="text-3xl font-bold">Refund Receipt</DialogTitle>
            <div className="flex justify-between text-sm pt-2">
              <div>
                <p className="text-muted-foreground">
                  Original Order ID: <span className="font-medium text-foreground">{orderId?.slice(0, 8)}</span>
                </p>
                <p className="text-muted-foreground">
                  Refund Date: <span className="font-medium text-foreground">{refundDate}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-orange-600">Status: Refund Processed</p>
              </div>
            </div>
          </DialogHeader>

          {/* Buyer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Refund Issued To</h3>
              <div className="text-foreground">
                <p>{orderData.userProfile?.full_name || "N/A"}</p>
                <p>{user?.email}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Credit Note</h3>
              <p className="text-sm text-muted-foreground">
                This credit note confirms the refund for the items listed below.
              </p>
            </div>
          </div>

          {/* Refund Reasons */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Refund Details</h3>
            {approvedRefunds.map((refund: any) => (
              <div key={refund.id} className="border rounded-lg p-4">
                <p className="font-medium mb-2">Refund Reason:</p>
                <p className="text-sm text-gray-700 mb-2">{refund.reason}</p>
                {refund.admin_notes && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Admin Notes:</strong> {refund.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total Refunded</span>
                <span>{formatCurrency(refundTotal)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8">
            The refunded amount will be returned via the original payment method.
          </p>
        </div>

        <DialogFooter className="p-4 bg-muted border-t sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Refund Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
