import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Order = {
  id: string;
  created_at: string;
  status: 'open' | 'partial' | 'closed' | 'cancelled' | 'refunded' | 'ready_for_checkout' | 'completed';
  parts: {
    id: string;
    part_name: string;
    quantity: number;
    shipping_status: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
    } | null;
  }[];
};

interface RecentOrdersProps {
  userId: string;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          parts (
            id,
            part_name,
            quantity,
            shipping_status,
            vehicle:vehicles (
              make,
              model,
              year
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!orders.length) return <div>No orders found</div>;

  return (
    <Accordion type="single" collapsible className="w-full">
      {orders.map(order => (
        <AccordionItem value={order.id} key={order.id}>
          <AccordionTrigger>
            <div className="flex justify-between items-center w-full pr-4">
              <div className="text-left">
                <p className="text-sm text-gray-500">
                  {format(new Date(order.created_at), 'PPP')}
                  {order.parts && ` - ${order.parts.length} parts`}
                </p>
              </div>
              <Badge>{order.status}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {order.parts.map(part => (
              <div key={part.id} className="py-2">
                <div className="flex justify-between items-center">
                  <span>{part.part_name} (x{part.quantity})</span>
                  <Badge variant="outline">{part.shipping_status}</Badge>
                </div>
                {part.vehicle && (
                  <p className="text-sm text-gray-500">
                    {part.vehicle.make} {part.vehicle.model} ({part.vehicle.year})
                  </p>
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};