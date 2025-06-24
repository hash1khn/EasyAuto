export type DeliveryStatus = 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface DeliveryPart {
    id: string;
    partName: string;
    partNumber: string;
    condition: 'New' | 'Used - Excellent' | 'Used - Good';
    imageUrls: string[];
    status: DeliveryStatus;
    quantity: number;
    vendorId: string;
    vendorName: string;
    vendorAddress: string;
    vendorPhone: string;
    sourcerName: string;
    sourcerId: string;
    sourcerPhone: string;
    vendorLat: number;
    vendorLng: number;
}

export interface DeliveryVehicle {
    id: string;
    vehicleName: string;
    vin: string;
    parts: DeliveryPart[];
}

export interface DeliveryOrder {
    id: string; // e.g. ORD-009
    buyerName: string;
    deliveryAddress: string;
    phone: string;
    vehicles: DeliveryVehicle[];
}

export const mockDeliveryOrders: DeliveryOrder[] = [
    {
        id: 'ORD-009',
        buyerName: 'Ahmed Al Mansouri',
        deliveryAddress: 'Villa 7, Street 12, Al Barsha 2, Dubai',
        phone: '+971 50 123 4567',
        vehicles: [
            {
                id: 'V1-009',
                vehicleName: '2020 Toyota Camry',
                vin: '1HGBH41JXMN109186',
                parts: [
                    { 
                        id: 'P1-009', 
                        partName: 'Front Bumper', 
                        partNumber: 'TY-CM-FB-01',
                        condition: 'New', 
                        imageUrls: ['/assets/parts/download (1).jpeg', '/assets/parts/download.jpeg'],
                        status: 'Out for Delivery',
                        quantity: 1,
                        vendorId: 'VEND-01',
                        vendorName: 'Al Quoz Auto Parts',
                        vendorAddress: 'Warehouse 1, Al Quoz Industrial Area 3, Dubai',
                        vendorPhone: '+971 4 333 1234',
                        sourcerName: 'Fatima Al-Fassi',
                        sourcerId: 'SOURCER-01',
                        sourcerPhone: '+971 50 111 2222',
                        vendorLat: 25.1314,
                        vendorLng: 55.2236,
                    },
                    { 
                        id: 'P2-009', 
                        partName: 'Radiator',
                        partNumber: 'TY-CM-RD-01',
                        condition: 'New', 
                        imageUrls: ['/assets/parts/images (1).jpeg'],
                        status: 'Accepted',
                        quantity: 1,
                        vendorId: 'VEND-02',
                        vendorName: 'Deira City Parts',
                        vendorAddress: '8th St, Deira, Dubai',
                        vendorPhone: '+971 4 295 1111',
                        sourcerName: 'Yusuf Ahmed',
                        sourcerId: 'SOURCER-02',
                        sourcerPhone: '+971 50 333 4444',
                        vendorLat: 25.2532,
                        vendorLng: 55.3300,
                    },
                ]
            },
            {
                id: 'V2-009',
                vehicleName: '2019 Honda Civic',
                vin: '2T1BURHE0JC123456',
                parts: [
                     { 
                        id: 'P4-009', 
                        partName: 'Grille', 
                        partNumber: 'HO-CV-GR-01',
                        condition: 'New', 
                        imageUrls: ['/assets/parts/download.jpeg'],
                        status: 'Accepted',
                        quantity: 1,
                        vendorId: 'VEND-01',
                        vendorName: 'Al Quoz Auto Parts',
                        vendorAddress: 'Warehouse 1, Al Quoz Industrial Area 3, Dubai',
                        vendorPhone: '+971 4 333 1234',
                        sourcerName: 'Fatima Al-Fassi',
                        sourcerId: 'SOURCER-01',
                        sourcerPhone: '+971 50 111 2222',
                        vendorLat: 25.1314,
                        vendorLng: 55.2236,
                    },
                ]
            }
        ],
    },
    {
        id: 'ORD-010',
        buyerName: 'Sarah Johnson',
        deliveryAddress: 'Apt 502, Marina Tower, Dubai Marina, Dubai',
        phone: '+971 55 987 6543',
        vehicles: [
            {
                id: 'V3-010',
                vehicleName: '2021 BMW X5',
                vin: '5UXCR6C54KL123789',
                parts: [
                    { 
                        id: 'P5-010', 
                        partName: 'Side Mirror', 
                        partNumber: 'BM-X5-SM-01',
                        condition: 'Used - Excellent', 
                        imageUrls: ['/assets/parts/download (2).jpeg'],
                        status: 'Out for Delivery',
                        quantity: 2,
                        vendorId: 'VEND-03',
                        vendorName: 'Dubai Investment Park Spares',
                        vendorAddress: 'Dubai Investments Park 1, Dubai',
                        vendorPhone: '+971 4 888 5678',
                        sourcerName: 'Aisha Al-Jaber',
                        sourcerId: 'SOURCER-03',
                        sourcerPhone: '+971 50 555 6666',
                        vendorLat: 25.0218,
                        vendorLng: 55.1764,
                    },
                     { 
                        id: 'P6-010', 
                        partName: 'Brake Pads',
                        partNumber: 'BM-X5-BP-01',
                        condition: 'New', 
                        imageUrls: ['/assets/parts/images.jpeg'],
                        status: 'Accepted',
                        quantity: 4,
                        vendorId: 'VEND-01',
                        vendorName: 'Al Quoz Auto Parts',
                        vendorAddress: 'Warehouse 1, Al Quoz Industrial Area 3, Dubai',
                        vendorPhone: '+971 4 333 1234',
                        sourcerName: 'Fatima Al-Fassi',
                        sourcerId: 'SOURCER-01',
                        sourcerPhone: '+971 50 111 2222',
                        vendorLat: 25.1314,
                        vendorLng: 55.2236,
                    },
                ]
            }
        ]
    },
    {
        id: 'ORD-011',
        buyerName: 'Mohammed Al Rashid',
        deliveryAddress: 'Floor 3, Office 301, Index Tower, DIFC, Dubai',
        phone: '+971 52 456 7890',
        vehicles: [
            {
                id: 'V5-011',
                vehicleName: '2020 Lexus RX',
                vin: '2T2ZZMCA0LC123789',
                parts: [
                     { 
                        id: 'P9-011', 
                        partName: 'Tail Light',
                        partNumber: 'LX-RX-TL-01', 
                        condition: 'Used - Excellent', 
                        imageUrls: ['/assets/parts/images.jpeg'],
                        status: 'Out for Delivery',
                        quantity: 1,
                        vendorId: 'VEND-02',
                        vendorName: 'Deira City Parts',
                        vendorAddress: '8th St, Deira, Dubai',
                        vendorPhone: '+971 4 295 1111',
                        sourcerName: 'Yusuf Ahmed',
                        sourcerId: 'SOURCER-02',
                        sourcerPhone: '+971 50 333 4444',
                        vendorLat: 25.2532,
                        vendorLng: 55.3300,
                    },
                    { 
                        id: 'P10-011', 
                        partName: 'Air Filter',
                        partNumber: 'LX-RX-AF-01', 
                        condition: 'New', 
                        imageUrls: ['/assets/parts/download (2).jpeg'],
                        status: 'Accepted',
                        quantity: 1,
                        vendorId: 'VEND-03',
                        vendorName: 'Dubai Investment Park Spares',
                        vendorAddress: 'Dubai Investments Park 1, Dubai',
                        vendorPhone: '+971 4 888 5678',
                        sourcerName: 'Aisha Al-Jaber',
                        sourcerId: 'SOURCER-03',
                        sourcerPhone: '+971 50 555 6666',
                        vendorLat: 25.0218,
                        vendorLng: 55.1764,
                    },
                ]
            }
        ]
    }
]; 