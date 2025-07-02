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

interface RefundReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoiceId: string | null;
}

export const RefundReceiptModal = ({ isOpen, onOpenChange, invoiceId }: RefundReceiptModalProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [refundedParts, setRefundedParts] = useState<any[]>([]);
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

        // Fetch refunded parts for this invoice
        const { data: partsData } = await supabase
          .from('invoice_parts')
          .select('*, parts(*)')
          .eq('invoice_id', invoiceId)
          .eq('parts.shipping_status', 'refunded');

        if (partsData) {
          setRefundedParts(partsData);
        }
      } catch (error) {
        console.error('Error fetching refund receipt data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  if (!invoiceId || !invoice) return null;

  const refundDate = new Date(invoice.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
  
  const refundTotal = refundedParts.reduce((sum, part) => sum + (part.unit_price || 0) * part.quantity, 0);

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`;
  
  const handlePrint = () => {
      window.print();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-8">
          <div className="flex justify-center items-center h-64">
            Loading refund receipt...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col max-h-[90vh]">
        <div id="refund-receipt-content" className="p-8 overflow-y-auto">
            {/* Header */}
            <DialogHeader className="mb-8 text-left">
                <DialogTitle className="text-3xl font-bold">Refund Receipt</DialogTitle>
                <div className="flex justify-between text-sm pt-2">
                    <div>
                        <p className="text-muted-foreground">Original Invoice ID: <span className="font-medium text-foreground">{invoiceId}</span></p>
                        <p className="text-muted-foreground">Refund Date: <span className="font-medium text-foreground">{refundDate}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-orange-600">Status: Refund Processed</p>
                    </div>
                </div>
            </DialogHeader>

            {/* Buyer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
                 <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Refund Issued To</h3>
                     <div className="text-foreground">
                        <p>{buyerInfo?.full_name}</p>
                        <p>{buyerInfo?.email}</p>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Credit Note</h3>
                     <p className="text-sm text-muted-foreground">This credit note confirms the refund for the items listed below.</p>
                </div>
            </div>

            {/* Refunded Parts */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Refunded Items</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="text-left p-3 font-semibold text-foreground">Part Name</th>
                                <th className="text-left p-3 font-semibold text-foreground">Part Number</th>
                                <th className="text-center p-3 font-semibold text-foreground">Qty</th>
                                <th className="text-right p-3 font-semibold text-foreground">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refundedParts.map(({ parts: part, quantity, unit_price }) => (
                                <tr key={part.id} className="border-t">
                                    <td className="p-2">{part.part_name}</td>
                                    <td className="p-2">{part.part_number}</td>
                                    <td className="text-center p-2">{quantity}</td>
                                    <td className="text-right p-2">{formatCurrency(unit_price * quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-8">
                <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                        <span>Total Refunded</span>
                        <span>{formatCurrency(refundTotal)}</span>
                    </div>
                </div>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-8">The refunded amount will be returned via the original payment method.</p>
        </div>
        
        <DialogFooter className="p-4 bg-muted border-t sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Refund Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};