import { useState } from 'react';
import { Plus, Calendar, MapPin, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCustomers, cities, areasByCity, scrapCategories, pickupSlots } from '@/data/mockData';
import { generateOrderId } from '@/types';
import { toast } from 'sonner';

interface CreateOrderDialogProps {
  onOrderCreated?: (order: any) => void;
  trigger?: React.ReactNode;
}

export function CreateOrderDialog({ onOrderCreated, trigger }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    city: 'Bangalore',
    area: '',
    address: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '',
    scrapCategory: '',
    description: '',
  });
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'new') {
      setIsNewCustomer(true);
      setFormData({
        ...formData,
        customerId: '',
        customerName: '',
        customerPhone: '',
        area: '',
        address: '',
      });
    } else {
      const customer = mockCustomers.find(c => c.id === customerId);
      if (customer) {
        setIsNewCustomer(false);
        setFormData({
          ...formData,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          city: customer.city,
          area: customer.area,
          address: customer.address,
        });
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.customerPhone || !formData.area || !formData.pickupSlot || !formData.scrapCategory) {
      toast.error('Please fill all required fields');
      return;
    }

    const newOrder = {
      id: generateOrderId(),
      createdAt: new Date(),
      customerId: formData.customerId || generateOrderId(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      city: formData.city,
      area: formData.area,
      address: formData.address,
      pickupDate: new Date(formData.pickupDate),
      pickupSlot: formData.pickupSlot,
      scrapCategory: formData.scrapCategory,
      scrapPhotos: [],
      description: formData.description,
      status: 'new' as const,
      orderSource: 'admin' as const,
      createdBy: 'Admin',
      cancellationEligibility: true,
    };

    onOrderCreated?.(newOrder);
    toast.success(`Order ${newOrder.id} created successfully`);
    setOpen(false);
    setFormData({
      customerId: '',
      customerName: '',
      customerPhone: '',
      city: 'Bangalore',
      area: '',
      address: '',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupSlot: '',
      scrapCategory: '',
      description: '',
    });
    setIsNewCustomer(false);
  };

  const areas = areasByCity[formData.city] || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Order
          </DialogTitle>
          <DialogDescription>
            Manually create a new pickup order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </label>
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select existing or add new" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">+ Add New Customer</SelectItem>
                {mockCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Details */}
          {isNewCustomer && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </>
          )}

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.city}
                onValueChange={(v) => setFormData({ ...formData, city: v, area: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.area}
                onValueChange={(v) => setFormData({ ...formData, area: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Area *" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
          </div>

          {/* Pickup Schedule */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pickup Schedule
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <Select
                value={formData.pickupSlot}
                onValueChange={(v) => setFormData({ ...formData, pickupSlot: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time Slot *" />
                </SelectTrigger>
                <SelectContent>
                  {pickupSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scrap Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Scrap Category *</label>
            <Select
              value={formData.scrapCategory}
              onValueChange={(v) => setFormData({ ...formData, scrapCategory: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {scrapCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the scrap..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
