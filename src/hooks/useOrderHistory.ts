"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

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
    expected_delivery_date: string | null
    delivery_photo_url: string | null
    photos: string[] | null
    vehicle: {
      id: string
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
      status: string
      image_url: string | null
      vendor: {
        full_name: string
        business_name: string | null
        whatsapp_number: string
      }
    } | null
    invoice: {
      id: string
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
      created_at: string
    } | null
  }>
  refund_requests: Array<{
    id: string
    reason: string
    status: string
    created_at: string
    admin_notes: string | null
    images: string[] | null
  }>
}

interface OrderHistoryStats {
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  awaitingAction: number
  inProgress: number
  completed: number
  cancelled: number
}

export const useOrderHistory = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [dateRange, setDateRange] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchOrderHistory = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get user profile first
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (profileError) throw profileError

      // First fetch all orders for the user
      // const { data: ordersData, error: ordersError } = await supabase
      //   .from("orders")
      //   .select("*")
      //   .eq("user_id", userProfile.id)
      //   .order("created_at", { ascending: false })

      // if (ordersError) throw ordersError

      // Then fetch all parts for these orders with their invoices
      // const orderIds = ordersData?.map(order => order.id) || []

      const { data: partsData, error: partsError } = await supabase
        .from("parts")
        .select(`
          *,
          vehicles (id, make, model, year, vin),
          bids!part_id (
            id,
            price,
            condition,
            warranty,
            notes,
            status,
            image_url,
            vendor:user_profiles!vendor_id (
              full_name,
              business_name,
              whatsapp_number
            )
          ),
          invoice_parts!part_id (
            invoice_id,
            quantity,
            unit_price,
            invoices (
              id,
              user_id,
              total_amount,
              subtotal,
              vat_amount,
              service_fee,
              delivery_fee,
              payment_status,
              paid_at,
              invoice_url,
              delivery_address,
              created_at,
              delivery_options (
                name,
                estimated_days
              )
            )
          ),
          refund_requests!part_id (
            id,
            reason,
            status,
            created_at,
            admin_notes,
            images
          )
        `)
        .eq("vehicles.user_id", userProfile.id)

      if (partsError) throw partsError

      // Group parts by invoice instead of order
      const partsByInvoiceId: Record<string, any[]> = {}
      partsData?.forEach((part) => {
        const invoiceId = part.invoice_parts?.[0]?.invoice_id || "no-invoice"
        if (!partsByInvoiceId[invoiceId]) {
          partsByInvoiceId[invoiceId] = []
        }
        partsByInvoiceId[invoiceId].push(part)
      })

      // Transform data into our structure - group by invoice instead of order
      const transformedOrders: OrderHistoryItem[] = Object.entries(partsByInvoiceId)
        .filter(([invoiceId]) => invoiceId !== "no-invoice") // Only include parts with invoices
        .map(([invoiceId, invoiceParts]) => {
          const firstPart = invoiceParts[0]
          const invoice = firstPart.invoice_parts?.[0]?.invoices

          if (!invoice) return null

          const partsWithInvoices = invoiceParts.map((part: any) => {
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
              expected_delivery_date: part.expected_delivery_date,
              delivery_photo_url: part.delivery_photo_url,
              photos: part.photos || [],
              vehicle: part.vehicles,
              winning_bid: winningBid
                ? {
                    id: winningBid.id,
                    price: winningBid.price,
                    condition: winningBid.condition,
                    warranty: winningBid.warranty,
                    notes: winningBid.notes,
                    status: winningBid.status,
                    image_url: winningBid.image_url,
                    vendor: winningBid.vendor,
                  }
                : null,
              invoice: {
                id: invoice.id,
                total_amount: invoice.total_amount,
                subtotal: invoice.subtotal,
                vat_amount: invoice.vat_amount,
                service_fee: invoice.service_fee,
                delivery_fee: invoice.delivery_fee,
                payment_status: invoice.payment_status,
                paid_at: invoice.paid_at,
                invoice_url: invoice.invoice_url,
                delivery_address: invoice.delivery_address,
                delivery_option: invoice.delivery_options,
                created_at: invoice.created_at,
              },
            }
          })

          return {
            id: invoiceId, // Use invoice ID as the "order" ID
            created_at: invoice.created_at,
            updated_at: invoice.created_at,
            status: invoice.payment_status === "paid" ? "completed" : "open",
            is_paid: invoice.payment_status === "paid",
            parts_count: partsWithInvoices.length,
            total_amount: invoice.total_amount,
            subtotal: invoice.subtotal,
            vat_amount: invoice.vat_amount,
            service_fee: invoice.service_fee,
            delivery_fee: invoice.delivery_fee,
            payment_status: invoice.payment_status,
            paid_at: invoice.paid_at,
            invoice_url: invoice.invoice_url,
            delivery_address: invoice.delivery_address,
            delivery_option: invoice.delivery_options,
            parts: partsWithInvoices,
            refund_requests: invoiceParts.flatMap(
              (part) =>
                part.refund_requests?.map((req: any) => ({
                  id: req.id,
                  reason: req.reason,
                  status: req.status,
                  created_at: req.created_at,
                  admin_notes: req.admin_notes,
                  images: req.images || [],
                })) || [],
            ),
          }
        })
        .filter(Boolean) as OrderHistoryItem[]

      setOrders(transformedOrders)
    } catch (error) {
      console.error("Error fetching order history:", error)
      toast({
        title: "Error loading order history",
        description: "Unable to fetch order history. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderHistory()
  }, [user])

  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Filter by completed/delivered orders only for order history
    filtered = filtered.filter(
      (order) => order.status === "completed" || order.parts.some((part) => part.shipping_status === "delivered"),
    )

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()
      switch (dateRange) {
        case "30days":
          cutoffDate.setDate(now.getDate() - 30)
          break
        case "90days":
          cutoffDate.setDate(now.getDate() - 90)
          break
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      filtered = filtered.filter((order) => new Date(order.created_at) >= cutoffDate)
    }

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((order) => {
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.parts.some(
            (part) =>
              part.part_name.toLowerCase().includes(searchLower) ||
              (part.part_number && part.part_number.toLowerCase().includes(searchLower)) ||
              (part.vehicle &&
                (part.vehicle.make.toLowerCase().includes(searchLower) ||
                  part.vehicle.model.toLowerCase().includes(searchLower) ||
                  part.vehicle.vin?.toLowerCase().includes(searchLower))),
          )
        )
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [orders, searchTerm, sortOrder, dateRange, statusFilter])

  const stats: OrderHistoryStats = useMemo(() => {
    const completedOrders = orders.filter((order) => order.status === "completed")
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total_amount, 0)

    return {
      totalOrders: orders.length,
      totalSpent,
      avgOrderValue: completedOrders.length > 0 ? totalSpent / completedOrders.length : 0,
      awaitingAction: orders.filter((order) =>
        order.parts.some((part) => part.shipping_status === "waiting_for_bid" && !part.winning_bid),
      ).length,
      inProgress: orders.filter(
        (order) =>
          order.is_paid && order.parts.some((part) => !["delivered", "admin_collected"].includes(part.shipping_status)),
      ).length,
      completed: completedOrders.length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    }
  }, [orders])

  const clearFilters = () => {
    setSearchTerm("")
    setSortOrder("newest")
    setDateRange("all")
    setStatusFilter("all")
  }

  return {
    orders: filteredOrders,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    clearFilters,
    refetchOrders: fetchOrderHistory,
  }
}
