import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const BuyerApplicationStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('application_status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching status:', error);
        return;
      }

      setStatus(data.application_status);

      // If approved, redirect to dashboard
      if (data.application_status === 'approved') {
        navigate('/dashboard');
      }
    };

    fetchStatus();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Application Status</h1>
        <div className="text-center space-y-4">
          {status === 'pending' && (
            <>
              <p className="text-yellow-600">Your application is under review.</p>
              <p className="text-gray-600">
                We'll review your application shortly. You'll receive an email once approved.
              </p>
            </>
          )}
          {status === 'rejected' && (
            <>
              <p className="text-red-600">Your application was not approved.</p>
              <p className="text-gray-600">
                Please contact support for more information.
              </p>
            </>
          )}
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};