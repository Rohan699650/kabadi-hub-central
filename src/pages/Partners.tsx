import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  CheckCircle,
  XCircle,
  Wallet,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Bell,
  Trash2,
  Power,
  FileText,
  Shield,
  Plus,
  Users,
  TrendingUp,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { mockPartners, mockOrders, mockMaterials, cities, areasByCity } from '@/data/mockData';
import { Partner, generatePartnerId } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Partners() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; partner: Partner | null }>({
    open: false,
    partner: null,
  });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Bangalore',
    areas: [] as string[],
    vehicleNumber: '',
    vehicleType: '',
    godownDetails: false,
  });

  const filteredPartners = mockPartners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.phone.includes(searchQuery) ||
    partner.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.areas.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleActive = (partner: Partner) => {
    toast.success(`${partner.name} ${partner.isActive ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = () => {
    if (deleteDialog.partner) {
      toast.success(`${deleteDialog.partner.name} deleted`);
      setDeleteDialog({ open: false, partner: null });
    }
  };

  const handleCreatePartner = () => {
    if (!newPartner.name || !newPartner.phone) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success(`Partner ${newPartner.name} created`);
    setCreateDialog(false);
    setNewPartner({
      name: '',
      phone: '',
      email: '',
      city: 'Bangalore',
      areas: [],
      vehicleNumber: '',
      vehicleType: '',
      godownDetails: false,
    });
  };

  const handleExportCSV = () => {
    const headers = ['Partner ID', 'Name', 'Phone', 'Email', 'City', 'Areas', 'Vehicle Number', 'Vehicle Type', 'Godown', 'Approval Status', 'Active Status', 'Rating', 'Last Active', 'Total Orders', 'Completed', 'Cancelled'];
    const csvContent = [
      headers.join(','),
      ...filteredPartners.map(partner => [
        partner.id,
        partner.name,
        partner.phone,
        partner.email,
        partner.city,
        partner.areas.join('; '),
        partner.vehicleNumber || '',
        partner.vehicleType || '',
        partner.godownDetails ? 'Yes' : 'No',
        partner.approvalStatus,
        partner.isActive ? 'Active' : 'Inactive',
        partner.rating,
        partner.lastActive ? format(partner.lastActive, 'yyyy-MM-dd HH:mm') : '',
        partner.totalOrders,
        partner.completedOrders,
        partner.cancelledOrders,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partners-export.csv';
    a.click();
  };

  const partnerOrders = selectedPartner
    ? mockOrders.filter(o => o.partnerId === selectedPartner.id)
    : [];

  const scrapSummary = mockMaterials.map(mat => ({
    name: mat.name,
    quantity: Math.floor(Math.random() * 500) + 50,
    unit: mat.unit,
  }));

  // Partner comparison chart data
  const partnerComparisonData = mockPartners.map(p => ({
    name: p.name.split(' ')[0],
    orders: p.completedOrders,
    revenue: p.completedOrders * 450, // Estimated
  }));

  // Individual partner contribution chart
  const partnerContributionData = selectedPartner ? [
    { name: 'This Partner', value: selectedPartner.completedOrders, color: 'hsl(142, 76%, 36%)' },
    { name: 'Others', value: mockPartners.reduce((sum, p) => sum + (p.id !== selectedPartner.id ? p.completedOrders : 0), 0), color: 'hsl(199, 89%, 48%)' },
  ] : [];

  const areas = areasByCity[newPartner.city] || [];

  if (selectedPartner) {
    return (
      <AdminLayout onLogout={() => navigate('/login')}>
        <div className="space-y-6">
          <PageHeader
            title={selectedPartner.name}
            description={`Partner ID: ${selectedPartner.id}`}
            breadcrumbs={[
              { label: 'Partners', href: '/partners' },
              { label: selectedPartner.name },
            ]}
            showBackToDashboard={false}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedPartner(null)}>
                  ← Back to Partners
                </Button>
                <Button variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
                <Button variant="outline" onClick={() => setEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            }
          />

          {/* Partner Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-3xl font-bold text-primary">
                    {selectedPartner.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{selectedPartner.name}</h2>
                    {selectedPartner.isLive && (
                      <Badge className="bg-success text-success-foreground">Live</Badge>
                    )}
                    <Badge variant="secondary" className={selectedPartner.approvalStatus === 'approved' ? 'status-completed' : selectedPartner.approvalStatus === 'pending' ? 'status-warning' : 'status-cancelled'}>
                      {selectedPartner.approvalStatus}
                    </Badge>
                    {!selectedPartner.isActive && (
                      <Badge variant="secondary" className="status-cancelled">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {selectedPartner.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {selectedPartner.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {selectedPartner.city} - {selectedPartner.areas.join(', ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>Vehicle: {selectedPartner.vehicleNumber || 'N/A'} ({selectedPartner.vehicleType || 'N/A'})</span>
                    <span>Godown: {selectedPartner.godownDetails ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{selectedPartner.rating}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch
                    checked={selectedPartner.isActive}
                    onCheckedChange={() => handleToggleActive(selectedPartner)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedPartner.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedPartner.completedOrders}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedPartner.cancelledOrders}</p>
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                    <Wallet className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{selectedPartner.walletBalance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partner Contribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Partner Contribution to Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={partnerContributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {partnerContributionData.map((entry, index) => (
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

          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="scrap">Scrap Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {partnerOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Pickup Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead>Scrap Category</TableHead>
                          <TableHead className="text-right">Weight</TableHead>
                          <TableHead className="text-right">Customer Amt</TableHead>
                          <TableHead className="text-right">Partner Amt</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.id}</TableCell>
                            <TableCell>{format(order.pickupDate, 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.area}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.scrapCategory}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{order.totalScrapWeight || '-'} kg</TableCell>
                            <TableCell className="text-right">
                              {order.customerInvoice ? `₹${order.customerInvoice.total}` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {order.partnerInvoice ? `₹${order.partnerInvoice.total}` : '-'}
                            </TableCell>
                            <TableCell className="text-right text-success">
                              {order.commission ? `₹${order.commission}` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`status-${order.status}`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.completedAt ? format(order.completedAt, 'MMM dd, HH:mm') : 
                               order.cancelledAt ? format(order.cancelledAt, 'MMM dd, HH:mm') : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Document Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {Object.entries(selectedPartner.documents).map(([doc, data]) => (
                      <div key={doc} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium capitalize">{doc}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            data.status === 'approved' && 'status-completed',
                            data.status === 'pending' && 'status-warning',
                            data.status === 'rejected' && 'status-cancelled'
                          )}
                        >
                          {data.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scrap" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scrap Quantity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Quantity Collected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scrapSummary.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            {item.quantity} {item.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <PageHeader
          title="Partners"
          description="Manage pickup partners"
          breadcrumbs={[{ label: 'Partners' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            </div>
          }
        />

        {/* Partner Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Partner Contribution Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(142, 76%, 36%)" name="Completed Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, ID, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Partner Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <Card
              key={partner.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedPartner(partner)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-xl font-bold text-primary">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{partner.name}</h3>
                        {partner.isLive && (
                          <span className="flex h-2 w-2 rounded-full bg-success animate-pulse-soft" />
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">{partner.id}</p>
                      <p className="text-sm text-muted-foreground">{partner.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {partner.city} - {partner.areas.slice(0, 2).join(', ')}
                        {partner.areas.length > 2 && ` +${partner.areas.length - 2}`}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPartner(partner); }}>
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Bell className="mr-2 h-4 w-4" /> Send Notification
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleActive(partner); }}>
                        <Power className="mr-2 h-4 w-4" />
                        {partner.isActive ? 'Disable' : 'Enable'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, partner }); }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{partner.rating}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{partner.completedOrders} orders</span>
                    <Badge variant="secondary" className={partner.approvalStatus === 'approved' ? 'status-completed' : partner.approvalStatus === 'pending' ? 'status-warning' : 'status-cancelled'}>
                      {partner.approvalStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Partner Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Add New Partner
            </DialogTitle>
            <DialogDescription>Create a new pickup partner</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder="Partner name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newPartner.email}
                onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select value={newPartner.city} onValueChange={(v) => setNewPartner({ ...newPartner, city: v, areas: [] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <Select onValueChange={(v) => setNewPartner({ ...newPartner, areas: [...newPartner.areas, v] })}>
                  <SelectTrigger><SelectValue placeholder="Select areas" /></SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Number</label>
                <Input
                  value={newPartner.vehicleNumber}
                  onChange={(e) => setNewPartner({ ...newPartner, vehicleNumber: e.target.value })}
                  placeholder="KA-01-AB-1234"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <Select value={newPartner.vehicleType} onValueChange={(v) => setNewPartner({ ...newPartner, vehicleType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pickup Truck">Pickup Truck</SelectItem>
                    <SelectItem value="Auto Rickshaw">Auto Rickshaw</SelectItem>
                    <SelectItem value="Mini Truck">Mini Truck</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newPartner.godownDetails}
                onCheckedChange={(v) => setNewPartner({ ...newPartner, godownDetails: v })}
              />
              <label className="text-sm">Has Godown/Storage</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePartner}>Create Partner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, partner: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.partner?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, partner: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
