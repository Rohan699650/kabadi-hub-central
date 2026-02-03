import { Order } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Phone,
  Calendar,
  Clock,
  User,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Order {order.id}</DialogTitle>
            <Badge variant="secondary" className={cn('status-badge', statusStyles[order.status])}>
              {statusLabels[order.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Customer Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{order.area}</p>
                <p className="text-sm text-muted-foreground">{order.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pickup Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Pickup Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(order.pickupDate, 'EEEE, MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Clock className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Slot</p>
                  <p className="font-medium">{order.pickupSlot}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Description
            </h3>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="flex-1 text-sm">{order.description || 'No description provided'}</p>
            </div>
          </div>

          {/* Scrap Photos */}
          {order.scrapPhotos.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Scrap Photos ({order.scrapPhotos.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {order.scrapPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg border bg-muted flex items-center justify-center"
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Partner Info */}
          {order.partnerName && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Assigned Partner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <User className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{order.partnerName}</p>
                    <p className="text-sm text-muted-foreground">Partner ID: {order.partnerId}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Cancel Reason */}
          {order.status === 'cancelled' && order.cancelReason && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Cancellation Reason
                </h3>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">{order.cancelReason}</p>
                </div>
              </div>
            </>
          )}

          {/* Timeline */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(order.createdAt, 'MMM dd, yyyy HH:mm')}</span>
              </div>
              {order.assignedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned</span>
                  <span>{format(order.assignedAt, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              {order.startedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{format(order.startedAt, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              {order.arrivedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arrived</span>
                  <span>{format(order.arrivedAt, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{format(order.completedAt, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span>{format(order.cancelledAt, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
