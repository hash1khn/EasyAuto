export interface PartConditionPreference {
  condition: PartCondition
}

export interface VendorQuote {
  id: string
  vendorName: string
  vendorAddress: string
  vendorPhone: string
  vendorEmail: string
  price: number
  condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair"
  warranty: string
  imageUrls?: string[]
  vendorNotes?: string
  submittedAt: string
  isAccepted?: boolean
  isSourcerProvided?: boolean
  sourcerNotes?: string
  status: "pending" | "accepted" | "rejected"
  sourcerReview?: {
    inspectionImages: string[]
    reviewNotes: string
    acceptedAt: string
  }
  vendor_info?: {
    name?: string
    address?: string
    phone?: string
    email?: string
    sourcerNotes?: string
  }
}

export interface Part {
  id: string
  partName: string
  partNumber?: string
  quantity: number
  description?: string
  estimatedBudget?: number
  vendorQuotes: VendorQuote[]
  inspectionImages?: string[]
  inspectedBy?: string
  inspectedAt?: string
  part_condition_preferences?: PartConditionPreference[]
  conditions?: PartCondition[]
  photos?: string[]
  imageFiles?: File[]
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  vin?: string
}

export interface UserProfile {
  id: string
  fullName: string
  whatsappNumber: string
  location: string
  deliveryAddress?: string
}

export interface Order {
  id: string
  userId: string
  status: string
  createdAt: string
  userProfile: UserProfile
  parts: (Part & { vehicle: Vehicle })[]
}

export type PartCondition = "new" | "used_excellent" | "used_good" | "used_fair"

export interface ReviewForm {
  inspectionImages: File[]
  reviewNotes: string
  customerPaid: string
  vendorPrice: string
}

export interface AddQuoteForm {
  vendorName: string
  vendorAddress: string
  vendorPhone: string
  vendorEmail: string
  vendorPrice: string
  customerPaid: string
  condition: string
  warranty: string
  imageFiles: File[]
  vendorNotes: string
}
