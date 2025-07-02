import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  liveOrders: number;
  pendingBids: number;
  readyForCheckout: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    liveOrders: 0,
    pendingBids: 0,
    readyForCheckout: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user profile first to get the correct user_id for queries
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch orders with all related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          is_paid,
          parts (
            id,
            part_name,
            description,
            part_number,
            quantity,
            inspection_images,
            shipping_status,
            estimated_budget,
            created_at,
            vehicle:vehicles (
              id,
              make,
              model,
              year,
              vin
            ),
            bids (
              id,
              price,
              notes,
              warranty,
              condition,
              status,
              image_url,
              created_at,
              vendor:user_profiles!vendor_id (
                id,
                full_name,
                business_name
              )
            )
          )
        `)
        .eq('user_id', userProfile.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Process orders for live orders display
      const liveOrdersData = ordersData?.filter(order => 
        order.status === 'open' && order.parts.some(part => 
          part.shipping_status !== 'delivered' && part.shipping_status !== 'admin_collected'
        )
      ) || [];

      const processedOrders = liveOrdersData.map(order => {
        const partsWithDetails = order.parts
          .filter(part => 
            part.shipping_status !== 'delivered' && part.shipping_status !== 'admin_collected'
          )
          .map(part => ({
            ...part,
            vehicle: part.vehicle,
            bids: part.bids || []
          }));

        const hasAcceptedBids = partsWithDetails.some(part => 
          part.bids.some((bid: any) => bid.status === 'accepted')
        );

        return {
          ...order,
          parts: partsWithDetails,
          hasAcceptedBids
        };
      });

      // Calculate dashboard statistics
      const stats = {
        liveOrders: liveOrdersData.length,
        pendingBids: 0,
        readyForCheckout: 0
      };

      // Count pending bids across all orders
      ordersData?.forEach(order => {
        order.parts.forEach(part => {
          const pendingBidsCount = part.bids.filter((bid: any) => bid.status === 'pending').length;
          stats.pendingBids += pendingBidsCount;
        });
      });

      // Count orders ready for checkout (has accepted bids but not paid)
      stats.readyForCheckout = ordersData?.filter(order => 
        !order.is_paid && 
        order.parts.some(part => 
          part.bids.some((bid: any) => bid.status === 'accepted')
        )
      ).length || 0;

      setLiveOrders(processedOrders);
      setDashboardStats(stats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Unable to fetch dashboard data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get vehicles with parts for the dashboard display
  const getVehiclesWithParts = () => {
    const vehiclesMap = new Map();

    liveOrders.forEach(order => {
      order.parts.forEach(part => {
        if (part.vehicle) {
          const vehicleKey = part.vehicle.id;
          
          if (!vehiclesMap.has(vehicleKey)) {
            vehiclesMap.set(vehicleKey, {
              ...part.vehicle,
              parts: []
            });
          }
          
          vehiclesMap.get(vehicleKey).parts.push({
            ...part,
            order_id: order.id,
            orderDate: order.created_at
          });
        }
      });
    });

    return Array.from(vehiclesMap.values());
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return { 
    liveOrders, 
    dashboardStats,
    vehiclesWithParts: getVehiclesWithParts(),
    loading,
    refetchOrders: fetchDashboardData
  };
};