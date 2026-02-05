import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Download,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Check,
  X,
  Image,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { mockMaterials, mockPartnerPricing, mockPartners } from '@/data/mockData';
import { Material } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Pricing() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState(mockMaterials);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editRate, setEditRate] = useState('');
  const [addMaterialDialog, setAddMaterialDialog] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    unit: 'kg',
    customerRate: '',
    description: '',
    imageUrl: '',
  });
  const [selectedPartner, setSelectedPartner] = useState(mockPartners[0]?.id || '');
  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.customerRate) {
      toast.error('Please fill required fields');
      return;
    }
    const newMat: Material = {
      id: `KM25${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      name: newMaterial.name,
      category: newMaterial.category || 'Other',
      unit: newMaterial.unit,
      customerRate: Number(newMaterial.customerRate),
      isActive: true,
      updatedAt: new Date(),
      updatedBy: 'Admin',
    };
    setMaterials(prev => [...prev, newMat]);
    toast.success(`${newMaterial.name} added successfully`);
    setAddMaterialDialog(false);
    setNewMaterial({
      name: '',
      category: '',
      unit: 'kg',
      customerRate: '',
      description: '',
      imageUrl: '',
    });
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
    toast.success('Material deleted');
  };

  const [partnerEditDialog, setPartnerEditDialog] = useState(false);
  const [partnerEditMaterial, setPartnerEditMaterial] = useState<{ materialId: string; rate: number } | null>(null);
  const [partnerEditRate, setPartnerEditRate] = useState('');

  const handleEditCustomerRate = (material: Material) => {
    setEditingMaterial(material);
    setEditRate(material.customerRate.toString());
    setEditDialog(true);
  };

  const handleSaveCustomerRate = () => {
    if (editingMaterial && editRate) {
      setMaterials(prev =>
        prev.map(m =>
          m.id === editingMaterial.id
            ? { ...m, customerRate: Number(editRate), updatedAt: new Date() }
            : m
        )
      );
      toast.success(`${editingMaterial.name} rate updated to ₹${editRate}/${editingMaterial.unit}`);
      setEditDialog(false);
    }
  };

  const handleToggleMaterial = (materialId: string) => {
    setMaterials(prev =>
      prev.map(m =>
        m.id === materialId
          ? { ...m, isActive: !m.isActive, updatedAt: new Date() }
          : m
      )
    );
  };

  const handleEditPartnerRate = (materialId: string, currentRate: number) => {
    setPartnerEditMaterial({ materialId, rate: currentRate });
    setPartnerEditRate(currentRate.toString());
    setPartnerEditDialog(true);
  };

  const handleSavePartnerRate = () => {
    if (partnerEditMaterial && partnerEditRate) {
      toast.success(`Partner rate updated to ₹${partnerEditRate}`);
      setPartnerEditDialog(false);
    }
  };

  const handleExportCustomerCSV = () => {
    const headers = ['Material', 'Unit', 'Rate', 'Status', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...materials.map(m => [
        m.name,
        m.unit,
        m.customerRate,
        m.isActive ? 'Active' : 'Inactive',
        format(m.updatedAt, 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-pricing-export.csv';
    a.click();
  };

  const handleExportPartnerCSV = () => {
    const partner = mockPartners.find(p => p.id === selectedPartner);
    const pricing = mockPartnerPricing.find(p => p.partnerId === selectedPartner);
    if (!partner || !pricing) return;

    const headers = ['Material', 'Unit', 'Rate', 'Status', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...pricing.materials.map(m => [
        m.materialName,
        m.unit,
        m.rate,
        m.isActive ? 'Active' : 'Inactive',
        format(m.updatedAt, 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partner-pricing-${partner.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  const selectedPartnerPricing = mockPartnerPricing.find(p => p.partnerId === selectedPartner);

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <PageHeader
          title="Pricing Management"
          description="Configure customer and partner rates"
          breadcrumbs={[{ label: 'Pricing' }]}
        />

        <Tabs defaultValue="customer">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="customer">Customer Pricing</TabsTrigger>
            <TabsTrigger value="partner">Partner Pricing</TabsTrigger>
          </TabsList>

          {/* Customer Pricing */}
          <TabsContent value="customer" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Customer Rates
                    </CardTitle>
                    <CardDescription>
                      Global rates applicable to all customers
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setAddMaterialDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Item
                    </Button>
                    <Button variant="outline" onClick={handleExportCustomerCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{material.customerRate}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={material.isActive}
                              onCheckedChange={() => handleToggleMaterial(material.id)}
                            />
                            <Badge
                              variant="secondary"
                              className={material.isActive ? 'status-completed' : 'status-cancelled'}
                            >
                              {material.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(material.updatedAt, 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCustomerRate(material)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Rate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteMaterial(material.id)}
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
          </TabsContent>

          {/* Partner Pricing */}
          <TabsContent value="partner" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Partner Rates
                    </CardTitle>
                    <CardDescription>
                      Partner-specific rates for each material
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPartners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleExportPartnerCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedPartnerPricing ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Rate (₹)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPartnerPricing.materials.map((material) => (
                        <TableRow key={material.materialId}>
                          <TableCell className="font-medium">{material.materialName}</TableCell>
                          <TableCell>{material.unit}</TableCell>
                          <TableCell className="text-right font-mono">
                            ₹{material.rate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={material.isActive ? 'status-completed' : 'status-cancelled'}
                            >
                              {material.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(material.updatedAt, 'MMM dd, HH:mm')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditPartnerRate(material.materialId, material.rate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Select a partner to view pricing
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Customer Rate Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Rate</DialogTitle>
            <DialogDescription>
              Update the customer rate for {editingMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">₹</span>
              <Input
                type="number"
                value={editRate}
                onChange={(e) => setEditRate(e.target.value)}
                placeholder="Enter rate"
              />
              <span className="text-muted-foreground">/ {editingMaterial?.unit}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomerRate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Rate Dialog */}
      <Dialog open={partnerEditDialog} onOpenChange={setPartnerEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Partner Rate</DialogTitle>
            <DialogDescription>
              Update the partner rate for this material
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">₹</span>
              <Input
                type="number"
                value={partnerEditRate}
                onChange={(e) => setPartnerEditRate(e.target.value)}
                placeholder="Enter rate"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartnerEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePartnerRate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog open={addMaterialDialog} onOpenChange={setAddMaterialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Pricing Item
            </DialogTitle>
            <DialogDescription>
              Add a new material with pricing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="e.g., Copper Wire"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newMaterial.category} onValueChange={(v) => setNewMaterial({ ...newMaterial, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Metal">Metal</SelectItem>
                    <SelectItem value="Paper">Paper</SelectItem>
                    <SelectItem value="Plastic">Plastic</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Glass">Glass</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  value={newMaterial.customerRate}
                  onChange={(e) => setNewMaterial({ ...newMaterial, customerRate: e.target.value })}
                  placeholder="Enter rate"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Select value={newMaterial.unit} onValueChange={(v) => setNewMaterial({ ...newMaterial, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="gram">gram</SelectItem>
                    <SelectItem value="unit">unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                placeholder="Brief description of the item..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image URL
              </label>
              <Input
                value={newMaterial.imageUrl}
                onChange={(e) => setNewMaterial({ ...newMaterial, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {newMaterial.imageUrl && (
                <div className="mt-2 p-2 border rounded-md">
                  <img 
                    src={newMaterial.imageUrl} 
                    alt="Preview" 
                    className="max-h-20 object-contain mx-auto"
                    onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMaterialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMaterial}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
