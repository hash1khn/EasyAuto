export type PartStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";
export type OrderStatus = "open" | "closed" | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  is_paid: boolean;
}

// In your type definitions file (e.g., @/lib/types.ts)
export interface Part {
  id: string;
  order_id: string;
  vehicle_id: string;
  part_name: string;
  part_number: string | null;
  description: string | null;
  quantity: number;
  created_at: string;
  shipping_status: PartStatus;
  shipped_at: string | null;
  collected_at: string | null;
  delivered_at: string | null;
  admin_collected_by: string | null;
  admin_collected_at: string | null;
  is_accepted: boolean | null;
  estimated_budget: number | null;
  expected_delivery_date: string | null;
  delivery_photo_url: string | null;
  photos: string[] | null;
  pickup_notes: string | null;
  pickup_at: string | null;
  picked_up_by: string | null;
  pickup_confirmation: boolean | null;
  updated_at: string;
  delivery_note: string | null;
  pickup_photo_urls: string[] | null;
  inspection_images: string[] | null;
  inspected_by: string | null;
  inspected_at: string | null;
  conditions?: string[]; // Add this line

  
  // Relations
  vehicle?: Vehicle;
  order?: Order;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  part_id: string;
  vendor_id: string;
  price: number;
  customer_paid:number;
  notes: string | null;
  status: BidStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  warranty: string;
  condition: string;
  // Relations
  vendor?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name: string;
  whatsapp_number: string;
  business_name: string | null;
  location: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  payment_status: PaymentStatus;
}
