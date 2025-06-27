import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from '@/hooks/useAdminData';
import { RecentOrders } from './RecentOrders';
import { supabase } from '@/integrations/supabase/client';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  user, 
  isOpen, 
  onClose 
}) => {
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch the current role from user_roles table
      const fetchUserRole = async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setEditedUser({ ...user, roles: [data.role] });
        } else {
          setEditedUser({ ...user, roles: [] });
        }
      };

      fetchUserRole();
    }
  }, [user]);

  const isBuyer = editedUser?.roles?.includes('buyer');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        {editedUser && (
          <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={editedUser.email} readOnly />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={editedUser.full_name || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Business Name</Label>
                <Input value={editedUser.business_name || 'N/A'} readOnly />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={editedUser.whatsapp_number || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={editedUser.location || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Google Maps URL</Label>
                <Input value={editedUser.google_maps_url || 'N/A'} readOnly />
              </div>
            </div>

            <div className="mt-4">
              <Label>Current Role</Label>
              <div className="flex gap-2 mt-2">
                {editedUser.roles?.[0] ? (
                  <Badge variant="default">
                    {editedUser.roles[0]}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-500">No role assigned</span>
                )}
              </div>
            </div>

            {isBuyer && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Order History</h3>
                <RecentOrders userId={editedUser.id} />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};