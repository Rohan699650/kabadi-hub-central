import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockOrders, mockPartners } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'on-the-way', label: 'On The Way' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const areaOptions = ['All Areas', 'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Jayanagar', 'BTM Layout', 'Electronic City'];

export default function ViewAllOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesArea = areaFilter === 'All Areas' || order.area === areaFilter;
    const matchesPartner = partnerFilter === 'all' || order.partnerId === partnerFilter;

    return matchesSearch && matchesStatus && matchesArea && matchesPartner;
  });

  const totalOrders = mockOrders.length;
  const completedOrders = mockOrders.filter(o => o.status === 'completed').length;
  const cancelledOrders = mockOrders.filter(o => o.status === 'cancelled').length;
  const repeatCustomers = new Set(mockOrders.map(o => o.customerId)).size;

  const pieData = [
    { name: 'Completed', value: completedOrders, color: 'hsl(142, 76%, 36%)' },
    { name: 'Cancelled', value: cancelledOrders, color: 'hsl(0, 84%, 60%)' },
    { name: 'Other', value: totalOrders - completedOrders - cancelledOrders, color: 'hsl(199, 89%, 48%)' },
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
    const headers = ['Order ID', 'Customer', 'Phone', 'Area', 'Pickup Date', 'Status', 'Partner', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customerName,
        order.customerPhone,
        order.area,
        order.pickupDate.toISOString().split('T')[0],
        order.status,
        order.partnerName || 'Unassigned',
        order.customerInvoice?.total || 0,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Orders</h1>
            <p className="text-muted-foreground">Complete order history and analytics</p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Orders" value={totalOrders} icon={Package} />
          <KPICard title="Completed" value={completedOrders} icon={CheckCircle} variant="success" />
          <KPICard title="Cancelled" value={cancelledOrders} icon={XCircle} variant="destructive" />
          <KPICard title="Unique Customers" value={repeatCustomers} icon={Users} variant="info" />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Distribution</CardTitle>
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

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          onView={handleViewOrder}
        />

        <OrderDetailDialog
          order={selectedOrder}
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}
