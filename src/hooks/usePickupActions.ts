import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export const usePickupActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPickupPhoto = async (photo: File): Promise<string | null> => {
    try {
      const fileExt = photo.name.split(".").pop()
      const fileName = `pickup-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `pickup-photos/${fileName}`

      const { data, error: uploadError } = await supabase.storage.from("mybucket").upload(filePath, photo)

      if (uploadError) {
        console.error("Error uploading photo:", uploadError)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("mybucket").getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error("Error in uploadPickupPhoto:", err)
      return null
    }
  }

  const confirmPickup = async (partIds: string[], pickupNotes: string, photo?: File) => {
    try {
      setLoading(true)
      setError(null)

      // Upload photo if provided
      let photoUrl: string | null = null
      if (photo) {
        photoUrl = await uploadPickupPhoto(photo)
      }

      // Update all selected parts in a single query
      const { error: updateError } = await supabase
        .from("parts")
        .update({
          shipping_status: "out_for_delivery",
          pickup_notes: pickupNotes,
          pickup_photo_urls: photoUrl,
          pickup_at: new Date().toISOString(),
          pickup_confirmation: true,
          updated_at: new Date().toISOString(),
        })
        .in("id", partIds)

      if (updateError) throw updateError

      return {
        success: true,
        message: `${partIds.length} part(s) marked as 'Out for Delivery'`,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to confirm pickup"
      setError(errorMessage)
      console.error("Error confirming pickup:", err)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    confirmPickup,
    loading,
    error,
  }
}
