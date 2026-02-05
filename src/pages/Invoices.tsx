import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockProcessedInvoices, mockCustomers } from '@/data/mockData';
import { ProcessedInvoice } from '@/types';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export default function Invoices() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<ProcessedInvoice | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const filteredInvoices = mockProcessedInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesCustomer = customerFilter === 'all' || invoice.customerName === customerFilter;
    
    // Date filtering
    let matchesDate = true;
    if (fromDate || toDate) {
      const invoiceDate = invoice.processedAt;
      if (fromDate && toDate) {
        matchesDate = isWithinInterval(invoiceDate, {
          start: startOfDay(new Date(fromDate)),
          end: endOfDay(new Date(toDate)),
        });
      } else if (fromDate) {
        matchesDate = invoiceDate >= startOfDay(new Date(fromDate));
      } else if (toDate) {
        matchesDate = invoiceDate <= endOfDay(new Date(toDate));
      }
    }
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
  });

  const handleDownloadPDF = (invoice: ProcessedInvoice) => {
    // Generate PDF content
    const pdfContent = `
INVOICE: ${invoice.id}
Order ID: ${invoice.orderId}
Customer: ${invoice.customerName}
Partner: ${invoice.partnerName}
Status: ${invoice.status.toUpperCase()}
Processed At: ${format(invoice.processedAt, 'MMM dd, yyyy HH:mm')}

CUSTOMER INVOICE
----------------
${invoice.customerInvoice.items.map(item => `${item.materialName}: ${item.quantity} ${item.unit} x ₹${item.rate} = ₹${item.total}`).join('\n')}
Total: ₹${invoice.customerInvoice.total}

PARTNER INVOICE
---------------
${invoice.partnerInvoice.items.map(item => `${item.materialName}: ${item.quantity} ${item.unit} x ₹${item.rate} = ₹${item.total}`).join('\n')}
Total: ₹${invoice.partnerInvoice.total}

COMMISSION: ₹${invoice.commission}
    `.trim();
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    a.click();
    toast.success(`Invoice ${invoice.id} downloaded`);
  };

  const approvedCount = mockProcessedInvoices.filter(i => i.status === 'approved').length;
  const rejectedCount = mockProcessedInvoices.filter(i => i.status === 'rejected').length;
  const totalCommission = mockProcessedInvoices
    .filter(i => i.status === 'approved')
    .reduce((sum, i) => sum + i.commission, 0);

  const handleExportCSV = () => {
    const headers = ['Invoice ID', 'Order ID', 'Customer', 'Partner', 'Customer Total', 'Partner Total', 'Commission', 'Status', 'Processed At'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(invoice => [
        invoice.id,
        invoice.orderId,
        invoice.customerName,
        invoice.partnerName,
        invoice.customerInvoice.total,
        invoice.partnerInvoice.total,
        invoice.commission,
        invoice.status,
        format(invoice.processedAt, 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices-export.csv';
    a.click();
  };

  const handleViewInvoice = (invoice: ProcessedInvoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDialogOpen(true);
  };

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <PageHeader
          title="Invoices"
          description="All approved and rejected invoices"
          breadcrumbs={[{ label: 'Invoices' }]}
          actions={
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          }
        />

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved Invoices</p>
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
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{totalCommission.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Commission</p>
                </div>
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
                  placeholder="Search invoices..."
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
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'approved' | 'rejected')}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Processed Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Customer Total</TableHead>
                  <TableHead className="text-right">Partner Total</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.id}</TableCell>
                      <TableCell className="font-mono">{invoice.orderId}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.partnerName}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{invoice.customerInvoice.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{invoice.partnerInvoice.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-success">
                        ₹{invoice.commission.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={invoice.status === 'approved' ? 'status-completed' : 'status-cancelled'}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(invoice.processedAt, 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewInvoice(invoice)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPDF(invoice)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Detail Dialog */}
        <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-medium">{selectedInvoice.orderId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge
                      variant="secondary"
                      className={selectedInvoice.status === 'approved' ? 'status-completed' : 'status-cancelled'}
                    >
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Partner</p>
                    <p className="font-medium">{selectedInvoice.partnerName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Invoice</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.customerInvoice.items.map((item) => (
                          <TableRow key={item.materialId}>
                            <TableCell>{item.materialName}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right">₹{item.rate}</TableCell>
                            <TableCell className="text-right">₹{item.total}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{selectedInvoice.customerInvoice.total}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Partner Invoice</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.partnerInvoice.items.map((item) => (
                          <TableRow key={item.materialId}>
                            <TableCell>{item.materialName}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right">₹{item.rate}</TableCell>
                            <TableCell className="text-right">₹{item.total}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{selectedInvoice.partnerInvoice.total}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                    <span className="font-semibold">Commission (Partner - Customer)</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{selectedInvoice.commission.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
