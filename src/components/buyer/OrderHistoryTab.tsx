import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import { OrderHistorySummary } from "./OrderHistorySummary";
import { OrderHistoryFilters } from "./OrderHistoryFilters";
import { OrderHistoryCard } from "./OrderHistoryCard";
import { PartModal } from "./PartModal";
import { ReceiptModal } from "./ReceiptModal";
import { RefundReceiptModal } from "./RefundReceiptModal";
import { useAuth } from "@/contexts/AuthContext";

interface OrderSummary {
  id: string;
  status: string;
  date: string;
  partCount: number;
  amount: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  hasRefunds: boolean;
  invoiceId: string;
}

export const OrderHistoryTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [receiptInvoiceId, setReceiptInvoiceId] = useState<string | null>(null);
  const [refundReceiptInvoiceId, setRefundReceiptInvoiceId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's invoices with delivered or refunded parts
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (!invoicesData) return;

        // Fetch parts for these invoices
        const { data: partsData } = await supabase
          .from('invoice_parts')
          .select('*, parts(*, vehicles(*))')
          .in('invoice_id', invoicesData.map(i => i.id));

        // Fetch vehicles
        const vehicleIds = partsData?.flatMap(p => p.parts?.vehicle_id) || [];
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', [...new Set(vehicleIds)]);

        if (partsData) setParts(partsData);
        if (vehiclesData) setVehicles(vehiclesData);

        // Create order summaries
        const orderSummaries = invoicesData.map(invoice => {
          const invoiceParts = partsData?.filter(p => p.invoice_id === invoice.id) || [];
          const hasRefunds = invoiceParts.some(p => p.parts?.shipping_status === 'refunded');
          
          const subtotal = invoiceParts.reduce((sum, part) => {
            if (part.parts?.shipping_status !== 'refunded') {
              return sum + (part.unit_price * part.quantity);
            }
            return sum;
          }, 0);
          
          const totalAmount = invoice.total_amount;
          const deliveryFee = invoice.delivery_fee;

          return {
            id: invoice.id,
            status: 'Delivered',
            date: new Date(invoice.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            partCount: invoiceParts.length,
            amount: `AED ${totalAmount.toFixed(2)}`,
            subtotal,
            deliveryFee,
            totalAmount,
            hasRefunds,
            invoiceId: invoice.id
          };
        });

        setOrders(orderSummaries);
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply date range filter
    if (fromDate && toDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
      });
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const orderParts = parts.filter(p => p.invoice_id === order.id);
        
        return orderParts.some(part => {
          const vehicle = vehicles.find(v => v.id === part.parts?.vehicle_id);
          const vehicleString = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin}`.toLowerCase() : '';
          return part.parts?.part_name.toLowerCase().includes(searchLower) || 
                 (part.parts?.part_number && part.parts.part_number.toLowerCase().includes(searchLower)) ||
                 vehicleString.includes(searchLower) ||
                 order.id.toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [searchTerm, sortOrder, fromDate, toDate, orders, parts, vehicles]);
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setSortOrder("newest");
    setFromDate("");
    setToDate("");
  };

  const handleViewPartDetails = (partId: string) => {
    const part = parts.find(p => p.parts?.id === partId)?.parts;
    if (part) setSelectedPart(part);
  };

  const handleShowReceipt = (invoiceId: string) => {
    setReceiptInvoiceId(invoiceId);
  };

  const handleShowRefundReceipt = (invoiceId: string) => {
    setRefundReceiptInvoiceId(invoiceId);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading order history...</div>;
  }

  return (
    <div className="space-y-6">
      <OrderHistoryHeader />
      <OrderHistorySummary parts={parts} />
      <OrderHistoryFilters 
        onClearFilters={handleClearFilters}
        onSearchChange={setSearchTerm}
        onDateRangeChange={(from, to) => {
          setFromDate(from);
          setToDate(to);
        }}
        searchTerm={searchTerm}
        fromDate={fromDate}
        toDate={toDate}
      />
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Showing {filteredOrders.length} of {orders.length} orders</p>
        {filteredOrders.map(order => (
          <OrderHistoryCard 
            key={order.id} 
            order={order} 
            onViewDetails={handleViewPartDetails}
            onShowReceipt={handleShowReceipt}
            onShowRefundReceipt={handleShowRefundReceipt}
          />
        ))}
      </div>
      
      <PartModal 
        part={selectedPart}
        vehicle={selectedPart ? vehicles.find(v => v.id === selectedPart.vehicle_id) : null}
        onOpenChange={() => setSelectedPart(null)}
      />
      <ReceiptModal 
        isOpen={!!receiptInvoiceId}
        onOpenChange={() => setReceiptInvoiceId(null)}
        invoiceId={receiptInvoiceId}
      />
      <RefundReceiptModal
        isOpen={!!refundReceiptInvoiceId}
        onOpenChange={() => setRefundReceiptInvoiceId(null)}
        invoiceId={refundReceiptInvoiceId}
      />
    </div>
  );
};