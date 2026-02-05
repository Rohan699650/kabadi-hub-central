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
  CheckCircle,
  Copy,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
import { mockNotifications, mockNotificationTemplates, mockPartners, mockCustomers, notificationTemplatesList } from '@/data/mockData';
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
  const [broadcastToAll, setBroadcastToAll] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; template: any }>({ open: false, template: null });
  const [editTemplateDialog, setEditTemplateDialog] = useState<{ open: boolean; template: any }>({ open: false, template: null });
  const [templates, setTemplates] = useState(mockNotificationTemplates);
  const [addTemplateDialog, setAddTemplateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '', type: 'custom' as const });

  const sentNotifications = mockNotifications.filter(n => n.recipientType !== 'admin');
  const receivedNotifications = mockNotifications.filter(n => n.recipientType === 'admin');

  const handleSendNotification = () => {
    if (broadcastToAll) {
      if (notificationTitle && notificationMessage) {
        const count = recipientType === 'partner' ? mockPartners.length : mockCustomers.length;
        toast.success(`Notification sent to all ${count} ${recipientType}s`);
        setSendDialog(false);
        setBroadcastToAll(false);
        setNotificationTitle('');
        setNotificationMessage('');
      }
      return;
    }
    
    if (selectedRecipient && notificationTitle && notificationMessage) {
      toast.success('Notification sent successfully');
      setSendDialog(false);
      setSelectedRecipient('');
      setNotificationTitle('');
      setNotificationMessage('');
    }
  };

  const handleUseTemplate = (templateId: string) => {
    const template = notificationTemplatesList.find(t => t.id === templateId);
    if (template) {
      setNotificationTitle(template.subject);
      setNotificationMessage(template.body);
      setSelectedTemplate(templateId);
    }
  };

  const handleSaveTemplate = () => {
    if (editTemplateDialog.template) {
      setTemplates(prev => prev.map(t => 
        t.id === editTemplateDialog.template.id ? { ...t, ...editTemplateDialog.template } : t
      ));
      toast.success('Template updated');
      setEditTemplateDialog({ open: false, template: null });
    }
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error('Please fill all fields');
      return;
    }
    const template = {
      id: `KM25${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      name: newTemplate.name,
      type: newTemplate.type,
      subject: newTemplate.subject,
      body: newTemplate.body,
      variables: [],
      isActive: true,
    };
    setTemplates(prev => [...prev, template]);
    toast.success('Template added');
    setAddTemplateDialog(false);
    setNewTemplate({ name: '', subject: '', body: '', type: 'custom' });
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
        <PageHeader
          title="Notifications"
          description="Manage alerts and communications"
          breadcrumbs={[{ label: 'Notifications' }]}
          actions={
            <Button onClick={() => setSendDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          }
        />

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
                  <Button variant="outline" onClick={() => setAddTemplateDialog(true)}>
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
                    {templates.map((template) => (
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
                              <DropdownMenuItem onClick={() => setPreviewDialog({ open: true, template })}>
                                <Eye className="mr-2 h-4 w-4" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditTemplateDialog({ open: true, template: { ...template } })}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setNotificationTitle(template.subject);
                                setNotificationMessage(template.body);
                                setSendDialog(true);
                              }}>
                                <Copy className="mr-2 h-4 w-4" /> Use Template
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
            {/* Quick Templates */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Template</label>
              <Select value={selectedTemplate} onValueChange={handleUseTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTemplatesList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Type</label>
              <Select value={recipientType} onValueChange={(v: 'partner' | 'customer') => {
                setRecipientType(v);
                setSelectedRecipient('');
                setBroadcastToAll(false);
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

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Broadcast to all {recipientType}s ({recipientType === 'partner' ? mockPartners.length : mockCustomers.length})
                </span>
              </div>
              <Switch checked={broadcastToAll} onCheckedChange={setBroadcastToAll} />
            </div>

            {!broadcastToAll && (
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
            )}

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
              disabled={(!broadcastToAll && !selectedRecipient) || !notificationTitle || !notificationMessage}
            >
              <Send className="mr-2 h-4 w-4" />
              {broadcastToAll ? 'Broadcast' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ open, template: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Preview - {previewDialog.template?.name}</DialogTitle>
          </DialogHeader>
          {previewDialog.template && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="p-3 bg-muted rounded-lg">{previewDialog.template.subject}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Body</label>
                <p className="p-3 bg-muted rounded-lg whitespace-pre-wrap">{previewDialog.template.body}</p>
              </div>
              {previewDialog.template.variables?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Variables</label>
                  <div className="flex flex-wrap gap-2">
                    {previewDialog.template.variables.map((v: string) => (
                      <Badge key={v} variant="outline">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog({ open: false, template: null })}>Close</Button>
            <Button onClick={() => {
              setNotificationTitle(previewDialog.template.subject);
              setNotificationMessage(previewDialog.template.body);
              setPreviewDialog({ open: false, template: null });
              setSendDialog(true);
            }}>
              <Copy className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateDialog.open} onOpenChange={(open) => setEditTemplateDialog({ open, template: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editTemplateDialog.template && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editTemplateDialog.template.name}
                  onChange={(e) => setEditTemplateDialog(prev => ({ ...prev, template: { ...prev.template, name: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={editTemplateDialog.template.subject}
                  onChange={(e) => setEditTemplateDialog(prev => ({ ...prev, template: { ...prev.template, subject: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <Textarea
                  value={editTemplateDialog.template.body}
                  onChange={(e) => setEditTemplateDialog(prev => ({ ...prev, template: { ...prev.template, body: e.target.value } }))}
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editTemplateDialog.template.isActive}
                  onCheckedChange={(v) => setEditTemplateDialog(prev => ({ ...prev, template: { ...prev.template, isActive: v } }))}
                />
                <label className="text-sm">Active</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplateDialog({ open: false, template: null })}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog open={addTemplateDialog} onOpenChange={setAddTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Template name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Notification subject"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Body</label>
              <Textarea
                value={newTemplate.body}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Notification body..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTemplate}>Add Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
