
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  available?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  image: string;
  deliveryTime: string;
  distance: string;
  menu: MenuItem[];
  pixKey?: string;
  pixWhatsApp?: string;
  address?: string;
  phone?: string;
  email?: string;
  deliveryFee: number;
  isOpen?: boolean; // Status online/offline
  isBlocked?: boolean; // Status de bloqueio administrativo
}

export interface UserProfile {
  name: string;
  address: string;
  addressReference: string;
  phone: string;
  email: string;
  securityPin?: string;
  role: 'customer' | 'partner' | null;
  isBlocked?: boolean; // Bloqueio no perfil do usuário
}

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';

export type PaymentMethod = 'pix' | 'card' | 'cash';

export type OrderType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  pickupCode: string;
  paymentMethod: PaymentMethod;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerAddressReference?: string;
  changeFor?: number;
  rating?: number;
  ratingComment?: string;
}

export type ViewMode = 'customer' | 'restaurant';

export type AppView = 'landing' | 'login' | 'home' | 'restaurant_detail' | 'cart' | 'order_tracking' | 'profile';
