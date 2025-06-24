export interface DeliveryPart {
  id: string
  part_name: string
  part_number: string | null
  quantity: number
  photos: string[] | null
  shipping_status: string
  order_id: string
  vehicle_id: string
  created_at: string
  delivered_at: string | null
  delivery_photo_url: string | null

  // Joined data
  order: {
    id: string
    user_id: string
    status: string
    user_profile: {
      id: string
      full_name: string
      whatsapp_number: string
      delivery_address: string | null
      delivery_phone: string | null
      delivery_instructions: string | null
      google_maps_url: string | null
    }
  }

  vehicle: {
    id: string
    make: string
    model: string
    year: number
  }

  // Winning bid information
  winning_bid?: {
    id: string
    price: number
    condition: string
    warranty: string
    vendor: {
      id: string
      full_name: string
      whatsapp_number: string
      business_name: string | null
      location: string
    }
  }
}

export interface GroupedDeliveryData {
  buyer_id: string
  buyer_name: string
  delivery_address: string
  delivery_phone: string
  delivery_instructions: string | null
  google_maps_url: string | null
  parts: DeliveryPart[]
}

export interface EnrichedPart extends DeliveryPart {
  // Legacy compatibility
  partName: string
  partNumber: string
  imageUrls: string[]
  condition: string
  vendorName: string
  vendorAddress: string
  vendorPhone: string
  sourcerName: string
  sourcerId: string
  sourcerPhone: string
  orderId: string
}
