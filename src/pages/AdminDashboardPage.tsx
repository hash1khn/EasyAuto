import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminLayout, AdminTabId } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { UserManagement } from '@/components/admin/UserManagement';
import { VendorApplications } from '@/components/admin/VendorApplications';
import LogisticsPage from '@/pages/LogisticsPage';
import { AdminLogs } from '@/components/admin/logs/AdminLogs';
import { AdminOrders } from '@/components/admin/orders/AdminOrders';
import { PriceModifiers } from '@/components/admin/PriceModifiers';

const AdminDashboardPage = () => {
  const { loading, error, refresh } = useAdminData();
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-4 text-lg">Loading Admin Data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium text-red-600">Failed to load admin data</h2>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
          <div className="mt-6">
            <Button onClick={refresh} variant="outline">Try again</Button>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <UserManagement />;
      case 'applications':
        return <VendorApplications />;
      case 'orders':
        return <AdminOrders />;
      case 'logistics':
        return <LogisticsPage />;
      case 'modifiers':
        return <PriceModifiers />;
      case 'logs':
        return <AdminLogs />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboardPage;