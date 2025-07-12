import { supabase } from "@/integrations/supabase/client"

export const getQuoteStatus = (part: any) => {
  if (part.vendorQuotes.length === 0) {
    return { text: "No Quotes", color: "bg-gray-100 text-gray-800" }
  }
  const acceptedCount = part.vendorQuotes.filter((q: any) => q.status === "accepted").length
  if (acceptedCount > 0) {
    return {
      text: `${acceptedCount} Accepted`,
      color: "bg-green-100 text-green-800",
    }
  }
  return {
    text: `${part.vendorQuotes.length} Quotes`,
    color: "bg-blue-100 text-blue-800",
  }
}

export const getConditionColor = (condition: string) => {
  switch (condition) {
    case "New":
      return "bg-green-100 text-green-800"
    case "Used - Excellent":
      return "bg-blue-100 text-blue-800"
    case "Used - Good":
      return "bg-yellow-100 text-yellow-800"
    case "Used - Fair":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const calculateProfitMargin = (customerPaid: string, vendorPrice: string) => {
  const customer = Number.parseFloat(customerPaid)
  const vendor = Number.parseFloat(vendorPrice)
  if (!customer || !vendor || customer <= 0 || vendor <= 0) return null
  const profit = customer - vendor
  const margin = (profit / vendor) * 100
  return {
    profit,
    margin,
    status: margin < 15 ? "red" : margin === 15 ? "orange" : "green",
  }
}

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `sourcer-images/${fileName}`

    const { error: uploadError } = await supabase.storage.from("mybucket").upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("mybucket").getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}

export const calculateMaxAllowedSpend = (
  budget: number | undefined,
  vendorPercentage: number | null,
): number | null => {
  if (!budget || vendorPercentage === null) return null
  const calculatedValue = budget / (1 + vendorPercentage / 100)
  return Math.floor(calculatedValue / 5) * 5 // Round down to nearest 5
}

export const fetchVendorPercentageAndCalculateSpend = async (estimatedBudget: number | undefined) => {
  try {
    const { data, error } = await supabase.from("price_modifiers").select("vendor_percentage").single()

    if (error) throw error

    const vendorPercentage = data.vendor_percentage
    let maxAllowedSpend = null

    if (estimatedBudget && vendorPercentage !== null) {
      const calculatedValue = estimatedBudget / (1 + vendorPercentage / 100)
      maxAllowedSpend = Math.floor(calculatedValue / 5) * 5
    }

    return { vendorPercentage, maxAllowedSpend }
  } catch (error) {
    console.error("Error fetching vendor percentage:", error)
    // Return default values
    const defaultPercentage = 15
    let maxAllowedSpend = null

    if (estimatedBudget) {
      const calculatedValue = estimatedBudget / 1.15 // Using default 15%
      maxAllowedSpend = Math.floor(calculatedValue / 5) * 5
    }

    return { vendorPercentage: defaultPercentage, maxAllowedSpend }
  }
}
