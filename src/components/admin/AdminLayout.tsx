import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { Home, Users, FileText, Settings, LogOut, Package, History, Truck, User, Activity ,Percent,Share2} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type AdminTabId = 'overview' | 'users' | 'applications' | 'orders' | 'logistics' | 'logs' | 'modifiers'| 'referral';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
}

const tabs = [
  { id: 'overview' as AdminTabId, label: 'Overview', icon: Home },
  { id: 'users' as AdminTabId, label: 'Users', icon: Users },
  { id: 'applications' as AdminTabId, label: 'Applications', icon: FileText },
  { id: 'orders' as AdminTabId, label: 'Orders', icon: Package }, // Changed from History to Package
  { id: 'logistics' as AdminTabId, label: 'Logistics', icon: Truck },
  { id: 'modifiers' as AdminTabId, label: 'Price Modifiers', icon: Percent },

  { id: 'logs' as AdminTabId, label: 'Logs', icon: Activity },
{
  id: 'referral' as AdminTabId,
  label: 'Referral Management',
  icon: Share2, // Best for referrals (sharing concept)

}];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { user, signOut } = useAuth();
  const { isVendor } = useUserRoles();
  const navigate = useNavigate();  // Add this

  const handleModeSwitch = (mode: 'buyer' | 'vendor') => {
    switch (mode) {
      case 'buyer':
        navigate('/dashboard');
        break;
      case 'vendor':
        navigate('/vendor');
        break;
    }
  };

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: activeTab === tab.id,
    onClick: () => onTabChange(tab.id)
  }));

  const header = (
    <div className="p-4 space-y-2">
      <div className='text-center text-sm p-2 bg-red-50 text-red-700 rounded-md'>
        Admin: {user?.email}
      </div>
    </div>
  );

  const footer = (
    <div className="space-y-3">
      {/* Mode Switch Buttons */}
      <div className="space-y-2 border-b border-gray-200 pb-3 mb-3">
        <p className="text-xs text-gray-500 mb-2">Switch Dashboard</p>
        
        {/* Buyer Mode Button */}
        <Button
          onClick={() => handleModeSwitch('buyer')}
          variant="outline"
          className="w-full text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <User className="w-4 h-4 mr-2" />
          Buyer Mode
        </Button>

        {/* Vendor Mode Button */}
        <Button
          onClick={() => handleModeSwitch('vendor')}
          variant="outline"
          className="w-full text-sm bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100"
        >
          🧰 Vendor Mode
        </Button>

        {/* Sourcer Mode Button */}
        <Button
          onClick={() => navigate('/sourcer')}
          variant="outline"
          className="w-full text-sm bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
        >
          🔍 Sourcer Mode
        </Button>
      </div>

      {/* Sign Out Button */}
      <Button
        onClick={signOut}
        variant="outline"
        className="w-full flex items-center justify-center hover:bg-gray-50"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <ResponsiveSidebar
      title="Admin Panel"
      subtitle="EasyCarParts.ae"
      items={sidebarItems}
      header={header}
      footer={footer}
    >
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </ResponsiveSidebar>
  );
};