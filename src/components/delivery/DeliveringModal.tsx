import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { EnrichedPart, GroupedDeliveryData } from "@/types/delivery"
import { handleDeliveryConfirmation } from "@/lib/delivery-service"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import imageCompression from 'browser-image-compression';

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
  vatAmount: number
  serviceFee: number
  grandTotal: number
  buyerData?: GroupedDeliveryData
  priceModifiers: {
    vendor_percentage: number
    vat_percentage: number
    service_charge_percentage: number
  }

}

interface DeliveringModalProps {
  isOpen: boolean
  onClose: () => void
  parts: EnrichedPart[]
  address: string
  buyerName: string
  phone: string
  businessName?: string; // Add this line
  buyerData: GroupedDeliveryData
  onConfirm: (data: any) => void
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
  businessName,
  buyerData,
}) => {
  const [deliveryFee, setDeliveryFee] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [deliveryPhotos, setDeliveryPhotos] = useState<File[]>([])
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [driverName, setDriverName] = useState("")
  const [discountAmount, setDiscountAmount] = useState("")

  const [priceModifiers, setPriceModifiers] = useState({
    vendor_percentage: 10,
    vat_percentage: 5,
    service_charge_percentage: 5
  })
  useEffect(() => {
    const fetchModifiers = async () => {
      const { data } = await supabase
        .from('price_modifiers')
        .select('*')
        .single()
      if (data) setPriceModifiers(data)
    }
    fetchModifiers()
  }, [])


  const calculatePrices = () => {
    const deliveryFeeNum = Number.parseFloat(deliveryFee) || 0
    const discountNum = Number.parseFloat(discountAmount) || 0


    // Calculate subtotal with vendor markup
    const subtotal = parts.reduce((sum, part) => {
      const basePrice = part.winning_bid?.price || 0
      const finalUnitPrice = basePrice
      return sum + (finalUnitPrice * (part.quantity || 1))
    }, 0)

    // Calculate taxable amount (subtotal + delivery)
    const taxableAmount = subtotal + deliveryFeeNum - discountNum

    // Calculate VAT and Service Charge
    const vatAmount = taxableAmount * (priceModifiers.vat_percentage / 100)
    const serviceFee = taxableAmount * (priceModifiers.service_charge_percentage / 100)

    // Calculate grand total
    const grandTotal = subtotal + deliveryFeeNum - discountNum + vatAmount + serviceFee

    return { subtotal, deliveryFeeNum, discountNum, vatAmount, serviceFee, grandTotal }
  }

  const { subtotal, deliveryFeeNum, discountNum, vatAmount, serviceFee, grandTotal } = calculatePrices()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount)
  }

  const VALID_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ] as const;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const invalidReasons: string[] = [];

    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          // Check file size first
          if (file.size > 5 * 1024 * 1024) {
            invalidReasons.push(`${file.name}: File exceeds 5MB limit`);
            return null;
          }

          try {
            // Compression options
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            };

            // For HEIC/HEIF files, convert to JPEG first
            if (file.type === 'image/heic' || file.type === 'image/heif') {
              const blobUrl = URL.createObjectURL(file);
              const img = new Image();
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = blobUrl;
              });

              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('Could not get canvas context');
              
              ctx.drawImage(img, 0, 0);
              
              const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
              });

              URL.revokeObjectURL(blobUrl);

              const convertedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg'
              });

              return await imageCompression(convertedFile, options);
            }

            // For other image types, just compress
            if (VALID_FILE_TYPES.includes(file.type as any)) {
              return await imageCompression(file, options);
            }

            invalidReasons.push(`${file.name}: Invalid file type`);
            return null;
          } catch (error) {
            console.error('Error processing file:', file.name, error);
            invalidReasons.push(`${file.name}: Failed to process image`);
            return null;
          }
        })
      );

      // Filter out null results and add valid files
      const validFiles = processedFiles.filter((f): f is File => f !== null);

      if (validFiles.length > 0) {
        setDeliveryPhotos(prev => [...prev, ...validFiles]);
      }

      // Show errors if any files were invalid
      if (invalidReasons.length > 0) {
        toast({
          title: "Some files were invalid",
          description: invalidReasons.join('\n'),
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error handling files:', error);
      toast({
        title: "Error Processing Images",
        description: "Failed to process some images",
        variant: "destructive"
      });
    }
  };

  const handleConfirm = async () => {
    if (!driverName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Driver name is required",
      })
      return
    }

    try {
      // Update parts with final prices including vendor markup
      const updatedParts = parts.map(part => ({
        ...part,
        winning_bid: {
          ...part.winning_bid,
          price: part.winning_bid?.price || 0
        }
      }))

      const invoiceData = {
        parts: updatedParts,
        buyerData,
        address,
        deliveryFee: deliveryFeeNum,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        deliveryPhotos,
        deliveryNotes,
        driverName: driverName.trim(),
        subtotal,
        vatAmount,
        serviceFee,
        grandTotal,
        priceModifiers,
        discountAmount: discountNum
      }

      await handleDeliveryConfirmation(invoiceData)

      onConfirm(invoiceData)
      onClose()

      toast({
        title: "Success",
        description: "Delivery confirmed and invoice generated successfully",
      })
    } catch (error) {
      console.error("Error confirming delivery:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm delivery. Please try again.",
      })
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirm Delivery</DialogTitle>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">
                {buyerName}
                {businessName && (
                  <span className="ml-2 font-normal text-sm text-gray-500">
                    ({businessName})
                  </span>
                )}
              </h3>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-600">{address}</p>
                <p className="text-sm text-gray-600">{phone}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
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
                    {parts.map((part) => {
                      const basePrice = part.winning_bid?.price || 0
                      return (
                        <tr key={part.id}>
                          <td className="px-3 py-2">{part.partName}</td>
                          <td className="px-3 py-2 text-center">{part.quantity}</td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(basePrice)}

                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(basePrice * (part.quantity || 1))}
                          </td>
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
                      <td colSpan={3} className="px-3 py-2 text-right">
                        + VAT ({priceModifiers.vat_percentage}%):
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(vatAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right">
                        + Service Charge ({priceModifiers.service_charge_percentage}%):
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(serviceFee)}</td>
                    </tr>
                   <tr>
  <td colSpan={3} className="px-3 py-2 text-right">
    - Discount:
  </td>
  <td className="px-3 py-2 text-right">
    <div className="flex items-center justify-end gap-2">
      <Input
        type="number"
        min={0}
        max={subtotal + deliveryFeeNum}
        placeholder="AED"
        value={discountAmount}
        onKeyPress={(e) => {
          if (e.key === '-') {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || (Number(value) >= 0 )) {
            setDiscountAmount(value);
          }
        }}
        className="w-28 text-right"
      />
    </div>
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
              <Label htmlFor="deliveryPhotos">Delivery Photo(s) - Multiple photos allowed</Label>
              <Input
                id="deliveryPhotos"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handlePhotoChange}
                className="cursor-pointer"
              />
              {deliveryPhotos.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">{deliveryPhotos.length} photo(s) selected</div>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {deliveryPhotos.map((file, index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = deliveryPhotos.filter((_, i) => i !== index)
                            setDeliveryPhotos(newPhotos)
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Label htmlFor="deliveryNotes">Delivery Notes</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="e.g., left with security, customer not home."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
              <div className="text-xs text-gray-500">
                Supported formats: JPG, PNG, WEBP, HEIC (Max 5MB each)
              </div>
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
        </div>

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
