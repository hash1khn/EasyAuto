import { Vehicle } from './orders';

interface SourcerReview {
  inspectionImages: string[];
  reviewNotes: string;
  acceptedAt: string;
}

interface VendorQuote {
  id: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorEmail: string;
  price: number;
  condition: string;
  warranty: string;
  imageUrl?: string;
  vendorNotes?: string;
  submittedAt: string;
  isAccepted: boolean;
  sourcerReview?: SourcerReview;
}

interface Part {
  id: string;
  partName: string;
  quantity: number;
  buyerNotes: string;
  requestedCondition: string;
  requestedWarranty?: string;
  maxBudget?: number;
  partNumber?: string;
  vendorQuotes: VendorQuote[];
  vehicle: Vehicle;
}

interface Order {
  id: string;
  orderId: string;
  createdAt: string;
  vehicles: Vehicle[];
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    maxBudget?: number;
  };
}