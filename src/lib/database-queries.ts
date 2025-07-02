import { supabase } from "../integrations/supabase/client"

export async function getUserVehiclesWithParts(userId: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      parts (
        *,
        order:orders (*),
        bids (
          *,
          vendor:user_profiles (*)
        )
      )
    `)
    .eq("user_id", userId)
    .order("make", { ascending: true })

  if (error) {
    console.error("Error fetching vehicles with parts:", error)
    return []
  }

  return data || []
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      parts (
        *,
        vehicle:vehicles (*),
        bids (
          *,
          vendor:user_profiles (*)
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data || []
}

export async function getDashboardStats(userId: string) {
  // Get live orders count (orders with parts that are not delivered)
  const { data: liveOrdersData, error: liveOrdersError } = await supabase
    .from("orders")
    .select(`
      id,
      parts!inner (
        shipping_status
      )
    `)
    .eq("user_id", userId)
    .neq("parts.shipping_status", "delivered")

  // Get pending bids count
  const { data: pendingBidsData, error: pendingBidsError } = await supabase
    .from("bids")
    .select(`
      id,
      part:parts!inner (
        order:orders!inner (
          user_id
        )
      )
    `)
    .eq("status", "pending")
    .eq("part.order.user_id", userId)

  // Get ready for checkout count (accepted bids not yet paid)
  const { data: readyForCheckoutData, error: checkoutError } = await supabase
    .from("orders")
    .select(`
      id,
      is_paid,
      parts!inner (
        bids!inner (
          status
        )
      )
    `)
    .eq("user_id", userId)
    .eq("is_paid", false)
    .eq("parts.bids.status", "accepted")

  if (liveOrdersError || pendingBidsError || checkoutError) {
    console.error("Error fetching dashboard stats:", { liveOrdersError, pendingBidsError, checkoutError })
    return {
      liveOrders: 0,
      pendingBids: 0,
      readyForCheckout: 0,
    }
  }

  return {
    liveOrders: liveOrdersData?.length || 0,
    pendingBids: pendingBidsData?.length || 0,
    readyForCheckout: readyForCheckoutData?.length || 0,
  }
}
