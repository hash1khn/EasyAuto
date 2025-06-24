import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mockDeliveryOrders, DeliveryOrder, DeliveryPart } from '@/data/deliveryMockData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Map } from 'lucide-react';
import DeliveringModal from '../delivery/DeliveringModal';
import PartDetailsModal from '@/components/delivery/PartDetailsModal';

// @ts-ignore
if (typeof window !== 'undefined' && !window.deliveryHistory) {
  // @ts-ignore
  window.deliveryHistory = [];
}

declare global {
  interface Window {
    deliveryHistory: any[];
  }
}

export type EnrichedDeliveryPart = DeliveryPart & { orderId: string; vehicleName: string; };

export type GroupedByAddress = {
    address: string;
    buyerName: string;
    phone: string;
    lat: number;
    lng: number;
    parts: EnrichedDeliveryPart[];
};

const Delivering: React.FC = () => {
    const [orders, setOrders] = useState<DeliveryOrder[]>(mockDeliveryOrders);
    const [selectedParts, setSelectedParts] = useState<Record<string, Set<string>>>({});
    const [deliveringModalState, setDeliveringModalState] = useState<{ isOpen: boolean; address: string | null }>({ isOpen: false, address: null });
    const [detailsModalState, setDetailsModalState] = useState<{ isOpen: boolean; part: EnrichedDeliveryPart | null }>({ isOpen: false, part: null });
    const location = useLocation();
    const navigate = useNavigate();

    // Group by delivery address, only parts with status 'Out for Delivery'
    const partsByAddress = useMemo((): GroupedByAddress[] => {
        const allParts: EnrichedDeliveryPart[] = orders.flatMap(order => 
            order.vehicles.flatMap(vehicle => 
                vehicle.parts
                .filter(part => part.status === 'Out for Delivery')
                .map(part => ({ ...part, orderId: order.id, vehicleName: vehicle.vehicleName }))
            )
        );
        const grouped = allParts.reduce((acc, part) => {
            const order = orders.find(o => o.id === part.orderId);
            if (!order) return acc;
            if (!acc[order.deliveryAddress]) {
                acc[order.deliveryAddress] = {
                    address: order.deliveryAddress,
                    buyerName: order.buyerName,
                    phone: order.phone,
                    lat: part.vendorLat, // Use vendorLat as a fallback for address
                    lng: part.vendorLng, // Use vendorLng as a fallback for address
                    parts: [],
                };
            }
            acc[order.deliveryAddress].parts.push(part);
            return acc;
        }, {} as Record<string, GroupedByAddress>);
        return Object.values(grouped);
    }, [orders]);

    const handleSelectPart = (address: string, partId: string) => {
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            if (!newSelection[address]) {
                newSelection[address] = new Set();
            }
            const addressSelection = new Set(newSelection[address]);
            if (addressSelection.has(partId)) {
                addressSelection.delete(partId);
            } else {
                addressSelection.add(partId);
            }
            newSelection[address] = addressSelection;
            return newSelection;
        });
    };

    const handleOpenDeliveringModal = (address: string) => {
        if (!selectedParts[address] || selectedParts[address].size === 0) {
            alert("Please select parts to mark as delivered.");
            return;
        }
        setDeliveringModalState({ isOpen: true, address });
    };

    const handleCloseDeliveringModal = () => {
        setDeliveringModalState({ isOpen: false, address: null });
    };

    const handleOpenDetailsModal = (part: EnrichedDeliveryPart) => {
        setDetailsModalState({ isOpen: true, part });
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalState({ isOpen: false, part: null });
    };

    const handleConfirmDelivered = (invoice: any) => {
        const address = invoice.address;
        const partIdsToUpdate = new Set(invoice.parts.map((p: any) => p.id));
        const newOrders = orders.map(order => ({
            ...order,
            vehicles: order.vehicles.map(vehicle => ({
                ...vehicle,
                parts: vehicle.parts.map(part => 
                    partIdsToUpdate.has(part.id) ? { ...part, status: 'Delivered' as const } : part
                )
            }))
        }));
        setOrders(newOrders);
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            delete newSelection[address];
            return newSelection;
        });
        handleCloseDeliveringModal();
        alert(`${partIdsToUpdate.size} part(s) marked as 'Delivered'.`);
        // Save invoice to history (in-memory for demo)
        if (!window.deliveryHistory) window.deliveryHistory = [];
        window.deliveryHistory.unshift({
            id: 'INV-' + Math.floor(Math.random() * 100000),
            date: new Date().toLocaleString(),
            customer: invoice.buyerName,
            phone: invoice.phone,
            address: invoice.address,
            driver: invoice.driverName,
            grandTotal: invoice.grandTotal,
            paymentMethod: invoice.paymentMethod,
            deliveryFee: invoice.deliveryFee,
            parts: invoice.parts.map((p: any) => ({
                partName: p.partName,
                quantity: p.quantity,
                unitPrice: 500, // Use mock price for now
                vendor: { name: p.vendorName || 'Vendor', address: p.vendorAddress || '', phone: p.vendorPhone || '' }
            })),
            notes: invoice.deliveryNotes,
            photos: (invoice.deliveryPhotos || []).map((f: File) => URL.createObjectURL(f)),
        });
    };

    const deliveringModalParts = partsByAddress
        .find(group => group.address === deliveringModalState.address)
        ?.parts.filter(p => selectedParts[deliveringModalState.address!]?.has(p.id)) || [];

    useEffect(() => {
        if (location.state && location.state.address && location.state.partIds) {
            const { address, partIds } = location.state;
            setSelectedParts(prev => ({
                ...prev,
                [address]: new Set(partIds)
            }));
            setDeliveringModalState({ isOpen: true, address });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Delivering</h1>
                <Button asChild variant="outline">
                    <Link to="/delivery/map-delivering">
                        <Map className="mr-2 h-4 w-4" />
                        Map View
                    </Link>
                </Button>
            </div>
            <Accordion type="multiple" defaultValue={partsByAddress.map(a => a.address)} className="space-y-4">
                {partsByAddress.map(({ address, buyerName, phone, parts }) => {
                    const selectedCount = selectedParts[address]?.size || 0;
                    return (
                        <AccordionItem value={address} key={address} className="bg-white rounded-lg border">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <div className="flex justify-between w-full pr-4 items-center">
                                    <div className="flex flex-col text-left">
                                        <h3 className="font-bold text-lg">{buyerName}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                                target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 hover:text-blue-600"
                                            >
                                                <MapPin className="h-4 w-4" /> {address}
                                            </a>
                                            <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-600">
                                                <Phone className="h-4 w-4" /> {phone}
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
                                                            checked={selectedParts[address]?.has(part.id)}
                                                            onCheckedChange={() => handleSelectPart(address, part.id)}
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
                                    <Button onClick={() => handleOpenDeliveringModal(address)} disabled={selectedCount === 0}>
                                        Mark as Delivered ({selectedCount})
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
            {deliveringModalState.isOpen && (
                <DeliveringModal
                    isOpen={deliveringModalState.isOpen}
                    onClose={handleCloseDeliveringModal}
                    parts={deliveringModalParts}
                    address={deliveringModalState.address || ''}
                    onConfirm={handleConfirmDelivered}
                    buyerName={partsByAddress.find(g => g.address === deliveringModalState.address)?.buyerName || ''}
                    phone={partsByAddress.find(g => g.address === deliveringModalState.address)?.phone || ''}
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

export default Delivering; 