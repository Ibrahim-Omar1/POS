export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
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
