import React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";


interface UserProfile {
  id: string;
  full_name: string;
  whatsapp_number: string;
  location: string;
  user: {
    email: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  user_profiles: UserProfile;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
}

interface Part {
  id: string;
  part_name: string;
  shipping_status: string;
  inspection_images: string[];
  inspected_by: string;
  inspected_at: string;
  order_id: string;
  vehicles: Vehicle;
  orders: Order;
}

interface Bid {
  id: string;
  price: number;
  status: string;
  warranty: 'No Warranty' | '3 Days' | '7 Days' | '14 Days' | '30 Days' | string; 
  condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair";
  image_url: string;
  vendor_info: any;
  notes: string;
  created_at: string;
  updated_at: string;
  is_sourcer_provided: boolean;
  sourcer_notes: string;
  vendor_id: string;
  vendor: {
    id: string;
    full_name: string;
    whatsapp_number: string;
    location: string;
    user: {
      email: string;
    };
  };
  parts: Part;
}

interface VendorInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  isSourcerProvided: boolean;
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
  status: "Accepted" | "Out for Delivery" | "Delivered";
  price: number;
  vendor: VendorInfo;
  warranty: 'No Warranty' | '3 Days' | '7 Days' | '14 Days' | '30 Days' | string; 
  condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair";
  inspection: InspectionInfo;
  acceptedDate: string;
  shippingStatus: string;
  isSourcerProvided: boolean;
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
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedQuoteForInspection, setSelectedQuoteForInspection] = useState<AcceptedQuote | null>(null);
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAcceptedQuotes();
    }
  }, [user]);

  const fetchAcceptedQuotes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("bids")
        .select(`
          id,
          price,
          status,
          warranty,
          condition,
          image_url,
          vendor_info,
          notes,
          created_at,
          updated_at,
          is_sourcer_provided,
          sourcer_notes,
          vendor_id,
          vendor:vendor_id(
            id,
            full_name,
            whatsapp_number,
            location,
            user:user_id(
              email
            )
          ),
          parts!inner(
            id,
            part_name,
            shipping_status,
            inspection_images,
            inspected_by,
            inspected_at,
            order_id,
            vehicles!inner(
              id,
              make,
              model,
              year,
              vin
            ),
            orders!inner(
              id,
              created_at,
              user_profiles!inner(
                id,
                full_name,
                whatsapp_number,
                location,
                delivery_address
              )
            )
          )
        `)
        .eq("status", "accepted")
        .in("parts.shipping_status", ["confirmed", "out_for_delivery", "delivered"])
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const transformedQuotes: AcceptedQuote[] = (data as any[]).map((bid) => {
  // Extract first element from arrays returned by Supabase for relations
  const part = Array.isArray(bid.parts) ? bid.parts[0] : bid.parts;
  const vehicle = part && Array.isArray(part.vehicles) ? part.vehicles[0] : part?.vehicles;
  const order = part && Array.isArray(part.orders) ? part.orders[0] : part?.orders;
  const userProfile = order && Array.isArray(order.user_profiles) ? order.user_profiles[0] : order?.user_profiles;
  const isSourcerProvided = bid.is_sourcer_provided;
  const vendorInfo = bid.vendor_info || {};
  const vendor = Array.isArray(bid.vendor) ? bid.vendor[0] : bid.vendor;

  return {
    id: bid.id,
    orderId: order?.id,
    vehicleId: vehicle?.id,
    vehicleMake: vehicle?.make,
    vehicleModel: vehicle?.model,
    vehicleYear: vehicle?.year,
    location: userProfile?.location || "UAE",
    buyerName: userProfile?.full_name,
    buyerPhone: userProfile?.whatsapp_number,
    partName: part?.part_name,
    status: getDisplayStatus(part?.shipping_status),
    price: bid.price,
    vendor: {
      name: isSourcerProvided ? vendorInfo.name : vendor?.full_name || "Unknown Vendor",
      phone: isSourcerProvided ? vendorInfo.phone : vendor?.whatsapp_number || "N/A",
      email: isSourcerProvided ? vendorInfo.email : vendor?.user?.email || "N/A",
      address: isSourcerProvided ? vendorInfo.address : vendor?.location || "N/A",
      isSourcerProvided
    },
    warranty: bid.warranty || "No Warranty",
    condition: bid.condition || "Used - Good",
    inspection: {
      notes: bid.sourcer_notes || bid.notes || "No inspection notes available",
      images: part?.inspection_images || ["/placeholder.svg?height=200&width=300"],
    },
    acceptedDate: bid.updated_at || bid.created_at,
    shippingStatus: part?.shipping_status,
    isSourcerProvided
  };
});

      setAcceptedQuotes(transformedQuotes);
    } catch (error) {
      console.error("Error fetching accepted quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStatus = (shippingStatus: string) => {
    switch (shippingStatus) {
      case "confirmed": return "Accepted";
      case "out_for_delivery": return "Out for Delivery";
      case "delivered": return "Delivered";
      default: return "Accepted";
    }
  };

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

  const filteredQuotes = acceptedQuotes.filter((quote) => 
    statusFilter === "All" || quote.status === statusFilter
  );

  const groupedOrders: GroupedOrder[] = filteredQuotes.reduce((acc, quote) => {
    const existingOrder = acc.find((o) => o.orderId === quote.orderId);
    if (existingOrder) {
      existingOrder.parts.push(quote);
      existingOrder.vehicles.add(`${quote.vehicleYear} ${quote.vehicleMake} ${quote.vehicleModel}`);
    } else {
      acc.push({
        orderId: quote.orderId,
        location: quote.location,
        buyerName: quote.buyerName,
        buyerPhone: quote.buyerPhone,
        parts: [quote],
        vehicles: new Set([`${quote.vehicleYear} ${quote.vehicleMake} ${quote.vehicleModel}`])
      });
    }
    return acc;
  }, [] as GroupedOrder[]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Accepted": return "bg-blue-100 text-blue-800";
      case "Out for Delivery": return "bg-yellow-100 text-yellow-800";
      case "Delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted": return "✅";
      case "Out for Delivery": return "🚚";
      case "Delivered": return "📦";
      default: return "📋";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view your quote history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quote History</h2>
            <p className="text-gray-600 mt-1">View all your accepted quotes and track their delivery status.</p>
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

      {groupedOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">
            {acceptedQuotes.length === 0 ? "No accepted quotes found." : "No quotes match the current filter."}
          </p>
          {acceptedQuotes.length === 0 && (
            <p className="text-sm mt-2">Start accepting vendor quotes to see them here.</p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedOrders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Order #{order.orderId.slice(-8)}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.vehicles.size} {order.vehicles.size > 1 ? "Vehicles" : "Vehicle"} | {order.parts.length}{" "}
                      {order.parts.length > 1 ? "Parts" : "Part"} | Location: {order.location}
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
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="link" 
                                className="p-0 h-auto" 
                                onClick={() => openVendorModal(part.vendor)}
                              >
                                {part.vendor.name}
                              </Button>
                              {part.isSourcerProvided && (
                                <Badge variant="secondary">Sourcer</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <img
                                src={part.inspection.images[0] || "/placeholder.svg?height=40&width=40"}
                                alt="Inspection"
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="text-gray-500 text-xs truncate max-w-[200px]">
                                {part.inspection.notes}
                              </span>
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

      {isVendorModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Vendor Information</h3>
                {selectedVendor.isSourcerProvided && (
                  <Badge variant="secondary" className="mt-1">Sourcer Provided</Badge>
                )}
              </div>
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
                <a href={`tel:${selectedVendor.phone}`} className="text-lg text-gray-800 hover:underline">
                  {selectedVendor.phone}
                </a>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
                <a href={`mailto:${selectedVendor.email}`} className="text-lg text-gray-800 hover:underline">
                  {selectedVendor.email}
                </a>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border">
                  {selectedVendor.address}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl text-right">
              <Button onClick={closeVendorModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isInspectionModalOpen && selectedQuoteForInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
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
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500">Inspection Images</h4>
                <Carousel className="w-full">
                  <CarouselContent>
                    {selectedQuoteForInspection.inspection.images.map((img, idx) => (
                      <CarouselItem key={idx}>
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={img || "/placeholder.svg?height=300&width=400"}
                            alt={`Inspection image ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
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
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Inspection Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">
                    {selectedQuoteForInspection.inspection.notes}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Vendor</h4>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="font-medium">{selectedQuoteForInspection.vendor.name}</p>
                    {selectedQuoteForInspection.vendor.isSourcerProvided && (
                      <Badge variant="secondary" className="mt-1">Sourcer Provided</Badge>
                    )}
                  </div>
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