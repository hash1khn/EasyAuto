import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database} from '../types/supabase'; // adjust path if needed

// Utility type
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Types
export type Order = Tables<'orders'> & {
  parts: {
    id: string;
    shipping_status: string;
    delivered_at: string | null;
  }[];
};
export type UserProfile = Tables<'user_profiles'> & {
  email?: string;  // Add this line
};
export type User = {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  business_name: string | null;
  whatsapp_number: string | null;
  location: string | null;
  google_maps_url: string | null;
  roles: string[];
  status: 'active' | 'disabled';
  user_id: string;
};

export interface PlatformStats {
  total_users: number;
  total_vendors: number;
  total_buyers: number;
  total_parts: number;  // Changed from total_orders
  active_parts: number;
  delivered_parts: number;
  pending_quotes: number;  // Add this new field
  total_revenue: number;
  outstanding_payments: number; // Add outstanding payments
  flagged_issues: {
    pending_refunds: number;
    pending_applications: number;
    unprocessed_payouts: number;
    problem_shipments: number;
    failed_payments: number;
    total: number;
  };
}

// Add this interface to type the RPC response
interface AdminDataResponse {
  platform_stats: PlatformStats;
  all_orders: Order[];
  all_users: User[];
  vendor_applications: Array<UserProfile & { email: string }>; // Updated this line
}

export interface AdminData {
  stats: PlatformStats;
  orders: Order[];
  users: User[];
  vendorApplications: UserProfile[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

const initialStats: PlatformStats = {
  total_users: 0,
  total_vendors: 0,
  total_buyers: 0,
  total_parts: 0,    // Changed from total_orders
  active_parts: 0,
  delivered_parts: 0,
  pending_quotes: 0,  // Add initial value
  total_revenue: 0,
  outstanding_payments: 0, // Initialize outstanding payments
  flagged_issues: {
    pending_refunds: 0,
    pending_applications: 0,
    unprocessed_payouts: 0,
    problem_shipments: 0,
    failed_payments: 0,
    total: 0
  }
};

export const useAdminData = (): AdminData => {
  const [stats, setStats] = useState<PlatformStats>(initialStats);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendorApplications, setVendorApplications] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First get parts stats
      const { data: statsData, error: statsError } = await supabase
        .from('orders')
        .select(`
          id,
          parts (
            id,
            shipping_status,
            delivered_at
          )
        `);

      if (statsError) throw statsError;

      // Calculate parts statistics
      const totalParts = statsData?.reduce((acc, order) => 
        acc + (order.parts?.length || 0), 0) || 0;

      const activeParts = statsData?.reduce((acc, order) => 
        acc + (order.parts?.filter(part => 
          part.shipping_status !== 'delivered' && 
          part.shipping_status !== 'cancelled' && 
          part.shipping_status !== 'refunded'
        ).length || 0), 0) || 0;

      const deliveredParts = statsData?.reduce((acc, order) => 
        acc + (order.parts?.filter(part => 
          part.shipping_status === 'delivered'
        ).length || 0), 0) || 0;

      // Get admin data
      const { data: adminData, error: adminError } = await supabase
        .rpc('get_admin_data');

      if (adminError) throw adminError;

      console.log(adminData)

      // Get pending quotes count
      const { count: pendingQuotes, error: bidsError } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (bidsError) throw bidsError;

      // Get total revenue from invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('service_fee');

      if (invoiceError) throw invoiceError;

      // Calculate total revenue from service fees
      const totalRevenue = invoiceData?.reduce((acc, invoice) => 
        acc + (invoice.service_fee || 0), 0) || 0;

      // Get flagged issues counts
      const [
        { count: pendingRefunds },
        { count: pendingApplications },
        { count: unprocessedPayouts },
        { count: problemShipments },
        { count: failedPayments }
      ] = await Promise.all([
        // Pending refunds
        supabase
          .from('refund_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Pending vendor applications
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('application_status', 'pending'),

        // Unprocessed payouts
        supabase
          .from('vendor_payouts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Problem shipments
        supabase
          .from('parts')
          .select('*', { count: 'exact', head: true })
          .in('shipping_status', ['cancelled', 'refunded']),

        // Failed payments
        supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'failed')
      ]);

      // Update combined stats with flagged issues
      const flaggedIssues = {
        pending_refunds: pendingRefunds || 0,
        pending_applications: pendingApplications || 0,
        unprocessed_payouts: unprocessedPayouts || 0,
        problem_shipments: problemShipments || 0,
        failed_payments: failedPayments || 0,
        total: (pendingRefunds || 0) + 
               (pendingApplications || 0) + 
               (unprocessedPayouts || 0) + 
               (problemShipments || 0) + 
               (failedPayments || 0)
      };

      const combinedStats = {
        ...(adminData?.[0]?.platform_stats || initialStats),
        total_parts: totalParts,
        active_parts: activeParts,
        delivered_parts: deliveredParts,
        pending_quotes: pendingQuotes || 0,
        total_revenue: totalRevenue,
        flagged_issues: flaggedIssues
      };

      setStats(combinedStats);

      // Set other data from admin dashboard
      if (adminData?.[0]) {
        const result = adminData[0] as AdminDataResponse;
        setOrders(Array.isArray(result.all_orders) ? result.all_orders : []);
        setUsers(Array.isArray(result.all_users) ? result.all_users : []);
        setVendorApplications(Array.isArray(result.vendor_applications) ? result.vendor_applications : []);
      }

    } catch (err: any) {
      console.error("Error fetching admin data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVendorApplications = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        full_name,
        business_name,
        whatsapp_number,
        location,
        application_status,
        application_submitted_at
      `)
      .neq('application_status', 'not_applied')
      .order('application_submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    orders,
    users,
    vendorApplications,
    loading,
    error,
    refresh: fetchData,
  };
};