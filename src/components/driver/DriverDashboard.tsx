import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Map } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PickupModal from '../delivery/PickupModal';
import PartDetailsModal from '../delivery/PartDetailsModal';
import { QuoteCondition } from '@/types/orders';

interface SupabaseVendor {
  id: string;
  full_name: string;
  whatsapp_number: string;
  location: string;
  delivery_address: string | null;
  delivery_instructions: string | null;
  google_maps_url: string | null;
}

interface SupabaseBid {
  id: string;
  vendor_id: string;
  condition: QuoteCondition;
  status: string;
  vendor: SupabaseVendor;
}

interface SupabasePart {
  id: string;
  order_id: string;
  part_name: string;
  part_number: string | null;
  quantity: number;
  photos: string[];
  shipping_status: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  bids: SupabaseBid[];
}

interface DBPart {
  id: string;
  order_id: string;
  part_name: string;
  part_number: string;
  quantity: number;
  photos: string[];
  shipping_status: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  bids: {
    id: string;
    vendor_id: string;
    condition: QuoteCondition;
    status: string;
    vendor: {
      id: string;
      full_name: string;
      whatsapp_number: string;
      location: string;
      google_maps_url: string;
    };
  }[];
}

export type EnrichedPart = {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  orderId: string;
  vehicleName: string;
  imageUrls: string[];
  condition: QuoteCondition;
  status: string;
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorLat: number;
  vendorLng: number;
};

export type GroupedByVendor = {
  vendor: {
    id: string;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    google_maps_url?: string;
    delivery_instructions?: string; // Add this field
  };
  parts: EnrichedPart[];
};

export const DriverDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState<DBPart[]>([]);
  const [selectedParts, setSelectedParts] = useState<Record<string, Set<string>>>({});
  const [pickupModalState, setPickupModalState] = useState<{ isOpen: boolean; vendorId: string | null }>({ isOpen: false, vendorId: null });
  const [detailsModalState, setDetailsModalState] = useState<{ isOpen: boolean; part: EnrichedPart | null }>({ isOpen: false, part: null });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartsForPickup();
  }, []);

  const fetchPartsForPickup = async () => {
    try {
      const { data: rawData, error } = await supabase
        .from('parts')
        .select(`
          id,
          order_id,
          part_name,
          part_number,
          quantity,
          photos,
          shipping_status,
          created_at,
          delivered_at,
          vehicle:vehicles!inner(
            id,
            make,
            model,
            year,
            user:user_profiles(
              id,
              full_name,
              whatsapp_number,
              delivery_address,
              delivery_phone,
              delivery_instructions
            )
          ),
          order:orders(
            id,
            user_id,
            status,
            user_profile:user_profiles(
              full_name,
              delivery_address,
              delivery_phone,
              delivery_instructions
            )
          ),
          bids!inner(
            id,
            vendor_id,
            condition,
            status,
            price,
            warranty,
            notes,
            created_at,
            vendor:user_profiles!inner(
              id,
              full_name,
              whatsapp_number,
              location,
              business_name,
              delivery_address,
              delivery_instructions,
              google_maps_url
            )
          )
        `)
        .eq('shipping_status', 'confirmed')
        .eq('bids.status', 'accepted');

      if (error) throw error;

      // Transform the raw data with proper type assertion
      const processedData: DBPart[] = (rawData || []).map(item => ({
        id: item.id,
        order_id: item.order_id,
        part_name: item.part_name,
        part_number: item.part_number || '',
        quantity: item.quantity,
        photos: item.photos || [],
        shipping_status: item.shipping_status,
        created_at: item.created_at,
        delivered_at: item.delivered_at,
        vehicle: {
          id: item.vehicle.id,
          make: item.vehicle.make,
          model: item.vehicle.model,
          year: item.vehicle.year,
          user: item.vehicle.user
        },
        bids: item.bids.map(bid => ({
          id: bid.id,
          vendor_id: bid.vendor_id,
          condition: bid.condition,
          status: bid.status,
          price: bid.price,
          warranty: bid.warranty,
          notes: bid.notes,
          created_at: bid.created_at,
          vendor: {
            id: bid.vendor.id,
            full_name: bid.vendor.full_name,
            whatsapp_number: bid.vendor.whatsapp_number,
            location: bid.vendor.location,
            business_name: bid.vendor.business_name,
            google_maps_url: bid.vendor.google_maps_url || ''
          }
        })),
        order: {
          id: item.order?.id,
          user_id: item.order?.user_id,
          status: item.order?.status,
          user_profile: item.order?.user_profile
        }
      }));

      setParts(processedData);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatesFromUrl = (url?: string) => {
    const defaultCoords = { lat: 25.2048, lng: 55.2708 }; // Dubai coordinates
    if (!url) return defaultCoords;

    try {
      const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : defaultCoords;
    } catch {
      return defaultCoords;
    }
  };

  const partsByVendor = useMemo(() => {
    const grouped = parts.reduce((acc, part) => {
      const acceptedBid = part.bids[0]; // Since we filtered for accepted bids
      const vendor = acceptedBid.vendor;
      const coords = getCoordinatesFromUrl(vendor.google_maps_url);

      if (!acc[vendor.id]) {
        acc[vendor.id] = {
          vendor: {
            id: vendor.id,
            name: vendor.full_name,
            address: vendor.location,
            phone: vendor.whatsapp_number,
            lat: coords.lat,
            lng: coords.lng,
            google_maps_url: vendor.google_maps_url
          },
          parts: []
        };
      }

      acc[vendor.id].parts.push({
        id: part.id,
        partName: part.part_name,
        partNumber: part.part_number || '',
        quantity: part.quantity,
        orderId: part.order_id,
        imageUrls: part.photos || [],
        vehicleName: `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`,
        condition: acceptedBid.condition,
        status: 'Accepted',
        vendorId: vendor.id,
        vendorName: vendor.full_name,
        vendorAddress: vendor.location,
        vendorPhone: vendor.whatsapp_number,
        vendorLat: coords.lat,
        vendorLng: coords.lng,
        shipping_status: part.shipping_status,
        created_at: part.created_at,
        delivered_at: part.delivered_at,
        vehicle: {
          make: part.vehicle.make,
          model: part.vehicle.model,
          year: part.vehicle.year
        },
        winning_bid: {
          price: acceptedBid.price,
          warranty: acceptedBid.warranty,
          notes: acceptedBid.notes,
          created_at: acceptedBid.created_at,
          vendor: {
            business_name: vendor.business_name
          }
        },
        order: {
          user_profile: {
            full_name: part.order?.user_profile?.full_name,
            delivery_address: part.order?.user_profile?.delivery_address,
            delivery_phone: part.order?.user_profile?.delivery_phone,
            delivery_instructions: part.order?.user_profile?.delivery_instructions
          }
        }
      });

      return acc;
    }, {} as Record<string, GroupedByVendor>);

    return Object.values(grouped);
  }, [parts]);

  const handleSelectPart = (vendorId: string, partId: string) => {
    setSelectedParts(prev => {
      const newSelection = { ...prev };
      if (!newSelection[vendorId]) {
        newSelection[vendorId] = new Set();
      }

      const vendorSelection = new Set(newSelection[vendorId]);
      if (vendorSelection.has(partId)) {
        vendorSelection.delete(partId);
      } else {
        vendorSelection.add(partId);
      }
      newSelection[vendorId] = vendorSelection;
      return newSelection;
    });
  };

  const handleOpenPickupModal = (vendorId: string) => {
    if (!selectedParts[vendorId] || selectedParts[vendorId].size === 0) {
      alert("Please select parts to pick up.");
      return;
    }
    setPickupModalState({ isOpen: true, vendorId });
  };

  const handleClosePickupModal = () => {
    setPickupModalState({ isOpen: false, vendorId: null });
  };

  const handleOpenDetailsModal = (part: EnrichedPart) => {
    setDetailsModalState({ isOpen: true, part });
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalState({ isOpen: false, part: null });
  };
  
  const handleConfirmPickup = async (pickupNotes: string, photo?: File) => {
    const { vendorId } = pickupModalState;
    if (!vendorId) return;

    try {
      const partIdsToUpdate = Array.from(selectedParts[vendorId] || []);
      
      const { error } = await supabase
        .from('parts')
        .update({ 
          shipping_status: 'out_for_delivery',
          delivery_note: pickupNotes,
          // Add photo handling if needed
        })
        .in('id', partIdsToUpdate);

      if (error) throw error;

      await fetchPartsForPickup();
      setSelectedParts(prev => {
        const newSelection = { ...prev };
        delete newSelection[vendorId];
        return newSelection;
      });
      
      handleClosePickupModal();
      alert(`${partIdsToUpdate.length} part(s) marked as 'Out for Delivery'`);
    } catch (error) {
      console.error('Error updating parts:', error);
      alert('Failed to update parts status');
    }
  };

  const pickupModalParts = partsByVendor
        .find(group => group.vendor.id === pickupModalState.vendorId)
        ?.parts.filter(p => selectedParts[pickupModalState.vendorId!]?.has(p.id)) || [];

  useEffect(() => {
    if (location.state && location.state.vendorId && location.state.partIds) {
      const { vendorId, partIds } = location.state;
      setSelectedParts(prev => ({
        ...prev,
        [vendorId]: new Set(partIds)
      }));
      setPickupModalState({ isOpen: true, vendorId });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Ready for Pickup</h1>
                <Button asChild variant="outline">
                    <Link to="/delivery/map">
                        <Map className="mr-2 h-4 w-4" />
                        Map View
                    </Link>
                </Button>
            </div>
            
            <Accordion type="multiple" defaultValue={partsByVendor.map(v => v.vendor.id)} className="space-y-4">
                {partsByVendor.map(({ vendor, parts }) => {
                    const selectedCount = selectedParts[vendor.id]?.size || 0;
                    return (
                        <AccordionItem value={vendor.id} key={vendor.id} className="bg-white rounded-lg border">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <div className="flex justify-between w-full pr-4 items-center">
                                    <div className="flex flex-col text-left">
                                        <h3 className="font-bold text-lg">{vendor.name}</h3>
                                        <div className="flex flex-col gap-2 text-sm text-gray-500 mt-1">
                                            <div className="flex items-start gap-1">
                                                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                                                <div className="flex flex-col">
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="hover:text-blue-600"
                                                    >

                                                        {vendor.address}
                                                    </a>
                                                    {vendor.delivery_instructions && (
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            <span className="font-medium">Instructions: </span>
                                                            {vendor.delivery_instructions}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${vendor.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 hover:text-blue-600"
                                            >
                                                <Phone className="h-4 w-4" />
                                                <span className="font-medium">Contact: </span>
                                                {vendor.phone}
                                            </a>
                                            {vendor.google_maps_url && (
                                                <a
                                                    href={vendor.google_maps_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Map className="h-4 w-4" />
                                                    View on Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant={selectedCount > 0 ? "default" : "secondary"} className="text-md">
                                        {parts.length} Part(s)
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="border rounded-lg overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12"></TableHead>
                                                <TableHead>Part Name</TableHead>
                                                <TableHead>Order</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parts.map(part => (
                                                <TableRow key={part.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedParts[vendor.id]?.has(part.id)}
                                                            onCheckedChange={() => handleSelectPart(vendor.id, part.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div 
                                                            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                                                            onClick={() => handleOpenDetailsModal(part)}
                                                        >
                                                            <img src={part.imageUrls[0]} alt={part.partName} className="w-12 h-12 object-cover rounded-md"/>
                                                            <div>
                                                                {part.partName}
                                                                <p className="text-xs text-gray-500">{part.partNumber}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        #{part.orderId}
                                                        <Badge variant="outline" className="ml-2 hidden sm:inline-flex">{part.vehicleName}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{part.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={() => handleOpenPickupModal(vendor.id)} disabled={selectedCount === 0}>
                                        Mark as Picked Up ({selectedCount})
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
            
            {pickupModalState.isOpen && (
                <PickupModal
                    isOpen={pickupModalState.isOpen}
                    onClose={handleClosePickupModal}
                    parts={pickupModalParts}
                    vendorName={partsByVendor.find(v => v.vendor.id === pickupModalState.vendorId)?.vendor.name || ''}
                    onConfirm={handleConfirmPickup}
                />
            )}

            <PartDetailsModal
                isOpen={detailsModalState.isOpen}
                onClose={handleCloseDetailsModal}
                part={detailsModalState.part}
            />
        </div>
    );
};