import { Order, Partner, Customer, Material, PartnerPricing, Notification, NotificationTemplate, DashboardStats, ProcessedInvoice } from '@/types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);
const lastMonth = new Date(today);
lastMonth.setDate(lastMonth.getDate() - 30);

// Helper to generate dates
const getDate = (daysAgo: number, hour: number = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// --- Partners ---
export const mockPartners: Partner[] = [
  {
    id: 'KM250201',
    name: 'Suresh Yadav',
    phone: '+91 99887 76655',
    email: 'suresh.yadav@email.com',
    city: 'Bangalore',
    photo: '/placeholder.svg',
    areas: ['Koramangala', 'HSR Layout', 'BTM Layout'],
    vehicleNumber: 'KA-01-AB-1234',
    vehicleType: 'Pickup Truck',
    godownDetails: true,
    documents: {
      aadhar: { status: 'approved', url: '/placeholder.svg' },
      pan: { status: 'approved', url: '/placeholder.svg' },
      license: { status: 'approved', url: '/placeholder.svg' },
    },
    approvalStatus: 'approved',
    isActive: true,
    isLive: true,
    walletBalance: 5420,
    totalOrders: 156,
    completedOrders: 148,
    cancelledOrders: 8,
    rating: 4.7,
    joinedAt: new Date('2023-06-15'),
    lastActive: new Date(),
  },
  {
    id: 'KM250202',
    name: 'Ramesh Gupta',
    phone: '+91 88776 65544',
    email: 'ramesh.gupta@email.com',
    city: 'Bangalore',
    photo: '/placeholder.svg',
    areas: ['Indiranagar', 'Electronic City', 'Marathahalli'],
    vehicleNumber: 'KA-02-CD-5678',
    vehicleType: 'Auto Rickshaw',
    godownDetails: false,
    documents: {
      aadhar: { status: 'approved', url: '/placeholder.svg' },
      pan: { status: 'approved', url: '/placeholder.svg' },
      license: { status: 'pending' },
    },
    approvalStatus: 'approved',
    isActive: true,
    isLive: true,
    walletBalance: 3250,
    totalOrders: 98,
    completedOrders: 92,
    cancelledOrders: 6,
    rating: 4.5,
    joinedAt: new Date('2023-08-20'),
    lastActive: new Date(),
  },
  {
    id: 'KM250203',
    name: 'Anil Kumar',
    phone: '+91 77665 54433',
    email: 'anil.kumar@email.com',
    city: 'Bangalore',
    photo: '/placeholder.svg',
    areas: ['BTM Layout', 'Jayanagar', 'JP Nagar'],
    vehicleNumber: 'KA-03-EF-9012',
    vehicleType: 'Mini Truck',
    godownDetails: true,
    documents: {
      aadhar: { status: 'approved', url: '/placeholder.svg' },
      pan: { status: 'rejected', url: '/placeholder.svg' },
      license: { status: 'approved', url: '/placeholder.svg' },
    },
    approvalStatus: 'approved',
    isActive: true,
    isLive: false,
    walletBalance: 1800,
    totalOrders: 67,
    completedOrders: 60,
    cancelledOrders: 7,
    rating: 4.2,
    joinedAt: new Date('2023-10-05'),
    lastActive: new Date(Date.now() - 3600000),
  },
  {
    id: 'KM250204',
    name: 'Vijay Sharma',
    phone: '+91 66554 43322',
    email: 'vijay.sharma@email.com',
    city: 'Bangalore',
    photo: '/placeholder.svg',
    areas: ['Whitefield', 'Mahadevpura'],
    vehicleNumber: 'KA-04-GH-3456',
    vehicleType: 'Pickup Truck',
    godownDetails: false,
    documents: {
      aadhar: { status: 'pending' },
      pan: { status: 'pending' },
      license: { status: 'pending' },
    },
    approvalStatus: 'pending',
    isActive: false,
    isLive: false,
    walletBalance: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    rating: 0,
    joinedAt: new Date('2024-01-10'),
  }
];

// --- Customers ---
export const mockCustomers: Customer[] = [
  {
    id: 'KM250101',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    city: 'Bangalore',
    area: 'Koramangala',
    address: '123, 5th Cross, Koramangala 4th Block, Bangalore - 560034',
    totalOrders: 12,
    totalAmount: 4500,
    lastPickupDate: new Date(),
    notes: 'Regular customer, prefers morning slots',
    createdAt: new Date('2023-05-10'),
  },
  {
    id: 'KM250102',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@email.com',
    city: 'Bangalore',
    area: 'HSR Layout',
    address: '456, 7th Main, HSR Layout Sector 2, Bangalore - 560102',
    totalOrders: 8,
    totalAmount: 3200,
    lastPickupDate: new Date(),
    createdAt: new Date('2023-07-22'),
  },
  {
    id: 'KM250103',
    name: 'TechSolutions Pvt Ltd',
    phone: '+91 76543 21098',
    email: 'ops@techsolutions.com',
    city: 'Bangalore',
    area: 'Indiranagar',
    address: '789, 12th Cross, Indiranagar, Bangalore - 560038',
    totalOrders: 5,
    totalAmount: 8500,
    lastPickupDate: new Date(),
    notes: 'Corporate customer - bulk orders',
    createdAt: new Date('2023-09-15'),
  },
  {
    id: 'KM250104',
    name: 'Sneha Reddy',
    phone: '+91 65432 10987',
    city: 'Bangalore',
    area: 'Whitefield',
    address: '321, ITPL Main Road, Whitefield, Bangalore - 560066',
    totalOrders: 3,
    totalAmount: 1200,
    lastPickupDate: new Date(),
    createdAt: new Date('2023-11-01'),
  },
  {
    id: 'KM250105',
    name: 'Green Earth NGO',
    phone: '+91 54321 09876',
    city: 'Bangalore',
    area: 'Jayanagar',
    address: '555, 4th Block, Jayanagar, Bangalore - 560041',
    totalOrders: 2,
    totalAmount: 800,
    createdAt: new Date('2023-12-10'),
  },
];

// --- Materials ---
export const mockMaterials: Material[] = [
  { id: 'KM250301', name: 'Cardboard', category: 'Paper', unit: 'kg', customerRate: 8, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250302', name: 'Paper', category: 'Paper', unit: 'kg', customerRate: 12, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250303', name: 'Iron', category: 'Metal', unit: 'kg', customerRate: 25, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250304', name: 'Plastic', category: 'Plastic', unit: 'kg', customerRate: 15, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250305', name: 'Copper', category: 'Metal', unit: 'kg', customerRate: 450, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250306', name: 'Aluminum', category: 'Metal', unit: 'kg', customerRate: 120, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250307', name: 'E-waste', category: 'Electronics', unit: 'kg', customerRate: 35, isActive: true, updatedAt: new Date(), updatedBy: 'Admin' },
  { id: 'KM250308', name: 'Glass', category: 'Glass', unit: 'kg', customerRate: 5, isActive: false, updatedAt: new Date(), updatedBy: 'Admin' },
];

export const mockPartnerPricing: PartnerPricing[] = mockPartners.map(partner => ({
  partnerId: partner.id,
  partnerName: partner.name,
  materials: mockMaterials.map(mat => ({
    materialId: mat.id,
    materialName: mat.name,
    category: mat.category,
    unit: mat.unit,
    rate: Math.round(mat.customerRate * 1.2),
    isActive: mat.isActive,
    updatedAt: mat.updatedAt,
    updatedBy: 'Admin',
  })),
}));

// --- Orders Generator ---
const generateOrders = (): Order[] => {
  const orders: Order[] = [];
  let orderId = 250001;

  // 1. New Orders (Recent)
  orders.push({
    id: `KM${orderId++}`,
    createdAt: new Date(),
    customerId: 'KM250101',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 98765 43210',
    city: 'Bangalore',
    area: 'Koramangala',
    address: '123, 5th Cross, Koramangala 4th Block, Bangalore - 560034',
    pickupDate: new Date(),
    pickupSlot: '10:00 AM - 12:00 PM',
    scrapCategory: 'Mixed Household',
    scrapPhotos: ['/placeholder.svg'],
    description: 'Old newspapers, plastic bottles',
    status: 'new',
    orderSource: 'app',
    createdBy: 'Customer',
    cancellationEligibility: true,
  });

  orders.push({
    id: `KM${orderId++}`,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    customerId: 'KM250102',
    customerName: 'Priya Sharma',
    customerPhone: '+91 87654 32109',
    city: 'Bangalore',
    area: 'HSR Layout',
    address: '456, 7th Main, HSR Layout, Bangalore',
    pickupDate: new Date(),
    pickupSlot: '2:00 PM - 4:00 PM',
    scrapCategory: 'E-Waste',
    scrapPhotos: [],
    description: 'Old monitor and CPU',
    status: 'new',
    orderSource: 'web',
    createdBy: 'Customer',
    cancellationEligibility: true,
  });

  // 1b. Bulk New Orders (For Dashboard "New Orders Today")
  for (let i = 0; i < 8; i++) {
    const cust = mockCustomers[i % mockCustomers.length];
    orders.push({
      id: `KM${orderId++}`,
      createdAt: new Date(), // Today
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      city: 'Bangalore',
      area: cust.area || 'Koramangala',
      address: cust.address || 'Address...',
      pickupDate: new Date(),
      pickupSlot: '10:00 AM - 12:00 PM',
      scrapCategory: i % 2 === 0 ? 'Mixed Household' : 'Paper',
      scrapPhotos: [],
      description: 'Bulk household scrap',
      status: 'new',
      orderSource: 'app',
      createdBy: 'Customer',
      cancellationEligibility: true,
    });
  }

  // 1c. Pending Approvals (Invoice Submitted but not Approved)
  for (let i = 0; i < 5; i++) {
    const cust = mockCustomers[(i + 2) % mockCustomers.length];
    const partner = mockPartners[i % mockPartners.length];
    orders.push({
      id: `KM${orderId++}`,
      createdAt: getDate(1),
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      city: 'Bangalore',
      area: cust.area || 'Indiranagar',
      address: cust.address,
      pickupDate: getDate(1),
      pickupSlot: '2:00 PM - 4:00 PM',
      scrapCategory: 'Metal',
      scrapPhotos: [],
      description: 'Pending approval test',
      status: 'completed', // Completed physically
      invoiceStatus: 'pending', // But invoice pending logic
      partnerStatus: 'active',
      partnerId: partner.id,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      assignedAt: getDate(1),
      scheduledAt: getDate(1),
      startedAt: getDate(1, 11),
      otwTimestamp: getDate(1, 11),
      arrivedAt: getDate(1, 12),
      completedAt: getDate(1, 13),
      totalScrapWeight: 25,
      customerInvoice: { total: 250, items: [] },
      partnerInvoice: { total: 300, items: [] },
      commission: 50,
      orderSource: 'app',
      createdBy: 'Customer',
      cancellationEligibility: false,
    });
  }

  // 2. Scheduled/Assigned Orders
  orders.push({
    id: `KM${orderId++}`,
    createdAt: getDate(1),
    customerId: 'KM250103',
    customerName: 'TechSolutions Pvt Ltd',
    customerPhone: '+91 76543 21098',
    city: 'Bangalore',
    area: 'Indiranagar',
    address: '789, 12th Cross, Indiranagar, Bangalore',
    pickupDate: getDate(0),
    pickupSlot: '11:00 AM - 1:00 PM',
    scrapCategory: 'Corporate', // B2B
    scrapPhotos: [],
    description: 'Office cleanout - bulk paper',
    status: 'scheduled',
    partnerStatus: 'active',
    partnerId: 'KM250201',
    partnerName: 'Suresh Yadav',
    partnerPhone: '+91 99887 76655',
    assignedAt: getDate(1),
    scheduledAt: getDate(1),
    orderSource: 'web',
    createdBy: 'Customer',
    cancellationEligibility: true,
  });

  // 3. Ongoing Orders
  orders.push({
    id: `KM${orderId++}`,
    createdAt: getDate(0, 8),
    customerId: 'KM250104',
    customerName: 'Sneha Reddy',
    customerPhone: '+91 65432 10987',
    city: 'Bangalore',
    area: 'Whitefield',
    address: '321, ITPL Main Road, Whitefield',
    pickupDate: getDate(0),
    pickupSlot: '9:00 AM - 11:00 AM',
    scrapCategory: 'Paper',
    scrapPhotos: [],
    description: 'Newspapers',
    status: 'on-the-way',
    partnerStatus: 'active',
    partnerId: 'KM250202',
    partnerName: 'Ramesh Gupta',
    partnerPhone: '+91 88776 65544',
    assignedAt: getDate(0, 8),
    scheduledAt: getDate(0, 8),
    otwTimestamp: getDate(0, 9),
    arrivalOtp: '1234',
    arrivalOtpStatus: 'generated',
    orderSource: 'app',
    createdBy: 'Customer',
    cancellationEligibility: true,
  });

  // 4. Completed Orders (Historical - Last 30 Days)
  // Generating 20+ completed orders for analytics
  const pastCustomers = [mockCustomers[0], mockCustomers[1], mockCustomers[2]];
  const pastPartners = [mockPartners[0], mockPartners[1], mockPartners[2]];

  for (let i = 1; i <= 25; i++) {
    const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
    const date = getDate(daysAgo);
    const cust = pastCustomers[i % 3];
    const partner = pastPartners[i % 3];
    const isB2B = i % 3 === 2; // Every 3rd is B2B

    const weight = Math.floor(Math.random() * 50) + 10;
    const custRate = isB2B ? 10 : 12;
    const partRate = isB2B ? 12 : 15;
    const custTotal = weight * custRate;
    const partTotal = weight * partRate;
    const commission = partTotal - custTotal;

    orders.push({
      id: `KM${orderId++}`,
      createdAt: date,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      city: cust.city,
      area: cust.area,
      address: cust.address,
      pickupDate: date,
      pickupSlot: '10:00 AM - 12:00 PM',
      scrapCategory: isB2B ? 'Industrial' : 'Mixed Household',
      scrapPhotos: [],
      description: isB2B ? 'Factory waste metal' : 'Household items',
      status: 'completed',
      partnerStatus: 'active',
      partnerId: partner.id,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      assignedAt: getDate(daysAgo, 9),
      scheduledAt: getDate(daysAgo, 9),
      startedAt: getDate(daysAgo, 10),
      otwTimestamp: getDate(daysAgo, 10),
      arrivedAt: getDate(daysAgo, 10.5),
      completedAt: getDate(daysAgo, 11),
      totalScrapWeight: weight,
      invoiceStatus: 'approved',
      customerInvoice: {
        total: custTotal,
        items: [{ materialId: '1', materialName: 'Scrap', quantity: weight, unit: 'kg', rate: custRate, total: custTotal }]
      },
      partnerInvoice: {
        total: partTotal,
        items: [{ materialId: '1', materialName: 'Scrap', quantity: weight, unit: 'kg', rate: partRate, total: partTotal }]
      },
      commission: commission,
      orderSource: 'app',
      createdBy: 'Customer',
      cancellationEligibility: false,
    });
  }

  // 5. Cancelled Orders
  for (let i = 1; i <= 5; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = getDate(daysAgo);
    orders.push({
      id: `KM${orderId++}`,
      createdAt: date,
      customerId: mockCustomers[0].id,
      customerName: 'Rajesh Kumar',
      customerPhone: '+91 98765 43210',
      city: 'Bangalore',
      area: 'Koramangala',
      address: 'Address..',
      pickupDate: date,
      pickupSlot: '10:00 AM',
      scrapCategory: 'Plastic',
      scrapPhotos: [],
      description: 'Bottles',
      status: 'cancelled',
      cancelReason: 'Customer unavailable',
      cancelledBy: 'partner',
      cancelledAt: getDate(daysAgo, 12),
      orderSource: 'app',
      createdBy: 'Customer',
      cancellationEligibility: false,
    });
  }

  return orders;
};

export const mockOrders: Order[] = generateOrders();

// --- Notifications ---
export const mockNotifications: Notification[] = [
  {
    id: 'KM250401',
    type: 'new-order',
    referenceId: 'KM250002',
    title: 'New Order Assigned',
    message: 'You have been assigned order KM250002 in HSR Layout',
    recipientType: 'partner',
    recipientId: 'KM250201',
    recipientName: 'Suresh Yadav',
    channel: 'in-app',
    status: 'delivered',
    actionRequired: false,
    createdAt: new Date(),
  },
  {
    id: 'KM250402',
    type: 'invoice-submitted',
    referenceId: 'KM250008',
    title: 'Invoice Pending Approval',
    message: 'Partner Ramesh Gupta submitted invoice for order KM250008',
    recipientType: 'admin',
    channel: 'in-app',
    status: 'read',
    actionRequired: true,
    createdAt: new Date(),
    readAt: new Date(),
  },
  {
    id: 'KM250403',
    type: 'low-wallet',
    title: 'Low Wallet Balance',
    message: 'Your wallet balance is below ₹2000. Please add funds.',
    recipientType: 'partner',
    recipientId: 'KM250203',
    recipientName: 'Anil Kumar',
    channel: 'both',
    status: 'sent',
    actionRequired: false,
    createdAt: new Date(),
  },
  {
    id: 'KM250404',
    type: 'partner-registration',
    referenceId: 'KM250204',
    title: 'New Partner Registration',
    message: 'Vijay Sharma has applied for partner registration. Please review documents.',
    recipientType: 'admin',
    channel: 'in-app',
    status: 'unread',
    actionRequired: true,
    createdAt: new Date(),
  },
];

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'KM250501',
    name: 'New Order Assignment',
    type: 'new-order',
    subject: 'New Order Assigned - {{orderId}}',
    body: 'Hello {{partnerName}}, you have been assigned a new order ({{orderId}}) in {{area}}. Pickup scheduled for {{pickupDate}} at {{pickupSlot}}.',
    variables: ['orderId', 'partnerName', 'area', 'pickupDate', 'pickupSlot'],
    isActive: true,
  },
  {
    id: 'KM250502',
    name: 'Invoice Submitted',
    type: 'invoice-submitted',
    subject: 'Invoice Submitted for Order {{orderId}}',
    body: 'Partner {{partnerName}} has submitted an invoice for order {{orderId}}. Total amount: ₹{{amount}}. Please review and approve.',
    variables: ['orderId', 'partnerName', 'amount'],
    isActive: true,
  },
  {
    id: 'KM250503',
    name: 'Low Wallet Balance',
    type: 'low-wallet',
    subject: 'Low Wallet Balance Alert',
    body: 'Hello {{partnerName}}, your wallet balance is ₹{{balance}}. Please add funds to continue accepting orders.',
    variables: ['partnerName', 'balance'],
    isActive: true,
  },
];

export const mockProcessedInvoices: ProcessedInvoice[] = [
  {
    id: 'KM250601',
    orderId: 'KM250004',
    customerName: 'Sneha Reddy',
    partnerName: 'Suresh Yadav',
    customerInvoice: {
      items: [
        { materialId: 'KM250301', materialName: 'Cardboard', quantity: 25, unit: 'kg', rate: 8, total: 200 },
        { materialId: 'KM250302', materialName: 'Paper', quantity: 10, unit: 'kg', rate: 12, total: 120 },
      ],
      total: 320,
    },
    partnerInvoice: {
      items: [
        { materialId: 'KM250301', materialName: 'Cardboard', quantity: 25, unit: 'kg', rate: 10, total: 250 },
        { materialId: 'KM250302', materialName: 'Paper', quantity: 10, unit: 'kg', rate: 15, total: 150 },
      ],
      total: 400,
    },
    commission: 80,
    status: 'approved',
    processedAt: new Date(),
    processedBy: 'Admin',
  },
];

export const mockDashboardStats: DashboardStats = {
  newOrdersToday: mockOrders.filter(o => o.status === 'new').length,
  scheduledOrdersToday: mockOrders.filter(o => o.status === 'scheduled').length,
  ongoingOrdersToday: mockOrders.filter(o => ['on-the-way', 'arrived'].includes(o.status)).length,
  completedOrdersToday: mockOrders.filter(o => o.status === 'completed').length,
  cancelledOrdersToday: mockOrders.filter(o => o.status === 'cancelled').length,
  livePartners: mockPartners.filter(p => p.isLive).length,
  pendingInvoices: mockOrders.filter(o => o.invoiceStatus === 'pending').length,
  todayRevenue: mockOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.customerInvoice?.total || 0), 0),
};

export const scrapCategories = [
  'Mixed Household',
  'Paper & Cardboard',
  'Metal',
  'Plastic',
  'E-Waste',
  'Industrial Metal',
  'Glass',
  'Textiles',
  'Other',
];

export const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Belgaum', 'Kolhapur'];

export const areasByCity: Record<string, string[]> = {
  Bangalore: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Jayanagar', 'BTM Layout', 'Electronic City', 'Marathahalli', 'JP Nagar', 'Mahadevpura'],
  Mumbai: ['Andheri', 'Bandra', 'Powai', 'Juhu', 'Malad'],
  Delhi: ['Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini', 'Saket'],
  Chennai: ['Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'Mylapore'],
  Hyderabad: ['Banjara Hills', 'Madhapur', 'Gachibowli', 'Jubilee Hills', 'Secunderabad'],
  Belgaum: ['Tilakwadi', 'Camp', 'Khanapur', 'Shahpur', 'Vadgaon'],
  Kolhapur: ['Rajarampuri', 'Shahupuri', 'Tarabai Park', 'Nagala Park', 'Kasaba Bawada'],
};

export const pickupSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
  '6:00 PM - 7:00 PM',
];

export const notificationTemplatesList = [
  { id: 'order_confirmed', name: 'Order Confirmed', subject: 'Your order {{orderId}} is confirmed', body: 'Hello {{customerName}}, your order {{orderId}} is confirmed.' },
  { id: 'payment_received', name: 'Payment Received', subject: 'Payment Received', body: 'We received payment.' }
];
