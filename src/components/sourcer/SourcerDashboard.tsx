import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

// Components
import { ImagePreviewModal } from "./ImagePreviewModal"
import { ViewAllQuotesModal } from "./ViewAllQuoteModal"
import { ReviewQuoteModal } from "./ReviewQuoteModal"
import { AddQuoteModal } from "./AddQuoteModal"

// Hooks and Utils
import { useSourcerData } from "@/hooks/useSourcerData"
import {
  getQuoteStatus,
  getConditionColor,
  calculateProfitMargin,
  uploadImage,
  calculateMaxAllowedSpend,
  fetchVendorPercentageAndCalculateSpend,} from '../../utils/sourcerUtils'

// Types
import type { Part, Vehicle, VendorQuote, ReviewForm, AddQuoteForm } from "../../types/sourcer"

const SourcerDashboard: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { orders, loading, refetch } = useSourcerData(user)

  // Modal states
  const [selectedQuote, setSelectedQuote] = useState<VendorQuote | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isViewAllQuotesModalOpen, setIsViewAllQuotesModalOpen] = useState(false)
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleFilter, setVehicleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "no-quotes" | "with-quotes">("all")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // Form states
  const [submitting, setSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    inspectionImages: [],
    reviewNotes: "",
    customerPaid: "",
    vendorPrice: "",
  })
  const [addQuoteForm, setAddQuoteForm] = useState<AddQuoteForm>({
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    vendorEmail: "",
    vendorPrice: "",
    customerPaid: "",
    condition: "",
    warranty: "",
    imageFiles: [],
    vendorNotes: "",
  })
  const [vendorPercentage, setVendorPercentage] = useState<number | null>(null)
  const [maxAllowedSpend, setMaxAllowedSpend] = useState<number | null>(null)

  // Calculate metrics
  const allParts = orders.flatMap((order) => order.parts)
  const metrics = {
    pendingQuotes: allParts.reduce(
      (total, part) => total + part.vendorQuotes.filter((q) => q.status === "pending").length,
      0,
    ),
    noQuotes: allParts.filter((part) => part.vendorQuotes.length === 0).length,
  }

  // Effect for calculating max allowed spend
  useEffect(() => {
    if (selectedPart && vendorPercentage !== null) {
      const maxSpend = calculateMaxAllowedSpend(selectedPart.estimatedBudget, vendorPercentage)
      setMaxAllowedSpend(maxSpend)
    }
  }, [selectedPart, vendorPercentage])

  // Filter functions
  const getFilteredParts = () => {
    const allPartsWithOrder: Array<{
      order: any
      part: Part & { vehicle: Vehicle }
    }> = []

    orders.forEach((order) => {
      order.parts.forEach((part) => {
        allPartsWithOrder.push({ order, part })
      })
    })

    return allPartsWithOrder.filter(({ order, part }) => {
      const matchesSearch =
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.vendorQuotes.some((quote) => quote.vendorName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesVehicle = vehicleFilter === "all" || part.vehicle.make === vehicleFilter

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "no-quotes" && part.vendorQuotes.length === 0) ||
        (statusFilter === "with-quotes" && part.vendorQuotes.length > 0)

      return matchesSearch && matchesVehicle && matchesStatus
    })
  }

  // Modal handlers
  const openViewAllQuotesModal = async (part: Part & { vehicle: Vehicle }) => {
    console.log("Opening view all quotes for part:", part)
    console.log("Part photos:", part.photos)
    setSelectedPart(part)
    setSelectedVehicle(part.vehicle)
    setIsViewAllQuotesModalOpen(true)

    // Fetch vendor percentage and calculate spend
    const { vendorPercentage: fetchedPercentage, maxAllowedSpend: calculatedSpend } =
      await fetchVendorPercentageAndCalculateSpend(part.estimatedBudget)
    setVendorPercentage(fetchedPercentage)
    setMaxAllowedSpend(calculatedSpend)
  }

  const closeViewAllQuotesModal = () => {
    setIsViewAllQuotesModalOpen(false)
    setSelectedPart(null)
    setSelectedVehicle(null)
  }

  const openReviewModal = (quote: VendorQuote, part: Part & { vehicle: Vehicle }) => {
    setSelectedQuote(quote)
    setSelectedPart(part)
    setSelectedVehicle(part.vehicle)
    setIsReviewModalOpen(true)

    // Calculate max allowed spend immediately
    const maxSpend = calculateMaxAllowedSpend(part.estimatedBudget, vendorPercentage)
    setMaxAllowedSpend(maxSpend)

    setReviewForm({
      inspectionImages: [],
      reviewNotes: "",
      customerPaid: part.estimatedBudget?.toString() || "",
      vendorPrice: quote.price.toString(),
    })
  }

  const closeReviewModal = () => {
    setIsReviewModalOpen(false)
    setSelectedQuote(null)
    setSelectedPart(null)
    setSelectedVehicle(null)
    setReviewForm({
      inspectionImages: [],
      reviewNotes: "",
      customerPaid: "",
      vendorPrice: "",
    })
  }

  const openAddQuoteModal = async (part: Part & { vehicle: Vehicle }) => {
    setSelectedPart(part)
    setSelectedVehicle(part.vehicle)
    setIsAddQuoteModalOpen(true)
    setAddQuoteForm({
      vendorName: "",
      vendorAddress: "",
      vendorPhone: "",
      vendorEmail: "",
      vendorPrice: "",
      customerPaid: part.estimatedBudget?.toString() || "",
      condition: "",
      warranty: "",
      imageFiles: [],
      vendorNotes: "",
    })

    // Fetch vendor percentage
    try {
      const { data, error } = await supabase.from("price_modifiers").select("vendor_percentage").single()

      if (error) throw error
      setVendorPercentage(data.vendor_percentage)
    } catch (error) {
      console.error("Error fetching vendor percentage:", error)
      toast({
        title: "Error",
        description: "Could not fetch vendor percentage. Using default 15%.",
        variant: "destructive",
      })
      setVendorPercentage(15) // fallback to 15%
    }
  }

  const closeAddQuoteModal = () => {
    setIsAddQuoteModalOpen(false)
    setSelectedPart(null)
    setSelectedVehicle(null)
    setAddQuoteForm({
      vendorName: "",
      vendorAddress: "",
      vendorPhone: "",
      vendorEmail: "",
      vendorPrice: "",
      customerPaid: "",
      condition: "",
      warranty: "",
      imageFiles: [],
      vendorNotes: "",
    })
  }

  // Image handling for review modal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    setReviewForm((prev) => ({
      ...prev,
      inspectionImages: [...prev.inspectionImages, ...newFiles],
    }))
    e.target.value = ""
  }

  const removeImage = (indexToRemove: number) => {
    setReviewForm((prev) => ({
      ...prev,
      inspectionImages: prev.inspectionImages.filter((_, index) => index !== indexToRemove),
    }))
  }

  // Image handling for add quote modal
  const handleAddQuoteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      const validFiles: File[] = []
      const invalidReasons: string[] = []

      newFiles.forEach((file) => {
        const validTypes = ["image/jpeg", "image/png", "image/webp"]
        if (!validTypes.includes(file.type)) {
          invalidReasons.push(`${file.name}: Invalid file type`)
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          invalidReasons.push(`${file.name}: File exceeds 5MB limit`)
          return
        }
        validFiles.push(file)
      })

      if (invalidReasons.length > 0) {
        toast({
          title: "Some files were invalid",
          description: invalidReasons.join("\n"),
          variant: "destructive",
          duration: 5000,
        })
      }

      if (validFiles.length > 0) {
        setAddQuoteForm((prev) => ({
          ...prev,
          imageFiles: [...prev.imageFiles, ...validFiles],
        }))
      }
    }
    e.target.value = ""
  }

  const removeQuoteImage = (indexToRemove: number) => {
    setAddQuoteForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, index) => index !== indexToRemove),
    }))
  }

  // Quote handling
  const handleAcceptQuote = async (quote: VendorQuote) => {
    if (!user || !selectedPart) return
    setSubmitting(true)

    try {
      const imageUrls: string[] = []
      for (const file of reviewForm.inspectionImages) {
        const url = await uploadImage(file)
        if (url) imageUrls.push(url)
      }

      const { error: updateError } = await supabase
        .from("bids")
        .update({
          status: "accepted",
          price: Number.parseFloat(reviewForm.vendorPrice),
          updated_at: new Date().toISOString(),
          sourcer_notes: reviewForm.reviewNotes,
          customer_paid: Number.parseFloat(reviewForm.customerPaid) || null,
        })
        .eq("id", quote.id)

      if (updateError) throw updateError

      const { error: partUpdateError } = await supabase
        .from("parts")
        .update({
          is_accepted: true,
          shipping_status: "confirmed",
          inspection_images: imageUrls,
          inspected_by: user.id,
          inspected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPart.id)

      if (partUpdateError) throw partUpdateError

      await refetch()
      closeReviewModal()
      toast({
        title: "Success",
        description: "Quote accepted successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error accepting quote:", error)
      toast({
        title: "Error",
        description: "Error accepting quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddQuote = async () => {
    if (!user || !selectedPart || !selectedVehicle) return
    setSubmitting(true)

    try {
      const imageUrls: string[] = []
      for (const file of addQuoteForm.imageFiles) {
        const url = await uploadImage(file)
        if (url) imageUrls.push(url)
      }

      const vendorInfo = {
        name: addQuoteForm.vendorName,
        address: addQuoteForm.vendorAddress,
        phone: addQuoteForm.vendorPhone,
        email: addQuoteForm.vendorEmail,
        addedBy: user.id,
        addedAt: new Date().toISOString(),
        sourcerNotes: `Sourcer-verified quote. ${addQuoteForm.vendorNotes}`.trim(),
      }

      const { error: insertError } = await supabase.from("bids").insert({
        part_id: selectedPart.id,
        vendor_id: user.id,
        price: Number.parseFloat(addQuoteForm.vendorPrice),
        customer_paid: Number.parseFloat(addQuoteForm.customerPaid) || null,
        notes: addQuoteForm.vendorNotes,
        status: "accepted",
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        warranty: addQuoteForm.warranty,
        condition: addQuoteForm.condition,
        vendor_info: vendorInfo,
        is_sourcer_provided: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      const { error: partUpdateError } = await supabase
        .from("parts")
        .update({
          is_accepted: true,
          shipping_status: "confirmed",
          inspection_images: imageUrls,
          inspected_by: user.id,
          inspected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPart.id)

      if (partUpdateError) throw partUpdateError

      await refetch()
      closeAddQuoteModal()
      toast({
        title: "Success",
        description: "Quote added and automatically accepted!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error adding quote:", error)
      toast({
        title: "Error",
        description: "Error adding quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredParts = getFilteredParts()
  const groupedByOrder = filteredParts.reduce(
    (acc, { order, part }) => {
      if (!acc[order.id]) {
        acc[order.id] = {
          order,
          parts: [],
        }
      }
      acc[order.id].parts.push(part)
      return acc
    },
    {} as Record<string, { order: any; parts: Array<Part & { vehicle: Vehicle }> }>,
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to access the sourcer dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Vendor Quotes</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{metrics.pendingQuotes}</div>
          <p className="text-sm text-gray-600">Vendor quotes awaiting your review</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">No Vendor Quotes</h3>
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.noQuotes}</div>
          <p className="text-sm text-gray-600">Parts without any vendor quotes</p>
        </div>
      </div>

      {/* Filters + Search Bar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by part name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Vehicles</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Lexus">Lexus</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="no-quotes">No Quotes</option>
                <option value="with-quotes">With Quotes</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📊 Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                🃏 Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders and Parts */}
      <div className="space-y-6">
        {Object.entries(groupedByOrder).map(([orderId, { order, parts }]) => {
          const totalParts = parts.length
          const acceptedCount = parts.reduce(
            (total, part) => total + part.vendorQuotes.filter((q) => q.status === "accepted").length,
            0,
          )

          return (
            <div key={orderId} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Order Summary Bar */}
              <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order.id.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">
                      {totalParts} Parts | {acceptedCount} Accepted | Location: {order.userProfile.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Buyer: {order.userProfile.fullName}</p>
                    <p className="text-sm text-gray-600">{order.userProfile.whatsappNumber}</p>
                  </div>
                </div>
              </div>

              {/* Parts List */}
              <div className="p-6">
                {viewMode === "table" ? (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Part Name
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Part Number
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Budget
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conditions
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quote Status
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parts.map((part) => {
                          const quoteStatus = getQuoteStatus(part)
                          return (
                            <tr key={part.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{part.partName}</div>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                {part.partNumber || "N/A"}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                {part.vehicle.year} {part.vehicle.make} {part.vehicle.model}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-800">{part.quantity}</span>
                              </td>
                              <td className="py-4 px-4">
                                {part.estimatedBudget ? (
                                  <span className="text-sm font-medium text-gray-800">AED {part.estimatedBudget}</span>
                                ) : (
                                  <span className="text-sm text-gray-500">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                {part.part_condition_preferences?.length ? (
                                  <div className="flex flex-wrap gap-1">
                                    {part.part_condition_preferences.map((pref, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs capitalize"
                                      >
                                        {pref.condition.replace("_", " ")}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Any</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatus.color}`}>
                                  {quoteStatus.text}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {part.vendorQuotes.length > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <Button variant="default" size="sm" onClick={() => openViewAllQuotesModal(part)}>
                                      View Quotes ({part.vendorQuotes.length})
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openAddQuoteModal(part)}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      + Add Quote
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="secondary" size="sm" onClick={() => openAddQuoteModal(part)}>
                                    + Add Quote
                                  </Button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Card View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parts.map((part) => {
                      const quoteStatus = getQuoteStatus(part)
                      return (
                        <div
                          key={part.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="p-4 flex-grow">
                            <div>
                              <h4 className="font-bold text-gray-800">{part.partName}</h4>
                              <p className="text-sm text-gray-600">{`${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`}</p>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Qty:</span>
                                <p className="font-medium">{part.quantity}</p>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Budget:</span>
                                <p className="font-medium">
                                  {part.estimatedBudget ? `AED ${part.estimatedBudget}` : "-"}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {part.part_condition_preferences?.length ? (
                                  part.part_condition_preferences.map((pref, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs capitalize"
                                    >
                                      {pref.condition.replace("_", " ")}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-400 text-xs">Any condition</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatus.color}`}>
                              {quoteStatus.text}
                            </span>
                            {part.vendorQuotes.length > 0 ? (
                              <div className="flex items-center space-x-2">
                                <Button variant="default" size="sm" onClick={() => openViewAllQuotesModal(part)}>
                                  View ({part.vendorQuotes.length})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAddQuoteModal(part)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  + Add
                                </Button>
                              </div>
                            ) : (
                              <Button variant="secondary" size="sm" onClick={() => openAddQuoteModal(part)}>
                                + Add Quote
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {Object.keys(groupedByOrder).length === 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <p className="text-lg text-gray-500">No parts found matching your criteria</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ViewAllQuotesModal
        isOpen={isViewAllQuotesModalOpen}
        selectedPart={selectedPart as (Part & { vehicle: Vehicle }) | null}
        selectedVehicle={selectedVehicle}
        onClose={closeViewAllQuotesModal}
        onReviewQuote={openReviewModal}
        onAddQuote={openAddQuoteModal}
        getConditionColor={getConditionColor}
      />

      <ReviewQuoteModal
        isOpen={isReviewModalOpen}
        selectedQuote={selectedQuote}
        selectedPart={selectedPart as (Part & { vehicle: Vehicle }) | null}
        reviewForm={reviewForm}
        submitting={submitting}
        maxAllowedSpend={maxAllowedSpend}
        onClose={closeReviewModal}
        onFormChange={setReviewForm}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        onAcceptQuote={handleAcceptQuote}
        calculateProfitMargin={calculateProfitMargin}
        getConditionColor={getConditionColor}
      />

      <AddQuoteModal
        isOpen={isAddQuoteModalOpen}
        selectedPart={selectedPart as (Part & { vehicle: Vehicle }) | null}
        selectedVehicle={selectedVehicle}
        addQuoteForm={addQuoteForm}
        submitting={submitting}
        vendorPercentage={vendorPercentage}
        maxAllowedSpend={maxAllowedSpend}
        onClose={closeAddQuoteModal}
        onFormChange={setAddQuoteForm}
        onImageUpload={handleAddQuoteImageUpload}
        onRemoveImage={removeQuoteImage}
        onSubmit={handleAddQuote}
        calculateProfitMargin={calculateProfitMargin}
      />

      <ImagePreviewModal previewImage={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  )
}

export default SourcerDashboard
