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
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockPartners, mockOrders, mockMaterials } from '@/data/mockData';
import { Partner } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Partners() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; partner: Partner | null }>({
    open: false,
    partner: null,
  });

  const filteredPartners = mockPartners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.phone.includes(searchQuery) ||
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

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Areas', 'Status', 'Total Orders', 'Rating'];
    const csvContent = [
      headers.join(','),
      ...filteredPartners.map(partner => [
        partner.id,
        partner.name,
        partner.phone,
        partner.email,
        partner.areas.join('; '),
        partner.isActive ? 'Active' : 'Inactive',
        partner.totalOrders,
        partner.rating,
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

  if (selectedPartner) {
    return (
      <AdminLayout onLogout={() => navigate('/login')}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedPartner(null)}>
              ← Back to Partners
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>

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
                      <MapPin className="h-4 w-4" /> {selectedPartner.areas.join(', ')}
                    </span>
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

          <Tabs defaultValue="documents">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="scrap">Scrap Summary</TabsTrigger>
            </TabsList>

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
                            data.status === 'verified' && 'status-completed',
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
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.id}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{format(order.pickupDate, 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`status-${order.status}`}>
                                {order.status}
                              </Badge>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Partners</h1>
            <p className="text-muted-foreground">Manage pickup partners</p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
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
                      <p className="text-sm text-muted-foreground">{partner.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {partner.areas.slice(0, 2).join(', ')}
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
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium">{partner.rating}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {partner.totalOrders} orders
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={partner.isActive ? 'status-completed' : 'status-cancelled'}
                  >
                    {partner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-muted-foreground">No partners found</p>
          </div>
        )}
      </div>

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
