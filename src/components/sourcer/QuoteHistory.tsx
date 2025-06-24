import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

// Interfaces for quote history data
interface VendorInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface InspectionInfo {
  notes: string;
  images: string[];
}

interface AcceptedQuote {
  id: string;
  orderId: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  location: string;
  buyerName: string;
  buyerPhone: string;
  partName: string;
  status: 'Accepted' | 'Out for Delivery' | 'Delivered';
  price: number;
  vendor: VendorInfo;
  warranty: string;
  condition: 'New' | 'Used' | 'Reconditioned';
  inspection: InspectionInfo;
  acceptedDate: string;
}

interface GroupedOrder {
  orderId: string;
  location: string;
  buyerName: string;
  buyerPhone: string;
  parts: AcceptedQuote[];
  vehicles: Set<string>;
}

const QuoteHistory: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedQuoteForInspection, setSelectedQuoteForInspection] = useState<AcceptedQuote | null>(null);

  const openVendorModal = (vendor: VendorInfo) => {
    setSelectedVendor(vendor);
    setIsVendorModalOpen(true);
  };

  const closeVendorModal = () => {
    setIsVendorModalOpen(false);
    setSelectedVendor(null);
  };

  const openInspectionModal = (quote: AcceptedQuote) => {
    setSelectedQuoteForInspection(quote);
    setIsInspectionModalOpen(true);
  };

  const closeInspectionModal = () => {
    setIsInspectionModalOpen(false);
    setSelectedQuoteForInspection(null);
  };

  // Mock data for accepted quotes
  const [acceptedQuotes] = useState<AcceptedQuote[]>([
    {
      id: "Q1",
      orderId: "ORD-001",
      vehicleId: "V1",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: 2020,
      location: "Dubai, UAE",
      buyerName: "Ahmed Al Mansouri",
      buyerPhone: "+971 50 123 4567",
      partName: "Front Bumper",
      status: "Delivered",
      price: 950,
      vendor: {
        name: "AutoParts Pro",
        phone: "+971 4 123 4567",
        email: "contact@autopartspro.ae",
        address: "Sheikh Zayed Road, Dubai"
      },
      warranty: "1 year",
      condition: "New",
      inspection: {
        notes: "Part inspected and verified as genuine Toyota OEM. No damage found.",
        images: ["/assets/parts/download (1).jpeg"]
      },
      acceptedDate: "2024-01-15"
    },
    {
      id: "Q2",
      orderId: "ORD-001",
      vehicleId: "V1",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: 2020,
      location: "Dubai, UAE",
      buyerName: "Ahmed Al Mansouri",
      buyerPhone: "+971 50 123 4567",
      partName: "Headlight Assembly",
      status: "Out for Delivery",
      price: 1200,
      vendor: {
        name: "Gulf Auto Parts",
        phone: "+971 4 987 6543",
        email: "sales@gulfautoparts.ae",
        address: "Al Quoz Industrial Area, Dubai"
      },
      warranty: "6 months",
      condition: "Used",
      inspection: {
        notes: "Used part in excellent condition. All electrical components tested and working perfectly. Minor cosmetic wear not visible when installed.",
        images: ["/assets/parts/download (2).jpeg", "/assets/parts/images.jpeg"]
      },
      acceptedDate: "2024-01-16"
    },
    {
        id: "Q3",
        orderId: "ORD-002",
        vehicleId: "V2",
        vehicleMake: "Honda",
        vehicleModel: "Civic",
        vehicleYear: 2019,
        location: "Abu Dhabi, UAE",
        buyerName: "Fatima Al Zaabi",
        buyerPhone: "+971 50 987 6543",
        partName: "Rear Bumper",
        status: "Accepted",
        price: 350,
        vendor: {
          name: "Emirates Auto Supply",
          phone: "+971 2 456 7890",
          email: "info@emiratesauto.ae",
          address: "Mussafah Industrial Area, Abu Dhabi"
        },
        warranty: "3 months",
        condition: "Used",
        inspection: {
          notes: "Good condition used bumper. Minor scratches that can be easily painted over.",
          images: ["/assets/parts/images (1).jpeg"]
        },
        acceptedDate: "2024-01-17"
      },
      {
        id: "Q4",
        orderId: "ORD-003",
        vehicleId: "V3",
        vehicleMake: "BMW",
        vehicleModel: "X5",
        vehicleYear: 2021,
        location: "Sharjah, UAE",
        buyerName: "Omar Al Rashid",
        buyerPhone: "+971 50 555 1234",
        partName: "Side Mirror",
        status: "Delivered",
        price: 1800,
        vendor: {
          name: "Premium Auto Parts",
          phone: "+971 6 123 4567",
          email: "sales@premiumautoparts.ae",
          address: "Industrial Area 5, Sharjah"
        },
        warranty: "2 years",
        condition: "New",
        inspection: {
          notes: "Brand new OEM BMW side mirror. Includes all electrical components and wiring.",
          images: ["/assets/parts/download.jpeg"]
        },
        acceptedDate: "2024-01-10"
      }
  ]);

  // Filter quotes based on status
  const filteredQuotes = acceptedQuotes.filter(quote => 
    statusFilter === 'All' || quote.status === quote.status
  );

  // Group quotes by order
  const groupedOrders: GroupedOrder[] = filteredQuotes.reduce((acc, quote) => {
    let order = acc.find(o => o.orderId === quote.orderId);
    if (!order) {
        order = {
            orderId: quote.orderId,
            location: quote.location,
            buyerName: quote.buyerName,
            buyerPhone: quote.buyerPhone,
            parts: [],
            vehicles: new Set(),
        };
        acc.push(order);
    }
    order.parts.push(quote);
    order.vehicles.add(`${quote.vehicleYear} ${quote.vehicleMake} ${quote.vehicleModel}`);
    return acc;
  }, [] as GroupedOrder[]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'Out for Delivery': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Accepted': return '✅';
        case 'Out for Delivery': return '🚚';
        case 'Delivered': return '📦';
        default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quote History</h2>
            <p className="text-gray-600 mt-1">
              View all your accepted quotes and track their delivery status.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {groupedOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No quotes match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedOrders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Order #{order.orderId}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        {order.vehicles.size} {order.vehicles.size > 1 ? 'Vehicles' : 'Vehicle'} | {order.parts.length} {order.parts.length > 1 ? 'Parts' : 'Part'} | Location: {order.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-700">{order.buyerName}</p>
                    <p className="text-sm text-gray-600">{order.buyerPhone}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white">
                      <tr className="border-b">
                        <th className="text-left font-semibold text-gray-600 p-3">Part Name</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Vehicle</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Status</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Price</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Condition</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Warranty</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Vendor</th>
                        <th className="text-left font-semibold text-gray-600 p-3">Inspection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.parts.map((part) => (
                        <tr key={part.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800">{part.partName}</td>
                          <td className="p-3 text-gray-600">{`${part.vehicleYear} ${part.vehicleMake} ${part.vehicleModel}`}</td>
                          <td className="p-3">
                            <Badge className={`${getStatusBadgeColor(part.status)} whitespace-nowrap`}>
                              {getStatusIcon(part.status)} {part.status}
                            </Badge>
                          </td>
                          <td className="p-3 font-semibold text-green-600">AED {part.price}</td>
                          <td className="p-3">
                            <Badge variant="outline">{part.condition}</Badge>
                          </td>
                          <td className="p-3 text-gray-600">{part.warranty}</td>
                          <td className="p-3">
                            <Button variant="link" className="p-0 h-auto" onClick={() => openVendorModal(part.vendor)}>
                              {part.vendor.name}
                            </Button>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                                <img 
                                    src={part.inspection.images[0]} 
                                    alt="Inspection" 
                                    className="w-10 h-10 object-cover rounded"
                                />
                                <span className="text-gray-500 text-xs truncate max-w-[200px]">{part.inspection.notes}</span>
                                <Button variant="outline" size="sm" onClick={() => openInspectionModal(part)}>
                                    View
                                </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Details Modal */}
      {isVendorModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={closeVendorModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Vendor Information</h3>
                <Button variant="ghost" size="icon" onClick={closeVendorModal} className="rounded-full">
                    <span className="text-2xl">&times;</span>
                </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                  <h4 className="text-sm font-medium text-gray-500">Vendor Name</h4>
                  <p className="text-lg text-gray-800 font-semibold">{selectedVendor.name}</p>
              </div>
              <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact Phone</h4>
                  <p className="text-lg text-gray-800">{selectedVendor.phone}</p>
              </div>
              <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
                  <p className="text-lg text-gray-800">{selectedVendor.email}</p>
              </div>
              <div>
                  <h4 className="text-sm font-medium text-gray-500">Seller Address</h4>
                  <p className="text-lg text-gray-700 bg-gray-50 p-3 rounded-md border">{selectedVendor.address}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl text-right">
                <Button onClick={closeVendorModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Inspection Details Modal */}
      {isInspectionModalOpen && selectedQuoteForInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={closeInspectionModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Inspection Details</h3>
                    <p className="text-sm text-gray-500">for {selectedQuoteForInspection.partName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeInspectionModal} className="rounded-full">
                    <span className="text-2xl">&times;</span>
                </Button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Image Carousel */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-500">Inspection Images</h4>
                    <Carousel className="w-full">
                        <CarouselContent>
                            {selectedQuoteForInspection.inspection.images.map((img, idx) => (
                                <CarouselItem key={idx}>
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={img} alt={`Inspection image ${idx + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {selectedQuoteForInspection.inspection.images.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </>
                        )}
                    </Carousel>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Inspection Notes</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">{selectedQuoteForInspection.inspection.notes}</p>
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl text-right">
                <Button onClick={closeInspectionModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteHistory; 