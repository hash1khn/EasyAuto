import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useUserRoles } from "@/hooks/useUserRoles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { Search, Package, List, CheckCircle, Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { OrderWithParts } from "@/types/orders"
import { UpdateQuoteModal } from "./UpdateQuoteModal"
import { OrderDetailsModal } from "./OrderDetailsModal"
import type { VendorVehicle } from "@/types/vendor"

type SortOption = "newest" | "oldest" | "vehicle"

interface DisplayVehicle extends VendorVehicle {
  orderId: string
  createdAt: string
  status: "new" | "quoted" | "accepted"
}

const VehicleCard = ({
  vehicle,
  onSelect,
  badgeType,
}: {
  vehicle: DisplayVehicle
  onSelect: () => void
  badgeType: "new" | "quoted" | "accepted"
}) => {
  const partsToShow = useMemo(() => {
    switch (badgeType) {
      case "accepted":
        return vehicle.parts.filter((p) => p.myQuote?.isAccepted)
      case "quoted":
        return vehicle.parts.filter((p) => p.myQuote && !p.myQuote.isAccepted)
      case "new":
        return vehicle.parts.filter((p) => !p.myQuote)
      default:
        return vehicle.parts
    }
  }, [vehicle.parts, badgeType])
  const totalParts = partsToShow.length
  const partNames = partsToShow.map((p) => p.partName).slice(0, 2)

  const badge = useMemo(() => {
    switch (badgeType) {
      case "new":
        return null
      case "quoted":
        return <Badge className="bg-blue-100 text-blue-800">Quote Sent</Badge>
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Quote Accepted</Badge>
    }
  }, [badgeType])

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden"
      onClick={onSelect}
    >
      <div className="p-4 bg-slate-50 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-slate-600" />
            <span className="font-bold text-lg text-slate-800">{vehicle.vehicleName}</span>
          </div>
          <p className="text-sm text-gray-500 flex-shrink-0 ml-2">
            {formatDistanceToNow(new Date(vehicle.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm pl-1 text-gray-600">
          <Package className="h-4 w-4" />
          <span>
            {totalParts} Part{totalParts !== 1 ? "s" : ""} {badgeType === "accepted" ? "Accepted" : "Requested"}
          </span>
        </div>
        {badge && <div className="pl-1">{badge}</div>}
        <div className="text-sm text-muted-foreground pl-7 border-l-2 ml-3 py-1 space-y-1">
          {partNames.map((name, index) => (
            <p key={index} className="truncate">
              - {name}
            </p>
          ))}
          {totalParts > 2 && <p className="truncate text-xs">- and {totalParts - 2} more...</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export const VendorHome: React.FC = () => {
  const { user } = useAuth()
  const { hasRole, isAdmin } = useUserRoles()
  const [orders, setOrders] = useState<OrderWithParts[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderWithParts | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showBidModal, setShowBidModal] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  const [currentTab, setCurrentTab] = useState("new")
  const [activeModal, setActiveModal] = useState<"details" | "update" | "view" | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<DisplayVehicle | null>(null)

  const vendorProfileId = user?.id

  useEffect(() => {
    if (vendorProfileId) {
      handleLoadData()
    }
  }, [vendorProfileId])

  const handleLoadData = async () => {
    setLoading(true)
    await fetchLiveOrders()
    setLoading(false)
  }

  const fetchLiveOrders = async () => {
    if (!vendorProfileId) return

    try {
      // Fetch all orders with parts and bids
      const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        parts!inner(
          *,
          photos,
          vehicle:vehicles(*),
          bids(*),
          part_condition_preferences(condition)
        )
      `)
      .order("created_at", { ascending: false })

      if (error) throw error

      // Process orders with updated filtering logic based on your requirements
      const processedOrders = (data || [])
        .map((order) => ({
          ...order,
          parts: order.parts
            .filter((part) => {
              const vendorBid = part.bids?.find((bid) => bid.vendor_id === vendorProfileId)

              // NEW REQUESTS TAB: shipping_status = 'pending' AND bid_status = 'pending' AND part not accepted
              const isNewRequest = part.shipping_status === "pending" && !part.is_accepted && !vendorBid

              // MY QUOTES TAB: Parts where this vendor has quoted (bid exists, regardless of status)
              const hasMyQuote = !!vendorBid

              // ACCEPTED TAB: shipping_status = 'confirmed' AND bid_status = 'accepted' for this vendor
              const isAcceptedByMe = part.shipping_status === "confirmed" && vendorBid?.status === "accepted"

              // Show part if it matches any of the three categories
              return isNewRequest || hasMyQuote || isAcceptedByMe
            })
            .map((part) => ({
              ...part,
              existing_bid: part.bids?.find((bid) => bid.vendor_id === vendorProfileId),
              other_bids_count:
                part.bids?.filter((b) => b.vendor_id !== vendorProfileId && b.status === "pending").length || 0,
                conditions: part.part_condition_preferences?.map(p => p.condition) || [] ,
                photos: part.photos || [] // Add this line
            })),
        }))
        // Remove orders that have no visible parts after filtering
        .filter((order) => order.parts.length > 0)

      setOrders(processedOrders)
    } catch (error) {
      console.error("Error fetching live orders:", error)
    }
  }

  const handleRefresh = () => {
    if (!refreshing) {
      setRefreshing(true)
      handleLoadData().finally(() => setRefreshing(false))
    }
  }

  const handleBidUpdate = () => {
    handleLoadData()
  }

  const handleOrderSelect = (order: OrderWithParts) => {
    setSelectedOrder(order)
    setShowBidModal(true)
  }

  // Updated vehicle processing logic based on your requirements
  const { newVehicles, quotedVehicles, acceptedVehicles } = useMemo(() => {
    const allVehicles: DisplayVehicle[] = (orders as OrderWithParts[]).flatMap((order) =>
      order.parts.reduce((acc: DisplayVehicle[], part) => {
        if (!part.vehicle) return acc

        // Find existing vehicle in accumulator
        const existingVehicle = acc.find((v) => v.id === part.vehicle.id)

        const partData = {
          id: part.id,
          partName: part.part_name,
          partNumber: part.part_number || "",
          quantity: part.quantity,
          photos: part.photos,
          conditions: part.part_condition_preferences?.map(p => p.condition) || [],          myQuote: part.existing_bid
            ? {
                id: part.existing_bid.id,
                price: part.existing_bid.price,
                condition: (part.existing_bid.condition as any) || "Used - Good",
                warranty: part.existing_bid.warranty || "7 Days",
                notes: part.existing_bid.notes || "",
                imageUrls: part.existing_bid.image_urls,
                isAccepted: part.existing_bid.status === "accepted",
              }
            : undefined,
        }

        if (existingVehicle) {
          existingVehicle.parts.push(partData)
          return acc
        }

        // Create new vehicle entry
        acc.push({
          id: part.vehicle.id,
          vehicleName: `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`,
          vinNumber: part.vehicle.vin ?? "",
          orderId: order.id,
          createdAt: order.created_at,
          parts: [partData],
          status: part.existing_bid ? (part.existing_bid.status === "accepted" ? "accepted" : "quoted") : "new",
        })
        return acc
      }, []),
    )

    // NEW REQUESTS: shipping_status = 'pending' AND no bid from vendor AND part not accepted
    const newVehicles = allVehicles
      .map((vehicle) => ({
        ...vehicle,
        parts: vehicle.parts.filter((p) => {
          // Find the original part data to check shipping_status and is_accepted
          const originalPart = orders.flatMap((o) => o.parts).find((op) => op.id === p.id)
          return originalPart?.shipping_status === "pending" && !p.myQuote && !originalPart?.is_accepted
        }),
      }))
      .filter((vehicle) => vehicle.parts.length > 0)

    // MY QUOTES: Parts where this vendor has submitted a quote (any status)
    // MY QUOTES: Parts where this vendor has submitted a quote and is_accepted is false
const quotedVehicles = allVehicles
  .map((vehicle) => ({
    ...vehicle,
    parts: vehicle.parts.filter((p) => {
      const originalPart = orders.flatMap((o) => o.parts).find((op) => op.id === p.id);
      return (
        p.myQuote && 
        originalPart?.shipping_status === 'pending' && 
        !originalPart?.is_accepted
      );
    }),
  }))
  .filter((vehicle) => vehicle.parts.length > 0);

    // ACCEPTED: shipping_status = 'confirmed' AND bid_status = 'accepted'
    const acceptedVehicles = allVehicles
  .map((vehicle) => ({
    ...vehicle,
    parts: vehicle.parts.filter((p) => {
      const originalPart = orders.flatMap((o) => o.parts).find((op) => op.id === p.id);
      return (
        p.myQuote?.isAccepted && 
        originalPart?.shipping_status === 'confirmed' && 
        originalPart?.is_accepted
      );
    }),
  }))
  .filter((vehicle) => vehicle.parts.length > 0);

    return { newVehicles, quotedVehicles, acceptedVehicles }
  }, [orders])

  // Update the stats calculation
  const summaryStats = useMemo(
    () => ({
      openOrders: newVehicles.length,
      quotesPlaced: quotedVehicles.length,
      accepted: acceptedVehicles.length,
    }),
    [newVehicles, quotedVehicles, acceptedVehicles],
  )

  // Add the handleSelectVehicle function
  const handleSelectVehicle = (vehicle: DisplayVehicle, modalType: "details" | "update" | "view") => {
    setSelectedVehicle(vehicle)
    setActiveModal(modalType)
  }

  const handleCloseModals = () => {
    setSelectedVehicle(null)
    setActiveModal(null)
  }

  const handleRefreshData = () => {
    handleLoadData()
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8 mb-8">
          {/* Open Requests Card */}
          <Card className="bg-blue-500 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Open Requests</p>
                  <p className="text-3xl font-bold">{summaryStats.openOrders}</p>
                </div>
                <div className="p-3 bg-blue-600 rounded-full">
                  <Package className="h-7 w-7 text-blue-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotes Placed Card */}
          <Card className="bg-amber-500 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-100">Quotes Placed</p>
                  <p className="text-3xl font-bold">{summaryStats.quotesPlaced}</p>
                </div>
                <div className="p-3 bg-amber-600 rounded-full">
                  <List className="h-7 w-7 text-amber-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accepted Quotes Card */}
          <Card className="bg-green-500 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Accepted</p>
                  <p className="text-3xl font-bold">{summaryStats.accepted}</p>
                </div>
                <div className="p-3 bg-green-600 rounded-full">
                  <CheckCircle className="h-7 w-7 text-green-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by part, vehicle, or part number..."
                className="pl-10 focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="new-orders" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200 p-1 rounded-lg">
            <TabsTrigger
              value="new-orders"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md"
            >
              New Requests ({newVehicles.length})
            </TabsTrigger>
            <TabsTrigger
              value="my-quotes"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md"
            >
              My Quotes ({quotedVehicles.length})
            </TabsTrigger>
            <TabsTrigger
              value="accepted-quotes"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md"
            >
              Accepted Quotes ({acceptedVehicles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-orders" className="mt-6">
            <div className="space-y-4">
              {newVehicles
                .filter((vehicle) => {
                  if (!searchTerm) return true
                  const searchLower = searchTerm.toLowerCase()
                  return (
                    vehicle.vehicleName.toLowerCase().includes(searchLower) ||
                    vehicle.vinNumber.toLowerCase().includes(searchLower) ||
                    vehicle.parts.some(
                      (part) =>
                        part.partName.toLowerCase().includes(searchLower) ||
                        part.partNumber.toLowerCase().includes(searchLower),
                    )
                  )
                })
                .map((vehicle) => (
                  <VehicleCard
                    key={`new-${vehicle.id}`}
                    vehicle={vehicle}
                    onSelect={() => handleSelectVehicle(vehicle, "details")}
                    badgeType="new"
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="my-quotes" className="mt-6">
            <div className="space-y-4">
              {quotedVehicles
                .filter((vehicle) => {
                  if (!searchTerm) return true
                  const searchLower = searchTerm.toLowerCase()
                  return (
                    vehicle.vehicleName.toLowerCase().includes(searchLower) ||
                    vehicle.vinNumber.toLowerCase().includes(searchLower) ||
                    vehicle.parts.some(
                      (part) =>
                        part.partName.toLowerCase().includes(searchLower) ||
                        part.partNumber.toLowerCase().includes(searchLower),
                    )
                  )
                })
                .map((vehicle) => (
                  <VehicleCard
                    key={`myquote-${vehicle.id}`}
                    vehicle={vehicle}
                    onSelect={() => handleSelectVehicle(vehicle, "update")}
                    badgeType="quoted"
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="accepted-quotes" className="mt-6">
            <div className="space-y-4">
              {acceptedVehicles
                .filter((vehicle) => {
                  if (!searchTerm) return true
                  const searchLower = searchTerm.toLowerCase()
                  return (
                    vehicle.vehicleName.toLowerCase().includes(searchLower) ||
                    vehicle.vinNumber.toLowerCase().includes(searchLower) ||
                    vehicle.parts.some(
                      (part) =>
                        part.partName.toLowerCase().includes(searchLower) ||
                        part.partNumber.toLowerCase().includes(searchLower),
                    )
                  )
                })
                .map((vehicle) => (
                  <VehicleCard
                    key={`accepted-${vehicle.id}`}
                    vehicle={vehicle}
                    onSelect={() => handleSelectVehicle(vehicle, "view")}
                    badgeType="accepted"
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <OrderDetailsModal
          order={
            activeModal === "details"
              ? {
                  id: selectedVehicle?.orderId || "",
                  orderId: selectedVehicle?.orderId || "",
                  createdAt: selectedVehicle?.createdAt || "",
                  vehicles: selectedVehicle ? [selectedVehicle] : [],
                }
              : null
          }
          onClose={handleCloseModals}
          onAddQuote={handleBidUpdate}
          onRefreshData={handleRefreshData}
        />

        <UpdateQuoteModal
          order={
            activeModal === "update" || activeModal === "view"
              ? {
                  id: selectedVehicle?.orderId || "",
                  orderId: selectedVehicle?.orderId || "",
                  createdAt: selectedVehicle?.createdAt || "",
                  vehicles: selectedVehicle ? [selectedVehicle] : [],
                }
              : null
          }
          onClose={handleCloseModals}
          mode={activeModal === "view" ? "view" : "update"}
          onUpdate={handleBidUpdate}
        />
      </div>
    </div>
  )
}
