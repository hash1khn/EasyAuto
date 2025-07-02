import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminData } from '@/hooks/useAdminData';
import { LiveOrdersTable } from './LiveOrdersTable';
import { AdminOrderModal } from './AdminOrderModal';

export const AdminOverview: React.FC = () => {
  const { stats, refresh } = useAdminData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const metrics = [
    { 
      label: 'Total Part Orders', 
      value: stats?.total_parts?.toLocaleString() ?? '-',
    },
    { 
      label: 'Active Parts', 
      value: stats?.active_parts?.toLocaleString() ?? '-',
    },
    { 
      label: 'Delivered Parts', 
      value: stats?.delivered_parts?.toLocaleString() ?? '-',
    },
    { 
      label: 'Total Revenue', 
      value: stats?.total_revenue 
        ? `AED ${stats.total_revenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}` 
        : '-',
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
      value: stats?.outstanding_payments 
        ? `AED ${stats.outstanding_payments.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}` 
        : '-',
    },
    { 
      label: 'Pending Vendor Quotes', 
      value: stats?.pending_quotes?.toLocaleString() ?? '-',
    },
    { 
      label: 'Flagged Issues', 
      value: stats?.flagged_issues ? (
        <div className="flex flex-col items-center text-sm">
          <span className="text-2xl font-bold text-red-600">
            {stats.flagged_issues.total}
          </span>
          <div className="mt-1 text-gray-600 text-xs space-y-1">
            {stats.flagged_issues.pending_refunds > 0 && 
              <div>Pending Refunds: {stats.flagged_issues.pending_refunds}</div>}
            {stats.flagged_issues.pending_applications > 0 && 
              <div>Pending Applications: {stats.flagged_issues.pending_applications}</div>}
            {stats.flagged_issues.unprocessed_payouts > 0 && 
              <div>Unprocessed Payouts: {stats.flagged_issues.unprocessed_payouts}</div>}
            {stats.flagged_issues.problem_shipments > 0 && 
              <div>Problem Shipments: {stats.flagged_issues.problem_shipments}</div>}
            {stats.flagged_issues.failed_payments > 0 && 
              <div>Failed Payments: {stats.flagged_issues.failed_payments}</div>}
          </div>
        </div>
      ) : '-'
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

      <AdminOrderModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={refresh}
      />
    </div>
  );
};