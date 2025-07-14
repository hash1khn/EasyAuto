import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "../types/sourcer"

export const useSourcerData = (user: any) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLiveOrders = async () => {
    try {
      const { data: partsData, error: partsError } = await supabase
        .from("parts")
        .select(
          `
        *,
        inspection_images,
        inspected_by,
        inspected_at,
        vehicles(
            id,
            make,
            model,
            year,
            vin
        ),
        orders!inner(
            id,
            user_id,
            status,
            created_at,
            user_profiles!inner(
                id,
                full_name,
                whatsapp_number,
                location,
                delivery_address,
                user:user_id(
                    email
                )
            )
        ),
        bids(
            id,
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
            price,
            customer_paid,
            notes,
            status,
            image_urls,
            created_at,
            warranty,
            condition,
            vendor_info,
            is_sourcer_provided,
            sourcer_notes
        ),
        part_condition_preferences(
            condition
        )
      `,
        )
        .in("shipping_status", ["pending"])
        .not("is_accepted", "eq", true)
        .order("created_at", { ascending: false })

      if (partsError) throw partsError

      const ordersMap = new Map<string, Order>()
      console.log("Fetched parts data:", partsData)

      partsData?.forEach((part) => {
        const orderId = part.orders.id
        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, {
            id: part.orders.id,
            userId: part.orders.user_id,
            status: part.orders.status,
            createdAt: part.orders.created_at,
            userProfile: {
              id: part.orders.user_profiles.id,
              fullName: part.orders.user_profiles.full_name,
              whatsappNumber: part.orders.user_profiles.whatsapp_number,
              location: part.orders.user_profiles.location,
              deliveryAddress: part.orders.user_profiles.delivery_address,
            },
            parts: [],
          })
        }

        const order = ordersMap.get(orderId)!
        order.parts.push({
          id: part.id,
          partName: part.part_name,
          partNumber: part.part_number,
          quantity: part.quantity,
          description: part.description,
          estimatedBudget: part.estimated_budget,
          inspectionImages: part.inspection_images || [],
          inspectedBy: part.inspected_by,
          inspectedAt: part.inspected_at,
          vehicle: part.vehicles,
          part_condition_preferences: part.part_condition_preferences || [],
          photos: part.photos || [],
          vendorQuotes: part.bids.map((bid) => {
            const isSourcerProvided = bid.is_sourcer_provided
            const vendorInfo = bid.vendor_info
            return {
              id: bid.id,
              vendorName: isSourcerProvided ? vendorInfo?.name : bid.vendor?.full_name || "Unknown Vendor",
              vendorAddress: isSourcerProvided ? vendorInfo?.address : bid.vendor?.location || "No address provided",
              vendorPhone: isSourcerProvided ? vendorInfo?.phone : bid.vendor?.whatsapp_number || "No phone provided",
              vendorEmail: isSourcerProvided ? vendorInfo?.email : bid.vendor?.user?.email || "No email provided",
              price: bid.price,
              condition: bid.condition,
              warranty: bid.warranty,
              imageUrls: bid.image_urls,
              vendorNotes: bid.notes,
              submittedAt: bid.created_at,
              isAccepted: bid.status === "accepted",
              isSourcerProvided,
              status: bid.status,
              vendor_info: vendorInfo,
              sourcerNotes: bid.sourcer_notes || (isSourcerProvided ? vendorInfo?.sourcerNotes : undefined),
            }
          }),
        })
      })

      const processedOrders = Array.from(ordersMap.values())
      setOrders(processedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLoadData = async () => {
    setLoading(true)
    await fetchLiveOrders()
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      handleLoadData()
    }
  }, [user])

  return {
    orders,
    loading,
    refetch: handleLoadData,
  }
}
