import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface DeliveryHistoryItem {
  id: string
  date: string
  customer: string
  phone: string
  address: string
  driver: string
  grandTotal: number
  paymentMethod: string
  deliveryFee: number
  subtotal: number
  paymentStatus: string
  notes: string
  photos: string[]
  parts: {
    partName: string
    partNumber: string | null
    quantity: number
    unitPrice: number
    vendor: {
      name: string
      address: string
      phone: string
      business_name: string | null
    }
  }[]
}

export const useDeliveryHistory = () => {
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch completed invoices with all related data
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select(`
          id,
          total_amount,
          subtotal,
          delivery_fee,
          status,
          payment_status,
          delivery_address,
          driver_name,
          delivery_note,
          image_urls,
          created_at,
          user_id,
          user_profile:user_profiles!invoices_user_id_fkey (
            id,
            full_name,
            whatsapp_number,
            delivery_phone
          ),
          invoice_parts (
            quantity,
            unit_price,
            part:parts (
              id,
              part_name,
              part_number,
              bids!inner (
                id,
                status,
                vendor:user_profiles!bids_vendor_id_fkey (
                  id,
                  full_name,
                  whatsapp_number,
                  location,
                  business_name
                )
              )
            )
          )
        `)
        .eq("status", "completed")
        .order("created_at", { ascending: false })

      if (invoicesError) throw invoicesError

      // Transform the data to match the component's expected structure
      const transformedData: DeliveryHistoryItem[] = (invoicesData || []).map((invoice: any) => {
        // Get payment method from payment_status or default to 'Cash'
        const getPaymentMethod = (paymentStatus: string) => {
          switch (paymentStatus) {
            case "paid":
              return "Card"
            case "pending":
              return "Bank Transfer"
            default:
              return "Cash"
          }
        }

        // Transform parts data
        const parts = (invoice.invoice_parts || []).map((invoicePart: any) => {
          const part = invoicePart.part
          // Find the accepted bid for vendor info
          const acceptedBid = part?.bids?.find((bid: any) => bid.status === "accepted")

          return {
            partName: part?.part_name || "Unknown Part",
            partNumber: part?.part_number || null,
            quantity: invoicePart.quantity,
            unitPrice: invoicePart.unit_price,
            vendor: {
              name: acceptedBid?.vendor?.full_name || "Unknown Vendor",
              address: acceptedBid?.vendor?.location || "Unknown Address",
              phone: acceptedBid?.vendor?.whatsapp_number || "Unknown Phone",
              business_name: acceptedBid?.vendor?.business_name || null,
            },
          }
        })

        return {
          id: invoice.id,
          date: new Date(invoice.created_at).toLocaleString("en-AE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          customer: invoice.user_profile?.full_name || "Unknown Customer",
          phone: invoice.user_profile?.delivery_phone || invoice.user_profile?.whatsapp_number || "Unknown Phone",
          address: invoice.delivery_address || "Unknown Address",
          driver: invoice.driver_name || "Unknown Driver",
          grandTotal: Number(invoice.total_amount) || 0,
          paymentMethod: getPaymentMethod(invoice.payment_status),
          deliveryFee: Number(invoice.delivery_fee) || 0,
          subtotal: Number(invoice.subtotal) || 0,
          paymentStatus: invoice.payment_status || "unknown",
          notes: invoice.delivery_note || "No delivery notes",
          photos: invoice.image_urls || [],
          parts,
        }
      })

      setDeliveryHistory(transformedData)
    } catch (err) {
      console.error("Error fetching delivery history:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch delivery history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveryHistory()
  }, [])

  return {
    deliveryHistory,
    loading,
    error,
    refetch: fetchDeliveryHistory,
  }
}
