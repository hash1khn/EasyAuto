import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface OrderDetailsTableProps {
    invoiceId: string;
    onViewDetails: (partId: string) => void;
}

export const OrderDetailsTable = ({ invoiceId, onViewDetails }: OrderDetailsTableProps) => {
    const [parts, setParts] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch invoice details
                const { data: invoiceData } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('id', invoiceId)
                    .single();

                setInvoice(invoiceData);

                // Fetch parts for this invoice
                const { data: partsData } = await supabase
                    .from('invoice_parts')
                    .select('*, parts(*, vehicles(*))')
                    .eq('invoice_id', invoiceId);

                if (partsData) {
                    setParts(partsData);
                    
                    // Extract unique vehicle IDs
                    const vehicleIds = partsData
                        .map(p => p.parts?.vehicle_id)
                        .filter((v, i, a) => v && a.indexOf(v) === i);
                    
                    if (vehicleIds.length > 0) {
                        const { data: vehiclesData } = await supabase
                            .from('vehicles')
                            .select('*')
                            .in('id', vehicleIds);
                        
                        if (vehiclesData) setVehicles(vehiclesData);
                    }
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [invoiceId]);

    if (loading) {
        return <div className="p-4 bg-gray-50 text-center text-sm">Loading order details...</div>;
    }

    if (!parts || parts.length === 0) {
        return <div className="p-4 bg-gray-50 text-center text-sm">No parts found for this invoice.</div>;
    }

    // Group parts by vehicle
    const groupedParts = parts.reduce((acc, part) => {
        const key = part.parts?.vehicle_id;
        if (!key) return acc;
        
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(part);
        return acc;
    }, {} as Record<string, any[]>);

    const vehicleIds = Object.keys(groupedParts);

    const subtotal = parts
        .filter(p => p.parts?.shipping_status !== 'refunded')
        .reduce((sum, part) => sum + (part.unit_price || 0) * part.quantity, 0);
    
    const deliveryFee = invoice?.delivery_fee || 0;
    const grandTotal = subtotal + deliveryFee;

    const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`;

    return (
        <div className="bg-gray-50/50 p-4 md:p-6 border-t">
            {vehicleIds.map(vehicleId => {
                const vehicle = vehicles.find(v => v.id === vehicleId);
                const vehicleParts = groupedParts[vehicleId];
                return (
                    <div key={vehicleId} className="mb-6 last:mb-0">
                        {vehicle && (
                             <h4 className="text-md font-semibold mb-2 text-gray-800">
                                {vehicle.make} {vehicle.model} ({vehicle.year}) - <span className="font-normal text-gray-600">{vehicle.vin}</span>
                            </h4>
                        )}
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-2/5">Part Name</TableHead>
                                        <TableHead>Part Number</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicleParts.map(({ parts: part, quantity, unit_price }) => {
                                        const isRefunded = part.shipping_status === 'refunded';
                                        return (
                                        <TableRow key={part.id} className={isRefunded ? 'bg-gray-100' : ''}>
                                            <TableCell className="font-medium">{part.part_name}</TableCell>
                                            <TableCell>{part.part_number}</TableCell>
                                            <TableCell>{quantity}</TableCell>
                                            <TableCell>
                                                 {isRefunded ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="line-through text-muted-foreground cursor-help">
                                                                    {formatCurrency(unit_price || 0)}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Refunded – Not charged</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    formatCurrency(unit_price || 0)
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isRefunded ? (
                                                    <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">💸 Refunded</Badge>
                                                ) : (
                                                    <Button variant="link" className="h-auto p-0" onClick={() => onViewDetails(part.id)}>View Details</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                );
            })}
            
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                     <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-lg font-bold">Grand Total</span>
                        <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};