import type React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ImageCarousel } from "./ImageCarousel"
import type { Part, Vehicle, AddQuoteForm } from "../../types/sourcer"

interface AddQuoteModalProps {
  isOpen: boolean
  selectedPart: (Part & { vehicle: Vehicle }) | null
  selectedVehicle: Vehicle | null
  addQuoteForm: AddQuoteForm
  submitting: boolean
  vendorPercentage: number | null
  maxAllowedSpend: number | null
  onClose: () => void
  onFormChange: (form: AddQuoteForm) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
  onSubmit: () => void
  calculateProfitMargin: (customerPaid: string, vendorPrice: string) => any
}

export const AddQuoteModal: React.FC<AddQuoteModalProps> = ({
  isOpen,
  selectedPart,
  selectedVehicle,
  addQuoteForm,
  submitting,
  vendorPercentage,
  maxAllowedSpend,
  onClose,
  onFormChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  calculateProfitMargin,
}) => {
  if (!isOpen || !selectedPart || !selectedVehicle) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Add Manual Quote</h3>
            <p className="text-sm text-gray-600">
              {selectedPart.partName} for {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </p>
            {selectedPart.vendorQuotes && selectedPart.vendorQuotes.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                💡 This part already has {selectedPart.vendorQuotes.length} existing quote(s). You can add your own if
                you found a better deal.
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full -mt-2 -mr-2">
            <span className="text-2xl">&times;</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Existing Quotes Summary (if any) */}
            {selectedPart.vendorQuotes && selectedPart.vendorQuotes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-lg">📋</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Existing Quotes Summary</h4>
                    <div className="mt-2 space-y-1">
                      {selectedPart.vendorQuotes.slice(0, 3).map((quote, index) => (
                        <div key={quote.id} className="text-sm text-blue-700 flex justify-between">
                          <span>{quote.vendorName}</span>
                          <span className="font-medium">AED {quote.price}</span>
                        </div>
                      ))}
                      {selectedPart.vendorQuotes.length > 3 && (
                        <p className="text-xs text-blue-600">+{selectedPart.vendorQuotes.length - 3} more quotes...</p>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Add your quote below if you found a better deal or prefer a different vendor.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Part & Vehicle Info */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Part Information</h4>
              {selectedPart.photos && selectedPart.photos.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Reference Photos</h5>
                  <div className="bg-white rounded-lg p-2">
                    <ImageCarousel images={selectedPart.photos} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Customer provided reference images</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Part Name</p>
                  <p className="font-medium text-gray-800">{selectedPart.partName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vehicle</p>
                  <p className="font-medium text-gray-800">{`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}</p>
                </div>
                <div>
                  <p className="text-gray-500">VIN</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.vin || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Part Number</p>
                  <p className="font-medium text-gray-800">{selectedPart.partNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-800">{selectedPart.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer Budget</p>
                  <p className="font-bold text-red-600">
                    {selectedPart.estimatedBudget ? `AED ${selectedPart.estimatedBudget}` : "N/A"}
                  </p>
                </div>
                {vendorPercentage !== null && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Vendor Percentage</p>
                      <p className="font-medium text-gray-800">{vendorPercentage}%</p>
                    </div>
                    {maxAllowedSpend !== null && (
                      <div>
                        <p className="text-gray-500">Max Allowed Spend</p>
                        <p className="font-bold text-green-600">AED {maxAllowedSpend.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Acceptable Conditions:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPart.part_condition_preferences?.length ? (
                      selectedPart.part_condition_preferences.map((pref, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                          {pref.condition.replace("_", " ")}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Any condition accepted</span>
                    )}
                  </div>
                </div>
                {selectedPart.description && (
                  <div className="col-span-full">
                    <p className="text-gray-500">Description</p>
                    <p className="font-medium text-gray-800 bg-white p-2 rounded border">{selectedPart.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor % Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-lg">💡</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Pricing Reminder</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Keep the vendor percentage in mind when setting the quote price. Ensure fair vendor margins while
                    remaining competitive.
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
              <legend className="text-lg font-semibold text-gray-800 px-2">Vendor Details</legend>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={addQuoteForm.vendorName}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      vendorName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                  placeholder="e.g., John Doe's Auto Parts"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Phone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+971</span>
                  <input
                    type="tel"
                    value={addQuoteForm.vendorPhone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").replace(/^971/, "")
                      onFormChange({
                        ...addQuoteForm,
                        vendorPhone: cleaned,
                      })
                    }}
                    className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                    placeholder="50 123 4567"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter number without country code</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Address</label>
                <input
                  type="text"
                  value={addQuoteForm.vendorAddress}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      vendorAddress: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                  placeholder="Full vendor address"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Email</label>
                <input
                  type="email"
                  value={addQuoteForm.vendorEmail}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      vendorEmail: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                  placeholder="vendor@example.com"
                />
              </div>
            </fieldset>

            {/* Quote Details */}
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
              <legend className="text-lg font-semibold text-gray-800 px-2">Quote Details</legend>
              {/* Customer Pays Us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">The customer pays us (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={addQuoteForm.customerPaid}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      customerPaid: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {/* We Pay Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">We pay the vendor (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={addQuoteForm.vendorPrice}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      vendorPrice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Profit Margin Indicator */}
              {addQuoteForm.customerPaid && addQuoteForm.vendorPrice && (
                <div className="md:col-span-2 p-4 rounded-lg border">
                  {(() => {
                    const profitInfo = calculateProfitMargin(addQuoteForm.customerPaid, addQuoteForm.vendorPrice)
                    if (!profitInfo) return null
                    const { profit, margin, status } = profitInfo
                    const bgColor = {
                      red: "bg-red-50 border-red-200",
                      orange: "bg-orange-50 border-orange-200",
                      green: "bg-green-50 border-green-200",
                    }[status]
                    const textColor = {
                      red: "text-red-800",
                      orange: "text-orange-800",
                      green: "text-green-800",
                    }[status]
                    return (
                      <div className={`${bgColor} p-4 rounded-lg space-y-2`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Profit Margin:</span>
                          <span className={`font-bold ${textColor}`}>{margin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Profit Amount:</span>
                          <span className={`font-bold ${textColor}`}>AED {profit.toFixed(2)}</span>
                        </div>
                        {margin < 15 && (
                          <p className="text-red-600 text-sm mt-2">
                            Warning: Profit margin is below the recommended 15%
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
              {maxAllowedSpend !== null && Number.parseFloat(addQuoteForm.vendorPrice) > maxAllowedSpend && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-red-700">
                    <span className="font-bold">Warning:</span> Your quote exceeds the maximum allowed spend by AED{" "}
                    {(Number.parseFloat(addQuoteForm.vendorPrice) - maxAllowedSpend).toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={addQuoteForm.condition}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      condition: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Used - Excellent">Used - Excellent</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                <select
                  value={addQuoteForm.warranty}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      warranty: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select warranty</option>
                  <option value="No Warranty">No Warranty</option>
                  <option value="3 Days">3 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part Images ({addQuoteForm.imageFiles.length} selected)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0 file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {/* Image Preview Grid */}
                {addQuoteForm.imageFiles.length > 0 ? (
                  <div className="mt-4">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {addQuoteForm.imageFiles.map((file, index) => (
                          <CarouselItem key={`${file.name}-${index}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4">
                            <div className="relative group p-1">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={`Upload preview ${index + 1}`}
                                className="h-24 w-full object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {addQuoteForm.imageFiles.length > 4 && (
                        <>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                        </>
                      )}
                    </Carousel>
                  </div>
                ) : null}
                <p className="text-xs text-gray-500 mt-1">Upload multiple part images. Click to add more.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Notes</label>
                <textarea
                  value={addQuoteForm.vendorNotes}
                  onChange={(e) =>
                    onFormChange({
                      ...addQuoteForm,
                      vendorNotes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any additional notes about the part or vendor..."
                />
              </div>
            </fieldset>
          </div>
        </div>
        <div className="flex space-x-4 p-6 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={
              submitting ||
              !addQuoteForm.vendorName ||
              !addQuoteForm.vendorPrice ||
              !addQuoteForm.condition ||
              !addQuoteForm.warranty
            }
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Quote...
              </>
            ) : (
              "Add Quote"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
