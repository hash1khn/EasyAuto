import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "./StatusBadge"
import type { Part, Vehicle } from "@/lib/order"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { X } from "lucide-react"
import { useState } from "react"
import { Portal } from "@radix-ui/react-portal"

interface PartModalProps {
  part: Part | null
  vehicle: Vehicle
  onOpenChange: (part: Part | null) => void
}

export function PartModal({ part, vehicle, onOpenChange }: PartModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!part) return null
  console.log(part)

  // Get accepted bid if any
  const acceptedBid = part.bids?.find((bid) => bid.status === "accepted")
  const isPartConfirmed = acceptedBid !== undefined
  const hasInspectionImages = part.inspection_images && part.inspection_images.length > 0

  return (
    <>
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
                  <p className="text-sm text-muted-foreground">Part Name</p>
                  <p className="font-medium">{part.part_name}</p>
                </div>
                {part.part_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Part Number</p>
                    <p className="font-medium">{part.part_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{part.quantity}</p>
                </div>
                {part.estimated_budget && (
                  <div>
                    <p className="text-sm text-muted-foreground">Max Budget</p>
                    <p className="font-medium">AED {part.estimated_budget}</p>
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
              <div className="bg-muted border rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 text-lg">Sourcer Information</h3>
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
                  </div>
                </div>

                {/* Inspection Images Carousel - Only if images exist */}
                {hasInspectionImages && (
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">Inspection Images</h3>
                    <div className="px-8">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {part.inspection_images.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className="flex justify-center">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Inspection image ${index + 1}`}
                                  className="max-w-full h-auto max-h-64 rounded-lg border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setPreviewImage(image)}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {part.inspection_images.length > 1 && (
                          <>
                            <CarouselPrevious />
                            <CarouselNext />
                          </>
                        )}
                      </Carousel>
                    </div>
                  </div>
                )}
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

      {/* Image Preview Modal */}
      {previewImage && (
        <Portal>
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
            onClick={() => setPreviewImage(null)}
          >
            <div 
              className="relative max-w-7xl w-full mx-4 cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}