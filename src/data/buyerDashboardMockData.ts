// Mock data for the buyer dashboard prototype

// Status types
export type PartStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type GroupStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

// Part type
export interface Part {
  id: string;
  orderId: string;
  vehicleId: string;
  orderDate: string;
  partNumber?: string;
  name: string;
  status: PartStatus;
  price: number;
  customerBudget?: number;
  deliveryCharge: number;
  condition: string;
  warranty: string;
  quantity: number;
  notes: string;
  sourcerPhotos: string[];
  sourcer?: {
    name: string;
    uploadedImageUrl: string;
    sourcerNotes?: string;
  };
  deliveryPhoto?: string;
  deliveryContact: string;
  expectedDeliveryDate?: string;
  paymentMethod?: string;
  refundStatus?: string;
}

// Vehicle type
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  buyerNotes?: string;
}

// Generate mock data
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    make: 'Toyota',
    model: 'Prado',
    year: 2014,
    vin: 'JTEBU3FJ3E5012345',
  },
  {
    id: 'v2',
    make: 'Ford',
    model: 'F-150',
    year: 2018,
    vin: '1FTFW1EG1JFD12345',
  },
  {
    id: 'v3',
    make: 'Nissan',
    model: 'Patrol',
    year: 2020,
    vin: 'JN8BY2NY1L9123456',
  },
  {
    id: 'v4',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2017,
    vin: '1GNSCBKC1HR123456',
  },
  {
    id: 'v5',
    make: 'Hyundai',
    model: 'Santa Fe',
    year: 2016,
    vin: 'KM8SNDHF1GU123456',
  },
  {
    id: 'v6',
    make: 'Mercedes-Benz',
    model: 'GLE 450',
    year: 2019,
    vin: 'WDC1671591A123456',
  },
  {
    id: 'v7',
    make: 'BMW',
    model: 'X5',
    year: 2021,
    vin: '5UXCR6C56KLL12345',
  },
  {
    id: 'v8',
    make: 'Audi',
    model: 'Q7',
    year: 2019,
    vin: 'WA1VAAF75JD123456',
  },
  {
    id: 'v9',
    make: 'Lexus',
    model: 'RX 350',
    year: 2020,
    vin: '2T2ZZMCA0LC123456',
  },
  {
    id: 'v10',
    make: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2018,
    vin: 'SALGS2TF8JA123456',
  },
];

// Mock image URLs for parts
const mockImageUrls = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000',
  'https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?q=80&w=1000',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1000',
];

// Generate mock parts - 5 comprehensive test orders
export const mockParts: Part[] = [
  // ===== ORDER 1: Single Vehicle (Toyota Prado) - 3 Parts =====
  {
    id: 'part-001',
    orderId: 'ORD-001',
    vehicleId: 'v1',
    orderDate: '2025-06-30',
    partNumber: 'RF-3983',
    name: 'Radiator Fan',
    status: 'DELIVERED',
    price: 280,
    customerBudget: 300,
    deliveryCharge: 50,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'Need fast delivery, urgent replacement.',
    sourcerPhotos: [mockImageUrls[0], mockImageUrls[1]],
    sourcer: {
      name: "Auto Parts Express",
      uploadedImageUrl: mockImageUrls[0],
      sourcerNotes: "Genuine OEM part, in stock and ready for immediate delivery."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-02',
  },
  {
    id: 'part-002',
    orderId: 'ORD-001',
    vehicleId: 'v1',
    orderDate: '2025-06-30',
    partNumber: 'AC-COMP-001',
    name: 'Air Conditioning Compressor',
    status: 'DELIVERED',
    price: 750,
    customerBudget: 800,
    deliveryCharge: 0,
    condition: 'Refurbished',
    warranty: '6 Months',
    quantity: 1,
    notes: 'Must be compatible with 2014 model.',
    sourcerPhotos: [mockImageUrls[2]],
    sourcer: {
      name: "Cooling Systems Pro",
      uploadedImageUrl: mockImageUrls[2],
      sourcerNotes: "Professionally refurbished, tested and certified."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-02',
  },
  {
    id: 'part-003',
    orderId: 'ORD-001',
    vehicleId: 'v1',
    orderDate: '2025-06-30',
    partNumber: 'BP-TOY-001',
    name: 'Brake Pads (Front)',
    status: 'DELIVERED',
    price: 180,
    customerBudget: 200,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 2,
    notes: 'OEM quality preferred.',
    sourcerPhotos: [mockImageUrls[3]],
    sourcer: {
      name: "Brake Masters",
      uploadedImageUrl: mockImageUrls[3],
      sourcerNotes: "Premium ceramic brake pads, excellent stopping power."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-02',
  },
  {
    id: 'part-003-refunded',
    orderId: 'ORD-001',
    vehicleId: 'v1',
    orderDate: '2025-06-30',
    partNumber: 'BP-TOY-001-R',
    name: 'Brake Pads (Front)',
    status: 'REFUNDED',
    price: 180,
    customerBudget: 200,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1, // Only one of the two was refunded
    notes: 'One set of brake pads was damaged in transit.',
    sourcerPhotos: [mockImageUrls[3]],
    sourcer: {
      name: "Brake Masters",
      uploadedImageUrl: mockImageUrls[3],
      sourcerNotes: "Premium ceramic brake pads."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-02',
    refundStatus: "Refunded by AM on 2025-07-03"
  },

  // ===== ORDER 2: Single Vehicle (Ford F-150) - 4 Parts =====
  {
    id: 'part-004',
    orderId: 'ORD-002',
    vehicleId: 'v2',
    orderDate: '2025-06-28',
    partNumber: 'BP-2044',
    name: 'Brake Pads',
    status: 'DELIVERED',
    price: 420,
    customerBudget: 450,
    deliveryCharge: 50,
    condition: 'New',
    warranty: '2 Years',
    quantity: 2,
    notes: 'Heavy duty brake pads for towing.',
    sourcerPhotos: [mockImageUrls[0], mockImageUrls[1]],
    sourcer: {
      name: "Truck Parts Plus",
      uploadedImageUrl: mockImageUrls[0],
      sourcerNotes: "Heavy-duty brake pads designed for F-150 towing capacity."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-30',
  },
  {
    id: 'part-005',
    orderId: 'ORD-002',
    vehicleId: 'v2',
    orderDate: '2025-06-28',
    partNumber: 'OIL-FIL-002',
    name: 'Oil Filter',
    status: 'DELIVERED',
    price: 45,
    customerBudget: 50,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 3,
    notes: 'Synthetic oil compatible.',
    sourcerPhotos: [mockImageUrls[2]],
    sourcer: {
      name: "Filter World",
      uploadedImageUrl: mockImageUrls[2],
      sourcerNotes: "High-quality synthetic oil filter, extended service intervals."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-30',
  },
  {
    id: 'part-006',
    orderId: 'ORD-002',
    vehicleId: 'v2',
    orderDate: '2025-06-28',
    partNumber: 'SPARK-003',
    name: 'Spark Plugs',
    status: 'DELIVERED',
    price: 120,
    customerBudget: 150,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 8,
    notes: 'Iridium spark plugs for better performance.',
    sourcerPhotos: [mockImageUrls[3]],
    sourcer: {
      name: "Ignition Pro",
      uploadedImageUrl: mockImageUrls[3],
      sourcerNotes: "Iridium spark plugs for improved fuel efficiency and performance."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-30',
  },
  {
    id: 'part-007',
    orderId: 'ORD-002',
    vehicleId: 'v2',
    orderDate: '2025-06-28',
    partNumber: 'AIR-FIL-004',
    name: 'Air Filter',
    status: 'DELIVERED',
    price: 35,
    customerBudget: 40,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'High-flow air filter.',
    sourcerPhotos: [mockImageUrls[4]],
    sourcer: {
      name: "Air Flow Systems",
      uploadedImageUrl: mockImageUrls[4],
      sourcerNotes: "High-flow air filter for improved engine breathing."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-30',
  },

  // ===== ORDER 3: Two Vehicles (Nissan Patrol + Chevrolet Tahoe) - 5 Parts Total =====
  {
    id: 'part-008',
    orderId: 'ORD-003',
    vehicleId: 'v3',
    orderDate: '2025-06-25',
    partNumber: 'SUSP-001',
    name: 'Suspension Strut',
    status: 'DELIVERED',
    price: 650,
    customerBudget: 700,
    deliveryCharge: 50,
    condition: 'New',
    warranty: '2 Years',
    quantity: 2,
    notes: 'Front suspension struts.',
    sourcerPhotos: [mockImageUrls[0]],
    sourcer: {
      name: "Suspension Kings",
      uploadedImageUrl: mockImageUrls[0],
      sourcerNotes: "OEM replacement struts, perfect fit for Patrol."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-27',
  },
  {
    id: 'part-009',
    orderId: 'ORD-003',
    vehicleId: 'v3',
    orderDate: '2025-06-25',
    partNumber: 'WHEEL-002',
    name: 'Wheel Bearing',
    status: 'DELIVERED',
    price: 180,
    customerBudget: 200,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 2,
    notes: 'Front wheel bearings.',
    sourcerPhotos: [mockImageUrls[1]],
    sourcer: {
      name: "Bearing World",
      uploadedImageUrl: mockImageUrls[1],
      sourcerNotes: "High-quality wheel bearings, sealed for life."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-27',
  },
  {
    id: 'part-010',
    orderId: 'ORD-003',
    vehicleId: 'v4',
    orderDate: '2025-06-25',
    partNumber: 'TRAN-003',
    name: 'Transmission Filter',
    status: 'DELIVERED',
    price: 95,
    customerBudget: 100,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'Automatic transmission filter.',
    sourcerPhotos: [mockImageUrls[2]],
    sourcer: {
      name: "Transmission Pro",
      uploadedImageUrl: mockImageUrls[2],
      sourcerNotes: "Genuine transmission filter for smooth shifting."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-27',
  },
  {
    id: 'part-011',
    orderId: 'ORD-003',
    vehicleId: 'v4',
    orderDate: '2025-06-25',
    partNumber: 'FUEL-004',
    name: 'Fuel Filter',
    status: 'DELIVERED',
    price: 45,
    customerBudget: 50,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'In-line fuel filter.',
    sourcerPhotos: [mockImageUrls[3]],
    sourcer: {
      name: "Fuel Systems",
      uploadedImageUrl: mockImageUrls[3],
      sourcerNotes: "High-efficiency fuel filter for clean fuel delivery."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-27',
  },
  {
    id: 'part-012',
    orderId: 'ORD-003',
    vehicleId: 'v4',
    orderDate: '2025-06-25',
    partNumber: 'BELT-005',
    name: 'Serpentine Belt',
    status: 'DELIVERED',
    price: 75,
    customerBudget: 80,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'Gates belt preferred.',
    sourcerPhotos: [mockImageUrls[4]],
    sourcer: {
      name: "Belt Masters",
      uploadedImageUrl: mockImageUrls[4],
      sourcerNotes: "Gates serpentine belt, premium quality for long life."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-27',
  },

  // ===== ORDER 4: Three Vehicles (Hyundai Santa Fe + Mercedes GLE + BMW X5) - 6 Parts Total =====
  {
    id: 'part-013',
    orderId: 'ORD-004',
    vehicleId: 'v5',
    orderDate: '2025-06-20',
    partNumber: 'ECU-HY-001',
    name: 'Engine Control Unit',
    status: 'DELIVERED',
    price: 1200,
    customerBudget: 1300,
    deliveryCharge: 50,
    condition: 'Refurbished',
    warranty: '6 Months',
    quantity: 1,
    notes: 'Programmed for Santa Fe.',
    sourcerPhotos: [mockImageUrls[0]],
    sourcer: {
      name: "ECU Specialists",
      uploadedImageUrl: mockImageUrls[0],
      sourcerNotes: "Refurbished ECU, tested and programmed for your vehicle."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-22',
  },
  {
    id: 'part-014',
    orderId: 'ORD-004',
    vehicleId: 'v5',
    orderDate: '2025-06-20',
    partNumber: 'SENSOR-HY-002',
    name: 'Oxygen Sensor',
    status: 'DELIVERED',
    price: 180,
    customerBudget: 200,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 2,
    notes: 'Upstream sensors.',
    sourcerPhotos: [mockImageUrls[1]],
    sourcer: {
      name: "Sensor World",
      uploadedImageUrl: mockImageUrls[1],
      sourcerNotes: "OEM oxygen sensors for accurate fuel mixture control."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-22',
  },
  {
    id: 'part-015',
    orderId: 'ORD-004',
    vehicleId: 'v6',
    orderDate: '2025-06-20',
    partNumber: 'MB-NAV-003',
    name: 'Navigation System',
    status: 'DELIVERED',
    price: 2500,
    customerBudget: 2800,
    deliveryCharge: 0,
    condition: 'Used',
    warranty: '3 Months',
    quantity: 1,
    notes: 'With latest maps.',
    sourcerPhotos: [mockImageUrls[2]],
    sourcer: {
      name: "Luxury Electronics",
      uploadedImageUrl: mockImageUrls[2],
      sourcerNotes: "Factory navigation system with updated maps and software."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-22',
  },
  {
    id: 'part-016',
    orderId: 'ORD-004',
    vehicleId: 'v7',
    orderDate: '2025-06-20',
    partNumber: 'BMW-LEATHER-004',
    name: 'Leather Seat Cover',
    status: 'DELIVERED',
    price: 450,
    customerBudget: 500,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 2,
    notes: 'Front seats only.',
    sourcerPhotos: [mockImageUrls[3]],
    sourcer: {
      name: "Leather Masters",
      uploadedImageUrl: mockImageUrls[3],
      sourcerNotes: "Premium leather seat covers, custom fit for X5."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-22',
  },
  {
    id: 'part-017',
    orderId: 'ORD-004',
    vehicleId: 'v7',
    orderDate: '2025-06-20',
    partNumber: 'BMW-WHEEL-005',
    name: 'Alloy Wheel',
    status: 'DELIVERED',
    price: 800,
    customerBudget: 900,
    deliveryCharge: 0,
    condition: 'Used',
    warranty: '3 Months',
    quantity: 1,
    notes: '20-inch wheel.',
    sourcerPhotos: [mockImageUrls[4]],
    sourcer: {
      name: "Wheel World",
      uploadedImageUrl: mockImageUrls[4],
      sourcerNotes: "Original BMW alloy wheel, excellent condition."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-22',
  },
  {
    id: 'part-018',
    orderId: 'ORD-004',
    vehicleId: 'v7',
    orderDate: '2025-06-20',
    partNumber: 'BMW-TIRE-006',
    name: 'Tire',
    status: 'DELIVERED',
    price: 350,
    customerBudget: 400,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'Run-flat tire.',
    sourcerPhotos: [mockImageUrls[0]],
    sourcer: {
      name: "Tire Pro",
      uploadedImageUrl: mockImageUrls[0],
      sourcerNotes: "Premium run-flat tire, perfect for BMW X5."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-22',
  },

  // ===== ORDER 5: Two Vehicles (Audi Q7 + Lexus RX) - 4 Parts Total =====
  {
    id: 'part-019',
    orderId: 'ORD-005',
    vehicleId: 'v8',
    orderDate: '2025-06-15',
    partNumber: 'AUDI-LIGHT-001',
    name: 'LED Headlight',
    status: 'DELIVERED',
    price: 1200,
    customerBudget: 1400,
    deliveryCharge: 50,
    condition: 'New',
    warranty: '2 Years',
    quantity: 1,
    notes: 'Left side headlight.',
    sourcerPhotos: [mockImageUrls[1]],
    sourcer: {
      name: "Lighting Pro",
      uploadedImageUrl: mockImageUrls[1],
      sourcerNotes: "OEM LED headlight with adaptive lighting system."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-17',
  },
  {
    id: 'part-020',
    orderId: 'ORD-005',
    vehicleId: 'v8',
    orderDate: '2025-06-15',
    partNumber: 'AUDI-BRAKE-002',
    name: 'Brake Rotor',
    status: 'DELIVERED',
    price: 280,
    customerBudget: 300,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 2,
    notes: 'Front brake rotors.',
    sourcerPhotos: [mockImageUrls[2]],
    sourcer: {
      name: "Brake Masters",
      uploadedImageUrl: mockImageUrls[2],
      sourcerNotes: "Premium brake rotors, drilled and slotted for better cooling."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-17',
  },
  {
    id: 'part-021',
    orderId: 'ORD-005',
    vehicleId: 'v9',
    orderDate: '2025-06-15',
    partNumber: 'LEXUS-NAV-003',
    name: 'Navigation Update',
    status: 'DELIVERED',
    price: 150,
    customerBudget: 200,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'Latest maps and software.',
    sourcerPhotos: [mockImageUrls[3]],
    sourcer: {
      name: "Navigation Plus",
      uploadedImageUrl: mockImageUrls[3],
      sourcerNotes: "Latest navigation update with new POIs and improved routing."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-17',
  },
  {
    id: 'part-022',
    orderId: 'ORD-005',
    vehicleId: 'v9',
    orderDate: '2025-06-15',
    partNumber: 'LEXUS-CAM-004',
    name: 'Backup Camera',
    status: 'DELIVERED',
    price: 320,
    customerBudget: 350,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'HD backup camera.',
    sourcerPhotos: [mockImageUrls[4]],
    sourcer: {
      name: "Camera Systems",
      uploadedImageUrl: mockImageUrls[4],
      sourcerNotes: "HD backup camera with night vision and parking guidelines."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-06-17',
  },

  // ===== DATA FOR ACTIVE DASHBOARD (NON-DELIVERED) =====

  // --- Vehicle v1: Toyota Prado (PENDING) ---
  {
    id: 'part-200',
    orderId: 'ORD-006',
    vehicleId: 'v1',
    orderDate: '2025-07-10',
    name: 'Front Grille',
    status: 'PENDING',
    price: 0,
    customerBudget: 450,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: 'Chrome finish.',
    sourcerPhotos: [],
    deliveryContact: '',
    expectedDeliveryDate: '',
  },

  // --- Vehicle v2: Ford F-150 (CONFIRMED) ---
  {
    id: 'part-201',
    orderId: 'ORD-007',
    vehicleId: 'v2',
    orderDate: '2025-07-11',
    name: 'Tail Light Assembly',
    status: 'CONFIRMED',
    price: 320,
    deliveryCharge: 20,
    condition: 'Used - Excellent',
    warranty: '90 Days',
    quantity: 1,
    notes: 'Right side only.',
    sourcerPhotos: [mockImageUrls[0]],
    sourcer: {
      name: "Truck Lighting Co.",
      uploadedImageUrl: mockImageUrls[0],
      sourcerNotes: "OEM part, tested and working."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-15',
  },
  
  // --- Vehicle v3: Nissan Patrol (OUT_FOR_DELIVERY) ---
  {
    id: 'part-202',
    orderId: 'ORD-008',
    vehicleId: 'v3',
    orderDate: '2025-07-09',
    name: 'Battery',
    status: 'OUT_FOR_DELIVERY',
    price: 450,
    deliveryCharge: 25,
    condition: 'New',
    warranty: '2 Years',
    quantity: 1,
    notes: 'AGM battery required.',
    sourcerPhotos: [mockImageUrls[1]],
    sourcer: {
      name: "Power Source UAE",
      uploadedImageUrl: mockImageUrls[1],
      sourcerNotes: "High-cranking amp AGM battery."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-12',
  },
   {
    id: 'part-203',
    orderId: 'ORD-008',
    vehicleId: 'v3',
    orderDate: '2025-07-09',
    name: 'Alternator',
    status: 'CONFIRMED',
    price: 650,
    deliveryCharge: 0,
    condition: 'Refurbished',
    warranty: '6 Months',
    quantity: 1,
    notes: 'Must be 2020 Patrol compatible.',
     sourcerPhotos: [mockImageUrls[2]],
    sourcer: {
      name: "Auto Electricians",
      uploadedImageUrl: mockImageUrls[2],
      sourcerNotes: "Tested and certified refurbished unit."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-14',
  },

  // ===== ORDER 6: Active - Single Vehicle (BMW X5) - PENDING =====
  {
    id: 'part-022',
    orderId: 'ORD-006',
    vehicleId: 'v7',
    orderDate: '2025-07-28',
    name: 'Front Bumper Assembly',
    status: 'PENDING',
    price: 0, // No price yet
    customerBudget: 2500,
    deliveryCharge: 0,
    condition: 'New',
    warranty: 'N/A',
    quantity: 1,
    notes: 'Looking for OEM or high-quality aftermarket bumper. Color matching required.',
    sourcerPhotos: [],
    deliveryContact: '+971 5X XXX XXXX',
  },

  // ===== ORDER 7: Active - Single Vehicle (Audi Q7) - CONFIRMED =====
  {
    id: 'part-023',
    orderId: 'ORD-007',
    vehicleId: 'v8',
    orderDate: '2025-07-27',
    partNumber: 'AQ7-TL-001',
    name: 'Tail Light Assembly',
    status: 'CONFIRMED',
    price: 650,
    customerBudget: 700,
    deliveryCharge: 50,
    condition: 'Used - A Grade',
    warranty: '6 Months',
    quantity: 1,
    notes: 'Right side only. Must be fully functional.',
    sourcerPhotos: [mockImageUrls[4]],
    sourcer: {
      name: "German Auto Lights",
      uploadedImageUrl: mockImageUrls[4],
      sourcerNotes: "Excellent condition, fully tested and working. Minor cosmetic wear."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-30',
  },
  {
    id: 'part-024',
    orderId: 'ORD-007',
    vehicleId: 'v8',
    orderDate: '2025-07-27',
    partNumber: 'AQ7-WG-002',
    name: 'Window Regulator (Front Left)',
    status: 'CONFIRMED',
    price: 300,
    customerBudget: 350,
    deliveryCharge: 0,
    condition: 'New',
    warranty: '1 Year',
    quantity: 1,
    notes: '',
    sourcerPhotos: [mockImageUrls[1]],
    sourcer: {
      name: "Parts Planet",
      uploadedImageUrl: mockImageUrls[1],
      sourcerNotes: "Brand new OEM part."
    },
    deliveryContact: '+971 5X XXX XXXX',
    expectedDeliveryDate: '2025-07-30',
  },
];

// Helper function to get vehicle by ID
export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find(vehicle => vehicle.id === id);
};

// Helper function to get parts by vehicle ID
export const getPartsByVehicleId = (vehicleId: string): Part[] => {
  return mockParts.filter(part => part.vehicleId === vehicleId);
};

// Helper function to get group status based on parts
export const getGroupStatus = (parts: Part[]): GroupStatus => {
  const allDelivered = parts.every(p => p.status === 'DELIVERED' || p.status === 'REFUNDED');
  if (allDelivered) return 'COMPLETE';
  
  const someInProgress = parts.some(p => p.status === 'CONFIRMED' || p.status === 'OUT_FOR_DELIVERY');
  if (someInProgress) return 'IN_PROGRESS';
  
  const allCancelled = parts.every(p => p.status === 'CANCELLED');
  if (allCancelled) return 'CANCELLED';

  return 'NEW';
};

// Helper function to get delivered or refunded parts
export const getCompletedParts = (): Part[] => {
  return mockParts.filter(part => part.status === 'DELIVERED' || part.status === 'REFUNDED');
};

// Helper function to group completed parts by delivery date
export const getCompletedPartsByDate = () => {
  const completedParts = getCompletedParts();
  
  // Group by delivery date
  const grouped = completedParts.reduce((acc, part) => {
    if (!part.expectedDeliveryDate) return acc;
    
    if (!acc[part.expectedDeliveryDate]) {
      acc[part.expectedDeliveryDate] = [];
    }
    
    acc[part.expectedDeliveryDate].push(part);
    return acc;
  }, {} as Record<string, Part[]>);
  
  // Convert to array and sort by date (newest first)
  return Object.entries(grouped)
    .map(([date, parts]) => ({ date, parts }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Helper function to get parts by order ID
export const getPartsByOrderId = (orderId: string): Part[] => {
  return mockParts.filter((part) => part.orderId === orderId);
}; 