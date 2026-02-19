
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Restaurant, CartItem, Order, ViewMode, AppView, MenuItem, PaymentMethod, UserProfile, OrderType } from '../types';
import { MOCK_RESTAURANTS } from '../constants';

interface AppContextType {
  restaurants: Restaurant[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, restaurantId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (method: PaymentMethod, type: OrderType, changeFor?: number) => void;
  activeOrders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  submitOrderRating: (orderId: string, rating: number, comment: string) => void;
  // Auth & Profile
  userProfile: UserProfile;
  isAuthenticated: boolean;
  login: (email: string, pin: string, role: 'customer' | 'partner') => { success: boolean, blocked?: boolean };
  register: (profile: UserProfile) => boolean;
  logout: () => void;
  updateCustomerProfile: (profile: UserProfile) => void;
  updateRestaurantInfo: (restaurantId: string, info: Partial<Restaurant>) => void;
  addMenuItem: (restaurantId: string, item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (restaurantId: string, itemId: string) => void;
  toggleMenuItemAvailability: (restaurantId: string, itemId: string) => void;
  // Administrative & Status
  toggleRestaurantOpen: (restaurantId: string) => void;
  deleteAccount: (email: string, protocol: string) => boolean;
  blockAccount: (email: string, protocol: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_USERS_KEY = 'delivery_certo_users_v1';
const DB_RESTAURANTS_KEY = 'delivery_certo_restaurants_v1';
const DEV_PROTOCOL = '0382690@';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  
  // Banco de Dados de Restaurantes
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem(DB_RESTAURANTS_KEY);
    if (saved) return JSON.parse(saved);
    // Se for a primeira vez, usa os Mocks e salva
    localStorage.setItem(DB_RESTAURANTS_KEY, JSON.stringify(MOCK_RESTAURANTS));
    return MOCK_RESTAURANTS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', address: '', addressReference: '', phone: '', email: '', role: null
  });

  // Sincronizar restaurantes com localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(DB_RESTAURANTS_KEY, JSON.stringify(restaurants));
  }, [restaurants]);

  const getStoredUsers = (): UserProfile[] => {
    const data = localStorage.getItem(DB_USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const login = (email: string, pin: string, role: 'customer' | 'partner'): { success: boolean, blocked?: boolean } => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email && u.role === role && u.securityPin === pin);
    
    if (user) {
      if (user.isBlocked) return { success: false, blocked: true };
      
      setUserProfile(user);
      setIsAuthenticated(true);
      if (role === 'partner') {
        setViewMode('restaurant');
        setCurrentView('home');
      } else {
        setViewMode('customer');
        setCurrentView('home');
      }
      return { success: true };
    }
    return { success: false };
  };

  const register = (profile: UserProfile): boolean => {
    const users = getStoredUsers();
    if (users.some(u => u.email === profile.email && u.role === profile.role)) return false;
    
    const newUser = { ...profile, isBlocked: false };
    users.push(newUser);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    
    // Se for parceiro, cria o registro do restaurante se não existir
    if (profile.role === 'partner') {
      const restaurantExists = restaurants.some(r => r.email === profile.email);
      if (!restaurantExists) {
        const newRestaurant: Restaurant = {
          id: Math.random().toString(36).substring(7),
          name: profile.name,
          description: 'Novo parceiro',
          rating: 0,
          image: 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 100),
          deliveryTime: '-- min',
          distance: '', // Removida distância fictícia
          menu: [],
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          deliveryFee: 0,
          isOpen: true,
          isBlocked: false
        };
        setRestaurants(prev => [...prev, newRestaurant]);
      }
    }

    setUserProfile(newUser);
    setIsAuthenticated(true);
    setViewMode(profile.role === 'partner' ? 'restaurant' : 'customer');
    setCurrentView('home');
    return true;
  };

  const deleteAccount = (email: string, protocol: string): boolean => {
    if (protocol !== DEV_PROTOCOL) return false;
    
    // Remove usuário
    const users = getStoredUsers();
    const filteredUsers = users.filter(u => u.email !== email);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(filteredUsers));
    
    // Remove restaurante vinculado
    setRestaurants(prev => prev.filter(r => r.email !== email));
    
    if (userProfile.email === email) logout();
    return true;
  };

  const blockAccount = (email: string, protocol: string): boolean => {
    if (protocol !== DEV_PROTOCOL) return false;
    
    // Bloqueia usuário
    const users = getStoredUsers();
    const updatedUsers = users.map(u => u.email === email ? { ...u, isBlocked: true } : u);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(updatedUsers));
    
    // Bloqueia restaurante
    setRestaurants(prev => prev.map(r => r.email === email ? { ...r, isBlocked: true, isOpen: false } : r));
    
    if (userProfile.email === email) logout();
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setCart([]);
    setActiveOrders([]);
    setUserProfile({ name: '', address: '', addressReference: '', phone: '', email: '', role: null });
  };

  const toggleRestaurantOpen = (restaurantId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isOpen: !r.isOpen } : r));
  };

  const addToCart = (item: MenuItem, restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant?.isOpen) {
      alert("Este restaurante está offline no momento e não aceita pedidos.");
      return;
    }
    if (item.available === false) return;
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
       if(!window.confirm("Iniciar uma nova sacola? Você tem itens de outro restaurante.")) return;
       setCart([{ ...item, quantity: 1, restaurantId }]);
       return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, restaurantId }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.map((item) => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (method: PaymentMethod, type: OrderType, changeFor?: number) => {
    if (!userProfile.name || !userProfile.phone || !userProfile.address) {
      alert("Complete seu cadastro no perfil para pedir.");
      setCurrentView('profile');
      return;
    }
    if (cart.length === 0) return;
    const restaurant = restaurants.find(r => r.id === cart[0].restaurantId);
    if (!restaurant?.isOpen) {
      alert("O restaurante fechou ou ficou offline. O pedido não pôde ser concluído.");
      return;
    }
    
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = type === 'delivery' ? (restaurant?.deliveryFee || 0) : 0;
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      restaurantId: cart[0].restaurantId,
      restaurantName: restaurant?.name || 'Restaurante Desconhecido',
      items: [...cart],
      subtotal, deliveryFee, total,
      status: 'pending',
      createdAt: Date.now(),
      pickupCode: Math.floor(1000 + Math.random() * 9000).toString(),
      paymentMethod: method,
      orderType: type,
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      customerAddress: type === 'delivery' ? userProfile.address : undefined,
      customerAddressReference: type === 'delivery' ? userProfile.addressReference : undefined,
      changeFor: method === 'cash' ? changeFor : undefined
    };

    setActiveOrders((prev) => [newOrder, ...prev]);

    if (method === 'pix' && restaurant) {
      const targetPhone = restaurant.pixWhatsApp || restaurant.phone || '5519991759068';
      const cleanPhone = targetPhone.replace(/\D/g, '');
      const itemsList = newOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
      const message = `Olá! Acabei de fazer um pedido via Pix no Delivery Certo.\n\n*Pedido:* #${newOrder.id}\n*Total:* R$ ${newOrder.total.toFixed(2)}\n*Itens:* ${itemsList}`;
      const waUrl = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    }
    clearCart();
    setCurrentView('order_tracking');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const submitOrderRating = (orderId: string, rating: number, comment: string) => {
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating, ratingComment: comment } : o));
  };

  const updateCustomerProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    const users = getStoredUsers();
    const updatedUsers = users.map(u => (u.email === profile.email && u.role === profile.role) ? profile : u);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(updatedUsers));
  };

  const updateRestaurantInfo = (restaurantId: string, info: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, ...info } : r));
  };

  const addMenuItem = (restaurantId: string, newItem: Omit<MenuItem, 'id'>) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        const itemWithId = { ...newItem, id: Math.random().toString(36).substring(7) };
        return { ...r, menu: [...r.menu, itemWithId] };
      }
      return r;
    }));
  };

  const deleteMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return { ...r, menu: r.menu.filter(i => i.id !== itemId) };
      }
      return r;
    }));
  };

  const toggleMenuItemAvailability = (restaurantId: string, itemId: string) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return {
          ...r,
          menu: r.menu.map(i => i.id === itemId ? { ...i, available: i.available === false ? true : false } : i)
        };
      }
      return r;
    }));
  };

  return (
    <AppContext.Provider
      value={{
        restaurants, viewMode, setViewMode, currentView, setCurrentView,
        selectedRestaurant, setSelectedRestaurant, cart, addToCart,
        removeFromCart, clearCart, placeOrder, activeOrders, updateOrderStatus,
        submitOrderRating, userProfile, isAuthenticated, login, register, logout,
        updateCustomerProfile, updateRestaurantInfo, addMenuItem, deleteMenuItem,
        toggleMenuItemAvailability, toggleRestaurantOpen, deleteAccount, blockAccount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
