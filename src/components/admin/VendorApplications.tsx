import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export const VendorApplications: React.FC = () => {
  const { vendorApplications, refresh: refetchVendorApplications } = useAdminData();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDraft, setAppDraft] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setAppDraft({ ...app });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
    setAppDraft(null);
  };

  const handleDraftChange = (field: string, value: string) => {
    setAppDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccept = async () => {
    if (!appDraft?.user_id) return;
    
    setLoadingStates(prev => ({ ...prev, [appDraft.user_id]: true }));
    
    try {
      // Update application status in user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          application_status: 'approved',
          business_name: appDraft.business_name,
          full_name: appDraft.full_name,
          whatsapp_number: appDraft.whatsapp_number,
          location: appDraft.location,
          google_maps_url: appDraft.google_maps_url,
        })
        .eq('user_id', appDraft.user_id);

      if (updateError) throw updateError;

      // Update user role
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({ 
          role: 'vendor',
          is_approved: true 
        })
        .eq('user_id', appDraft.user_id);

      if (roleUpdateError) throw roleUpdateError;

      await refetchVendorApplications();
      handleCloseModal();
      
      toast({
        title: "Application approved",
        description: "Vendor application has been approved successfully.",
      });
    } catch (error) {
      console.error('Approval failed:', error);
      toast({
        title: "Error",
        description: `Failed to approve the application: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [appDraft.user_id]: false }));
    }
  };

  const filteredApplications = vendorApplications.filter(
    app => app.application_status !== 'not_applied'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Applications</h1>
        <p className="text-gray-500">Review and accept new applications.</p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Applicant Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.business_name || 'N/A'}</TableCell>
                <TableCell>{app.full_name}</TableCell>
                <TableCell>{app.whatsapp_number}</TableCell>
                <TableCell>{app.location}</TableCell>
                <TableCell>{format(new Date(app.application_submitted_at), 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={app.application_status === 'approved' ? 'default' : 'secondary'}>
                    {app.application_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {app.application_status !== 'approved' && (
                    <Button size="sm" onClick={() => handleOpenModal(app)}>
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg p-0 bg-transparent shadow-none">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                Application Details
              </CardTitle>
              <CardDescription>Review and edit application details before accepting.</CardDescription>
            </CardHeader>
            {appDraft && (
              <form onSubmit={(e) => e.preventDefault()}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={appDraft.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={appDraft.full_name || ''} 
                      onChange={e => handleDraftChange('full_name', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input 
                      value={appDraft.whatsapp_number || ''} 
                      onChange={e => handleDraftChange('whatsapp_number', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      value={appDraft.location || ''} 
                      onChange={e => handleDraftChange('location', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input 
                      value={appDraft.business_name || ''} 
                      onChange={e => handleDraftChange('business_name', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Maps URL</Label>
                    <Input 
                      value={appDraft.google_maps_url || ''} 
                      onChange={e => handleDraftChange('google_maps_url', e.target.value)} 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                  <Button 
                    type="button" 
                    onClick={handleAccept} 
                    className="w-full md:w-auto"
                    disabled={loadingStates[appDraft.user_id]}
                  >
                    {loadingStates[appDraft.user_id] ? 'Processing...' : 'Accept'}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </CardFooter>
              </form>
            )}
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};