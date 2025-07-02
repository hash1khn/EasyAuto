import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireApproval?: boolean;
  isPaymentRoute?: boolean;
}

const FullPageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApproval = false,
  isPaymentRoute = false
}) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [paymentSessionValid, setPaymentSessionValid] = useState<boolean | null>(null);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      // Store the intended path while we're waiting for auth to initialize
      setIntendedPath(location.pathname);
    } else if (intendedPath && intendedPath !== location.pathname) {
      // Clear the intended path after we've initialized
      setIntendedPath(null);
    }
  }, [initialized, location.pathname]);

  useEffect(() => {
    const fetchUserRoleAndStatus = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, is_approved')
          .eq('user_id', user.id)
          .single();

        if (roleError || !roleData) {
          setUserRole('buyer');
          setIsApproved(true);
        } else {
          setUserRole(roleData.role);
          setIsApproved(roleData.is_approved || false);

          if (requireApproval && roleData.role === 'vendor') {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('application_status')
              .eq('id', user.id)
              .single();

            const isFullyApproved = roleData.is_approved && 
              profile?.application_status === 'approved';
            setIsApproved(isFullyApproved);
          }
        }
      } catch (error) {
        console.error('Error checking user authorization:', error);
        setUserRole('buyer');
        setIsApproved(true);
      }
      setCheckingRole(false);
    };

    if (initialized && user) {
      fetchUserRoleAndStatus();
    }
  }, [user, requireApproval, initialized]);

  useEffect(() => {
    if (isPaymentRoute && initialized) {
      const verifyPaymentSession = async () => {
        const sessionId = new URLSearchParams(location.search).get('session_id');
        if (!sessionId) {
          setPaymentSessionValid(false);
          return;
        }

        try {
          const { data } = await supabase
            .from('invoices')
            .select('user_id')
            .eq('stripe_session_id', sessionId)
            .single();

          setPaymentSessionValid(!!data);
        } catch (error) {
          console.error('Error verifying payment session:', error);
          setPaymentSessionValid(false);
        }
      };

      verifyPaymentSession();
    }
  }, [isPaymentRoute, location.search, initialized]);

  // Show loading while auth or role check is in progress
  if (!initialized || loading || checkingRole || (isPaymentRoute && paymentSessionValid === null)) {
    return <FullPageLoader />;
  }

  // Special case for payment route
  if (isPaymentRoute) {
    if (paymentSessionValid === false) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // If we have an intended path and we're now initialized, redirect there
  if (intendedPath && intendedPath !== location.pathname) {
    return <Navigate to={intendedPath} replace />;
  }

  // Normal protected route logic
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'vendor':
        return <Navigate to="/vendor" replace />;
      case 'sourcer':
        return <Navigate to="/sourcer" replace />;
      case 'driver':
        return <Navigate to="/driver/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  if (requireApproval && userRole === 'vendor' && !isApproved) {
    return <Navigate to="/vendor/status" replace />;
  }

  return <>{children}</>;
};