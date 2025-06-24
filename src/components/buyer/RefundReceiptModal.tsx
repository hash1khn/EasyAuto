import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface RefundReceiptModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  refundId: string | null
}

export const RefundReceiptModal = ({ isOpen, onOpenChange, refundId }: RefundReceiptModalProps) => {
  const { user } = useAuth()
  const [refundData, setRefundData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && refundId && user) {
      fetchRefundData()
    }
  }, [isOpen, refundId, user])

  const fetchRefundData = async () => {
    if (!refundId || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("refund_requests")
        .select(`
          *,
          user_profiles (*),
          parts:part_id (
            *,
            vehicles (make, model, year, vin),
            bids!part_id (
              id, price, condition, warranty, status,
              vendor:user_profiles!vendor_id (full_name, business_name)
            )
          ),
          invoices:invoice_id (*)
        `)
        .eq("id", refundId)
        .single()

      if (error) throw error

      setRefundData(data)
    } catch (error) {
      console.error("Error fetching refund data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!refundData || loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">Loading refund receipt...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (refundData.status !== "approved") {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">This refund has not been approved yet.</div>
        </DialogContent>
      </Dialog>
    )
  }

  const refundDate = new Date(refundData.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formatCurrency = (amount: number) => `AED ${amount?.toFixed(2) || "0.00"}`

  // Calculate refund amount - either from invoice or from part bids
  const refundAmount = refundData.invoices
    ? refundData.invoices.total_amount
    : refundData.parts?.bids?.find((b: any) => b.status === "accepted")?.price || 0

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
                  Refund ID: <span className="font-medium text-foreground">{refundId?.slice(0, 8)}</span>
                </p>
                <p className="text-muted-foreground">
                  Refund Date: <span className="font-medium text-foreground">{refundDate}</span>
                </p>
                {refundData.invoices && (
                  <p className="text-muted-foreground">
                    Original Invoice: <span className="font-medium text-foreground">{refundData.invoices.id.slice(0, 8)}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-orange-600">Status: {refundData.status}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Buyer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Refund Issued To</h3>
              <div className="text-foreground">
                <p>{refundData.user_profiles?.full_name || "N/A"}</p>
                <p>{user?.email}</p>
                <p>{refundData.user_profiles?.whatsapp_number || "N/A"}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Credit Note</h3>
              <p className="text-sm text-muted-foreground">
                This credit note confirms the refund for the items listed below.
              </p>
            </div>
          </div>

          {/* Refund Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Refund Details</h3>
            
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Refund Reason:</p>
              <p className="text-sm text-gray-700 mb-2">{refundData.reason}</p>
              
              {refundData.admin_notes && (
                <div className="bg-gray-50 p-3 rounded mt-2">
                  <p className="text-sm">
                    <strong>Admin Notes:</strong> {refundData.admin_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Refunded Items */}
            {refundData.parts && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Refunded Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-semibold text-foreground">Part Name</th>
                        <th className="text-left p-3 font-semibold text-foreground">Part Number</th>
                        <th className="text-right p-3 font-semibold text-foreground">Refund Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">{refundData.parts.part_name}</td>
                        <td className="p-2">{refundData.parts.part_number || "N/A"}</td>
                        <td className="text-right p-2">{formatCurrency(refundAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total Refunded</span>
                <span>{formatCurrency(refundAmount)}</span>
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