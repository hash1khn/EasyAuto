import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

interface ReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoiceId: string | null;
}

export const ReceiptModal = ({ isOpen, onOpenChange, invoiceId }: ReceiptModalProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [buyerInfo, setBuyerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch invoice
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('*, user_profiles(*)')
          .eq('id', invoiceId)
          .single();

        setInvoice(invoiceData);
        setBuyerInfo(invoiceData?.user_profiles);

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
        console.error('Error fetching receipt data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  if (!invoiceId || !invoice) return null;

  const orderDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
  
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

  // Update the calculations
  const calculations = {
    // Only sum non-refunded items
    subtotal: parts.reduce((sum, part) => {
      if (part.parts?.shipping_status !== 'refunded') {
        return sum + (part.unit_price || 0) * (part.quantity || 0);
      }
      return sum;
    }, 0),
    
    // Get values directly from invoice
    deliveryFee: invoice.delivery_fee || 0,
    vatAmount: invoice.vat_amount || 0,
    serviceFee: invoice.service_fee || 0,
    discountAmount: invoice.discount_amount || 0, // Assuming discount amount is directly available on the invoice
  };

  // Use invoice.total_amount instead of calculating our own total
  const grandTotal = invoice.total_amount;

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`;
  
  const handlePrint = () => {
      window.print();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-8">
          <div className="flex justify-center items-center h-64">
            Loading receipt...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col max-h-[90vh]">
        <div id="receipt-content" className="p-8 overflow-y-auto">
            {/* Header */}
            <DialogHeader className="mb-8 text-left">
                <DialogTitle className="text-3xl font-bold">Order Receipt</DialogTitle>
                <div className="flex justify-between text-sm pt-2">
                    <div>
                        <p className="text-muted-foreground">Invoice ID: <span className="font-medium text-foreground">{invoiceId}</span></p>
                        <p className="text-muted-foreground">Order Date: <span className="font-medium text-foreground">{orderDate}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-green-600">Status: {invoice.payment_status === 'paid' ? 'Paid' : 'Pending'}</p>
                        <p className="text-xs text-muted-foreground mt-1">Prices include VAT and Service Charge</p>
                    </div>
                </div>
            </DialogHeader>

            {/* Buyer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Buyer Information</h3>
                    <div className="text-foreground">
                        <p>{buyerInfo?.full_name}</p>
                        <p>{buyerInfo?.email}</p>
                        <p>{buyerInfo?.whatsapp_number}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Delivery Address</h3>
                    <div className="text-foreground">
                        <p>{invoice.delivery_address}</p>
                    </div>
                </div>
            </div>

            {/* Parts Breakdown */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Parts Breakdown</h3>
                {vehicleIds.map(vehicleId => {
                    const vehicle = vehicles.find(v => v.id === vehicleId);
                    const vehicleParts = groupedParts[vehicleId];
                    return (
                        <div key={vehicleId}>
                            {vehicle && (
                                <h4 className="font-semibold mb-2">{vehicle.make} {vehicle.model} - <span className="text-muted-foreground">{vehicle.vin}</span></h4>
                            )}
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="text-left p-3 font-semibold text-foreground">Part Name</th>
                                            <th className="text-left p-3 font-semibold text-foreground">Part Number</th>
                                            <th className="text-center p-3 font-semibold text-foreground">Qty</th>
                                            <th className="text-right p-3 font-semibold text-foreground">Unit Price</th>
                                            <th className="text-right p-3 font-semibold text-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicleParts.map(({ parts: part, quantity, unit_price }) => (
                                            <tr key={part.id} className="border-t">
                                                <td className="p-2">
                                                    {part.part_name}
                                                    {part.shipping_status === 'refunded' && <Badge variant="outline" className="ml-2 border-orange-500 text-orange-500">Refunded</Badge>}
                                                </td>
                                                <td className="p-2">{part.part_number}</td>
                                                <td className="text-center p-2">{quantity}</td>
                                                <td className="text-right p-2">{formatCurrency(unit_price)}</td>
                                                <td className="text-right p-2">{formatCurrency(unit_price * quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-8">
              <div className="w-full max-w-sm space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                </div>
              
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(calculations.deliveryFee)}</span>
                </div>
                {calculations.vatAmount > 0 && (
      <div className="flex justify-between">
        <span>VAT</span>
        <span className="font-medium">{formatCurrency(calculations.vatAmount)}</span>
      </div>
    )}
    
    {calculations.serviceFee > 0 && (
      <div className="flex justify-between">
        <span>Service Fee</span>
        <span className="font-medium">{formatCurrency(calculations.serviceFee)}</span>
      </div>
    )}
                {calculations.discountAmount > 0 && (
      <div className="flex justify-between text-green-600">
        <span>Discount</span>
        <span className="font-medium">-{formatCurrency(calculations.discountAmount)}</span>
      </div>
    )}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-8">All prices include VAT and Service Charge</p>
        </div>
        
        <DialogFooter className="p-4 bg-muted border-t sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
          </Button>
        </DialogFooter>
        <style>{`
          @media print {
            body > * {
              display: none;
            }
            .radix-dialog-content-wrapper {
              display: block !important;
            }
            #receipt-content {
              display: block;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};