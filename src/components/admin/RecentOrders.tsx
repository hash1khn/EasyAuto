import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  parts: Array<{
    id: string;
    part_name: string;
    part_number?: string;
    quantity: number;
    shipping_status: string;
  }>;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  vehicles: Vehicle[];
}

interface RecentOrdersProps {
  userId: string;
}

// First, add an interface for the Supabase response
interface PartWithVehicle {
  id: string;
  order_id: string;
  vehicle_id: string;
  part_name: string;
  part_number?: string;
  quantity: number;
  shipping_status: string;
  vehicles: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'out_for_delivery':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getOverallOrderStatus = (vehicles: Vehicle[]) => {
  const allParts = vehicles.flatMap(v => v.parts);
  if (allParts.length === 0) return 'No Parts';

  const statuses = allParts.map(p => p.shipping_status);

  if (statuses.every(s => s === 'delivered')) return 'Fully Delivered';
  if (statuses.some(s => s === 'cancelled')) return 'Cancelled';
  if (statuses.some(s => s === 'out_for_delivery')) return 'In Transit';
  if (statuses.some(s => s === 'confirmed')) return 'Processing';

  return 'Pending';
};

export const RecentOrders: React.FC<RecentOrdersProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch parts and vehicles for each order
        const orderIds = ordersData?.map(order => order.id) || [];
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select(`
            id,
            order_id,
            vehicle_id,
            part_name,
            part_number,
            quantity,
            shipping_status,
            vehicles (
              id,
              make,
              model,
              year,
              vin
            )
          `)
          .in('order_id', orderIds);

        if (partsError) throw partsError;

        // Transform the data
        const transformedOrders = ordersData?.map(order => {
          const orderParts = (partsData as unknown as PartWithVehicle[] | null)?.filter(part => 
            part.order_id === order.id
          ) || [];

          // Group parts by vehicle
          const vehicleMap = new Map<string, Vehicle>();
          orderParts.forEach(part => {
            if (!vehicleMap.has(part.vehicle_id)) {
              // Now TypeScript knows the shape of vehicles
              const vehicle = part.vehicles;
              vehicleMap.set(part.vehicle_id, {
                id: vehicle.id,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                vin: vehicle.vin,
                parts: []
              });
            }

            vehicleMap.get(part.vehicle_id)?.parts.push({
              id: part.id,
              part_name: part.part_name,
              part_number: part.part_number,
              quantity: part.quantity,
              shipping_status: part.shipping_status
            });
          });

          const vehicles = Array.from(vehicleMap.values());

          return {
            id: order.id,
            created_at: order.created_at,
            status: getOverallOrderStatus(vehicles),
            vehicles
          };
        }) || [];

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) return <div>Loading orders...</div>;
  if (!orders.length) return <div>No orders found</div>;

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Card key={order.id} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(order.created_at), 'PPP')}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {formatStatus(order.status)}
            </Badge>
          </div>

          <div className="space-y-4">
            {order.vehicles.map(vehicle => (
              <div key={vehicle.id} className="border-t pt-4">
                <div className="font-medium mb-2">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                  {vehicle.vin && (
                    <span className="text-xs text-gray-500 ml-2">
                      VIN: {vehicle.vin}
                    </span>
                  )}
                </div>
                <Label className="text-sm text-gray-600">Parts</Label>
                <ul className="mt-2 space-y-2">
                  {vehicle.parts.map(part => (
                    <li key={part.id} className="flex items-center justify-between">
                      <div>
                        <span>{part.part_name}</span>
                        {part.part_number && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({part.part_number})
                          </span>
                        )}
                        <span className="text-sm text-gray-500 ml-2">
                          x{part.quantity}
                        </span>
                      </div>
                      <Badge className={getStatusColor(part.shipping_status)}>
                        {formatStatus(part.shipping_status)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};