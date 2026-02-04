import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  StickyNote,
  Plus,
  User,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { mockCustomers, mockOrders, cities, areasByCity } from '@/data/mockData';
import { Customer, generateCustomerId } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [sendMessageDialog, setSendMessageDialog] = useState<{ open: boolean; customerId: string }>({
    open: false,
    customerId: '',
  });
  const [messageText, setMessageText] = useState('');
  const [messageCustomerId, setMessageCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Bangalore',
    area: '',
    address: '',
    notes: '',
  });

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.customer) {
      toast.success(`${deleteDialog.customer.name} deleted`);
      setDeleteDialog({ open: false, customer: null });
    }
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.area) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success(`Customer ${newCustomer.name} created`);
    setCreateDialog(false);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      city: 'Bangalore',
      area: '',
      address: '',
      notes: '',
    });
  };

  const handleEditCustomer = () => {
    if (selectedCustomer) {
      toast.success(`Customer ${selectedCustomer.name} updated`);
      setEditDialog(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageCustomerId || !messageText) {
      toast.error('Please enter customer ID and message');
      return;
    }
    const customer = mockCustomers.find(c => c.id === messageCustomerId);
    if (!customer) {
      toast.error('Customer not found');
      return;
    }
    toast.success(`Message sent to ${customer.name}`);
    setSendMessageDialog({ open: false, customerId: '' });
    setMessageText('');
    setMessageCustomerId('');
  };

  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Name', 'Phone', 'Email', 'City', 'Area', 'Address', 'Total Orders', 'Total Amount', 'Last Pickup', 'Notes', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.id,
        customer.name,
        customer.phone,
        customer.email || '',
        customer.city,
        customer.area,
        `"${customer.address}"`,
        customer.totalOrders,
        customer.totalAmount,
        customer.lastPickupDate ? format(customer.lastPickupDate, 'yyyy-MM-dd') : '',
        customer.notes || '',
        format(customer.createdAt, 'yyyy-MM-dd'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-export.csv';
    a.click();
  };

  const customerOrders = selectedCustomer
    ? mockOrders.filter(o => o.customerId === selectedCustomer.id)
    : [];

  const areas = areasByCity[newCustomer.city] || [];

  if (selectedCustomer) {
    return (
      <AdminLayout onLogout={() => navigate('/login')}>
        <div className="space-y-6">
          <PageHeader
            title={selectedCustomer.name}
            description={`Customer ID: ${selectedCustomer.id}`}
            breadcrumbs={[
              { label: 'Customers', href: '/customers' },
              { label: selectedCustomer.name },
            ]}
            showBackToDashboard={false}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  ← Back to Customers
                </Button>
                <Button variant="outline" onClick={() => setSendMessageDialog({ open: true, customerId: selectedCustomer.id })}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            }
          />

          {/* Customer Profile */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-3xl font-bold text-primary">
                    {selectedCustomer.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {selectedCustomer.phone}
                    </span>
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" /> {selectedCustomer.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {selectedCustomer.city}, {selectedCustomer.area}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                  {selectedCustomer.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <StickyNote className="h-4 w-4 text-warning mt-0.5" />
                      <span>{selectedCustomer.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats - Removed Total Spent as requested */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                    <Calendar className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {selectedCustomer.lastPickupDate
                        ? format(selectedCustomer.lastPickupDate, 'MMM dd')
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Last Pickup</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Scrap Category</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>{format(order.pickupDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{order.area}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.scrapCategory}</Badge>
                        </TableCell>
                        <TableCell>{order.partnerName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`status-${order.status}`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.customerInvoice
                            ? `₹${order.customerInvoice.total.toLocaleString()}`
                            : '-'}
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
        </div>

        {/* Edit Customer Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input defaultValue={selectedCustomer.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input defaultValue={selectedCustomer.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={selectedCustomer.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Textarea defaultValue={selectedCustomer.address} rows={2} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea defaultValue={selectedCustomer.notes} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
              <Button onClick={handleEditCustomer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <PageHeader
          title="Customers"
          description="Manage customer database"
          breadcrumbs={[{ label: 'Customers' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSendMessageDialog({ open: true, customerId: '' })}>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          }
        />

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

        {/* Customers Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead>Last Pickup</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-sm">{customer.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell>{customer.area}</TableCell>
                    <TableCell className="text-right">{customer.totalOrders}</TableCell>
                    <TableCell>
                      {customer.lastPickupDate
                        ? format(customer.lastPickupDate, 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{customer.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedCustomer(customer); setEditDialog(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSendMessageDialog({ open: true, customerId: customer.id })}>
                            <Send className="mr-2 h-4 w-4" /> Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, customer })}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Customer Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add New Customer
            </DialogTitle>
            <DialogDescription>Create a new customer record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select value={newCustomer.city} onValueChange={(v) => setNewCustomer({ ...newCustomer, city: v, area: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area *</label>
                <Select value={newCustomer.area} onValueChange={(v) => setNewCustomer({ ...newCustomer, area: v })}>
                  <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCustomer}>Create Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog - ID-based targeting */}
      <Dialog open={sendMessageDialog.open} onOpenChange={(open) => setSendMessageDialog({ open, customerId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Customer</DialogTitle>
            <DialogDescription>
              Enter customer ID to send an in-app notification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer ID</label>
              <Input
                value={messageCustomerId || sendMessageDialog.customerId}
                onChange={(e) => setMessageCustomerId(e.target.value)}
                placeholder="KM250101"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendMessageDialog({ open: false, customerId: '' })}>Cancel</Button>
            <Button onClick={handleSendMessage}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, customer: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.customer?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, customer: null })}>
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
