import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { EnrichedPart, GroupedDeliveryData } from "@/types/delivery"
import { handleDeliveryConfirmation } from '@/lib/delivery-service';
import { toast } from '@/components/ui/use-toast';

interface InvoiceData {
  parts: EnrichedPart[]
  address: string
  deliveryFee: number
  paymentMethod: string
  paymentReference?: string
  deliveryPhotos: File[]
  deliveryNotes: string
  driverName: string
  subtotal: number
  grandTotal: number
  buyerData?: GroupedDeliveryData
}

interface DeliveringModalProps {
  isOpen: boolean
  onClose: () => void
  parts: EnrichedPart[]
  address: string
  onConfirm: (invoice: InvoiceData) => void
  buyerName: string
  phone: string
  buyerData?: GroupedDeliveryData
}

const paymentMethods = ["Cash", "Card", "Not Collected"]

const DeliveringModal: React.FC<DeliveringModalProps> = ({
  isOpen,
  onClose,
  parts,
  address,
  onConfirm,
  buyerName,
  phone,
  buyerData,
}) => {
  const [deliveryFee, setDeliveryFee] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [deliveryPhotos, setDeliveryPhotos] = useState<File[]>([])
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [driverName, setDriverName] = useState("")

  // Pricing calculations - using mock pricing for now
  const subtotal = parts.reduce((sum, part, idx) => sum + (500 + idx * 100) * (part.quantity || 1), 0)
  const deliveryFeeNum = Number.parseFloat(deliveryFee) || 0
  const grandTotal = subtotal + deliveryFeeNum

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDeliveryPhotos(Array.from(e.target.files))
    }
  }

  const handleConfirm = async () => {
    if (!driverName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Driver name is required"
      });
      return;
    }

    try {
      const invoice = await handleDeliveryConfirmation({
        parts,
        buyerData,
        deliveryFee: Number(deliveryFee) || 0,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        deliveryPhotos,
        deliveryNotes,
        driverName: driverName.trim(),
        subtotal,
        grandTotal
      });

      toast({
        title: "Success",
        description: "Delivery confirmed and invoice generated successfully"
      });

      onConfirm({
        parts,
        address,
        deliveryFee: Number(deliveryFee) || 0,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        deliveryPhotos,
        deliveryNotes,
        driverName: driverName.trim(),
        subtotal,
        grandTotal,
        buyerData
      });
      
      onClose();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm delivery. Please try again."
      });
    }
  };

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Invoice & Confirm Delivery</DialogTitle>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">{buyerName}</span>
            <span className="mx-2">|</span>
            <span>{phone}</span>
          </div>
          <div className="text-sm text-gray-600">
            Delivering to: <span className="font-semibold">{address}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-6 py-4">
            {/* Section 1: Parts Summary Table */}
            <div>
              <div className="font-semibold mb-2">Parts Summary</div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Part Name</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((part, idx) => {
                      const unitPrice = 500 + idx * 100
                      return (
                        <tr key={part.id}>
                          <td className="px-3 py-2">{part.partName}</td>
                          <td className="px-3 py-2 text-center">{part.quantity}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(unitPrice)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(unitPrice * (part.quantity || 1))}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">
                        Subtotal:
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right">
                        + Delivery Fee:
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          min={0}
                          placeholder="AED"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          className="w-28 text-right inline-block"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-bold">
                        Grand Total:
                      </td>
                      <td className="px-3 py-2 text-right font-bold">{formatCurrency(grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Section 2: Payment Confirmation */}
            <div className="grid gap-2">
              <div className="font-semibold mb-1">Payment Confirmation</div>
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  className="border rounded px-2 py-1"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Payment Reference No. (optional)"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="md:ml-2"
                />
              </div>
            </div>

            {/* Section 3: Delivery Evidence */}
            <div className="grid gap-2">
              <div className="font-semibold mb-1">Delivery Evidence</div>
              <Label htmlFor="deliveryPhotos">Delivery Photo(s)</Label>
              <Input id="deliveryPhotos" type="file" multiple accept="image/*" onChange={handlePhotoChange} />
              {deliveryPhotos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {deliveryPhotos.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Delivery photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
              <Label htmlFor="deliveryNotes">Delivery Notes</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="e.g., left with security, customer not home."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>

            {/* Section 4: Driver Info */}
            <div className="grid gap-2">
              <div className="font-semibold mb-1">Driver Info</div>
              <Label htmlFor="driverName">
                Driver Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="driverName"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-600 text-white hover:bg-blue-700">
            Confirm Delivery & Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeliveringModal
