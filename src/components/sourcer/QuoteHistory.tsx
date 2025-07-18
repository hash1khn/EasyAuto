"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  full_name: string
  whatsapp_number: string
  location: string
  user: {
    email: string
  }
}

interface Order {
  id: string
  created_at: string
  user_profiles: UserProfile
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  vin: string
}

interface Part {
  id: string
  part_name: string
  shipping_status: string
  inspection_images: string[]
  inspected_by: string
  inspected_at: string
  order_id: string
  vehicles: Vehicle
  orders: Order
}

interface Bid {
  id: string
  price: number
  customer_paid: number
  status: string
  warranty: "No Warranty" | "3 Days" | "7 Days" | "14 Days" | "30 Days" | string
  condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair"
  image_url: string
  vendor_info: any
  notes: string
  created_at: string
  updated_at: string
  is_sourcer_provided: boolean
  sourcer_notes: string
  vendor_id: string
  vendor: {
    id: string
    full_name: string
    whatsapp_number: string
    location: string
    user: {
      email: string
    }
  }
  parts: Part
}

interface VendorInfo {
  name: string
  phone: string
  email: string
  address: string
  isSourcerProvided: boolean
}

interface InspectionInfo {
  notes: string
  images: string[]
}

interface AcceptedQuote {
  id: string
  bidId: string // Added to track the bid ID
  partId: string // Added to track the part ID
  orderId: string
  vehicleId: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  location: string
  buyerName: string
  buyerPhone: string
  partName: string
  status: "Accepted" | "Out for Delivery" | "Delivered"
  price: number
  customerPaid: number
  paidToVendor: number
  profit: number
  profitMargin: number
  vendor: VendorInfo
  warranty: "No Warranty" | "3 Days" | "7 Days" | "14 Days" | "30 Days" | string
  condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair"
  inspection: InspectionInfo
  acceptedDate: string
  shippingStatus: string
  isSourcerProvided: boolean
}

interface GroupedOrder {
  orderId: string
  location: string
  buyerName: string
  buyerPhone: string
  parts: AcceptedQuote[]
  vehicles: Set<string>
}

const QuoteHistory: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null)
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false)
  const [selectedQuoteForInspection, setSelectedQuoteForInspection] = useState<AcceptedQuote | null>(null)
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [unacceptingQuotes, setUnacceptingQuotes] = useState<Set<string>>(new Set())
  const [isUnacceptModalOpen, setIsUnacceptModalOpen] = useState(false)
  const [selectedQuoteForUnaccept, setSelectedQuoteForUnaccept] = useState<AcceptedQuote | null>(null)

  useEffect(() => {
    if (user) {
      fetchAcceptedQuotes()
    }
  }, [user])

  const fetchAcceptedQuotes = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("bids")
        .select(
          `
          id,
          price,
          customer_paid,
          status,
          warranty,
          condition,
          image_url,
          vendor_info,
          notes,
          created_at,
          updated_at,
          is_sourcer_provided,
          sourcer_notes,
          vendor_id,
          vendor:vendor_id(
            id,
            full_name,
            whatsapp_number,
            location,
            user:user_id(
              email
            )
          ),
          parts!inner(
            id,
            part_name,
            shipping_status,
            inspection_images,
            inspected_by,
            inspected_at,
            order_id,
            vehicles!inner(
              id,
              make,
              model,
              year,
              vin
            ),
            orders!inner(
              id,
              created_at,
              user_profiles!inner(
                id,
                full_name,
                whatsapp_number,
                location,
                delivery_address
              )
            )
          )
        `,
        )
        .eq("status", "accepted")
        .in("parts.shipping_status", ["confirmed", "out_for_delivery", "delivered"])
        .order("updated_at", { ascending: false })

      if (error) throw error

      const transformedQuotes: AcceptedQuote[] = (data as any[]).map((bid) => {
        const part = Array.isArray(bid.parts) ? bid.parts[0] : bid.parts
        const vehicle = part && Array.isArray(part.vehicles) ? part.vehicles[0] : part?.vehicles
        const order = part && Array.isArray(part.orders) ? part.orders[0] : part?.orders
        const userProfile = order && Array.isArray(order.user_profiles) ? order.user_profiles[0] : order?.user_profiles

        const isSourcerProvided = bid.is_sourcer_provided
        const vendorInfo = bid.vendor_info || {}
        const vendor = Array.isArray(bid.vendor) ? bid.vendor[0] : bid.vendor

        const customerPaid = bid.customer_paid || 0
        const paidToVendor = bid.price
        const profit = customerPaid - paidToVendor
        const profitMargin = paidToVendor > 0 ? (profit / paidToVendor) * 100 : 0

        return {
          id: bid.id,
          bidId: bid.id, // Added
          partId: part?.id, // Added
          orderId: order?.id,
          vehicleId: vehicle?.id,
          customerPaid,
          paidToVendor,
          profit,
          profitMargin,
          vehicleMake: vehicle?.make,
          vehicleModel: vehicle?.model,
          vehicleYear: vehicle?.year,
          location: userProfile?.location || "UAE",
          buyerName: userProfile?.full_name,
          buyerPhone: userProfile?.whatsapp_number,
          partName: part?.part_name,
          status: getDisplayStatus(part?.shipping_status),
          price: bid.price,
          vendor: {
            name: isSourcerProvided ? vendorInfo.name : vendor?.full_name || "Unknown Vendor",
            phone: isSourcerProvided ? vendorInfo.phone : vendor?.whatsapp_number || "N/A",
            email: isSourcerProvided ? vendorInfo.email : vendor?.user?.email || "N/A",
            address: isSourcerProvided ? vendorInfo.address : vendor?.location || "N/A",
            isSourcerProvided,
          },
          warranty: bid.warranty || "No Warranty",
          condition: bid.condition || "Used - Excellent",
          inspection: {
            notes: bid.sourcer_notes || bid.notes || "No inspection notes available",
            images: part?.inspection_images || ["/placeholder.svg?height=200&width=300"],
          },
          acceptedDate: bid.updated_at || bid.created_at,
          shippingStatus: part?.shipping_status,
          isSourcerProvided,
        }
      })

      setAcceptedQuotes(transformedQuotes)
    } catch (error) {
      console.error("Error fetching accepted quotes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch quote history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getDisplayStatus = (shippingStatus: string) => {
    switch (shippingStatus) {
      case "confirmed":
        return "Accepted"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return "Accepted"
    }
  }

  const openVendorModal = (vendor: VendorInfo) => {
    setSelectedVendor(vendor)
    setIsVendorModalOpen(true)
  }

  const closeVendorModal = () => {
    setIsVendorModalOpen(false)
    setSelectedVendor(null)
  }

  const openInspectionModal = (quote: AcceptedQuote) => {
    setSelectedQuoteForInspection(quote)
    setIsInspectionModalOpen(true)
  }

  const closeInspectionModal = () => {
    setIsInspectionModalOpen(false)
    setSelectedQuoteForInspection(null)
  }

  const openUnacceptModal = (quote: AcceptedQuote) => {
    setSelectedQuoteForUnaccept(quote)
    setIsUnacceptModalOpen(true)
  }

  const closeUnacceptModal = () => {
    setIsUnacceptModalOpen(false)
    setSelectedQuoteForUnaccept(null)
  }

  const handleUnacceptQuote = async (quote: AcceptedQuote) => {
    if (!user || !quote.bidId || !quote.partId) return

    setUnacceptingQuotes((prev) => new Set(prev).add(quote.bidId))

    try {
      if (quote.isSourcerProvided) {
        // For sourcer-provided quotes, completely delete the bid entry
        const { error: bidDeleteError } = await supabase.from("bids").delete().eq("id", quote.bidId)

        if (bidDeleteError) throw bidDeleteError
      } else {
        // For regular vendor quotes, just update status back to pending
        const { error: bidError } = await supabase
          .from("bids")
          .update({
            status: "pending",
            customer_paid: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", quote.bidId)

        if (bidError) throw bidError
      }

      // Update the part status back to pending (same for both types)
      const { error: partError } = await supabase
        .from("parts")
        .update({
          is_accepted: false,
          shipping_status: "pending",
          inspection_images: null,
          inspected_by: null,
          inspected_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quote.partId)

      if (partError) throw partError

      toast({
        title: "Success",
        description: quote.isSourcerProvided
          ? "Sourcer-provided quote has been completely removed from the system."
          : "Quote has been unaccepted successfully. It's now back to pending status.",
        variant: "default",
      })

      // Refresh the data
      await fetchAcceptedQuotes()
      closeUnacceptModal()
    } catch (error) {
      console.error("Error unaccepting quote:", error)
      toast({
        title: "Error",
        description: "Failed to unaccept quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUnacceptingQuotes((prev) => {
        const newSet = new Set(prev)
        newSet.delete(quote.bidId)
        return newSet
      })
    }
  }

  const filteredQuotes = acceptedQuotes.filter((quote) => statusFilter === "All" || quote.status === statusFilter)

  const groupedOrders: GroupedOrder[] = filteredQuotes.reduce((acc, quote) => {
    const existingOrder = acc.find((o) => o.orderId === quote.orderId)
    if (existingOrder) {
      existingOrder.parts.push(quote)
      existingOrder.vehicles.add(`${quote.vehicleYear} ${quote.vehicleMake} ${quote.vehicleModel}`)
    } else {
      acc.push({
        orderId: quote.orderId,
        location: quote.location,
        buyerName: quote.buyerName,
        buyerPhone: quote.buyerPhone,
        parts: [quote],
        vehicles: new Set([`${quote.vehicleYear} ${quote.vehicleMake} ${quote.vehicleModel}`]),
      })
    }
    return acc
  }, [] as GroupedOrder[])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-blue-100 text-blue-800"
      case "Out for Delivery":
        return "bg-yellow-100 text-yellow-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return "✅"
      case "Out for Delivery":
        return "🚚"
      case "Delivered":
        return "📦"
      default:
        return "📋"
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view your quote history.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quote History</h2>
            <p className="text-gray-600 mt-1">View all your accepted quotes and track their delivery status.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {groupedOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">
            {acceptedQuotes.length === 0 ? "No accepted quotes found." : "No quotes match the current filter."}
          </p>
          {acceptedQuotes.length === 0 && (
            <p className="text-sm mt-2">Start accepting vendor quotes to see them here.</p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedOrders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Order #{order.orderId.slice(-8)}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.vehicles.size} {order.vehicles.size > 1 ? "Vehicles" : "Vehicle"} | {order.parts.length}{" "}
                      {order.parts.length > 1 ? "Parts" : "Part"} | Location: {order.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-700">{order.buyerName}</p>
                    <p className="text-sm text-gray-600">{order.buyerPhone}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white">
                      <tr className="border-b">
                        <th className="text-left font-semibold text-gray-600 p-3">Part Name</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Vehicle</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Status</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Paid to Vendor</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Condition</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Warranty</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Vendor</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Inspection</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.parts.map((part) => {
                        const profitColor = part.profit >= 0 ? "text-green-600" : "text-red-600"
                        const marginColor =
                          part.profitMargin < 15
                            ? "text-red-600"
                            : part.profitMargin === 15
                              ? "text-orange-500"
                              : "text-green-600"

                        return (
                          <tr key={part.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{part.partName}</td>
                            <td className="p-3 text-gray-600">
                              {`${part.vehicleYear} ${part.vehicleMake} ${part.vehicleModel}`}
                            </td>
                            <td className="p-3">
                              <Badge className={`${getStatusBadgeColor(part.status)} whitespace-nowrap`}>
                                {getStatusIcon(part.status)} {part.status}
                              </Badge>
                            </td>
                            <td className="p-3 font-semibold text-green-600">AED {part.price}</td>
                            <td className="p-3">
                              <Badge variant="outline">{part.condition}</Badge>
                            </td>
                            <td className="p-3 text-gray-600">{part.warranty}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto"
                                  onClick={() => openVendorModal(part.vendor)}
                                >
                                  {part.vendor.name}
                                </Button>
                                {part.isSourcerProvided && <Badge variant="secondary">Sourcer</Badge>}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={part.inspection.images[0] || "/placeholder.svg?height=40&width=40"}
                                  alt="Inspection"
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <span className="text-gray-500 text-xs truncate max-w-[200px]">
                                  {part.inspection.notes}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => openInspectionModal(part)}>
                                  View
                                </Button>
                              </div>
                            </td>
                            <td className="p-3">
                              {/* Only show unaccept for "Accepted" status, not for delivered items */}
                              {part.status === "Accepted" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openUnacceptModal(part)}
                                  disabled={unacceptingQuotes.has(part.bidId)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  {unacceptingQuotes.has(part.bidId) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                      Unaccepting...
                                    </>
                                  ) : (
                                    "Unaccept"
                                  )}
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Modal */}
      {isVendorModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Vendor Information</h3>
                {selectedVendor.isSourcerProvided && (
                  <Badge variant="secondary" className="mt-1">
                    Sourcer Provided
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={closeVendorModal} className="rounded-full">
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Vendor Name</h4>
                <p className="text-lg text-gray-800 font-semibold">{selectedVendor.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Phone</h4>
                <a href={`tel:${selectedVendor.phone}`} className="text-lg text-gray-800 hover:underline">
                  {selectedVendor.phone}
                </a>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
                <a href={`mailto:${selectedVendor.email}`} className="text-lg text-gray-800 hover:underline">
                  {selectedVendor.email}
                </a>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border">{selectedVendor.address}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl text-right">
              <Button onClick={closeVendorModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {isInspectionModalOpen && selectedQuoteForInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Inspection Details</h3>
                <p className="text-sm text-gray-500">for {selectedQuoteForInspection.partName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeInspectionModal} className="rounded-full">
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500">Inspection Images</h4>
                <Carousel className="w-full">
                  <CarouselContent>
                    {selectedQuoteForInspection.inspection.images.map((img, idx) => (
                      <CarouselItem key={idx}>
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={img || "/placeholder.svg?height=300&width=400"}
                            alt={`Inspection image ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {selectedQuoteForInspection.inspection.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Inspection Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">
                    {selectedQuoteForInspection.inspection.notes}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Financials</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-gray-700">Customer Paid:</div>
                    <div className="font-semibold text-blue-600">
                      AED {selectedQuoteForInspection.customerPaid.toFixed(2)}
                    </div>
                    <div className="text-gray-700">Paid to Vendor:</div>
                    <div className="font-semibold text-gray-700">
                      AED {selectedQuoteForInspection.paidToVendor.toFixed(2)}
                    </div>
                    <div className="text-gray-700">Profit:</div>
                    <div
                      className={`font-semibold ${
                        selectedQuoteForInspection.profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      AED {selectedQuoteForInspection.profit.toFixed(2)}
                    </div>
                    <div className="text-gray-700">Profit Margin:</div>
                    <div
                      className={`font-semibold ${
                        selectedQuoteForInspection.profitMargin < 15
                          ? "text-red-600"
                          : selectedQuoteForInspection.profitMargin === 15
                            ? "text-orange-500"
                            : "text-green-600"
                      }`}
                    >
                      {selectedQuoteForInspection.profitMargin.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Vendor</h4>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="font-medium">{selectedQuoteForInspection.vendor.name}</p>
                    {selectedQuoteForInspection.vendor.isSourcerProvided && (
                      <Badge variant="secondary" className="mt-1">
                        Sourcer Provided
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl text-right">
              <Button onClick={closeInspectionModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Unaccept Confirmation Modal */}
      {isUnacceptModalOpen && selectedQuoteForUnaccept && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Unaccept Quote</h3>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to unaccept this quote?</p>
            </div>
            <div className="p-6 space-y-4">
              <div
                className={`border rounded-lg p-4 ${
                  selectedQuoteForUnaccept.isSourcerProvided
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{selectedQuoteForUnaccept.isSourcerProvided ? "🗑️" : "⚠️"}</span>
                  </div>
                  <div className="ml-3">
                    <h4
                      className={`text-sm font-medium ${
                        selectedQuoteForUnaccept.isSourcerProvided ? "text-red-800" : "text-yellow-800"
                      }`}
                    >
                      {selectedQuoteForUnaccept.isSourcerProvided ? "Sourcer Quote Removal" : "Warning"}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        selectedQuoteForUnaccept.isSourcerProvided ? "text-red-700" : "text-yellow-700"
                      }`}
                    >
                      This action will:
                    </p>
                    <ul
                      className={`text-sm mt-2 list-disc list-inside space-y-1 ${
                        selectedQuoteForUnaccept.isSourcerProvided ? "text-red-700" : "text-yellow-700"
                      }`}
                    >
                      {selectedQuoteForUnaccept.isSourcerProvided ? (
                        <>
                          <li>
                            <strong>Completely delete</strong> this sourcer-provided quote from database
                          </li>
                          <li>Remove all bid data (price, condition, warranty, images, notes)</li>
                          <li>Clear inspection images and notes from part</li>
                          <li>Reset part shipping status to "Pending"</li>
                          <li>
                            <strong>This action cannot be undone</strong>
                          </li>
                          <li>You'll need to add a completely new quote if needed</li>
                        </>
                      ) : (
                        <>
                          <li>Change the quote status back to "Pending"</li>
                          <li>Reset the part shipping status to "Pending"</li>
                          <li>Clear inspection images and notes</li>
                          <li>Remove customer paid amount</li>
                          <li>Vendor can still see and modify their quote</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Quote Details:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Part:</span> {selectedQuoteForUnaccept.partName}
                  </p>
                  <p>
                    <span className="text-gray-600">Vendor:</span> {selectedQuoteForUnaccept.vendor.name}
                    {selectedQuoteForUnaccept.isSourcerProvided && (
                      <Badge variant="secondary" className="ml-2">
                        Sourcer Provided
                      </Badge>
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Customer Paid:</span> AED
                    {selectedQuoteForUnaccept.customerPaid.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-gray-600">Paid to Vendor:</span> AED
                    {selectedQuoteForUnaccept.paidToVendor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <Button variant="outline" onClick={closeUnacceptModal}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUnacceptQuote(selectedQuoteForUnaccept)}
                disabled={unacceptingQuotes.has(selectedQuoteForUnaccept.bidId)}
              >
                {unacceptingQuotes.has(selectedQuoteForUnaccept.bidId) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedQuoteForUnaccept.isSourcerProvided ? "Removing..." : "Unaccepting..."}
                  </>
                ) : selectedQuoteForUnaccept.isSourcerProvided ? (
                  "Yes, Remove Quote"
                ) : (
                  "Yes, Unaccept Quote"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuoteHistory
