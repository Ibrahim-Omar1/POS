export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  stock: number | null; // null = unlimited stock
  isAvailable: boolean;
  categoryId: number;
  category: Category;
  createdAt: string;
}

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number | null; // null = unlimited
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  menuItem: MenuItem;
}

export interface Order {
  id: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface Settings {
  id: number;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  updatedAt: string;
}
