import type React from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { ImageCarousel } from "./ImageCarousel"
import type { Part, Vehicle, VendorQuote } from "../../types/sourcer"

interface ViewAllQuotesModalProps {
  isOpen: boolean
  selectedPart: (Part & { vehicle: Vehicle }) | null
  selectedVehicle: Vehicle | null
  onClose: () => void
  onReviewQuote: (quote: VendorQuote, part: Part & { vehicle: Vehicle }) => void
  onAddQuote: (part: Part & { vehicle: Vehicle }) => void
  getConditionColor: (condition: string) => string
}

export const ViewAllQuotesModal: React.FC<ViewAllQuotesModalProps> = ({
  isOpen,
  selectedPart,
  selectedVehicle,
  onClose,
  onReviewQuote,
  onAddQuote,
  getConditionColor,
}) => {
  if (!isOpen || !selectedPart || !selectedVehicle) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Vendor Quotes for {selectedPart.partName}</h3>
            <p className="text-gray-600 mt-1">
              {`${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year} - ${
                selectedVehicle.vin || "No VIN"
              }`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onClose()
                onAddQuote(selectedPart)
              }}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              + Add My Quote
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full -mt-2 -mr-2">
              <span className="text-2xl">&times;</span>
            </Button>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Part Information section */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Part Information</h4>
                {selectedPart.photos && selectedPart.photos.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Reference Photos</h5>
                    <ImageCarousel images={selectedPart.photos} />
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-800">{selectedPart.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Part Number</p>
                    <p className="font-medium text-gray-800">{selectedPart.partNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Customer Budget</p>
                    <p className="text-lg font-bold text-red-600">
                      {selectedPart.estimatedBudget ? `AED ${selectedPart.estimatedBudget}` : "N/A"}
                    </p>
                  </div>
                </div>
                {selectedPart.description && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="font-medium text-gray-800 text-sm">{selectedPart.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor % Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-lg">💡</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Pricing Reminder</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Remember to keep the vendor percentage in mind when reviewing or updating bid prices. Ensure pricing
                    remains competitive while maintaining fair vendor margins.
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Quotes section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Vendor Quotes ({selectedPart.vendorQuotes.length})
              </h4>
              <div className="space-y-4">
                {selectedPart.vendorQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">{quote.vendorName}</h4>
                          {quote.isSourcerProvided && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Sourcer Added
                            </span>
                          )}
                        </div>
                        {/* Vendor Contact Information */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Address:</span>
                            <span>{quote.vendorAddress}</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                quote.vendorAddress,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 ml-1"
                              title="View on Google Maps"
                            >
                              <MapPin className="h-4 w-4" />
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Phone:</span>
                            <a href={`tel:${quote.vendorPhone}`} className="text-blue-500 hover:underline">
                              {quote.vendorPhone}
                            </a>
                          </div>
                          {quote.vendorEmail && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Email:</span>
                              <a href={`mailto:${quote.vendorEmail}`} className="text-blue-500 hover:underline">
                                {quote.vendorEmail}
                              </a>
                            </div>
                          )}
                        </div>
                        {/* Sourcer Notes (if available) */}
                        {quote.isSourcerProvided && quote.sourcerNotes && (
                          <div className="bg-blue-50 p-2 rounded text-sm">
                            <p className="font-medium text-blue-800">Sourcer Notes:</p>
                            <p className="text-gray-700">{quote.sourcerNotes}</p>
                          </div>
                        )}
                        {/* Quote Details */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="font-bold text-blue-600">AED {quote.price}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                              quote.condition,
                            )}`}
                          >
                            {quote.condition}
                          </span>
                          <span>
                            Warranty: <span className="font-medium">{quote.warranty}</span>
                          </span>
                        </div>
                      </div>
                      {quote.imageUrls?.length ? (
                        <div className="w-full">
                          <ImageCarousel images={quote.imageUrls} />
                        </div>
                      ) : (
                        <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          No images
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col gap-2">
                      {quote.status === "pending" ? (
                        <button
                          onClick={() => {
                            onClose()
                            onReviewQuote(quote, selectedPart)
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Review & Accept
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            quote.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {quote.status === "accepted" ? "Accepted" : "Rejected"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
