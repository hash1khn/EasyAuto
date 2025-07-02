import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Use a more flexible interface that can work with both types
interface PickupPart {
  id: string
  partName: string
  partNumber?: string
  quantity: number
  orderId: string
  winning_bid?: {
    price: number
  }
}

interface PickupModalProps {
  isOpen: boolean
  onClose: () => void
  parts: PickupPart[]
  vendorName: string
  onConfirm: (pickupNotes: string, photos: File[]) => Promise<void> | void
}

const PickupModal: React.FC<PickupModalProps> = ({ isOpen, onClose, parts, vendorName, onConfirm }) => {
  const [pickupNotes, setPickupNotes] = useState("")
  const [pickupPhotos, setPickupPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Combine existing photos with new ones
      setPickupPhotos((prevPhotos) => [...prevPhotos, ...Array.from(e.target.files!)])
    }
  }

  const removePhoto = (index: number) => {
    setPickupPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index))
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const result = onConfirm(pickupNotes, pickupPhotos)
      if (result instanceof Promise) {
        await result
      }

      // Reset form
      setPickupNotes("")
      setPickupPhotos([])
      onClose()
    } catch (error) {
      console.error("Error confirming pickup:", error)
      alert("Failed to confirm pickup. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Confirm Pickup from {vendorName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-600">You are about to mark the following parts as "Out for Delivery":</p>

          <ScrollArea className="h-40 w-full rounded-md border p-4">
            <div className="space-y-2">
              {parts.map((part) => (
                <div key={part.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-semibold">{part.partName}</span>
                    {part.partNumber && <span className="text-xs text-gray-500 ml-2">({part.partNumber})</span>}
                    <div className="text-sm text-gray-600">Quantity: {part.quantity}</div>
                  </div>
                  <Badge variant="outline">#{part.orderId.slice(-8)}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Pickup Photos - Multiple photos allowed</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="cursor-pointer"
            />
            {pickupPhotos.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-2">
                  {pickupPhotos.length} photo(s) selected
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {pickupPhotos.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Pickup photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="notes">Pickup Notes (Optional)</Label>
            <Textarea
              placeholder="e.g., box was slightly damaged, but parts look OK."
              id="notes"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Summary</div>
            <div className="text-sm text-blue-700">
              {parts.length} part(s) from {vendorName}
            </div>
            <div className="text-sm text-blue-700">
              Total value:{" "}
              {new Intl.NumberFormat("en-AE", {
                style: "currency",
                currency: "AED",
              }).format(
                parts.reduce((sum, part) => {
                  const price = part.winning_bid?.price || 0
                  return sum + price * part.quantity
                }, 0),
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Pickup"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PickupModal
