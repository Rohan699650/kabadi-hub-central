import { useState, useEffect } from 'react';
import { Order, InvoiceItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';

interface InvoiceApprovalProps {
  order: Order;
  onApprove: (customerInvoice: InvoiceItem[], partnerInvoice: InvoiceItem[]) => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export function InvoiceApproval({ order, onApprove, onReject, onClose }: InvoiceApprovalProps) {
  const [customerItems, setCustomerItems] = useState<InvoiceItem[]>(
    order.customerInvoice?.items || []
  );
  const [partnerItems, setPartnerItems] = useState<InvoiceItem[]>(
    order.partnerInvoice?.items || []
  );
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const customerTotal = customerItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const partnerTotal = partnerItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const commission = partnerTotal - customerTotal;

  const updateCustomerItem = (index: number, field: 'quantity' | 'rate', value: number) => {
    const updated = [...customerItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
      total: field === 'quantity' ? value * updated[index].rate : updated[index].quantity * value,
    };
    setCustomerItems(updated);
  };

  const updatePartnerItem = (index: number, field: 'quantity' | 'rate', value: number) => {
    const updated = [...partnerItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
      total: field === 'quantity' ? value * updated[index].rate : updated[index].quantity * value,
    };
    setPartnerItems(updated);
  };

  const handleApprove = () => {
    onApprove(customerItems, partnerItems);
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setRejectDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Invoice Approval</h2>
            <p className="text-muted-foreground">Order {order.id} - {order.customerName}</p>
          </div>
          <Badge variant="secondary" className="status-warning">
            Pending Approval
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Invoice */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Customer Invoice</span>
                <Badge variant="outline">To Pay: ₹{customerTotal.toLocaleString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="w-24">Rate</TableHead>
                    <TableHead className="text-right w-24">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerItems.map((item, index) => (
                    <TableRow key={item.materialId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.materialName}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCustomerItem(index, 'quantity', Number(e.target.value))}
                          className="h-8 w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateCustomerItem(index, 'rate', Number(e.target.value))}
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(item.quantity * item.rate).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Partner Invoice */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Partner Invoice</span>
                <Badge variant="outline">Earning: ₹{partnerTotal.toLocaleString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="w-24">Rate</TableHead>
                    <TableHead className="text-right w-24">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnerItems.map((item, index) => (
                    <TableRow key={item.materialId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.materialName}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updatePartnerItem(index, 'quantity', Number(e.target.value))}
                          className="h-8 w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updatePartnerItem(index, 'rate', Number(e.target.value))}
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(item.quantity * item.rate).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Commission Summary */}
        <Card className={commission >= 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className={commission >= 0 ? 'h-5 w-5 text-success' : 'h-5 w-5 text-destructive'} />
                <div>
                  <p className="font-medium">Platform Commission</p>
                  <p className="text-sm text-muted-foreground">
                    Partner Invoice (₹{partnerTotal.toLocaleString()}) - Customer Invoice (₹{customerTotal.toLocaleString()})
                  </p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${commission >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{commission.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => setRejectDialog(true)}>
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <Check className="mr-2 h-4 w-4" />
            Approve Invoice
          </Button>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Invoice</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
