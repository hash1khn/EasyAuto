import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentOrdersProps {
  userId: string;
}

// Define more specific types based on your expected query result
type Order = {
  id: string;
  created_at: string;
  status: 'open' | 'partial' | 'closed' | 'cancelled' | 'refunded' | 'ready_for_checkout' | 'completed';
  is_paid: boolean;
  parts: { part_name: string; quantity: number }[];
  invoice: { invoice_url: string | null; total_amount: number } | null;
  vehicle: { make: string; model: string; year: number } | null;
};

export const RecentOrders: React.FC<RecentOrdersProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await (supabase.rpc as any)('get_user_orders', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch recent orders.');
      } else {
        setOrders((data as Order[]) || []);
      }
      setLoading(false);
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Orders</AlertTitle>
        <AlertDescription>This user has no recent orders matching the criteria.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {orders.map(order => (
        <AccordionItem value={order.id} key={order.id}>
          <AccordionTrigger>
            <div className="flex justify-between items-center w-full pr-4">
              <div className="text-left">
                {/* <p className="font-semibold">
                  Order #{order.id.substring(0, 8)}
                  {order.vehicle && ` for ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.year})`}
                </p> */}
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                  {order.parts && ` - ${order.parts.reduce((acc, p) => acc + p.quantity, 0)} items`}
                </p>
              </div>
              <Badge>{order.status}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> <Badge variant="outline">{order.status}</Badge></p>
              <p><strong>Paid:</strong> {order.is_paid ? <Badge color="green">Yes</Badge> : <Badge variant="secondary">No</Badge>}</p>
              {order.invoice?.total_amount && (
                 <p><strong>Total:</strong> AED {order.invoice.total_amount.toFixed(2)}</p>
              )}
              {order.is_paid && order.invoice?.invoice_url && (
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href={order.invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                    View Invoice
                  </a>
                </Button>
              )}
              {order.parts && order.parts.length > 0 && (
                <>
                  <h4 className="font-semibold mt-2">Parts</h4>
                  <ul className="list-disc list-inside pl-4">
                    {order.parts.map((part, index) => (
                      <li key={index}>{part.part_name} (x{part.quantity})</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}; 