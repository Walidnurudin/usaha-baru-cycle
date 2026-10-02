export interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category?: Category;
  price: number | string;
  stock: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = 'INQUIRY' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Order {
  id: string;
  customerName: string;
  customerWa: string;
  productName: string;
  totalAmount: number | string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalWebsiteVisits: number;
  totalRevenue: number;
  recentOrders: Order[];
  recentVisitsCount7d?: number;
}
