export type OrderStatus = 'new' | 'scheduled' | 'on-the-way' | 'arrived' | 'completed' | 'cancelled';
export type PartnerStatus = 'active' | 'inactive';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Order {
  id: string;
  createdAt: Date;
  customerId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  area: string;
  address: string;
  pickupDate: Date;
  pickupSlot: string;
  scrapCategory: string;
  scrapPhotos: string[];
  description: string;
  status: OrderStatus;
  partnerStatus?: PartnerStatus;
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  cancelReason?: string;
  cancelledBy?: 'admin' | 'partner' | 'customer';
  orderSource: 'app' | 'web' | 'admin' | 'phone';
  createdBy: string;
  
  // Lifecycle timestamps
  assignedAt?: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  otwTimestamp?: Date;
  arrivedAt?: Date;
  invoiceSubmittedAt?: Date;
  invoiceApprovedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // OTP and verification
  arrivalOtp?: string;
  arrivalOtpStatus?: 'generated' | 'verified';
  scrapVerificationPending?: boolean;
  
  // Invoice data
  customerInvoice?: Invoice;
  partnerInvoice?: Invoice;
  invoiceStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  invoiceRejectionReason?: string;
  
  // Payment
  paymentMode?: 'cash' | 'upi' | 'razorpay';
  paymentStatus?: 'pending' | 'paid';
  
  // Scrap data
  totalScrapWeight?: number;
  commission?: number;
  
  // Additional
  delayIndicator?: 'on-time' | 'delayed';
  notes?: string;
  adminNotes?: string;
  cancellationEligibility?: boolean;
  refundRequired?: boolean;
  orderStageAtCancellation?: OrderStatus;
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
  city: string;
  photo?: string;
  areas: string[];
  vehicleNumber?: string;
  vehicleType?: string;
  godownDetails?: boolean;
  documents: {
    aadhar: { status: ApprovalStatus; url?: string };
    pan: { status: ApprovalStatus; url?: string };
    license: { status: ApprovalStatus; url?: string };
  };
  approvalStatus: ApprovalStatus;
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
  city: string;
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
  category: string;
  unit: string;
  customerRate: number;
  isActive: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface PartnerPricing {
  partnerId: string;
  partnerName: string;
  materials: {
    materialId: string;
    materialName: string;
    category: string;
    unit: string;
    rate: number;
    isActive: boolean;
    updatedAt: Date;
    updatedBy: string;
  }[];
}

export interface Notification {
  id: string;
  type: 'new-order' | 'partner-rejection' | 'invoice-submitted' | 'low-wallet' | 'custom' | 'partner-registration' | 'system';
  referenceId?: string;
  title: string;
  message: string;
  recipientType: 'partner' | 'customer' | 'admin';
  recipientId?: string;
  recipientName?: string;
  channel: 'in-app' | 'email' | 'both';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'unread';
  actionRequired?: boolean;
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

export interface ProcessedInvoice {
  id: string;
  orderId: string;
  customerName: string;
  partnerName: string;
  customerInvoice: Invoice;
  partnerInvoice: Invoice;
  commission: number;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  processedAt: Date;
  processedBy: string;
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

// ID Generation utility
export const generateId = (prefix: string): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}${year}${sequence}`;
};

export const generateOrderId = (): string => generateId('KM');
export const generatePartnerId = (): string => generateId('KM');
export const generateCustomerId = (): string => generateId('KM');
export const generateInvoiceId = (): string => generateId('KM');
export const generateNotificationId = (): string => generateId('KM');
