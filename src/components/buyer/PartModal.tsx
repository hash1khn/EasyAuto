import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "./StatusBadge"
import type { Part, Vehicle } from "@/lib/order"

interface PartModalProps {
  part: Part | null
  vehicle: Vehicle
  onOpenChange: (part: Part | null) => void
}

export function PartModal({ part, vehicle, onOpenChange }: PartModalProps) {
  if (!part) return null

  // Get accepted bid if any
  const acceptedBid = part.bids?.find((bid) => bid.status === "accepted")
  const isPartConfirmed = acceptedBid !== undefined

  return (
    <Dialog open={!!part} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{part.part_name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {vehicle.make} {vehicle.model} {vehicle.year} – VIN: {vehicle.vin || "N/A"}
              </p>
            </div>
            <div className="flex items-start gap-3 ml-4">
              <StatusBadge status={part.shipping_status} />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Part Information Block - Always Visible */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-lg">Part Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{part.quantity}</p>
              </div>
              {part.part_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Part Number</p>
                  <p className="font-medium">{part.part_number}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{part.description || "No description provided"}</p>
              </div>
            </div>
          </div>

          {/* Accepted Bid Info Block - Only for accepted bids */}
          {isPartConfirmed && acceptedBid && (
            <div className="bg-muted border rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Accepted Bid Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted Price</p>
                  <p className="font-bold text-lg">AED {acceptedBid.price}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium">{acceptedBid.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warranty</p>
                    <p className="font-medium">{acceptedBid.warranty}</p>
                  </div>
                </div>
                {acceptedBid.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor Notes</p>
                    <p className="text-sm mt-1">{acceptedBid.notes}</p>
                  </div>
                )}

                {/* Vendor Image - Only if image exists */}
                {acceptedBid.image_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Part Image</p>
                    <img
                      src={acceptedBid.image_url || "/placeholder.svg"}
                      alt="Part image"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Bids Info */}
          {part.bids && part.bids.filter((bid) => bid.status === "pending").length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-800">
                📋 You have {part.bids.filter((bid) => bid.status === "pending").length} pending bid(s) for this part
              </p>
              <p className="text-sm text-blue-700 mt-1">We'll notify you when vendors submit their quotes.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
