import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, User, Warehouse, Package } from "lucide-react"
import type { EnrichedPart } from "@/types/delivery"

interface PartDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  part: EnrichedPart | null
}

const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="rounded-lg overflow-hidden aspect-video relative">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt="Part Image"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=400&width=400"
          }}
        />
      </div>
      {images.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={goToNext}
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const PartDetailsModal: React.FC<PartDetailsModalProps> = ({ isOpen, onClose, part }) => {
  if (!isOpen || !part) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {part.partName}
            <span className="text-gray-500 font-normal">({part.partNumber || "No Part Number"})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <ImageCarousel images={part.imageUrls} />

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-bold text-lg">{part.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <Badge variant="outline">{part.condition}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold text-md">#{part.orderId.slice(-8)}</p>
              </div>
            </div>

            {part.winning_bid && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">Winning Bid</span>
                  <span className="font-bold text-green-900">{formatCurrency(part.winning_bid.price)}</span>
                </div>
                <div className="mt-1 text-xs text-green-700">Warranty: {part.winning_bid.warranty}</div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Warehouse className="mr-3 h-5 w-5" />
                  Vendor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <strong>Name:</strong> {part.vendorName}
                </p>
                <p>
                  <strong>Business:</strong> {part.winning_bid?.vendor?.business_name || "N/A"}
                </p>
                <p>
                  <strong>Location:</strong> {part.vendorAddress}
                </p>
                <p>
                  <strong>Phone:</strong> {part.vendorPhone}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="mr-3 h-5 w-5" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <strong>Make:</strong> {part.vehicle?.make}
                </p>
                <p>
                  <strong>Model:</strong> {part.vehicle?.model}
                </p>
                <p>
                  <strong>Year:</strong> {part.vehicle?.year}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="mr-3 h-5 w-5" />
                  Delivery Info
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <strong>Status:</strong>
                  <Badge variant="secondary" className="ml-2">
                    {part.shipping_status?.replace("_", " ").toUpperCase()}
                  </Badge>
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(part.created_at)}
                </p>
                {part.delivered_at && (
                  <p>
                    <strong>Delivered:</strong> {formatDate(part.delivered_at)}
                  </p>
                )}
                <p>
                  <strong>Buyer:</strong> {part.order?.user_profile?.full_name}
                </p>
                <p>
                  <strong>Delivery Address:</strong> {part.order?.user_profile?.delivery_address || "Not provided"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PartDetailsModal
