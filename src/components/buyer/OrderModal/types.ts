export type PartCondition = 'used' | 'new_oem' | 'new_aftermarket' | 'any';


export interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
}

export interface Part {
  vehicleIndex: number;
  partName: string;
  partNumber: string;
  description: string;
  quantity: number;
  estimatedBudget?: string;
  conditions?: PartCondition[]; // Add this line


} 