"use client"

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
import type { EnrichedPart } from "@/components/driver/DriverDashboard"

interface PickupModalProps {
  isOpen: boolean
  onClose: () => void
  parts: EnrichedPart[]
  vendorName: string
  onConfirm: (pickupNotes: string, photo?: File) => Promise<void>
}

const PickupModal: React.FC<PickupModalProps> = ({ isOpen, onClose, parts, vendorName, onConfirm }) => {
  const [pickupNotes, setPickupNotes] = useState("")
  const [photo, setPhoto] = useState<File>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      // Just pass the data to parent - let parent handle the Supabase update
      await onConfirm(pickupNotes, photo)

      // Reset form
      setPickupNotes("")
      setPhoto(undefined)
      onClose()
    } catch (error) {
      console.error("Error confirming pickup:", error)
      alert("Failed to confirm pickup. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const removePhoto = () => {
    setPhoto(undefined)
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
            <Label htmlFor="picture">Pickup Photo (Optional)</Label>
            <Input id="picture" type="file" accept="image/*" onChange={handlePhotoChange} />
            {photo && (
              <div className="mt-2 relative inline-block">
                <img
                  src={URL.createObjectURL(photo) || "/placeholder.svg"}
                  alt="Pickup preview"
                  className="w-20 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
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
              }).format(parts.reduce((sum, part) => sum + part.winning_bid.price * part.quantity, 0))}
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
