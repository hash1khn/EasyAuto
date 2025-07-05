import { supabase } from '@/integrations/supabase/client';

export interface ReferralAgent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface ReferralStats {
  total: number;
  vendors: number;
  buyers: number;
}

export const getReferralAgents = async (activeOnly = true) => {
  let query = supabase
    .from('referral_agents')
    .select('*')
    .order('name', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ReferralAgent[];
};

export const createReferralAgent = async (agentData: {
  name: string;
  email?: string;
  phone?: string;
}) => {
  const { data, error } = await supabase
    .from('referral_agents')
    .insert([{ ...agentData, is_active: true }])
    .select()
    .single();

  if (error) throw error;
  return data as ReferralAgent;
};

export const updateReferralAgent = async (id: string, updates: Partial<ReferralAgent>) => {
  const { data, error } = await supabase
    .from('referral_agents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ReferralAgent;
};

export const deleteReferralAgent = async (id: string) => {
  const { error } = await supabase
    .from('referral_agents')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const getReferralStats = async (agentId: string) => {
  // Get total referrals
  const { count: total } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', agentId);

  // First get all vendor user_ids
  const { data: vendorUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'vendor');

  const vendorIds = vendorUsers?.map(u => u.user_id) || [];

  // Get vendor referrals
  const { count: vendors } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', agentId)
    .in('id', vendorIds);

  // First get all buyer user_ids
  const { data: buyerUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'buyer');

  const buyerIds = buyerUsers?.map(u => u.user_id) || [];

  // Get buyer referrals
  const { count: buyers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', agentId)
    .in('id', buyerIds);

  return {
    total: total || 0,
    vendors: vendors || 0,
    buyers: buyers || 0
  } as ReferralStats;
};

export const getAgentsWithStats = async () => {
  const agents = await getReferralAgents(false);
  const statsPromises = agents.map(async agent => {
    const stats = await getReferralStats(agent.id);
    return { agent, stats };
  });
  
  const results = await Promise.all(statsPromises);
  return results;
};

export const assignReferralToUser = async (userId: string, agentId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ referred_by: agentId })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update the getUnassignedUsers function
export const getUnassignedUsers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      full_name,
      created_at,
      users:user_id(email),
      user_roles!inner(role)
    `)
    .is('referred_by', null);

  if (error) throw error;
  return data;
};

// Update the getUserWithReferral function
export const getUserWithReferral = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      full_name,
      referred_by,
      users:user_id(email),
      user_roles(role)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserReferral = async (userId: string, agentId: string | null) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ referred_by: agentId })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};