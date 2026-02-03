import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Send,
  Inbox,
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  User,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { mockNotifications, mockNotificationTemplates, mockPartners, mockCustomers } from '@/data/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const navigate = useNavigate();
  const [sendDialog, setSendDialog] = useState(false);
  const [recipientType, setRecipientType] = useState<'partner' | 'customer'>('partner');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const sentNotifications = mockNotifications.filter(n => n.recipientType !== 'admin');
  const receivedNotifications = mockNotifications.filter(n => n.recipientType === 'admin');

  const handleSendNotification = () => {
    if (selectedRecipient && notificationTitle && notificationMessage) {
      toast.success('Notification sent successfully');
      setSendDialog(false);
      setSelectedRecipient('');
      setNotificationTitle('');
      setNotificationMessage('');
    }
  };

  const statusColors = {
    sent: 'status-info',
    delivered: 'status-scheduled',
    read: 'status-completed',
    failed: 'status-cancelled',
  };

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage alerts and communications</p>
          </div>
          <Button onClick={() => setSendDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </div>

        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="received" className="gap-2">
              <Inbox className="h-4 w-4" />
              Received
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Sent Notifications */}
          <TabsContent value="sent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sent Notifications</CardTitle>
                <CardDescription>
                  Notifications sent to partners and customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentNotifications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                notification.recipientType === 'partner' ? 'bg-primary/10' : 'bg-info/10'
                              )}>
                                {notification.recipientType === 'partner' ? (
                                  <Users className="h-4 w-4 text-primary" />
                                ) : (
                                  <User className="h-4 w-4 text-info" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{notification.recipientName}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {notification.recipientType}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {notification.message}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {notification.channel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[notification.status]}>
                              {notification.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(notification.createdAt, 'MMM dd, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No sent notifications</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Received Notifications */}
          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Received Notifications</CardTitle>
                <CardDescription>
                  System alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receivedNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {receivedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                          notification.status !== 'read' && "bg-primary/5 border-primary/20"
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                          <Bell className="h-5 w-5 text-warning" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {format(notification.createdAt, 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No received notifications</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notification Templates</CardTitle>
                    <CardDescription>
                      Predefined templates for common notifications
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Variables</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockNotificationTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {template.type.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {template.subject}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.slice(0, 2).map((v) => (
                              <Badge key={v} variant="secondary" className="text-xs">
                                {`{{${v}}}`}
                              </Badge>
                            ))}
                            {template.variables.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.variables.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={template.isActive ? 'status-completed' : 'status-cancelled'}
                          >
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to a partner or customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Type</label>
              <Select value={recipientType} onValueChange={(v: 'partner' | 'customer') => {
                setRecipientType(v);
                setSelectedRecipient('');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select {recipientType}</label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${recipientType}`} />
                </SelectTrigger>
                <SelectContent>
                  {recipientType === 'partner'
                    ? mockPartners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))
                    : mockCustomers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={!selectedRecipient || !notificationTitle || !notificationMessage}
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
