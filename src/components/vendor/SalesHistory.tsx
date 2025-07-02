import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronRight, Download, DollarSign, Package, Calendar } from 'lucide-react';

interface SalesOrder {
  order_id: string;
  order_date: string;
  total_parts: number;
  total_earnings: number;
  parts: {
    id: string;
    part_name: string;
    quantity: number;
    vendor_earning: number;
    shipping_status: string;
    shipped_at: string | null;
    collected_at: string | null;
    delivered_at: string | null;
  }[];
}

export const SalesHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSalesHistory();
    }
  }, [user]);

  const getOrderDisplayStatus = (order: SalesOrder): string => {
    const allPartsDelivered = order.parts.every(part => 
      part.shipping_status === 'delivered' || part.delivered_at
    );
    const anyPartCollected = order.parts.some(part => 
      part.shipping_status === 'collected' || part.collected_at
    );

    if (allPartsDelivered) {
      return 'completed';
    } else if (anyPartCollected) {
      return 'delivering';
    } else {
      return 'pickup';
    }
  };

  const fetchSalesHistory = async () => {
    if (!user) return;

    try {
      // Step 1: Get all accepted bids for this vendor
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('id, price, shipped_at, part_id')
        .eq('vendor_id', user.id)
        .eq('status', 'accepted');

      if (bidsError) throw bidsError;

      if (!bidsData || bidsData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Step 2: Get part IDs from bids
      const partIds = bidsData.map(bid => bid.part_id);

      // Step 3: Get parts data with order information
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select(`
          id,
          part_name,
          quantity,
          shipping_status,
          order_id,
          collected_at,
          delivered_at,
          orders!inner (
            id,
            created_at
          ),
          invoices!inner (
            payment_status
          )
        `)
        .in('id', partIds)
        .eq('invoices.payment_status', 'paid');

      if (partsError) throw partsError;

      // Step 4: Combine bids and parts data and group by order
      const orderMap = new Map<string, SalesOrder>();

      if (partsData) {
        for (const part of partsData) {
          const bid = bidsData.find(b => b.part_id === part.id);
          if (!bid) continue;

          const orderId = part.order_id;
          const vendorEarning = bid.price

          if (!orderMap.has(orderId)) {
            orderMap.set(orderId, {
              order_id: orderId,
              order_date: part.orders.created_at,
              total_parts: 0,
              total_earnings: 0,
              parts: []
            });
          }

          const order = orderMap.get(orderId)!;
          order.total_parts += 1;
          order.total_earnings += vendorEarning;
          order.parts.push({
            id: part.id,
            part_name: part.part_name,
            quantity: part.quantity,
            vendor_earning: vendorEarning,
            shipping_status: part.shipping_status || 'pending',
            shipped_at: bid.shipped_at,
            collected_at: part.collected_at,
            delivered_at: part.delivered_at
          });
        }
      }

      const ordersArray = Array.from(orderMap.values());
      ordersArray.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
      
      setOrders(ordersArray);

      // Calculate stats
      const totalOrders = ordersArray.length;
      const totalEarnings = ordersArray.reduce((sum, order) => sum + order.total_earnings, 0);
      
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEarnings = ordersArray
        .filter(order => new Date(order.order_date) >= firstOfMonth)
        .reduce((sum, order) => sum + order.total_earnings, 0);

      setStats({
        totalOrders,
        totalEarnings,
        thisMonthEarnings
      });

    } catch (error) {
      console.error('Error fetching sales history:', error);
      toast({
        title: "Error loading sales history",
        description: "Unable to fetch sales data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const exportToCSV = () => {
    const csvData = orders.flatMap(order =>
      order.parts.map(part => ({
        'Order ID': order.order_id.slice(0, 8),
        'Order Date': new Date(order.order_date).toLocaleDateString(),
        'Part Name': part.part_name,
        'Quantity': part.quantity,
        'Your Earning (AED)': part.vendor_earning.toFixed(2),
        'Shipping Status': part.shipping_status,
        'Order Status': getOrderDisplayStatus(order)
      }))
    );

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_sales_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (order: SalesOrder) => {
    const displayStatus = getOrderDisplayStatus(order);
    
    const statusMap = {
      'pickup': { variant: 'secondary' as const, label: 'Ready for Pickup' },
      'delivering': { variant: 'default' as const, label: 'In Delivery' },
      'completed': { variant: 'default' as const, label: 'Completed' }
    };
    
    const config = statusMap[displayStatus as keyof typeof statusMap] || { variant: 'outline' as const, label: displayStatus };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getShippingStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'outline' as const, label: 'Pending' },
      'confirmed': { variant: 'secondary' as const, label: 'Confirmed' },
      'out_for_delivery': { variant: 'secondary' as const, label: 'Out for Delivery' },
      'delivered': { variant: 'default' as const, label: 'Delivered' },
      'collected': { variant: 'default' as const, label: 'Collected' },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelled' },
      'refunded': { variant: 'destructive' as const, label: 'Refunded' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const statCards = [
    {
      title: 'Paid Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Total Earnings (AED)',
      value: stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'This Month (AED)',
      value: stats.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales History</h1>
        <p className="text-gray-600">Track your earnings from paid orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Paid Orders</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading sales history...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No paid orders yet.</p>
              <p className="text-sm">Your earnings will appear here once orders are paid!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Parts</TableHead>
                    <TableHead className="text-right">Earnings (AED)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <React.Fragment key={order.order_id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRowExpansion(order.order_id)}
                      >
                        <TableCell>
                          {expandedRows.has(order.order_id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(order.order_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {order.total_parts} part{order.total_parts !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {order.total_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order)}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded row content */}
                      {expandedRows.has(order.order_id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <h4 className="font-medium mb-3">Part Breakdown</h4>
                              <div className="space-y-2">
                                {order.parts.map((part) => (
                                  <div key={part.id} className="bg-white p-3 rounded border">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="font-medium">{part.part_name}</div>
                                        <div className="text-sm text-gray-600">Quantity: {part.quantity}</div>
                                      </div>
                                      <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                          <div className="text-sm text-gray-600">Your Earning</div>
                                          <div className="font-semibold text-green-600">AED {part.vendor_earning.toFixed(2)}</div>
                                        </div>
                                        <div>
                                          {getShippingStatusBadge(part.shipping_status)}
                                        </div>
                                      </div>
                                    </div>
                                    {part.shipped_at && (
                                      <div className="mt-2 text-sm text-gray-500">
                                        Shipped on: {new Date(part.shipped_at).toLocaleString()}
                                      </div>
                                    )}
                                    {part.delivered_at && (
                                      <div className="mt-2 text-sm text-gray-500">
                                        Delivered on: {new Date(part.delivered_at).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};