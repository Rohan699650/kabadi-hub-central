import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  DollarSign,
  ArrowRight,
  Plus,
  Eye,
  MoreHorizontal,
  X as XIcon,
  UserPlus,
  Home,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { InvoiceApproval } from '@/components/invoice/InvoiceApproval';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { mockOrders, mockPartners, mockDashboardStats } from '@/data/mockData';
import { Order } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

type DashboardView = 'main' | 'new' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'invoices';

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<DashboardView>('main');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  
  // Dialog states
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const newOrders = mockOrders.filter(o => o.status === 'new');
  const scheduledOrders = mockOrders.filter(o => o.status === 'scheduled');
  const ongoingOrders = mockOrders.filter(o => ['on-the-way', 'arrived'].includes(o.status));
  const completedOrders = mockOrders.filter(o => o.status === 'completed');
  const cancelledOrders = mockOrders.filter(o => o.status === 'cancelled');
  const pendingInvoiceOrders = mockOrders.filter(o => o.invoiceStatus === 'pending');

  const handleAssign = () => {
    if (assignDialog.order && selectedPartnerId) {
      const partner = mockPartners.find(p => p.id === selectedPartnerId);
      toast.success(`Order ${assignDialog.order.id} assigned to ${partner?.name}`);
      setAssignDialog({ open: false, order: null });
      setSelectedPartnerId('');
    }
  };

  const handleCancel = () => {
    if (cancelDialog.order && cancelReason) {
      toast.success(`Order ${cancelDialog.order.id} cancelled`);
      setCancelDialog({ open: false, order: null });
      setCancelReason('');
    }
  };

  const handleComplete = (orderId: string) => {
    toast.success(`Order ${orderId} marked as complete`);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handleApproveInvoice = () => {
    toast.success('Invoice approved successfully');
    setSelectedInvoiceOrder(null);
  };

  const handleRejectInvoice = (reason: string) => {
    toast.error('Invoice rejected');
    setSelectedInvoiceOrder(null);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const maskPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
  };

  if (selectedInvoiceOrder) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <InvoiceApproval
          order={selectedInvoiceOrder}
          onApprove={handleApproveInvoice}
          onReject={handleRejectInvoice}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      </AdminLayout>
    );
  }

  const renderViewContent = () => {
    switch (view) {
      case 'new':
        return (
          <div className="space-y-6">
            <PageHeader
              title="New Orders Today"
              description="Orders created today (including future pickups)"
              breadcrumbs={[{ label: 'New Orders Today' }]}
              showBackToDashboard={false}
              actions={
                <div className="flex gap-2">
                  <CreateOrderDialog />
                  <Button variant="outline" onClick={() => setView('main')}>
                    ← Back to Dashboard
                  </Button>
                </div>
              }
            />
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>City / Area</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Scrap Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell className="text-sm">{format(order.createdAt, 'MMM dd, HH:mm')}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.city}</p>
                            <p className="text-xs text-muted-foreground">{order.area}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{format(order.pickupDate, 'MMM dd')}</p>
                            <p className="text-xs text-muted-foreground">{order.pickupSlot}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.scrapCategory}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="status-new">New</Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize">{order.orderSource}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAssignDialog({ open: true, order })}>
                                <UserPlus className="mr-2 h-4 w-4" /> Assign Partner
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setCancelDialog({ open: true, order })}
                                className="text-destructive"
                              >
                                <XIcon className="mr-2 h-4 w-4" /> Cancel Order
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
        );

      case 'scheduled':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Scheduled Orders Today"
              description="Assigned orders for today's pickup"
              breadcrumbs={[{ label: 'Scheduled Orders Today' }]}
              showBackToDashboard={false}
              actions={
                <div className="flex gap-2">
                  <CreateOrderDialog />
                  <Button variant="outline" onClick={() => setView('main')}>
                    ← Back to Dashboard
                  </Button>
                </div>
              }
            />
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Scrap Category</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Partner Status</TableHead>
                      <TableHead>Delay</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.area}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{format(order.pickupDate, 'MMM dd')}</p>
                            <p className="text-xs text-muted-foreground">{order.pickupSlot}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.scrapCategory}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.partnerName}</p>
                            <p className="text-xs text-muted-foreground">{order.partnerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.partnerStatus === 'active' ? 'status-completed' : 'status-cancelled'}>
                            {order.partnerStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.delayIndicator === 'on-time' ? 'status-completed' : 'status-warning'}>
                            {order.delayIndicator || 'On-time'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAssignDialog({ open: true, order })}>
                                <UserPlus className="mr-2 h-4 w-4" /> Reassign Partner
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setCancelDialog({ open: true, order })}
                                className="text-destructive"
                              >
                                <XIcon className="mr-2 h-4 w-4" /> Cancel Order
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
        );

      case 'ongoing':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Ongoing Orders Today"
              description="Orders in progress (on-the-way / arrived)"
              breadcrumbs={[{ label: 'Ongoing Orders Today' }]}
              showBackToDashboard={false}
              actions={
                <div className="flex gap-2">
                  <CreateOrderDialog />
                  <Button variant="outline" onClick={() => setView('main')}>
                    ← Back to Dashboard
                  </Button>
                </div>
              }
            />
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>OTW Time</TableHead>
                      <TableHead>OTP Status</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ongoingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{maskPhone(order.customerPhone)}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.area}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.partnerName}</p>
                            <p className="text-xs text-muted-foreground">{order.partnerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.status === 'on-the-way' ? 'status-info' : 'status-warning'}>
                            {order.status === 'on-the-way' ? 'On The Way' : 'Arrived'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.otwTimestamp ? format(order.otwTimestamp, 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.arrivalOtpStatus === 'verified' ? 'status-completed' : 'status-warning'}>
                            {order.arrivalOtpStatus || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.invoiceStatus === 'pending' ? 'status-warning' : 'status-info'}>
                            {order.invoiceStatus || 'Not Submitted'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setCancelDialog({ open: true, order })}
                                className="text-destructive"
                              >
                                <XIcon className="mr-2 h-4 w-4" /> Cancel Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleComplete(order.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Force Complete
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
        );

      case 'completed':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Completed Orders Today"
              description="Orders completed in the last 24 hours"
              breadcrumbs={[{ label: 'Completed Orders Today' }]}
              showBackToDashboard={false}
              actions={
                <Button variant="outline" onClick={() => setView('main')}>
                  ← Back to Dashboard
                </Button>
              }
            />
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Scrap Category</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Customer Amount</TableHead>
                      <TableHead className="text-right">Partner Amount</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.partnerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.scrapCategory}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.totalScrapWeight || '-'} kg</TableCell>
                        <TableCell className="text-right">₹{order.customerInvoice?.total.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-right">₹{order.partnerInvoice?.total.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-right text-success">₹{order.commission?.toLocaleString() || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{order.paymentMode}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.completedAt ? format(order.completedAt, 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Customer Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <FileText className="mr-2 h-4 w-4" /> View Partner Invoice
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
        );

      case 'cancelled':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Cancelled Orders Today"
              description="Orders cancelled in the last 24 hours"
              breadcrumbs={[{ label: 'Cancelled Orders Today' }]}
              showBackToDashboard={false}
              actions={
                <Button variant="outline" onClick={() => setView('main')}>
                  ← Back to Dashboard
                </Button>
              }
            />
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Cancelled By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Cancelled At</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Refund</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelledOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.partnerName || '-'}</TableCell>
                        <TableCell className="capitalize">{order.cancelledBy || 'Admin'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{order.cancelReason}</TableCell>
                        <TableCell className="text-sm">
                          {order.cancelledAt ? format(order.cancelledAt, 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.orderStageAtCancellation || 'New'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.refundRequired ? 'status-warning' : 'status-completed'}>
                            {order.refundRequired ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Pending Invoice Approvals"
              description="Invoices waiting for admin review"
              breadcrumbs={[{ label: 'Pending Invoices' }]}
              showBackToDashboard={false}
              actions={
                <Button variant="outline" onClick={() => setView('main')}>
                  ← Back to Dashboard
                </Button>
              }
            />
            {pendingInvoiceOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending invoices</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingInvoiceOrders.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedInvoiceOrder(order)}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                          <FileText className="h-6 w-6 text-warning" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName} • {order.partnerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">₹{order.partnerInvoice?.total.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Partner Invoice</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6 animate-fade-in">
            <PageHeader
              title="Dashboard"
              description="Today's operations at a glance"
              breadcrumbs={[]}
              showBackToDashboard={false}
            />

            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="New Orders Today"
                value={mockDashboardStats.newOrdersToday}
                icon={Package}
                variant="info"
                onClick={() => setView('new')}
              />
              <KPICard
                title="Scheduled Orders"
                value={mockDashboardStats.scheduledOrdersToday}
                icon={Clock}
                variant="default"
                onClick={() => setView('scheduled')}
              />
              <KPICard
                title="Ongoing Orders"
                value={mockDashboardStats.ongoingOrdersToday}
                icon={Truck}
                variant="warning"
                onClick={() => setView('ongoing')}
              />
              <KPICard
                title="Completed Today"
                value={mockDashboardStats.completedOrdersToday}
                icon={CheckCircle}
                variant="success"
                onClick={() => setView('completed')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Cancelled Today"
                value={mockDashboardStats.cancelledOrdersToday}
                icon={XCircle}
                variant="destructive"
                onClick={() => setView('cancelled')}
              />
              <KPICard
                title="Live Partners"
                value={mockDashboardStats.livePartners}
                icon={Users}
                variant="success"
                onClick={() => navigate('/partners')}
              />
              <KPICard
                title="Pending Invoices"
                value={mockDashboardStats.pendingInvoices}
                icon={FileText}
                variant="warning"
                onClick={() => setView('invoices')}
              />
              <KPICard
                title="Today's Revenue"
                value={mockDashboardStats.todayRevenue}
                icon={DollarSign}
                variant="success"
                prefix="₹"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-info" />
                    Recent New Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {newOrders.length > 0 ? (
                    <div className="space-y-3">
                      {newOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewOrder(order)}
                        >
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName} • {order.area}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                      {newOrders.length > 3 && (
                        <Button variant="ghost" className="w-full" onClick={() => setView('new')}>
                          View All ({newOrders.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No new orders today</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-warning" />
                    Pending Invoice Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingInvoiceOrders.length > 0 ? (
                    <div className="space-y-3">
                      {pendingInvoiceOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedInvoiceOrder(order)}
                        >
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.partnerName}</p>
                          </div>
                          <p className="font-semibold">₹{order.partnerInvoice?.total.toLocaleString()}</p>
                        </div>
                      ))}
                      {pendingInvoiceOrders.length > 3 && (
                        <Button variant="ghost" className="w-full" onClick={() => setView('invoices')}>
                          View All ({pendingInvoiceOrders.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No pending invoices</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      {renderViewContent()}
      
      <OrderDetailDialog
        order={selectedOrder}
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
      />

      {/* Assign Partner Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ open, order: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Partner</DialogTitle>
            <DialogDescription>
              Select a partner to assign to order {assignDialog.order?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {mockPartners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    <div className="flex items-center gap-2">
                      <span>{partner.name}</span>
                      <Badge variant="secondary" className={partner.isActive ? 'status-completed' : 'status-cancelled'}>
                        {partner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog({ open: false, order: null })}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedPartnerId}>
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, order: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling order {cancelDialog.order?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, order: null })}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
