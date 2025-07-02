import { Part } from './orders';

export type QuoteCondition = 'Used - Excellent' | 'Used - Good' | 'Used - Fair';
export type QuoteWarranty = 'No Warranty' | '3 Days' | '7 Days' | '14 Days' | '30 Days' | string; 
export interface MyQuote {
  id: string;
  price: number;
  condition: QuoteCondition;
  warranty: QuoteWarranty;
  notes?: string;
  imageUrls?: string[];
  isAccepted: boolean;
}

export interface QuoteRange {
  min: number;
  max: number;
}

export interface VendorPart {
  id: string;
  partName: string;           // Changed from part_name
  partNumber: string;         // Changed from part_number
  quantity: number;
  quoteRange?: QuoteRange;    // Changed from quote_range
  additionalInfo?: string;
  myQuote?: MyQuote;
  order_id?: string;         // Add if needed for compatibility
}

export interface VendorVehicle {
  id: string;
  vehicleName: string;
  vinNumber: string;
  parts: VendorPart[];
  orderId?: string;
  createdAt?: string;
  status?: 'new' | 'quoted' | 'accepted';
}

export interface VendorOrder {
  id: string;
  orderId: string;
  createdAt: string;
  vehicles: VendorVehicle[];
}