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
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { InvoiceApproval } from '@/components/invoice/InvoiceApproval';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders, mockPartners, mockDashboardStats } from '@/data/mockData';
import { Order } from '@/types';
import { toast } from 'sonner';

type DashboardView = 'main' | 'new' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'invoices';

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<DashboardView>('main');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const newOrders = mockOrders.filter(o => o.status === 'new');
  const scheduledOrders = mockOrders.filter(o => o.status === 'scheduled');
  const ongoingOrders = mockOrders.filter(o => ['on-the-way', 'arrived'].includes(o.status));
  const completedOrders = mockOrders.filter(o => o.status === 'completed');
  const cancelledOrders = mockOrders.filter(o => o.status === 'cancelled');
  const pendingInvoiceOrders = mockOrders.filter(o => o.invoiceStatus === 'pending');

  const handleAssign = (orderId: string, partnerId: string) => {
    const partner = mockPartners.find(p => p.id === partnerId);
    toast.success(`Order ${orderId} assigned to ${partner?.name}`);
  };

  const handleCancel = (orderId: string, reason: string) => {
    toast.success(`Order ${orderId} cancelled`);
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">New Orders Today</h2>
                <p className="text-muted-foreground">Orders created today (including future pickups)</p>
              </div>
              <Button variant="outline" onClick={() => setView('main')}>
                ← Back to Dashboard
              </Button>
            </div>
            <OrdersTable
              orders={newOrders}
              partners={mockPartners}
              showAssign
              showCancel
              onAssign={handleAssign}
              onCancel={handleCancel}
              onView={handleViewOrder}
            />
          </div>
        );

      case 'scheduled':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Scheduled Orders Today</h2>
                <p className="text-muted-foreground">Assigned orders for today's pickup</p>
              </div>
              <Button variant="outline" onClick={() => setView('main')}>
                ← Back to Dashboard
              </Button>
            </div>
            <OrdersTable
              orders={scheduledOrders}
              partners={mockPartners}
              showReassign
              showCancel
              onAssign={handleAssign}
              onCancel={handleCancel}
              onView={handleViewOrder}
            />
          </div>
        );

      case 'ongoing':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Ongoing Orders Today</h2>
                <p className="text-muted-foreground">Orders in progress (on-the-way / arrived)</p>
              </div>
              <Button variant="outline" onClick={() => setView('main')}>
                ← Back to Dashboard
              </Button>
            </div>
            <OrdersTable
              orders={ongoingOrders}
              partners={mockPartners}
              showCancel
              showComplete
              onCancel={handleCancel}
              onComplete={handleComplete}
              onView={handleViewOrder}
            />
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Completed Orders Today</h2>
                <p className="text-muted-foreground">Orders completed in the last 24 hours</p>
              </div>
              <Button variant="outline" onClick={() => setView('main')}>
                ← Back to Dashboard
              </Button>
            </div>
            <OrdersTable
              orders={completedOrders}
              onView={handleViewOrder}
            />
          </div>
        );

      case 'cancelled':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cancelled Orders Today</h2>
                <p className="text-muted-foreground">Orders cancelled in the last 24 hours</p>
              </div>
              <Button variant="outline" onClick={() => setView('main')}>
                ← Back to Dashboard
              </Button>
            </div>
            <OrdersTable
              orders={cancelledOrders}
              onView={handleViewOrder}
            />
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Pending Invoice Approvals</h2>
                <p className="text-muted-foreground">Invoices waiting for admin review</p>
              </div>
              <Button variant="outline" onClick={() => setView('main')}>
                ← Back to Dashboard
              </Button>
            </div>
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
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Today's operations at a glance</p>
            </div>

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
    </AdminLayout>
  );
}
