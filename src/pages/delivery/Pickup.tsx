import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mockDeliveryOrders, DeliveryOrder, DeliveryPart } from '@/data/deliveryMockData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Map } from 'lucide-react';
import PickupModal from '@/components/delivery/PickupModal';
import PartDetailsModal from '@/components/delivery/PartDetailsModal';

// This will be exported for the modal to use
export type EnrichedPart = DeliveryPart & { orderId: string; vehicleName: string; };

export type GroupedByVendor = {
    vendor: {
        id: string;
        name: string;
        address: string;
        phone: string;
        lat: number;
        lng: number;
    };
    parts: EnrichedPart[];
};

const Pickup: React.FC = () => {
    const [orders, setOrders] = useState<DeliveryOrder[]>(mockDeliveryOrders);
    const [selectedParts, setSelectedParts] = useState<Record<string, Set<string>>>({});
    const [pickupModalState, setPickupModalState] = useState<{ isOpen: boolean; vendorId: string | null }>({ isOpen: false, vendorId: null });
    const [detailsModalState, setDetailsModalState] = useState<{ isOpen: boolean; part: EnrichedPart | null }>({ isOpen: false, part: null });
    const location = useLocation();
    const navigate = useNavigate();

    const partsByVendor = useMemo((): GroupedByVendor[] => {
        const allParts: EnrichedPart[] = orders.flatMap(order => 
            order.vehicles.flatMap(vehicle => 
                vehicle.parts
                .filter(part => part.status === 'Accepted')
                .map(part => ({ ...part, orderId: order.id, vehicleName: vehicle.vehicleName }))
            )
        );

        const grouped = allParts.reduce((acc, part) => {
            if (!acc[part.vendorId]) {
                acc[part.vendorId] = {
                    vendor: {
                        id: part.vendorId,
                        name: part.vendorName,
                        address: part.vendorAddress,
                        phone: part.vendorPhone,
                        lat: part.vendorLat,
                        lng: part.vendorLng,
                    },
                    parts: [],
                };
            }
            acc[part.vendorId].parts.push(part);
            return acc;
        }, {} as Record<string, GroupedByVendor>);

        return Object.values(grouped);
    }, [orders]);

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
    
    const handleConfirmPickup = (pickupNotes: string, photo?: File) => {
        const { vendorId } = pickupModalState;
        if (!vendorId) return;

        console.log("Confirming pickup for vendor:", vendorId);
        console.log("Notes:", pickupNotes);
        console.log("Photo:", photo?.name);

        const partIdsToUpdate = selectedParts[vendorId];

        const newOrders = orders.map(order => ({
            ...order,
            vehicles: order.vehicles.map(vehicle => ({
                ...vehicle,
                parts: vehicle.parts.map(part => 
                    partIdsToUpdate.has(part.id) ? { ...part, status: 'Out for Delivery' as const } : part
                )
            }))
        }));

        setOrders(newOrders);
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            delete newSelection[vendorId];
            return newSelection;
        });
        handleClosePickupModal();
        alert(`${partIdsToUpdate.size} part(s) marked as 'Out for Delivery'.`);
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
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`}
                                                target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 hover:text-blue-600"
                                            >
                                                <MapPin className="h-4 w-4" /> {vendor.address}
                                            </a>
                                            <a href={`tel:${vendor.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-600">
                                                <Phone className="h-4 w-4" /> {vendor.phone}
                                            </a>
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

export default Pickup; 