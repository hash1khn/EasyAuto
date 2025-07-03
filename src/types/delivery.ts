import { QuoteCondition } from './orders';

export interface DeliveryPart {
  id: string
  part_name: string
  part_number: string | null
  quantity: number
  photos: string[] | null
  pickup_photo_urls: string[] | null  // Add this line
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
    is_sourcer_provided: boolean
    vendor_info?: {
      name: string
      phone: string
      address: string
      business_name?: string
      google_maps_url?: string
      delivery_instructions?: string
    }
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
  buyer_id: string;
  buyer_name: string;
  business_name?: string;  // Add this line
  delivery_address: string;
  delivery_phone: string;
  delivery_instructions?: string;
  google_maps_url?: string;
  parts: DeliveryPart[];
}

export interface EnrichedPart {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  orderId: string;
  vehicleName: string;
  imageUrls: string[]
  pickup_photo_urls?: string[] | null  // Add this line
  condition: QuoteCondition;
  status: string;
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorLat: number;
  vendorLng: number;
  shipping_status?: string;
  created_at?: string;
  delivered_at?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
  };
  winning_bid?: {
    id: string;
    price: number;
    condition: string;
    warranty: string;
    is_sourcer_provided: boolean;  // Add this
    vendor_info?: {               // Add this
      name: string;
      phone: string;
      address: string;
      business_name?: string;
      google_maps_url?: string;
      delivery_instructions?: string;
    };
    vendor: {
      id: string;
      full_name: string;
      whatsapp_number: string;
      business_name: string;
      location: string;
    };
  };
  order?: {
    user_profile?: {
      full_name: string;
      delivery_address: string;
    };
  };
}
