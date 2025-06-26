import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  CalendarIcon,
  Download,
  Search,
  Filter,
  Receipt,
  MessageCircle,
  Package,
  Clock,
  Truck,
  RefreshCw,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface OrderHistoryItem {
  id: string
  created_at: string
  updated_at: string
  status: string
  is_paid: boolean
  parts_count: number
  total_amount: number
  subtotal: number
  vat_amount: number
  service_fee: number
  delivery_fee: number
  payment_status: string
  paid_at: string | null
  invoice_url: string | null
  delivery_address: string | null
  delivery_option: {
    name: string
    estimated_days: number
  } | null
  parts: Array<{
    id: string
    part_name: string
    part_number: string | null
    description: string | null
    quantity: number
    shipping_status: string
    shipped_at: string | null
    collected_at: string | null
    delivered_at: string | null
    is_accepted: boolean
    vehicle: {
      make: string
      model: string
      year: number
      vin: string | null
    } | null
    winning_bid: {
      id: string
      price: number
      condition: string
      warranty: string
      notes: string | null
      status: "pending" | "accepted" | "rejected" // or whatever your actual enum values are

      vendor: {
        full_name: string
        business_name: string | null
        whatsapp_number: string
      }
    } | null
  }>
  refund_requests: Array<{
    id: string
    reason: string
    status: string
    created_at: string
    admin_notes: string | null
  }>
}

export const QuoteHistory: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [refundReason, setRefundReason] = useState("")
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    awaitingQuotes: 0,
    quoteReceived: 0,
    paymentPending: 0,
    processing: 0,
    partiallyDelivered: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    if (user) {
      fetchOrderHistory()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo, sortBy])

  const fetchOrderHistory = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          parts (
            *,
            vehicles (make, model, year, vin),
            bids!part_id (
              id,
              price,
              condition,
              warranty,
              notes,
              status,
              vendor:user_profiles!vendor_id (
                full_name,
                business_name,
                whatsapp_number
              )
            )
          ),
          invoices (
            id,
            total_amount,
            subtotal,
            vat_amount,
            service_fee,
            delivery_fee,
            payment_status,
            paid_at,
            invoice_url,
            delivery_address,
            delivery_options (
              name,
              estimated_days
            )
          ),
          refund_requests (
            id,
            reason,
            status,
            created_at,
            admin_notes
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching order history:", error)
        return
      }

      const transformedOrders: OrderHistoryItem[] = (data || []).map((order) => {
        const invoice = order.invoices?.[0]
        return {
          id: order.id,
          created_at: order.created_at,
          updated_at: order.updated_at,
          status: order.status,
          is_paid: order.is_paid,
          parts_count: order.parts?.length || 0,
          total_amount: invoice?.total_amount || 0,
          subtotal: invoice?.subtotal || 0,
          vat_amount: invoice?.vat_amount || 0,
          service_fee: invoice?.service_fee || 0,
          delivery_fee: invoice?.delivery_fee || 0,
          payment_status: invoice?.payment_status || "unpaid",
          paid_at: invoice?.paid_at || null,
          invoice_url: invoice?.invoice_url || null,
          delivery_address: invoice?.delivery_address || null,
          delivery_option: invoice?.delivery_options || null,
          parts: (order.parts || []).map((part: any) => {
            const winningBid = part.bids?.find((bid: any) => bid.status === "accepted")
            return {
              id: part.id,
              part_name: part.part_name,
              part_number: part.part_number,
              description: part.description,
              quantity: part.quantity,
              shipping_status: part.shipping_status,
              shipped_at: part.shipped_at,
              collected_at: part.collected_at,
              delivered_at: part.delivered_at,
              is_accepted: part.is_accepted,
              vehicle: part.vehicles,
              winning_bid: winningBid
                ? {
                    id: winningBid.id,
                    price: winningBid.price,
                    condition: winningBid.condition,
                    warranty: winningBid.warranty,
                    notes: winningBid.notes,
                    status: winningBid.status,

                    vendor: winningBid.vendor,
                  }
                : null,
            }
          }),
          refund_requests: order.refund_requests || [],
        }
      })

      setOrders(transformedOrders)

      // Calculate stats
      // Calculate stats
      const totalSpent = transformedOrders.reduce(
        (sum, order) => sum + (order.status === "completed" ? order.total_amount : 0),
        0,
      )

      const statsCalculation = {
        totalOrders: transformedOrders.length,
        totalSpent,
        avgOrderValue: 0, // Will calculate below
        awaitingQuotes: transformedOrders.filter((order) =>
          order.parts.every((part) => part.shipping_status === "waiting_for_bid" && !part.winning_bid),
        ).length,
        quoteReceived: transformedOrders.filter((order) =>
          order.parts.some(
            (part) =>
              (part.winning_bid?.status === "pending" || part.winning_bid?.status === "accepted") && !order.is_paid,
          ),
        ).length,
        paymentPending: transformedOrders.filter((order) => order.status === "ready_for_checkout" && !order.is_paid)
          .length,
        processing: transformedOrders.filter(
          (order) =>
            order.is_paid &&
            order.parts.some((part) => !["collected", "admin_collected", "delivered"].includes(part.shipping_status)),
        ).length,
        partiallyDelivered: transformedOrders.filter(
          (order) =>
            order.is_paid &&
            order.parts.some((part) => ["collected", "admin_collected", "delivered"].includes(part.shipping_status)) &&
            order.parts.some((part) => !["delivered"].includes(part.shipping_status)),
        ).length,
        delivered: transformedOrders.filter(
          (order) => order.parts.every((part) => part.shipping_status === "delivered") && order.status !== "completed",
        ).length,
        completed: transformedOrders.filter((order) => order.status === "completed").length,
        cancelled: transformedOrders.filter((order) => order.status === "cancelled").length,
        refunded: transformedOrders.filter((order) => order.status === "refunded").length,
      }

      // Calculate average order value
      statsCalculation.avgOrderValue =
        statsCalculation.completed > 0 ? statsCalculation.totalSpent / statsCalculation.completed : 0

      setStats(statsCalculation)
    } catch (error) {
      console.error("Error fetching order history:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.parts.some(
            (part) =>
              part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              part.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              part.vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
              part.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter((order) => new Date(order.created_at) >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((order) => new Date(order.created_at) <= dateTo)
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "highest":
        filtered.sort((a, b) => b.total_amount - a.total_amount)
        break
      case "lowest":
        filtered.sort((a, b) => a.total_amount - b.total_amount)
        break
    }

    setFilteredOrders(filtered)
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const handleRequestRefund = async () => {
    if (!user || !selectedOrderId || !refundReason.trim()) return

    try {
      const { error } = await supabase.from("refund_requests").insert({
        user_id: user.id,
        order_id: selectedOrderId,
        reason: refundReason.trim(),
        status: "pending",
      })

      if (error) {
        console.error("Error submitting refund request:", error)
        return
      }

      // Refresh order history
      await fetchOrderHistory()

      // Reset form
      setRefundDialogOpen(false)
      setSelectedOrderId(null)
      setRefundReason("")
    } catch (error) {
      console.error("Error submitting refund request:", error)
    }
  }

  const handleViewReceipt = (orderId: string) => {
    navigate(`/receipt/${orderId}`)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      awaiting_quotes: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      quote_received: { variant: "secondary" as const, icon: MessageCircle, color: "text-blue-400" },
      payment_pending: { variant: "secondary" as const, icon: CreditCard, color: "text-orange-600" },
      processing: { variant: "secondary" as const, icon: RefreshCw, color: "text-purple-600" },
      partially_delivered: { variant: "secondary" as const, icon: Package, color: "text-indigo-600" },
      delivered: { variant: "default" as const, icon: Truck, color: "text-green-500" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      cancelled: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      refunded: { variant: "secondary" as const, icon: RotateCcw, color: "text-gray-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.awaiting_quotes
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </Badge>
    )
  }

  const getShippingStatusBadge = (status: string) => {
    const statusConfig = {
      pending_pickup: { variant: "secondary" as const, text: "Pending Pickup", progress: 25 },
      collected: { variant: "default" as const, text: "Collected", progress: 50 },
      admin_collected: { variant: "default" as const, text: "In Transit", progress: 75 },
      delivered: { variant: "default" as const, text: "Delivered", progress: 100 },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_pickup

    return (
      <div className="space-y-1">
        <Badge variant={config.variant}>{config.text}</Badge>
        <Progress value={config.progress} className="h-1" />
      </div>
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    setSortBy("newest")
  }

  const exportToCSV = () => {
    const headers = ["Order ID", "Date", "Status", "Parts", "Total Amount (AED)", "Payment Status", "Delivery Status"]
    const csvData = filteredOrders.map((order) => [
      order.id.slice(0, 8),
      format(new Date(order.created_at), "yyyy-MM-dd"),
      order.status,
      order.parts_count,
      order.total_amount.toFixed(2),
      order.payment_status,
      order.parts.map((p) => p.shipping_status).join("; "),
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `order-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleReorder = (orderId: string) => {
    navigate(`/reorder/${orderId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading order history...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">View and manage your orders, track deliveries, and request refunds</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Awaiting Action</p>
                <p className="text-2xl font-bold">
                  {stats.awaitingQuotes + stats.quoteReceived + stats.paymentPending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.processing + stats.partiallyDelivered}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Order ID, part name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
        {(searchTerm || statusFilter !== "all" || dateFrom || dateTo) && (
          <Badge variant="secondary">Filters Applied</Badge>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {format(new Date(order.created_at), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.parts_count} part{order.parts_count !== 1 ? "s" : ""}
                      </span>
                      <span className="font-semibold text-green-600">AED {order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleOrderExpansion(order.id)}>
                      {expandedOrders.has(order.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Less Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          More Details
                        </>
                      )}
                    </Button>
                    {order.invoice_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
                          <Receipt className="w-4 h-4 mr-1" />
                          Invoice
                        </a>
                      </Button>
                    )}
                    {order.is_paid && (
                      <Button size="sm" variant="outline" onClick={() => handleViewReceipt(order.id)}>
                        <Receipt className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                    )}
                    {order.status === "completed" && order.refund_requests.length === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setRefundDialogOpen(true)
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Request Refund
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedOrders.has(order.id) && (
                <CardContent className="pt-0">
                  <Tabs defaultValue="parts" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="parts">Parts</TabsTrigger>
                      <TabsTrigger value="delivery">Delivery</TabsTrigger>
                      <TabsTrigger value="refunds">Refunds</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parts" className="space-y-4">
                      {order.parts.map((part) => (
                        <Card key={part.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2">
                                <h4 className="font-semibold text-lg mb-2">{part.part_name}</h4>
                                {part.part_number && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    <strong>Part Number:</strong> {part.part_number}
                                  </p>
                                )}
                                {part.description && <p className="text-sm text-gray-600 mb-2">{part.description}</p>}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <span>
                                    <strong>Quantity:</strong> {part.quantity}
                                  </span>
                                  {part.vehicle && (
                                    <span>
                                      <strong>Vehicle:</strong> {part.vehicle.year} {part.vehicle.make}{" "}
                                      {part.vehicle.model}
                                    </span>
                                  )}
                                </div>
                                {part.winning_bid && (
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <h5 className="font-medium mb-2">Winning Bid</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                      <span>
                                        <strong>Price:</strong> AED {part.winning_bid.price}
                                      </span>
                                      <span>
                                        <strong>Condition:</strong> {part.winning_bid.condition}
                                      </span>
                                      <span>
                                        <strong>Warranty:</strong> {part.winning_bid.warranty}
                                      </span>
                                    </div>
                                    {part.winning_bid.notes && (
                                      <p className="text-sm text-gray-600 mt-2">
                                        <strong>Notes:</strong> {part.winning_bid.notes}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Shipping Status</h5>
                                {order.is_paid ? (
                                  <>
                                    {getShippingStatusBadge(part.shipping_status)}
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                      {part.collected_at && (
                                        <p>Collected: {format(new Date(part.collected_at), "MMM dd, yyyy")}</p>
                                      )}
                                      {part.shipped_at && (
                                        <p>Shipped: {format(new Date(part.shipped_at), "MMM dd, yyyy")}</p>
                                      )}
                                      {part.delivered_at && (
                                        <p>Delivered: {format(new Date(part.delivered_at), "MMM dd, yyyy")}</p>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Shipping information will be available after payment
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="delivery" className="space-y-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Delivery Address
                              </h4>
                              {order.delivery_address ? (
                                <p className="text-sm text-gray-700">{order.delivery_address}</p>
                              ) : (
                                <p className="text-sm text-gray-500">No delivery address specified</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Delivery Option
                              </h4>
                              {order.delivery_option ? (
                                <div className="text-sm text-gray-700">
                                  <p>
                                    <strong>{order.delivery_option.name}</strong>
                                  </p>
                                  <p>Estimated: {order.delivery_option.estimated_days} days</p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Standard delivery</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="refunds" className="space-y-4">
                      {order.refund_requests.length > 0 ? (
                        order.refund_requests.map((refund) => (
                          <Card key={refund.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold">Refund Request</h4>
                                <Badge
                                  variant={
                                    refund.status === "approved"
                                      ? "default"
                                      : refund.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Reason:</strong> {refund.reason}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                Requested on: {format(new Date(refund.created_at), "MMM dd, yyyy")}
                              </p>
                              {refund.admin_notes && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm">
                                    <strong>Admin Notes:</strong> {refund.admin_notes}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-4 text-center">
                            <RotateCcw className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No refund requests for this order</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Please provide a reason for your refund request. Our team will review it and get back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refund-reason">Reason for refund</Label>
              <Textarea
                id="refund-reason"
                placeholder="Describe why you're requesting a refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRefund} disabled={!refundReason.trim()}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
