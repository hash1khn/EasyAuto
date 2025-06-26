"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RefundRequest {
  id: string
  user_id: string
  part_id: string
  vendor_id?: string
  reason: string
  status: string
  images?: string[]
  admin_notes?: string
  created_at: string
  updated_at: string
  invoice_id?: string
  user: {
    full_name: string
    email: string
    whatsapp_number: string
    business_name?: string
  }
  part: {
    part_name: string
    part_number?: string
    quantity: number
    shipping_status: string
    vehicle: {
      make: string
      model: string
      year: number
      vin?: string
    }
  }
  vendor?: {
    full_name: string
    business_name?: string
  }
  invoice?: {
    id: string
    total_amount: number
  }
}

interface AdminOrder {
  id: string
  created_at: string
  user_id: string
  status: string
  user: {
    id: string
    full_name: string
    email: string
    whatsapp_number: string
    business_name?: string
    delivery_address?: string
  }
  vehicles: Array<{
    id: string
    make: string
    model: string
    year: number
    vin?: string
    parts: Array<{
      id: string
      part_name: string
      part_number?: string
      quantity: number
      shipping_status: string
      estimated_budget?: number
      has_pending_refund?: boolean
      accepted_bid?: {
        id: string
        price: number
        vendor: {
          full_name: string
          business_name?: string
          whatsapp_number: string
        }
      }
    }>
  }>
  deliveries: Array<{
    id: string
    driver_name?: string
    delivery_note?: string
    created_at: string
    parts: string[]
    invoice?: {
      id: string
      total_amount: number
      payment_status: string
      subtotal: number
      delivery_fee: number
      vat_amount: number
      service_fee: number
      parts_breakdown: Array<{
        part_id: string
        part_name: string
        part_number?: string
        unit_price: number
        quantity: number
        vendor_name: string
      }>
    }
  }>
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "out_for_delivery":
      return "bg-purple-100 text-purple-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "refunded":
      return "bg-orange-100 text-orange-800"
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "processed":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

const getOverallOrderStatus = (vehicles: AdminOrder["vehicles"]) => {
  const allParts = vehicles.flatMap((v) => v.parts)
  if (allParts.length === 0) return "No Parts"

  const statuses = allParts.map((p) => p.shipping_status)

  if (statuses.every((s) => s === "delivered")) return "Fully Delivered"
  if (statuses.some((s) => s === "cancelled")) return "Cancelled"
  if (statuses.some((s) => s === "out_for_delivery")) return "In Transit"
  if (statuses.some((s) => s === "confirmed")) return "Processing"

  return "Pending"
}

export const AdminOrders = () => {
  const [activeSubTab, setActiveSubTab] = useState<"open" | "history">("open")
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [partToCancel, setPartToCancel] = useState<any>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [selectedRefundRequest, setSelectedRefundRequest] = useState<RefundRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    fetchRefundRequests()
  }, [])

  const fetchRefundRequests = async () => {
    try {
      const { data: refundRequestsData, error } = await supabase
        .from("refund_requests")
        .select(`
          *,
          user_profiles!refund_requests_user_id_fkey (
            full_name,
            whatsapp_number,
            business_name,
            users!user_profiles_user_id_fkey (
              email
            )
          ),
          parts (
            part_name,
            part_number,
            quantity,
            shipping_status,
            vehicles (
              make,
              model,
              year,
              vin
            )
          ),
          vendor:user_profiles!refund_requests_vendor_id_fkey (
            full_name,
            business_name
          ),
          invoices (
            id,
            total_amount
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedRefundRequests: RefundRequest[] =
        refundRequestsData?.map((req) => ({
          id: req.id,
          user_id: req.user_id,
          part_id: req.part_id,
          vendor_id: req.vendor_id,
          reason: req.reason,
          status: req.status,
          images: req.images,
          admin_notes: req.admin_notes,
          created_at: req.created_at,
          updated_at: req.updated_at,
          invoice_id: req.invoice_id,
          user: {
            full_name: req.user_profiles?.full_name || "Unknown",
            email: req.user_profiles?.users?.email || "No email",
            whatsapp_number: req.user_profiles?.whatsapp_number || "",
            business_name: req.user_profiles?.business_name,
          },
          part: {
            part_name: req.parts?.part_name || "",
            part_number: req.parts?.part_number,
            quantity: req.parts?.quantity || 0,
            shipping_status: req.parts?.shipping_status || "",
            vehicle: {
              make: req.parts?.vehicles?.make || "",
              model: req.parts?.vehicles?.model || "",
              year: req.parts?.vehicles?.year || 0,
              vin: req.parts?.vehicles?.vin,
            },
          },
          vendor: req.vendor
            ? {
                full_name: req.vendor.full_name,
                business_name: req.vendor.business_name,
              }
            : undefined,
          invoice: req.invoices
            ? {
                id: req.invoices.id,
                total_amount: req.invoices.total_amount,
              }
            : undefined,
        })) || []

      setRefundRequests(transformedRefundRequests)
    } catch (error) {
      console.error("Error fetching refund requests:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)

      // 1. Fetch orders with user profiles (unchanged)
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          user_id,
          user_profiles!orders_user_id_fkey (
            id,
            full_name,
            whatsapp_number,
            business_name,
            delivery_address,
            users!user_profiles_user_id_fkey (
              email
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (ordersError) throw ordersError

      // 2. Fetch parts for all orders with vehicles and bids (unchanged)
      const orderIds = ordersData?.map((order) => order.id) || []
      const { data: partsData, error: partsError } = await supabase
        .from("parts")
        .select(`
          id,
          order_id,
          vehicle_id,
          part_name,
          part_number,
          quantity,
          shipping_status,
          estimated_budget,
          vehicles (
            id,
            make,
            model,
            year,
            vin
          )
        `)
        .in("order_id", orderIds)

      if (partsError) throw partsError

      // 3. Get all part IDs to fetch related invoices
      const partIds = partsData?.map(part => part.id) || []

      // 4. Fetch invoice_parts and their related invoices for these parts
      const { data: invoicePartsData, error: invoicePartsError } = await supabase
        .from('invoice_parts')
        .select(`
          invoice_id,
          part_id,
          quantity,
          unit_price,
          invoices (
            id,
            total_amount,
            payment_status,
            subtotal,
            delivery_fee,
            vat_amount,
            service_fee,
            driver_name,
            delivery_note,
            created_at,
            user_id
          )
        `)
        .in('part_id', partIds)

      if (invoicePartsError) throw invoicePartsError

      // Fetch pending refund requests for parts
      const { data: pendingRefunds, error: pendingRefundsError } = await supabase
        .from("refund_requests")
        .select("part_id")
        .in("part_id", partIds)
        .eq("status", "pending")

      if (pendingRefundsError) throw pendingRefundsError

      const partsWithPendingRefunds = new Set(pendingRefunds?.map((r) => r.part_id) || [])

      // Fetch accepted bids for parts
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select(`
          id,
          part_id,
          price,
          vendor_id,
          user_profiles!bids_vendor_id_fkey (
            full_name,
            business_name,
            whatsapp_number
          )
        `)
        .eq("status", "accepted")
        .in("part_id", partIds)

      if (bidsError) throw bidsError

      // Fetch invoices with parts breakdown
      const userIds = ordersData?.map((order) => order.user_profiles?.id).filter(Boolean) || []
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select(`
          id,
          user_id,
          total_amount,
          payment_status,
          subtotal,
          delivery_fee,
          vat_amount,
          service_fee,
          driver_name,
          delivery_note,
          created_at
        `)
        .in("user_id", userIds)
        .eq("payment_status", "paid")

      if (invoicesError) throw invoicesError

      // Transform data into the required structure
      const transformedOrders: AdminOrder[] =
        ordersData?.map((order) => {
          const orderParts = partsData?.filter((part) => part.order_id === order.id) || []

          // Group parts by vehicle
          const vehicleMap = new Map()
          orderParts.forEach((part) => {
            if (!vehicleMap.has(part.vehicle_id)) {
              // Handle vehicles array - take first element if it's an array
              const vehicleData = Array.isArray(part.vehicles) ? part.vehicles[0] : part.vehicles
              vehicleMap.set(part.vehicle_id, {
                id: vehicleData?.id || part.vehicle_id,
                make: vehicleData?.make || "",
                model: vehicleData?.model || "",
                year: vehicleData?.year || 0,
                vin: vehicleData?.vin,
                parts: [],
              })
            }

            const acceptedBid = bidsData?.find((bid) => bid.part_id === part.id)
            // Handle user_profiles array - take first element if it's an array
            const vendorProfile = Array.isArray(acceptedBid?.user_profiles)
              ? acceptedBid?.user_profiles[0]
              : acceptedBid?.user_profiles

            vehicleMap.get(part.vehicle_id).parts.push({
              id: part.id,
              part_name: part.part_name,
              part_number: part.part_number,
              quantity: part.quantity,
              shipping_status: part.shipping_status,
              estimated_budget: part.estimated_budget,
              has_pending_refund: partsWithPendingRefunds.has(part.id),
              accepted_bid: acceptedBid
                ? {
                    id: acceptedBid.id,
                    price: acceptedBid.price,
                    vendor: {
                      full_name: vendorProfile?.full_name || "",
                      business_name: vendorProfile?.business_name,
                      whatsapp_number: vendorProfile?.whatsapp_number || "",
                    },
                  }
                : undefined,
            })
          })

          const vehicles = Array.from(vehicleMap.values())

          // Handle user_profiles array - take first element if it's an array
          const userProfile = Array.isArray(order.user_profiles) ? order.user_profiles[0] : order.user_profiles
          // Handle users array - take first element if it's an array
          const userData = Array.isArray(userProfile?.users) ? userProfile?.users[0] : userProfile?.users

          // Get deliveries (invoices represent deliveries in this context)
          const userInvoices = invoicesData?.filter((inv) => inv.user_id === userProfile?.id) || []
          const deliveries = userInvoices.map((invoice) => {
            const invoiceParts = invoicePartsData?.filter((ip) => ip.invoice_id === invoice.id) || []
            const partsBreakdown = invoiceParts.map((ip) => {
              const part = partsData?.find((p) => p.id === ip.part_id)
              const bid = bidsData?.find((b) => b.part_id === ip.part_id)
              const bidVendorProfile = Array.isArray(bid?.user_profiles) ? bid?.user_profiles[0] : bid?.user_profiles
              return {
                part_id: ip.part_id,
                part_name: part?.part_name || "Unknown Part",  // Ensure part name is set
                unit_price: ip.unit_price,
                quantity: ip.quantity,
                vendor_name: bidVendorProfile?.business_name || bidVendorProfile?.full_name || "N/A",
              }
            })

            return {
              id: invoice.id,
              driver_name: invoice.driver_name,
              delivery_note: invoice.delivery_note,
              created_at: invoice.created_at,
              parts: invoiceParts.map((ip) => ip.part_id),
              invoice: {
                id: invoice.id,
                total_amount: invoice.total_amount,
                payment_status: invoice.payment_status,
                subtotal: invoice.subtotal,
                delivery_fee: invoice.delivery_fee,
                vat_amount: invoice.vat_amount,
                service_fee: invoice.service_fee,
                parts_breakdown: partsBreakdown,
              },
            }
          })

          return {
            id: order.id,
            created_at: order.created_at,
            user_id: order.user_id,
            status: getOverallOrderStatus(vehicles),
            user: {
              id: userProfile?.id || "",
              full_name: userProfile?.full_name || "Unknown",
              email: userData?.email || "No email",
              whatsapp_number: userProfile?.whatsapp_number || "",
              business_name: userProfile?.business_name,
              delivery_address: userProfile?.delivery_address,
            },
            vehicles,
            deliveries,
          }
        }) || []

      setOrders(transformedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtering
  const filteredOrders = orders
    .filter((order) => {
      if (activeSubTab === "open") {
        return order.status !== "Fully Delivered" && order.status !== "Cancelled"
      } else {
        return order.status === "Fully Delivered" || order.status === "Cancelled"
      }
    })
    .filter((order) => {
      if (!search) return true
      return (
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        order.user.business_name?.toLowerCase().includes(search.toLowerCase())
      )
    })

  const pendingRefundRequests = refundRequests.filter((req) => req.status === "pending")

  // Actions
  const handleViewOrder = (order: AdminOrder) => setSelectedOrder(order)
  const handleViewDelivery = (delivery: any) => setSelectedDelivery(delivery)
  const handleViewInvoice = (invoice: any) => setSelectedInvoice(invoice)

  // Handler for cancel confirmation
  const handleCancelPart = (part: any) => {
    setPartToCancel(part)
  }

  const confirmCancelPart = async () => {
    if (partToCancel) {
      try {
        const { error } = await supabase
          .from("parts")
          .update({ shipping_status: "cancelled" })
          .eq("id", partToCancel.id)

        if (error) throw error

        alert(`Cancelled part ${partToCancel.part_name}`)
        setPartToCancel(null)
        fetchOrders() // Refresh data
      } catch (error) {
        console.error("Error cancelling part:", error)
        alert("Failed to cancel part")
      }
    }
  }

  const closeCancelDialog = () => setPartToCancel(null)

  // Refund request handlers
  const handleViewRefundRequest = (request: RefundRequest) => {
    setSelectedRefundRequest(request)
    setAdminNotes(request.admin_notes || "")
  }

  const handleApproveRefund = async () => {
    if (!selectedRefundRequest) return

    try {
      // 1. Update refund request status to approved
      const { error: refundUpdateError } = await supabase
        .from("refund_requests")
        .update({
          status: "approved",
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRefundRequest.id)

      if (refundUpdateError) throw refundUpdateError

      // 2. Update part shipping status to refunded
      const { error: partUpdateError } = await supabase
        .from("parts")
        .update({
          shipping_status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRefundRequest.part_id)

      if (partUpdateError) throw partUpdateError

      // 3. Update invoice refund status if invoice exists
      if (selectedRefundRequest.invoice_id) {
        // Check if this is a partial or full refund
        const { data: allInvoiceParts, error: allPartsError } = await supabase
          .from("invoice_parts")
          .select("part_id")
          .eq("invoice_id", selectedRefundRequest.invoice_id)

        if (allPartsError) throw allPartsError

        // Check how many parts from this invoice are now refunded
        const { data: refundedParts, error: refundedPartsError } = await supabase
          .from("parts")
          .select("id")
          .in(
            "id",
            allInvoiceParts.map((p) => p.part_id),
          )
          .eq("shipping_status", "refunded")

        if (refundedPartsError) throw refundedPartsError

        // Determine refund status
        const totalParts = allInvoiceParts.length
        const refundedCount = refundedParts.length + 1 // +1 for the part we just refunded

        let invoiceRefundStatus = "none"
        if (refundedCount === totalParts) {
          invoiceRefundStatus = "processed" // Full refund
        } else if (refundedCount > 0) {
          invoiceRefundStatus = "approved" // Partial refund
        }

        // Update invoice refund status
        const { error: invoiceUpdateError } = await supabase
          .from("invoices")
          .update({ refund_status: invoiceRefundStatus })
          .eq("id", selectedRefundRequest.invoice_id)

        if (invoiceUpdateError) throw invoiceUpdateError
      }

      // 4. Log the admin action
      const { data: currentUser } = await supabase.auth.getUser()
      if (currentUser.user) {
        const { data: adminProfile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("user_id", currentUser.user.id)
          .single()

        if (adminProfile) {
          await supabase.from("admin_logs").insert({
            admin_id: adminProfile.id,
            action: "approve_refund",
            target_table: "refund_requests",
            target_id: selectedRefundRequest.id,
            details: {
              part_name: selectedRefundRequest.part.part_name,
              customer: selectedRefundRequest.user.full_name,
              reason: selectedRefundRequest.reason,
              admin_notes: adminNotes,
            },
          })
        }
      }

      alert("Refund request approved successfully!")
      setSelectedRefundRequest(null)
      setAdminNotes("")
      fetchRefundRequests()
      fetchOrders()
    } catch (error) {
      console.error("Error approving refund:", error)
      alert("Failed to approve refund. Please try again.")
    }
  }

  const handleRejectRefund = async () => {
    if (!selectedRefundRequest) return

    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRefundRequest.id)

      if (error) throw error

      // Log the admin action
      const { data: currentUser } = await supabase.auth.getUser()
      if (currentUser.user) {
        const { data: adminProfile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("user_id", currentUser.user.id)
          .single()

        if (adminProfile) {
          await supabase.from("admin_logs").insert({
            admin_id: adminProfile.id,
            action: "reject_refund",
            target_table: "refund_requests",
            target_id: selectedRefundRequest.id,
            details: {
              part_name: selectedRefundRequest.part.part_name,
              customer: selectedRefundRequest.user.full_name,
              reason: selectedRefundRequest.reason,
              admin_notes: adminNotes,
            },
          })
        }
      }

      alert("Refund request rejected!")
      setSelectedRefundRequest(null)
      setAdminNotes("")
      fetchRefundRequests()
    } catch (error) {
      console.error("Error rejecting refund:", error)
      alert("Failed to reject refund. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-4 text-lg">Loading orders...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Orders Management</TabsTrigger>
          <TabsTrigger value="refunds" className="relative">
            Refund Requests
            {pendingRefundRequests.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">{pendingRefundRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant={activeSubTab === "open" ? "default" : "outline"} onClick={() => setActiveSubTab("open")}>
              Open Orders
            </Button>
            <Button
              variant={activeSubTab === "history" ? "default" : "outline"}
              onClick={() => setActiveSubTab("history")}
            >
              Order History
            </Button>
            <Input
              placeholder="Search by order ID or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs ml-auto"
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Parts Delivered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const deliveredParts = order.vehicles
                    .flatMap((v) => v.parts)
                    .filter((p) => p.shipping_status === "delivered").length
                  const totalParts = order.vehicles.flatMap((v) => v.parts).length
                  const hasPendingRefunds = order.vehicles.flatMap((v) => v.parts).some((p) => p.has_pending_refund)

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order.id.slice(0, 8)}
                        {hasPendingRefunds && (
                          <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">Refund Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.user.full_name}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status.toLowerCase().replace(" ", "_"))}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deliveredParts} of {totalParts}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleViewOrder(order)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Part</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user.full_name}</div>
                        <div className="text-sm text-gray-500">{request.user.business_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.part.part_name}</div>
                        <div className="text-sm text-gray-500">{request.part.part_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.part.vehicle.make} {request.part.vehicle.model} {request.part.vehicle.year}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>{formatStatus(request.status)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleViewRefundRequest(request)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl p-0 bg-transparent shadow-none">
            <Card className="w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">Order Details</CardTitle>
                <CardDescription>All order, buyer, and delivery info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="font-medium text-gray-600">
                    Order ID: <span className="font-normal text-gray-900">{selectedOrder.id.slice(0, 8)}</span>
                  </div>
                  <div className="font-medium text-gray-600">
                    Date:{" "}
                    <span className="font-normal text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-medium text-gray-600">
                    Status: <span className="font-normal text-gray-900">{selectedOrder.status}</span>
                  </div>
                  <div className="font-medium text-gray-600">
                    Buyer: <span className="font-normal text-gray-900">{selectedOrder.user.full_name}</span>
                  </div>
                  <div className="font-medium text-gray-600">
                    Buyer Contact:{" "}
                    <span className="font-normal text-gray-900">{selectedOrder.user.whatsapp_number}</span>
                  </div>
                  <div className="font-medium text-gray-600">
                    Email: <span className="font-normal text-gray-900">{selectedOrder.user.email}</span>
                  </div>
                  {selectedOrder.user.business_name && (
                    <div className="font-medium text-gray-600">
                      Business: <span className="font-normal text-gray-900">{selectedOrder.user.business_name}</span>
                    </div>
                  )}
                  {selectedOrder.user.delivery_address && (
                    <div className="font-medium text-gray-600">
                      Address: <span className="font-normal text-gray-900">{selectedOrder.user.delivery_address}</span>
                    </div>
                  )}
                </div>

                {selectedOrder.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="mt-4">
                    <div className="font-semibold text-base mb-1">
                      {vehicle.make} {vehicle.model} {vehicle.year}
                      <span className="text-xs text-gray-500 ml-2">VIN: {vehicle.vin || "N/A"}</span>
                    </div>
                    <Label>Requested Parts</Label>
                    <ul className="list-none ml-0 text-sm text-gray-800 divide-y divide-gray-100">
                      {vehicle.parts.map((part) => {
                        const partStatus = part.shipping_status || "pending"
                        const canCancel = !["out_for_delivery", "delivered", "cancelled", "refunded"].includes(
                          partStatus,
                        )

                        return (
                          <li key={part.id} className="flex items-center justify-between py-2">
                            <div>
                              <span className="font-medium">{part.part_name}</span>
                              {part.part_number && <span className="text-xs text-gray-500"> ({part.part_number})</span>}
                              <span className="text-xs text-gray-500"> (x{part.quantity})</span>
                              <Badge className={`ml-2 ${getStatusColor(partStatus)}`}>{formatStatus(partStatus)}</Badge>
                              {part.has_pending_refund && (
                                <Badge className="ml-2 bg-orange-100 text-orange-800">Refund Requested</Badge>
                              )}
                              {part.accepted_bid && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Accepted: AED {part.accepted_bid.price.toFixed(2)} by{" "}
                                  {part.accepted_bid.vendor.business_name || part.accepted_bid.vendor.full_name}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {canCancel && (
                                <Button size="sm" variant="destructive" onClick={() => handleCancelPart(part)}>
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}

                <div className="mt-4">
                  <Label>Deliveries</Label>
                  <div className="space-y-4 mt-2">
                    {selectedOrder.deliveries.map((delivery) => (
                      <Card key={delivery.id} className="p-4 border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="font-semibold">Delivery #{delivery.id.slice(0, 8)}</div>
                            <div className="text-sm text-gray-500">Driver: {delivery.driver_name || "N/A"}</div>
                            <div className="text-sm text-gray-500">Status: Delivered</div>
                            <div className="text-sm text-gray-500">
                              Delivered: {new Date(delivery.created_at).toLocaleString()}
                            </div>
                            {delivery.delivery_note && (
                              <div className="text-sm text-gray-500">Note: {delivery.delivery_note}</div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(delivery.invoice)}>
                            More Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </CardFooter>
            </Card>
          </DialogContent>
        </Dialog>
      )}

      {/* Refund Request Review Modal */}
      {selectedRefundRequest && (
        <Dialog open={!!selectedRefundRequest} onOpenChange={() => setSelectedRefundRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Refund Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Customer</Label>
                  <p>{selectedRefundRequest.user.full_name}</p>
                  <p className="text-gray-500">{selectedRefundRequest.user.email}</p>
                  <p className="text-gray-500">{selectedRefundRequest.user.whatsapp_number}</p>
                </div>
                <div>
                  <Label className="font-medium">Part Details</Label>
                  <p>{selectedRefundRequest.part.part_name}</p>
                  <p className="text-gray-500">{selectedRefundRequest.part.part_number}</p>
                  <p className="text-gray-500">Quantity: {selectedRefundRequest.part.quantity}</p>
                </div>
                <div>
                  <Label className="font-medium">Vehicle</Label>
                  <p>
                    {selectedRefundRequest.part.vehicle.make} {selectedRefundRequest.part.vehicle.model}{" "}
                    {selectedRefundRequest.part.vehicle.year}
                  </p>
                  <p className="text-gray-500">VIN: {selectedRefundRequest.part.vehicle.vin || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">Request Info</Label>
                  <p>
                    Status:{" "}
                    <Badge className={getStatusColor(selectedRefundRequest.status)}>
                      {formatStatus(selectedRefundRequest.status)}
                    </Badge>
                  </p>
                  <p className="text-gray-500">
                    Date: {new Date(selectedRefundRequest.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Customer Reason</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedRefundRequest.reason}</p>
              </div>

              {selectedRefundRequest.images && selectedRefundRequest.images.length > 0 && (
                <div>
                  <Label className="font-medium">Attached Images</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedRefundRequest.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Refund evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="admin-notes" className="font-medium">
                  Admin Notes
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedRefundRequest(null)}>
                Close
              </Button>
              {selectedRefundRequest.status === "pending" && (
                <>
                  <Button variant="destructive" onClick={handleRejectRefund}>
                    Reject
                  </Button>
                  <Button onClick={handleApproveRefund}>Approve Refund</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Part Confirmation Dialog */}
      <Dialog open={!!partToCancel} onOpenChange={closeCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Part</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to cancel <b>{partToCancel?.part_name}</b>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelDialog}>
              No, Go Back
            </Button>
            <Button variant="destructive" onClick={confirmCancelPart}>
              Yes, Cancel Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>Delivery and payment breakdown</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="font-medium text-gray-600">
                  Invoice ID: <span className="font-normal text-gray-900">{selectedInvoice.id.slice(0, 8)}</span>
                </div>
                <div className="font-medium text-gray-600">
                  Status: <span className="font-normal text-gray-900">{selectedInvoice.payment_status}</span>
                </div>
                <div className="font-medium text-gray-600">
                  Subtotal: <span className="font-normal text-gray-900">AED {selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="font-medium text-gray-600">
                  Delivery Fee: <span className="font-normal text-gray-900">AED {selectedInvoice.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="font-medium text-gray-600">
                  VAT: <span className="font-normal text-gray-900">AED {selectedInvoice.vat_amount.toFixed(2)}</span>
                </div>
                <div className="font-medium text-gray-600">
                  Total: <span className="font-normal text-gray-900">AED {selectedInvoice.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4">
                <Label>Parts Breakdown</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Part Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Vendor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.parts_breakdown.map((part, index) => (
                      <TableRow key={`${part.part_id}-${index}`}>
                        <TableCell className="font-medium break-words">
                          {part.part_name || 'Unknown Part'}
                        </TableCell>
                        <TableCell>{part.quantity}</TableCell>
                        <TableCell>AED {Number(part.unit_price).toFixed(2)}</TableCell>
                        <TableCell>AED {(Number(part.unit_price) * part.quantity).toFixed(2)}</TableCell>
                        <TableCell>{part.vendor_name || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
