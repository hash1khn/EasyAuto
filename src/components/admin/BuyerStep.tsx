import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserProfileWithEmail {
  id: string;
  full_name: string;
  business_name: string | null;
  users: {
    email: string;
  };  // Changed from array to single object
}

interface Buyer {
  id: string;
  full_name: string;
  business_name: string | null;
  email: string;
}

interface BuyerStepProps {
  selectedBuyerId: string | null;
  onSelectBuyer: (id: string) => void;
  onNext: () => void;
}

export const BuyerStep = ({ selectedBuyerId, onSelectBuyer, onNext }: BuyerStepProps) => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyers = async () => {
      // First get buyer role IDs
      const { data: buyerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'buyer');

      if (rolesError) {
        console.error('Error fetching buyer roles:', rolesError);
        setLoading(false);
        return;
      }

      const buyerIds = buyerRoles.map(role => role.user_id);
      console.log('Buyer IDs:', buyerIds);

      // Then fetch user profiles with their emails
      // Note: Using user_profiles_id_fkey to specify the exact relationship
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          business_name,
          users!user_profiles_id_fkey (
            email
          )
        `)
        .in('id', buyerIds);

      console.log('Raw profiles:', profiles);

      if (!profilesError && profiles) {
        const transformedBuyers = profiles
          .filter(profile => profile.users?.email) // Changed filter condition
          .map(profile => ({
            id: profile.id,
            full_name: profile.full_name,
            business_name: profile.business_name,
            email: profile.users.email // Direct access since it's not an array anymore
          }));

        console.log('Transformed buyers:', transformedBuyers);
        setBuyers(transformedBuyers);
      } else {
        console.error('Error fetching buyer profiles:', profilesError);
      }
      
      setLoading(false);
    };

    fetchBuyers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Label>Select Buyer</Label>
        <Select
          value={selectedBuyerId || ''}
          onValueChange={onSelectBuyer}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a buyer" />
          </SelectTrigger>
          <SelectContent>
            {buyers.map(buyer => (
              <SelectItem key={buyer.id} value={buyer.id}>
                {buyer.business_name ? 
                  `${buyer.full_name} (${buyer.business_name})` : 
                  buyer.full_name} - {buyer.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={!selectedBuyerId}
        >
          Next
        </Button>
      </div>
    </div>
  );
};