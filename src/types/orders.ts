export interface Order {
  id: string;
  created_at: string;
  user_id: string;
  status: 'open' | 'partial' | 'closed' | 'cancelled' | 'refunded' | 'ready_for_checkout' | 'completed';
  is_paid?: boolean;
}

// Rename the second interface to avoid conflict
export interface OrderWithPartsResponse {
  id: string;
  created_at: string;
  parts: Array<{
    id: string;
    part_name: string;
    part_number: string | null;
    quantity: number;
    vehicle: DBVehicle;
    existing_bid?: Bid;
    bids?: Bid[];
  }>;
}

// Keep the original OrderWithParts interface
export type OrderWithParts = {
  id: string
  user_id: string
  status: string
  created_at: string
  updated_at: string
  is_paid: boolean
  parts: (Part & {
    vehicle: Vehicle
    bids?: Bid[]
    existing_bid?: Bid
    other_bids_count?: number
  })[]
}

// In your types file (e.g., types/orders.ts or types/parts.ts)
export type Part = {
  id: string
  order_id?: string
  vehicle_id: string
  part_name: string
  part_number?: string
  description?: string
  quantity: number
  created_at: string
  shipping_status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded' // Add this
  shipped_at?: string
  collected_at?: string
  delivered_at?: string
  admin_collected_by?: string
  admin_collected_at?: string
  is_accepted: boolean // Add this
  estimated_budget?: number
  expected_delivery_date?: string
  delivery_photo_url?: string
  photos?: string[]
  pickup_notes?: string
  pickup_at?: string
  picked_up_by?: string
  pickup_confirmation?: boolean
  updated_at: string
  delivery_note?: string
  pickup_photo_urls?: string[]
  inspection_images?: string[]
  inspected_by?: string
  inspected_at?: string
  // Add any other missing properties from your schema
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string | number; // Modified this line
  vin?: string; // Add this line
}

// In your types file (e.g., types/orders.ts or types/bids.ts)
export type Bid = {
  id: string
  part_id: string
  vendor_id: string
  price: number
  notes?: string
  status: 'pending' | 'accepted' | 'rejected'
  image_url?: string
  created_at: string
  updated_at: string
  shipped_at?: string
  warranty: string // Add this
  condition: string // Add this
  source_type?: string
  vendor_info?: any
  is_sourcer_provided?: boolean
  sourcer_notes?: string
}

// Database response types
export interface BidResponse {
  id: string;
  created_at: string;
  updated_at: string;
  vendor_id: string;
  part_id: string;
  price: number;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  image_url: string | null;
  shipped_at: string | null;
}

export interface PartResponse {
  id: string;
  order_id: string;
  part_name: string;
  description?: string;
  part_number?: string;
  quantity: number;
  vehicle_id?: string;
  vehicle?: Vehicle;
  bids: BidResponse[];
  existing_bid?: BidResponse;
  total_bids?: number;
  has_accepted_bid?: boolean;
}

export type QuoteCondition = 'New' | 'Used - Excellent' | 'Used - Good' | 'Used - Fair';
export type QuoteWarranty = 'No Warranty' | '3 Days' | '7 Days' | '14 Days' | '30 Days';

export interface QuoteRange {
  min: number;
  max: number;
}

export interface MyQuote {
  id: string;
  price: number;
  condition: QuoteCondition;
  warranty: QuoteWarranty;
  notes?: string;
  imageUrl?: string;
  isAccepted: boolean;
}

export interface DBVehicle extends Vehicle {
  vin: string | null;
  created_at: string;
  updated_at: string;
}