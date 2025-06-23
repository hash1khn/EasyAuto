import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AuthModal } from '@/components/AuthModal';
import  DashboardLayout from '@/components/dashboard/DashboardLayout'
import { BuyerDashboard } from '@/components/dashboard/BuyerDashboard';
import { QuoteHistory } from '@/components/dashboard/QuoteHistory';
import { Support } from '@/components/dashboard/Support';
import { VendorApplicationForm } from '@/components/VendorApplicationForm';
import { UserRoleGuard } from '@/components/dashboard/UserRoleGuard';
import { SettingsContent } from '@/components/dashboard/SettingsContent';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardTab } from '@/types/dashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isVendor } = useUserRoles();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showVendorApplication, setShowVendorApplication] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      fetchUserData();
    }
  }, [user, loading]);

  // Add event listener for tab changes from dashboard home
  useEffect(() => {
    const handleTabChange = (event: any) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const fetchUserData = async () => {
  if (!user) return;

  try {
    // Fetch from user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return;
    }

    // Fetch from user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role,is_approved')
      .eq('user_id', user.id)
      .single();
    if (roleError) {
      console.error('Error fetching user role:', roleError);
      return;
    }

    // Combine both
    const mergedProfile = {
      ...profileData,
      user_role: roleData?.role || null,
      is_approved: roleData?.is_approved ?? null,

    };
    setUserProfile(mergedProfile);
  } catch (err) {
    console.error('Unexpected error fetching user data:', err);
  }
};



  const handleSwitchToVendor = () => {
    navigate('/vendor');
  };

  const handleVendorApplicationSubmitted = () => {
    setShowVendorApplication(false);
    setActiveTab('settings');
    fetchUserData();
  };

  // Show auth modal if not logged in
  if (!loading && !user) {
    return (
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        showSignup={showSignup}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    if (showVendorApplication) {
      return (
        <VendorApplicationForm 
          userProfile={userProfile}
          onApplicationSubmitted={handleVendorApplicationSubmitted}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <BuyerDashboard />;
      case 'quotes':
        return <QuoteHistory />;
      case 'support':
        return <Support />;
      case 'settings':
        return (
          <SettingsContent
            userProfile={userProfile}
            onProfileUpdate={fetchUserData}
            onShowVendorApplication={() => setShowVendorApplication(true)}
            onSwitchToVendor={handleSwitchToVendor}
          />
        );
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <UserRoleGuard>
      <DashboardLayout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userProfile={userProfile}
        showVendorSwitch={isVendor()}
        onSwitchToVendor={handleSwitchToVendor}
      >
        {renderContent()}
      </DashboardLayout>
    </UserRoleGuard>
  );
};

export default Dashboard;
