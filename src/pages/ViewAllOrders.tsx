import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockPartners, areasByCity } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'on-the-way', label: 'On The Way' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const areaOptions = ['All Areas', ...areasByCity['Bangalore']];

import { useOrders } from '@/context/OrderContext';

export default function ViewAllOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const { orders } = useOrders();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesArea = areaFilter === 'All Areas' || order.area === areaFilter;
    const matchesPartner = partnerFilter === 'all' || order.partnerId === partnerFilter;

    // Date filtering
    let matchesDate = true;
    if (fromDate || toDate) {
      const orderDate = order.createdAt;
      if (fromDate && toDate) {
        matchesDate = isWithinInterval(orderDate, {
          start: startOfDay(new Date(fromDate)),
          end: endOfDay(new Date(toDate)),
        });
      } else if (fromDate) {
        matchesDate = orderDate >= startOfDay(new Date(fromDate));
      } else if (toDate) {
        matchesDate = orderDate <= endOfDay(new Date(toDate));
      }
    }

    return matchesSearch && matchesStatus && matchesArea && matchesPartner && matchesDate;
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  // Pie chart for Completed vs Cancelled only
  const pieData = [
    { name: 'Completed', value: completedOrders, color: 'hsl(142, 76%, 36%)' },
    { name: 'Cancelled', value: cancelledOrders, color: 'hsl(0, 84%, 60%)' },
  ];

  const lineData = [
    { name: 'Mon', revenue: 2400, orders: 12 },
    { name: 'Tue', revenue: 1398, orders: 8 },
    { name: 'Wed', revenue: 9800, orders: 25 },
    { name: 'Thu', revenue: 3908, orders: 15 },
    { name: 'Fri', revenue: 4800, orders: 18 },
    { name: 'Sat', revenue: 3800, orders: 14 },
    { name: 'Sun', revenue: 4300, orders: 16 },
  ];

  const handleExportCSV = () => {
    const headers = [
      'Order ID', 'Customer', 'Partner', 'City', 'Area', 'Scrap Category',
      'Created At', 'Assigned At', 'Pickup Date', 'Started At', 'Arrived At',
      'Invoice Submitted', 'Invoice Approved', 'Completed At', 'Cancelled At',
      'Cancelled By', 'Cancel Reason', 'Customer Amount', 'Partner Amount',
      'Commission', 'Payment Mode', 'Payment Status', 'Final Status', 'Admin Notes'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customerName,
        order.partnerName || '',
        order.city,
        order.area,
        order.scrapCategory,
        order.createdAt ? format(order.createdAt, 'yyyy-MM-dd HH:mm') : '',
        order.assignedAt ? format(order.assignedAt, 'yyyy-MM-dd HH:mm') : '',
        order.pickupDate ? format(order.pickupDate, 'yyyy-MM-dd') : '',
        order.startedAt ? format(order.startedAt, 'yyyy-MM-dd HH:mm') : '',
        order.arrivedAt ? format(order.arrivedAt, 'yyyy-MM-dd HH:mm') : '',
        order.invoiceSubmittedAt ? format(order.invoiceSubmittedAt, 'yyyy-MM-dd HH:mm') : '',
        order.invoiceApprovedAt ? format(order.invoiceApprovedAt, 'yyyy-MM-dd HH:mm') : '',
        order.completedAt ? format(order.completedAt, 'yyyy-MM-dd HH:mm') : '',
        order.cancelledAt ? format(order.cancelledAt, 'yyyy-MM-dd HH:mm') : '',
        order.cancelledBy || '',
        order.cancelReason || '',
        order.customerInvoice?.total || 0,
        order.partnerInvoice?.total || 0,
        order.commission || 0,
        order.paymentMode || '',
        order.paymentStatus || '',
        order.status,
        order.adminNotes || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders-export.csv';
    a.click();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <PageHeader
          title="All Orders"
          description="Complete order history and analytics"
          breadcrumbs={[{ label: 'View All Orders' }]}
          actions={
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          }
        />

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KPICard title="Total Orders" value={totalOrders} icon={Package} />
          <KPICard title="Completed" value={completedOrders} icon={CheckCircle} variant="success" />
          <KPICard title="Cancelled" value={cancelledOrders} icon={XCircle} variant="destructive" />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution (Completed vs Cancelled)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(199, 89%, 48%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[150px]"
                  placeholder="From Date"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[150px]"
                  placeholder="To Date"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  {areaOptions.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {mockPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table with Full Lifecycle Columns */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>City / Area</TableHead>
                  <TableHead>Scrap Category</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Completed/Cancelled</TableHead>
                  <TableHead className="text-right">Customer Amt</TableHead>
                  <TableHead className="text-right">Partner Amt</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.partnerName || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.city}</p>
                        <p className="text-xs text-muted-foreground">{order.area}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.scrapCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(order.createdAt, 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.assignedAt ? format(order.assignedAt, 'MMM dd, HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(order.pickupDate, 'MMM dd')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.completedAt ? format(order.completedAt, 'MMM dd, HH:mm') :
                        order.cancelledAt ? format(order.cancelledAt, 'MMM dd, HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {order.customerInvoice ? `₹${order.customerInvoice.total.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {order.partnerInvoice ? `₹${order.partnerInvoice.total.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-success">
                      {order.commission ? `₹${order.commission.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {order.paymentStatus ? (
                        <Badge variant="secondary" className={order.paymentStatus === 'paid' ? 'status-completed' : 'status-warning'}>
                          {order.paymentStatus}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`status-${order.status}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.customerInvoice && (
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <OrderDetailDialog
          order={selectedOrder}
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}
