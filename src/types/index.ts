export type OrderStatus = 'new' | 'scheduled' | 'on-the-way' | 'arrived' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  createdAt: Date;
  customerId: string;
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  pickupDate: Date;
  pickupSlot: string;
  scrapPhotos: string[];
  description: string;
  status: OrderStatus;
  partnerId?: string;
  partnerName?: string;
  cancelReason?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  assignedAt?: Date;
  startedAt?: Date;
  arrivedAt?: Date;
  customerInvoice?: Invoice;
  partnerInvoice?: Invoice;
  invoiceStatus?: 'pending' | 'approved' | 'rejected';
  invoiceRejectionReason?: string;
  paymentStatus?: 'pending' | 'paid';
}

export interface Invoice {
  items: InvoiceItem[];
  total: number;
}

export interface InvoiceItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

export interface Partner {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo?: string;
  areas: string[];
  documents: {
    aadhar: { status: 'pending' | 'verified' | 'rejected'; url?: string };
    pan: { status: 'pending' | 'verified' | 'rejected'; url?: string };
    license: { status: 'pending' | 'verified' | 'rejected'; url?: string };
  };
  isActive: boolean;
  isLive: boolean;
  walletBalance: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  rating: number;
  joinedAt: Date;
  lastActive?: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area: string;
  address: string;
  totalOrders: number;
  totalAmount: number;
  lastPickupDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  customerRate: number;
  isActive: boolean;
  updatedAt: Date;
}

export interface PartnerPricing {
  partnerId: string;
  partnerName: string;
  materials: {
    materialId: string;
    materialName: string;
    unit: string;
    rate: number;
    isActive: boolean;
    updatedAt: Date;
  }[];
}

export interface Notification {
  id: string;
  type: 'new-order' | 'partner-rejection' | 'invoice-submitted' | 'low-wallet' | 'custom';
  title: string;
  message: string;
  recipientType: 'partner' | 'customer' | 'admin';
  recipientId?: string;
  recipientName?: string;
  channel: 'in-app' | 'email' | 'both';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface DashboardStats {
  newOrdersToday: number;
  scheduledOrdersToday: number;
  ongoingOrdersToday: number;
  completedOrdersToday: number;
  cancelledOrdersToday: number;
  livePartners: number;
  pendingInvoices: number;
  todayRevenue: number;
}
