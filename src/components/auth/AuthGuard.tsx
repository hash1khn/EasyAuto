import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export const AuthGuard: React.FC = () => {
  const { user, loading, initialized } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading, initialized]);

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    navigate('/', { replace: true });
  };

  if (loading || !initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
      />
    </>
  );
};