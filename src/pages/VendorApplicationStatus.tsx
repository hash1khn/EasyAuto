import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, XCircle, CheckCircle } from 'lucide-react';

interface VendorStatus {
  application_status: string;
  rejection_reason?: string;
  is_approved: boolean;
}

export const VendorApplicationStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<VendorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('application_status, rejection_reason')
        .eq('id', user.id)
        .single();

      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('is_approved')
        .eq('user_id', user.id)
        .single();

      if (!profileError && !roleError && profile && role) {
        setStatus({
          application_status: profile.application_status,
          rejection_reason: profile.rejection_reason,
          is_approved: role.is_approved
        });
      }
      setLoading(false);
    };

    fetchStatus();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!status) {
    return <div>Error loading application status</div>;
  }

  const renderContent = () => {
    if (status.application_status === 'pending') {
      return (
        <div className="text-center space-y-4">
          <Clock className="w-16 h-16 mx-auto text-yellow-500" />
          <h1 className="text-2xl font-bold">Application Under Review</h1>
          <p className="text-gray-600">
            Your vendor application is currently being reviewed by our team.
            We'll notify you once a decision has been made.
          </p>
        </div>
      );
    }

    if (status.application_status === 'rejected') {
      return (
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold">Application Rejected</h1>
          <p className="text-gray-600">
            Unfortunately, your vendor application has been rejected.
          </p>
          {status.rejection_reason && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-700">Reason: {status.rejection_reason}</p>
            </div>
          )}
        </div>
      );
    }

    if (status.application_status === 'approved' && !status.is_approved) {
      return (
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-blue-500" />
          <h1 className="text-2xl font-bold">Final Verification Pending</h1>
          <p className="text-gray-600">
            Your application has been approved and is in the final verification stage.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h1 className="text-2xl font-bold">Application Approved</h1>
        <p className="text-gray-600">
          Your vendor account has been approved. You can now access the vendor dashboard.
        </p>
        <Button onClick={() => navigate('/vendor')}>
          Go to Vendor Dashboard
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {renderContent()}
        <div className="mt-8 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};