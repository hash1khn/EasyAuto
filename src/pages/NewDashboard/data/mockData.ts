export type PartStatus = 
  | 'PENDING_REVIEW'
  | 'CONFIRMED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type GroupStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

export type Condition = 'NEW' | 'USED_EXCELLENT' | 'USED_GOOD' | 'USED_FAIR';
export type Warranty = 'NONE' | '7_DAYS' | '30_DAYS';

export interface Part {
  id: string;
  name: string;
  status: PartStatus;
  expectedDeliveryDate: string | null;
  sourcerPhotos: string[];
  condition: Condition;
  warranty: Warranty;
  notes: string;
  price: number;
  deliveryFee: number;
  serviceFee: number;
  partNumber?: string;
  deliveryContact: string;
  orderId: string;
  orderDate: string;
  vehicleId: string;
  deliveryDate: string | null;
  refundStatus?: string;
  paymentMethod?: string;
  proofOfPickup?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
}

export interface Order {
  id: string;
  date: string;
  vehicleId: string;
  parts: string[];
}

// Mock image URLs
const mockImageUrls = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000',
  'https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?q=80&w=1000',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1000',
];

// Mock vehicles
export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    make: 'Ford',
    model: 'F-150',
    year: 2018,
    vin: '1FTEW1E53JFD02658'
  },
  {
    id: 'v2',
    make: 'Mercedes',
    model: 'C-Class',
    year: 2022,
    vin: 'WDDWJ8GB7KF684356'
  },
  {
    id: 'v3',
    make: 'Toyota',
    model: 'Camry',
    year: 2019,
    vin: '4T1BF1FK7HU253925'
  },
  {
    id: 'v4',
    make: 'BMW',
    model: '3 Series',
    year: 2021,
    vin: 'WBA5R1C50LFH45234'
  }
];

// Mock parts
export const parts: Part[] = [
  // Ford F-150 parts (Order 1)
  {
    id: 'p1',
    name: 'Shock Absorbers (Pair)',
    status: 'OUT_FOR_DELIVERY',
    expectedDeliveryDate: '2025-06-25',
    sourcerPhotos: [mockImageUrls[0], mockImageUrls[1]],
    condition: 'NEW',
    warranty: '30_DAYS',
    notes: 'Heavy duty shock absorbers',
    price: 280,
    deliveryFee: 30,
    serviceFee: 15,
    partNumber: 'F150-SA-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-003',
    orderDate: '2025-06-18',
    vehicleId: 'v1',
    deliveryDate: null,
    proofOfPickup: mockImageUrls[3]
  },
  {
    id: 'p2',
    name: 'Brake Pads',
    status: 'CONFIRMED',
    expectedDeliveryDate: '2025-06-28',
    sourcerPhotos: [mockImageUrls[2], mockImageUrls[4]],
    condition: 'NEW',
    warranty: '30_DAYS',
    notes: 'Front brake pads, ceramic',
    price: 120,
    deliveryFee: 20,
    serviceFee: 10,
    partNumber: 'F150-BP-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-003',
    orderDate: '2025-06-18',
    vehicleId: 'v1',
    deliveryDate: null
  },
  {
    id: 'p3',
    name: 'Air Filter',
    status: 'REFUNDED',
    expectedDeliveryDate: '2025-06-25',
    sourcerPhotos: [mockImageUrls[4]],
    condition: 'NEW',
    warranty: '7_DAYS',
    notes: 'Refunded due to wrong size',
    price: 50,
    deliveryFee: 10,
    serviceFee: 5,
    partNumber: 'F150-AF-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-003',
    orderDate: '2025-06-18',
    vehicleId: 'v1',
    deliveryDate: '2025-06-22',
    refundStatus: 'Completed',
    paymentMethod: 'Credit Card'
  },

  // Mercedes C-Class parts (Order 2)
  {
    id: 'p4',
    name: 'Headlight Assembly',
    status: 'DELIVERED',
    expectedDeliveryDate: '2025-06-15',
    sourcerPhotos: [mockImageUrls[1], mockImageUrls[3]],
    condition: 'NEW',
    warranty: '30_DAYS',
    notes: 'LED headlight assembly, right side',
    price: 450,
    deliveryFee: 30,
    serviceFee: 20,
    partNumber: 'MERC-HL-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-005',
    orderDate: '2025-06-10',
    vehicleId: 'v2',
    deliveryDate: '2025-06-14',
    paymentMethod: 'Credit Card',
    proofOfPickup: mockImageUrls[2]
  },
  {
    id: 'p5',
    name: 'Oil Filter',
    status: 'DELIVERED',
    expectedDeliveryDate: '2025-06-15',
    sourcerPhotos: [mockImageUrls[0]],
    condition: 'NEW',
    warranty: '7_DAYS',
    notes: 'Genuine Mercedes oil filter',
    price: 35,
    deliveryFee: 10,
    serviceFee: 5,
    partNumber: 'MERC-OF-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-005',
    orderDate: '2025-06-10',
    vehicleId: 'v2',
    deliveryDate: '2025-06-14',
    paymentMethod: 'Credit Card',
    proofOfPickup: mockImageUrls[2]
  },
  {
    id: 'p6',
    name: 'Cabin Air Filter',
    status: 'DELIVERED',
    expectedDeliveryDate: '2025-06-15',
    sourcerPhotos: [mockImageUrls[4]],
    condition: 'NEW',
    warranty: '7_DAYS',
    notes: 'HEPA cabin air filter',
    price: 25,
    deliveryFee: 10,
    serviceFee: 5,
    partNumber: 'MERC-CAF-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-005',
    orderDate: '2025-06-10',
    vehicleId: 'v2',
    deliveryDate: '2025-06-14',
    paymentMethod: 'Credit Card',
    proofOfPickup: mockImageUrls[2]
  },

  // Toyota Camry parts (Order 3)
  {
    id: 'p7',
    name: 'Alternator',
    status: 'CANCELLED',
    expectedDeliveryDate: '2025-07-01',
    sourcerPhotos: [],
    condition: 'NEW',
    warranty: 'NONE',
    notes: 'Cancelled due to unavailability',
    price: 180,
    deliveryFee: 20,
    serviceFee: 10,
    partNumber: 'TOY-ALT-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-001',
    orderDate: '2025-06-20',
    vehicleId: 'v3',
    deliveryDate: null
  },
  {
    id: 'p8',
    name: 'Spark Plugs (Set of 4)',
    status: 'CANCELLED',
    expectedDeliveryDate: '2025-07-01',
    sourcerPhotos: [],
    condition: 'NEW',
    warranty: 'NONE',
    notes: 'Cancelled due to unavailability',
    price: 60,
    deliveryFee: 10,
    serviceFee: 5,
    partNumber: 'TOY-SP-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-001',
    orderDate: '2025-06-20',
    vehicleId: 'v3',
    deliveryDate: null
  },
  {
    id: 'p9',
    name: 'Wiper Blades',
    status: 'CANCELLED',
    expectedDeliveryDate: '2025-07-01',
    sourcerPhotos: [],
    condition: 'NEW',
    warranty: 'NONE',
    notes: 'Cancelled due to unavailability',
    price: 45,
    deliveryFee: 10,
    serviceFee: 5,
    partNumber: 'TOY-WB-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-001',
    orderDate: '2025-06-20',
    vehicleId: 'v3',
    deliveryDate: null
  },

  // BMW 3 Series parts (for receipts)
  {
    id: 'p10',
    name: 'Brake Discs (Pair)',
    status: 'REFUNDED',
    expectedDeliveryDate: '2025-06-10',
    sourcerPhotos: [mockImageUrls[1], mockImageUrls[2]],
    condition: 'NEW',
    warranty: '30_DAYS',
    notes: 'Refunded due to customer request',
    price: 320,
    deliveryFee: 25,
    serviceFee: 15,
    partNumber: 'BMW-BD-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-004',
    orderDate: '2025-06-05',
    vehicleId: 'v4',
    deliveryDate: '2025-06-09',
    refundStatus: 'Completed',
    paymentMethod: 'Credit Card',
    proofOfPickup: mockImageUrls[0]
  },
  {
    id: 'p11',
    name: 'Engine Oil (5L)',
    status: 'REFUNDED',
    expectedDeliveryDate: '2025-06-10',
    sourcerPhotos: [mockImageUrls[3]],
    condition: 'NEW',
    warranty: 'NONE',
    notes: 'Refunded due to customer request',
    price: 95,
    deliveryFee: 15,
    serviceFee: 10,
    partNumber: 'BMW-EO-2023',
    deliveryContact: '+971 5X XXX XXXX',
    orderId: 'ORD-004',
    orderDate: '2025-06-05',
    vehicleId: 'v4',
    deliveryDate: '2025-06-09',
    refundStatus: 'Completed',
    paymentMethod: 'Credit Card',
    proofOfPickup: mockImageUrls[0]
  }
];

// Mock orders
export const orders: Order[] = [
  {
    id: 'ORD-003',
    date: '2025-06-18',
    vehicleId: 'v1',
    parts: ['p1', 'p2', 'p3']
  },
  {
    id: 'ORD-005',
    date: '2025-06-10',
    vehicleId: 'v2',
    parts: ['p4', 'p5', 'p6']
  },
  {
    id: 'ORD-001',
    date: '2025-06-20',
    vehicleId: 'v3',
    parts: ['p7', 'p8', 'p9']
  },
  {
    id: 'ORD-004',
    date: '2025-06-05',
    vehicleId: 'v4',
    parts: ['p10', 'p11']
  }
];

// Helper functions
export const getVehicleById = (id: string): Vehicle | undefined => {
  return vehicles.find(vehicle => vehicle.id === id);
};

export const getPartById = (id: string): Part | undefined => {
  return parts.find(part => part.id === id);
};

export const getPartsByOrderId = (orderId: string): Part[] => {
  return parts.filter(part => part.orderId === orderId);
};

export const getPartsByVehicleId = (vehicleId: string): Part[] => {
  return parts.filter(part => part.vehicleId === vehicleId);
};

export const getOrderById = (id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByVehicleId = (vehicleId: string): Order[] => {
  return orders.filter(order => order.vehicleId === vehicleId);
};

export const getGroupStatus = (parts: Part[]): GroupStatus => {
  if (parts.every(part => part.status === 'CANCELLED')) {
    return 'CANCELLED';
  }

  if (parts.every(part => part.status === 'DELIVERED' || part.status === 'REFUNDED' || part.status === 'CANCELLED')) {
    return 'COMPLETE';
  }

  if (parts.some(part => part.status === 'CONFIRMED' || part.status === 'OUT_FOR_DELIVERY')) {
    return 'IN_PROGRESS';
  }

  return 'NEW';
};

export const getDeliveredOrRefundedParts = (): Part[] => {
  return parts.filter(part => part.status === 'DELIVERED' || part.status === 'REFUNDED');
};

export const getCompletedPartsByDate = () => {
  const completedParts = getDeliveredOrRefundedParts();
  
  // Group by delivery date
  const grouped = completedParts.reduce((acc, part) => {
    if (!part.deliveryDate) return acc;
    
    if (!acc[part.deliveryDate]) {
      acc[part.deliveryDate] = [];
    }
    
    acc[part.deliveryDate].push(part);
    return acc;
  }, {} as Record<string, Part[]>);
  
  // Convert to array and sort by date (newest first)
  return Object.entries(grouped)
    .map(([date, parts]) => ({ date, parts }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const formatCurrency = (amount: number): string => {
  return `AED ${amount.toFixed(2)}`;
};

export const getConditionText = (condition: Condition): string => {
  switch (condition) {
    case 'NEW':
      return 'New';
    case 'USED_EXCELLENT':
      return 'Used - Excellent';
    case 'USED_GOOD':
      return 'Used - Good';
    case 'USED_FAIR':
      return 'Used - Fair';
    default:
      return 'Unknown';
  }
};

export const getWarrantyText = (warranty: Warranty): string => {
  switch (warranty) {
    case 'NONE':
      return 'None';
    case '7_DAYS':
      return '7 Days';
    case '30_DAYS':
      return '30 Days';
    default:
      return 'Unknown';
  }
}; 