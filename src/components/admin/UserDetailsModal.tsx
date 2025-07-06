import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from '@/hooks/useAdminData';
import { RecentOrders } from './RecentOrders';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  user, 
  isOpen, 
  onClose,
  onUserUpdate
}) => {
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();
  const{user:currentAdmin}=useAuth();

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

  const handleDeleteUser = async () => {
    if (!editedUser) return;

    setIsDeleting(true);
    try {
      // First, log the deletion action
      const logResult = await supabase
        .from('admin_logs')
        .insert({
          admin_id: currentAdmin.id,
          action: 'delete_user',
          target_table: 'users',
          target_id: editedUser.id,
          details: {
            email: editedUser.email,
            roles: editedUser.roles
          }
        });

      if (logResult.error) throw logResult.error;

      // Delete from user_roles first (due to foreign key constraints)
      const roleDeleteResult = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editedUser.id);

      if (roleDeleteResult.error) throw roleDeleteResult.error;

      // Delete from user_profiles
      const profileDeleteResult = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', editedUser.id);

      if (profileDeleteResult.error) throw profileDeleteResult.error;

      // Finally delete from auth.users
      const userDeleteResult = await supabase
        .from('users')
        .delete()
        .eq('id', editedUser.id);

      if (userDeleteResult.error) throw userDeleteResult.error;

      toast({
        title: 'User deleted successfully',
        description: `User ${editedUser.email} has been removed from the system.`,
      });

      onUserUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error deleting user',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    await handleDeleteUser();
    setShowDeleteAlert(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteAlert(false);
  };

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
              {/* Address Section */}
              <div className="col-span-2 mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Delivery Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Delivery Address</Label>
                    <Input 
                      value={editedUser.delivery_address || 'N/A'} 
                      readOnly 
                    />
                  </div>
                  
                </div>
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
          <Button 
            variant="destructive" 
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} alt>
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};