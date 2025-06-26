import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database} from '../types/supabase'; // adjust path if needed

// Utility type
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Types
export type Order = Tables<'orders'> & { customer_name: string };
export type UserProfile = Tables<'user_profiles'>;
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
  total_orders: number;
}

// Add this interface to type the RPC response
interface AdminDataResponse {
  platform_stats: PlatformStats;
  all_orders: Order[];
  all_users: User[];
  vendor_applications: UserProfile[];
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
  total_orders: 0,
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
      const { data, error } = await supabase.rpc('get_admin_data');

      if (error) throw error;

      // Type the result properly
      const result = (data?.[0] ?? {}) as AdminDataResponse;

      setStats(
        typeof result.platform_stats === 'object' && result.platform_stats !== null
          ? result.platform_stats
          : initialStats
      );

      setOrders(Array.isArray(result.all_orders) ? result.all_orders : []);
      setUsers(Array.isArray(result.all_users) ? result.all_users : []);
      setVendorApplications(Array.isArray(result.vendor_applications) ? result.vendor_applications : []);
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