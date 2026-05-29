// Products are loaded from the DB via API — no mock data here

export const initialOrders = [
  {
    id: 'ORD-1001',
    customerName: 'Sarah Johnson',
    totalAmount: 84.98,
    status: 'Delivered',
    date: '2026-05-01',
  },
  {
    id: 'ORD-1002',
    customerName: 'Michael Chen',
    totalAmount: 49.99,
    status: 'Pending',
    date: '2026-05-10',
  },
  {
    id: 'ORD-1003',
    customerName: 'Emily Davis',
    totalAmount: 129.97,
    status: 'Pending',
    date: '2026-05-18',
  },
  {
    id: 'ORD-1004',
    customerName: 'James Wilson',
    totalAmount: 34.99,
    status: 'Delivered',
    date: '2026-05-20',
  },
  {
    id: 'ORD-1005',
    customerName: 'Priya Sharma',
    totalAmount: 94.98,
    status: 'Delivered',
    date: '2026-05-21',
  },
];

// Users are loaded from the DB via API — no mock data here

export const dashboardStats = {
  totalProducts: 156,
  totalOrders: 1240,
  totalUsers: 890,
  revenue: 45820,
};

export const PRODUCT_CATEGORIES = [
  'Backpacks',
  'Kids',
  'Sports',
  'Laptop Bags',
  'Accessories',
];

export const emptyProductForm = {
  name: '',
  price: '',
  category: '',
  description: '',
  brand: '',
  sku: '',
  stock: '',
  imageUrl: '',
  weight: '',
  dimensions: '',
  color: '',
  material: '',
  isVisibleOnWebsite: true,
};
