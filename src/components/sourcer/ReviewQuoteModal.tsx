import type React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ImageCarousel } from "./ImageCarousel"
import type { Part, Vehicle, VendorQuote, ReviewForm } from "../../types/sourcer"

interface ReviewQuoteModalProps {
  isOpen: boolean
  selectedQuote: VendorQuote | null
  selectedPart: (Part & { vehicle: Vehicle }) | null
  reviewForm: ReviewForm
  submitting: boolean
  maxAllowedSpend: number | null
  onClose: () => void
  onFormChange: (form: ReviewForm) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
  onAcceptQuote: (quote: VendorQuote) => void
  calculateProfitMargin: (customerPaid: string, vendorPrice: string) => any
  getConditionColor: (condition: string) => string
}

export const ReviewQuoteModal: React.FC<ReviewQuoteModalProps> = ({
  isOpen,
  selectedQuote,
  selectedPart,
  reviewForm,
  submitting,
  maxAllowedSpend,
  onClose,
  onFormChange,
  onImageUpload,
  onRemoveImage,
  onAcceptQuote,
  calculateProfitMargin,
  getConditionColor,
}) => {
  if (!isOpen || !selectedQuote || !selectedPart) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Review & Accept Quote</h3>
            <p className="text-gray-600 mt-1">From: {selectedQuote.vendorName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full -mt-2 -mr-2">
            <span className="text-2xl">&times;</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Paid (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={reviewForm.customerPaid}
                  onChange={(e) =>
                    onFormChange({
                      ...reviewForm,
                      customerPaid: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Prefilled with customer budget. Can be adjusted as needed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">We Pay Vendor (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={reviewForm.vendorPrice}
                  onChange={(e) =>
                    onFormChange({
                      ...reviewForm,
                      vendorPrice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Vendor's quoted price. Can be adjusted if needed.</p>
                {maxAllowedSpend !== null && (
                  <p className="text-md text-red-500 mt-1">Max allowed spend: AED {maxAllowedSpend.toFixed(2)}</p>
                )}
              </div>
              {/* Profit Margin Calculator */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3">Profit Calculation</h4>
                {reviewForm.customerPaid && reviewForm.vendorPrice ? (
                  (() => {
                    const profitInfo = calculateProfitMargin(reviewForm.customerPaid, reviewForm.vendorPrice)
                    if (!profitInfo) {
                      return <div className="text-gray-500">Invalid input values</div>
                    }
                    const { profit, margin, status } = profitInfo
                    const profitColor = {
                      red: "text-red-600",
                      orange: "text-orange-600",
                      green: "text-green-600",
                    }[status]
                    const marginColor = {
                      red: "text-red-600",
                      orange: "text-orange-600",
                      green: "text-green-600",
                    }[status]
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer Pays:</span>
                          <span className="font-medium">
                            AED {Number.parseFloat(reviewForm.customerPaid).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">We Pay Vendor:</span>
                          <span className="font-medium">
                            AED {Number.parseFloat(reviewForm.vendorPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit Amount:</span>
                          <span className={`font-bold ${profitColor}`}>AED {profit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit Margin:</span>
                          <span className={`font-bold ${marginColor}`}>{margin.toFixed(1)}%</span>
                        </div>
                        {maxAllowedSpend !== null && Number.parseFloat(reviewForm.vendorPrice) > maxAllowedSpend && (
                          <div className="mt-2 bg-red-50 border-l-4 border-red-500 p-2">
                            <p className="text-red-700 text-sm">
                              <span className="font-bold">Warning:</span> This quote exceeds maximum allowed spend by
                              AED {(Number.parseFloat(reviewForm.vendorPrice) - maxAllowedSpend).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-gray-500">Enter both amounts to see profit calculation.</div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Quote Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-lg text-blue-600">AED {selectedQuote.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Condition:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                        selectedQuote.condition,
                      )}`}
                    >
                      {selectedQuote.condition}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Warranty:</span>
                    <span className="font-medium">{selectedQuote.warranty}</span>
                  </div>
                  {selectedQuote.vendorNotes && (
                    <div className="pt-2">
                      <span className="text-gray-600">Notes:</span>
                      <p className="text-sm mt-1 bg-white p-2 border rounded">{selectedQuote.vendorNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedQuote.imageUrls?.length ? (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Part Images</h4>
                  <div className="w-full">
                    <ImageCarousel images={selectedQuote.imageUrls} />
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  No part images available
                </div>
              )}
            </div>
            {/* Right Column - Vendor Info & Review Form */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Vendor Information</h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Address:</span>
                    <p className="mt-1">{selectedQuote.vendorAddress}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">Phone:</span>
                    <a href={`tel:${selectedQuote.vendorPhone}`} className="text-blue-600 hover:underline">
                      {selectedQuote.vendorPhone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <a href={`mailto:${selectedQuote.vendorEmail}`} className="text-blue-600 hover:underline">
                      {selectedQuote.vendorEmail}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Your Review</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Inspection Images ({reviewForm.inspectionImages.length} selected)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload photos from your vendor inspection visit.</p>
                    {/* Preview selected images */}
                    {reviewForm.inspectionImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {reviewForm.inspectionImages.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="relative group">
                            <img
                              src={URL.createObjectURL(file) || "/placeholder.svg" || "/placeholder.svg"}
                              alt={`Upload preview ${index + 1}`}
                              className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-[96px]">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                    <textarea
                      value={reviewForm.reviewNotes}
                      onChange={(e) =>
                        onFormChange({
                          ...reviewForm,
                          reviewNotes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Describe your inspection findings, part condition, vendor facility, etc..."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3 p-6 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAcceptQuote(selectedQuote)}
            disabled={submitting || !reviewForm.reviewNotes.trim()}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Accepting...
              </>
            ) : (
              "Accept This Quote"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
