import { useState } from 'react';
import { Eye, UserPlus, X, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Order, Partner } from '@/types';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
  orders: Order[];
  partners?: Partner[];
  showAssign?: boolean;
  showReassign?: boolean;
  showCancel?: boolean;
  showComplete?: boolean;
  onAssign?: (orderId: string, partnerId: string) => void;
  onCancel?: (orderId: string, reason: string) => void;
  onComplete?: (orderId: string) => void;
  onView?: (order: Order) => void;
}

const statusStyles = {
  new: 'status-new',
  scheduled: 'status-scheduled',
  'on-the-way': 'status-ongoing',
  arrived: 'status-ongoing',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

const statusLabels = {
  new: 'New',
  scheduled: 'Scheduled',
  'on-the-way': 'On The Way',
  arrived: 'Arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function OrdersTable({
  orders,
  partners = [],
  showAssign,
  showReassign,
  showCancel,
  showComplete,
  onAssign,
  onCancel,
  onComplete,
  onView,
}: OrdersTableProps) {
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  });
  const [selectedPartner, setSelectedPartner] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const handleAssign = () => {
    if (assignDialog.orderId && selectedPartner && onAssign) {
      onAssign(assignDialog.orderId, selectedPartner);
      setAssignDialog({ open: false, orderId: null });
      setSelectedPartner('');
    }
  };

  const handleCancel = () => {
    if (cancelDialog.orderId && cancelReason && onCancel) {
      onCancel(cancelDialog.orderId, cancelReason);
      setCancelDialog({ open: false, orderId: null });
      setCancelReason('');
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="group">
                <TableCell className="font-mono text-sm font-medium">
                  {order.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{order.area}</p>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{format(order.pickupDate, 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{order.pickupSlot}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('status-badge', statusStyles[order.status])}>
                    {statusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.partnerName ? (
                    <p className="text-sm font-medium">{order.partnerName}</p>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {showAssign && !order.partnerId && (
                        <DropdownMenuItem
                          onClick={() => setAssignDialog({ open: true, orderId: order.id })}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Partner
                        </DropdownMenuItem>
                      )}
                      {showReassign && order.partnerId && (
                        <DropdownMenuItem
                          onClick={() => setAssignDialog({ open: true, orderId: order.id })}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Reassign Partner
                        </DropdownMenuItem>
                      )}
                      {showComplete && onComplete && (
                        <DropdownMenuItem onClick={() => onComplete(order.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      {showCancel && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setCancelDialog({ open: true, orderId: order.id })}
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Assign Partner Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ open, orderId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Partner</DialogTitle>
            <DialogDescription>
              Select a partner to assign this order to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    <div className="flex items-center gap-2">
                      <span>{partner.name}</span>
                      {partner.isLive && (
                        <Badge variant="secondary" className="status-completed text-[10px]">
                          Live
                        </Badge>
                      )}
                      {!partner.isActive && (
                        <Badge variant="secondary" className="status-cancelled text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog({ open: false, orderId: null })}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedPartner}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, orderId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, orderId: null })}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason.trim()}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
