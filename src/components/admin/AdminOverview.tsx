import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminData } from '@/hooks/useAdminData';
import { LiveOrdersTable } from './LiveOrdersTable';

export const AdminOverview: React.FC = () => {
  const { stats, recentOrders } = useAdminData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Calculate active and delivered orders
  const activeOrders = recentOrders?.filter(order => 
    ['open', 'partial', 'ready_for_checkout'].includes(order.status)
  ).length || 0;
  
  const deliveredOrders = recentOrders?.filter(order => 
    order.status === 'completed'
  ).length || 0;

  const metrics = [
    { 
      label: 'Total Orders', 
      value: stats?.total_orders?.toLocaleString() ?? '-',
    },
    { 
      label: 'Active Orders', 
      value: activeOrders.toLocaleString(),
    },
    { 
      label: 'Delivered Orders', 
      value: deliveredOrders.toLocaleString(),
    },
    { 
      label: 'Total Revenue', 
      value: 'Coming Soon',
    },
    { 
      label: 'Vendors', 
      value: stats?.total_vendors?.toLocaleString() ?? '-',
    },
    { 
      label: 'Buyers', 
      value: stats?.total_buyers?.toLocaleString() ?? '-',
    },
    { 
      label: 'Outstanding Payments', 
      value: 'Coming Soon',
    },
    { 
      label: 'Pending Vendor Quotes', 
      value: 'Coming Soon',
    },
    { 
      label: 'Flagged Issues', 
      value: 'Coming Soon',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Overview</h2>
          <p className="text-gray-500">Platform metrics and activity</p>
        </div>
        <Button 
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="flex flex-col items-center justify-center p-6 min-h-[120px]">
              <span className="text-lg font-semibold text-gray-800">{metric.label}</span>
              <span className="text-2xl text-blue-600 mt-2 font-bold">{metric.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <LiveOrdersTable />
      </div>

      {/* Modal will be added here later */}
    </div>
  );
};