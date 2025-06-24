import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface ReceiptModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  invoiceId: string | null
}

export const ReceiptModal = ({ isOpen, onOpenChange, invoiceId }: ReceiptModalProps) => {
  const { user } = useAuth()
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && invoiceId && user) {
      fetchInvoiceData()
    }
  }, [isOpen, invoiceId, user])

  const fetchInvoiceData = async () => {
    if (!invoiceId || !user) return

    setLoading(true)
    try {
      // Get user profile first
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (profileError) throw profileError

      const { data, error } = await supabase
        .from("invoices")
        .select(`
        *,
        invoice_parts (
          *,
          parts (
            *,
            vehicles (make, model, year, vin),
            bids!part_id (
              id, price, condition, warranty, notes, status,
              vendor:user_profiles!vendor_id (full_name, business_name)
            )
          )
        ),
        user_profiles!user_id (*),
        delivery_options (name, estimated_days)
      `)
        .eq("id", invoiceId)
        .eq("user_id", userProfile.id)
        .single()

      if (error) throw error

      setInvoiceData(data)
    } catch (error) {
      console.error("Error fetching invoice data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!invoiceData || loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">Loading receipt...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const invoiceDate = new Date(invoiceData.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const groupPartsByVehicle = (parts: any[]) => {
    return parts.reduce((acc: any, part: any) => {
      const key = part.parts?.vehicles?.id || "no-vehicle"
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(part)
      return acc
    }, {})
  }

  const groupedParts = groupPartsByVehicle(invoiceData.invoice_parts || [])
  const vehicleIds = Object.keys(groupedParts)

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col max-h-[90vh]">
        <div id="receipt-content" className="p-8 overflow-y-auto">
          <DialogHeader className="mb-8 text-left">
            <DialogTitle className="text-3xl font-bold">Order Receipt</DialogTitle>
            <div className="flex justify-between text-sm pt-2">
              <div>
                <p className="text-muted-foreground">
                  Invoice ID: <span className="font-medium text-foreground">{invoiceId?.slice(0, 8)}</span>
                </p>
                <p className="text-muted-foreground">
                  Invoice Date: <span className="font-medium text-foreground">{invoiceDate}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">Status: {invoiceData.payment_status}</p>
                <p className="text-xs text-muted-foreground mt-1">Prices include VAT and Service Charge</p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Buyer Information</h3>
              <div className="text-foreground">
                <p>{invoiceData.user_profiles?.full_name || "N/A"}</p>
                <p>{user?.email}</p>
                <p>{invoiceData.user_profiles?.whatsapp_number || "N/A"}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Delivery Address</h3>
              <div className="text-foreground">
                <p>{invoiceData.delivery_address || "Standard delivery address"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Parts Breakdown</h3>
            {vehicleIds.map((vehicleId) => {
              const vehicle = groupedParts[vehicleId][0]?.parts?.vehicles
              const vehicleParts = groupedParts[vehicleId]

              return (
                <div key={vehicleId}>
                  {vehicle && (
                    <h4 className="font-semibold mb-2">
                      {vehicle.make} {vehicle.model} -
                      <span className="text-muted-foreground"> {vehicle.vin || "No VIN"}</span>
                    </h4>
                  )}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-3 font-semibold text-foreground">Part Name</th>
                          <th className="text-left p-3 font-semibold text-foreground">Part Number</th>
                          <th className="text-center p-3 font-semibold text-foreground">Qty</th>
                          <th className="text-right p-3 font-semibold text-foreground">Unit Price</th>
                          <th className="text-right p-3 font-semibold text-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicleParts.map((invoicePart: any) => {
                          const part = invoicePart.parts
                          const winningBid = part?.bids?.find((bid: any) => bid.status === "accepted")
                          const price = winningBid?.price || invoicePart.unit_price || 0

                          return (
                            <tr key={part.id} className="border-t">
                              <td className="p-2">{part?.part_name}</td>
                              <td className="p-2">{part?.part_number || "N/A"}</td>
                              <td className="text-center p-2">{invoicePart.quantity}</td>
                              <td className="text-right p-2">{formatCurrency(price)}</td>
                              <td className="text-right p-2">{formatCurrency(price * invoicePart.quantity)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(invoiceData.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT Amount</span>
                <span className="font-medium">{formatCurrency(invoiceData.vat_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span className="font-medium">{formatCurrency(invoiceData.service_fee || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium">{formatCurrency(invoiceData.delivery_fee || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Grand Total</span>
                <span>{formatCurrency(invoiceData.total_amount || 0)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8">All prices include VAT and Service Charge</p>
        </div>

        <DialogFooter className="p-4 bg-muted border-t sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
