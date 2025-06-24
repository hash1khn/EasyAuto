import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { DeliveryPart, GroupedDeliveryData, EnrichedPart } from "@/types/delivery"

export const useDeliveryData = () => {
  const [deliveryData, setDeliveryData] = useState<GroupedDeliveryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliveryData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch parts that are out for delivery with all related data
      const { data: partsData, error: partsError } = await supabase
        .from("parts")
        .select(`
          *,
          order:orders!inner (
            id,
            user_id,
            status,
            user_profile:user_profiles!inner (
              id,
              full_name,
              whatsapp_number,
              delivery_address,
              delivery_phone,
              delivery_instructions,
              google_maps_url
            )
          ),
          vehicle:vehicles (
            id,
            make,
            model,
            year
          ),
          bids!inner (
            id,
            price,
            condition,
            warranty,
            status,
            vendor:user_profiles!bids_vendor_id_fkey (
              id,
              full_name,
              whatsapp_number,
              business_name,
              location
            )
          )
        `)
        .eq("shipping_status", "out_for_delivery")
        .eq("bids.status", "accepted")

      if (partsError) {
        throw partsError
      }

      // Group parts by buyer (delivery address)
      const groupedData: { [key: string]: GroupedDeliveryData } = {}

      partsData?.forEach((part: any) => {
        const buyerId = part.order.user_profile.id
        const deliveryAddress = part.order.user_profile.delivery_address || "No address provided"

        if (!groupedData[buyerId]) {
          groupedData[buyerId] = {
            buyer_id: buyerId,
            buyer_name: part.order.user_profile.full_name,
            delivery_address: deliveryAddress,
            delivery_phone: part.order.user_profile.delivery_phone || part.order.user_profile.whatsapp_number,
            delivery_instructions: part.order.user_profile.delivery_instructions,
            google_maps_url: part.order.user_profile.google_maps_url,
            parts: [],
          }
        }

        // Find the winning/accepted bid
        const winningBid = part.bids?.find((bid: any) => bid.status === "accepted")

        const enrichedPart: DeliveryPart = {
          ...part,
          winning_bid: winningBid
            ? {
                id: winningBid.id,
                price: winningBid.price,
                condition: winningBid.condition,
                warranty: winningBid.warranty,
                vendor: winningBid.vendor,
              }
            : undefined,
        }

        groupedData[buyerId].parts.push(enrichedPart)
      })

      setDeliveryData(Object.values(groupedData))
    } catch (err) {
      console.error("Error fetching delivery data:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updatePartStatus = async (partId: string, status: string, additionalData?: any) => {
    try {
      const updateData: any = {
        shipping_status: status,
        updated_at: new Date().toISOString(),
      }

      if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString()
        if (additionalData?.delivery_photo_url) {
          updateData.delivery_photo_url = additionalData.delivery_photo_url
        }
      }

      const { error } = await supabase.from("parts").update(updateData).eq("id", partId)

      if (error) throw error

      // Refresh data after update
      await fetchDeliveryData()

      return { success: true }
    } catch (err) {
      console.error("Error updating part status:", err)
      return { success: false, error: err instanceof Error ? err.message : "Update failed" }
    }
  }

  // Helper function to convert DeliveryPart to EnrichedPart for legacy compatibility
  const convertToEnrichedPart = (part: DeliveryPart): EnrichedPart => {
    return {
      ...part,
      partName: part.part_name,
      partNumber: part.part_number || "",
      imageUrls: part.photos || [],
      condition: part.winning_bid?.condition || "Unknown",
      vendorName: part.winning_bid?.vendor?.full_name || "Unknown Vendor",
      vendorAddress: part.winning_bid?.vendor?.location || "Unknown Address",
      vendorPhone: part.winning_bid?.vendor?.whatsapp_number || "Unknown Phone",
      sourcerName: part.winning_bid?.vendor?.full_name || "Unknown Sourcer",
      sourcerId: part.winning_bid?.vendor?.id || "",
      sourcerPhone: part.winning_bid?.vendor?.whatsapp_number || "Unknown Phone",
      orderId: part.order_id,
    }
  }

  useEffect(() => {
    fetchDeliveryData()
  }, [])

  return {
    deliveryData,
    loading,
    error,
    refetch: fetchDeliveryData,
    updatePartStatus,
    convertToEnrichedPart,
  }
}
