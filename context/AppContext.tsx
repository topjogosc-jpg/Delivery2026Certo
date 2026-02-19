
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Restaurant, CartItem, Order, ViewMode, AppView, MenuItem, PaymentMethod, UserProfile, OrderType } from '../types';
import { MOCK_RESTAURANTS } from '../constants';

interface AppContextType {
  restaurants: Restaurant[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  selectedRestaurant: Restaurant | null; // Helper derivado
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
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  
  // Banco de Dados de Restaurantes
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem(DB_RESTAURANTS_KEY);
    return saved ? JSON.parse(saved) : MOCK_RESTAURANTS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', address: '', addressReference: '', phone: '', email: '', role: null
  });

  // Restaurante selecionado sempre derivado da lista principal (Real-time sync)
  const selectedRestaurant = useMemo(() => {
    if (!selectedRestaurantId) return null;
    return restaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [selectedRestaurantId, restaurants]);

  // Sincronizar com localStorage e outras abas
  useEffect(() => {
    localStorage.setItem(DB_RESTAURANTS_KEY, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DB_RESTAURANTS_KEY && e.newValue) {
        setRestaurants(JSON.parse(e.newValue));
      }
      if (e.key === DB_USERS_KEY && e.newValue) {
        const users = JSON.parse(e.newValue);
        if (isAuthenticated && userProfile.email) {
            const updatedMe = users.find((u: any) => u.email === userProfile.email && u.role === userProfile.role);
            if (updatedMe) {
                if (updatedMe.isBlocked) logout();
                else setUserProfile(updatedMe);
            }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, userProfile]);

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
      setCurrentView('home');
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
    
    if (profile.role === 'partner') {
      const newRestaurant: Restaurant = {
        id: Math.random().toString(36).substring(7),
        name: profile.name,
        description: 'Novo parceiro Delivery Certo',
        rating: 0,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
        deliveryTime: '30-45 min',
        distance: 'Local',
        menu: [],
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        deliveryFee: 5.00,
        isOpen: true,
        isBlocked: false
      };
      setRestaurants(prev => [...prev, newRestaurant]);
    }

    setUserProfile(newUser);
    setIsAuthenticated(true);
    setCurrentView('home');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setSelectedRestaurantId(null);
    setCart([]);
    setActiveOrders([]);
  };

  const toggleRestaurantOpen = (restaurantId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isOpen: !r.isOpen } : r));
  };

  const addToCart = (item: MenuItem, restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant?.isOpen) {
      alert("Este restaurante está offline no momento.");
      return;
    }
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
       if(!window.confirm("Limpar sacola atual para pedir deste restaurante?")) return;
       setCart([{ ...item, quantity: 1, restaurantId }]);
       return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1, restaurantId }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (method: PaymentMethod, type: OrderType, changeFor?: number) => {
    if (cart.length === 0) return;
    const restaurant = restaurants.find(r => r.id === cart[0].restaurantId);
    
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = type === 'delivery' ? (restaurant?.deliveryFee || 0) : 0;

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      restaurantId: cart[0].restaurantId,
      restaurantName: restaurant?.name || 'Loja',
      items: [...cart],
      subtotal, deliveryFee, total: subtotal + deliveryFee,
      status: 'pending',
      createdAt: Date.now(),
      pickupCode: Math.floor(1000 + Math.random() * 9000).toString(),
      paymentMethod: method,
      orderType: type,
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      customerAddress: userProfile.address,
      changeFor
    };

    setActiveOrders(prev => [newOrder, ...prev]);
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
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users.map(u => (u.email === profile.email && u.role === profile.role) ? profile : u)));
  };

  const updateRestaurantInfo = (restaurantId: string, info: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, ...info } : r));
  };

  const addMenuItem = (restaurantId: string, newItem: Omit<MenuItem, 'id'>) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return { ...r, menu: [...r.menu, { ...newItem, id: Math.random().toString(36).substring(7) }] };
      }
      return r;
    }));
  };

  const deleteMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, menu: r.menu.filter(i => i.id !== itemId) } : r));
  };

  const toggleMenuItemAvailability = (restaurantId: string, itemId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? {
      ...r, menu: r.menu.map(i => i.id === itemId ? { ...i, available: !i.available } : i)
    } : r));
  };

  const deleteAccount = (email: string, protocol: string) => {
    if (protocol !== DEV_PROTOCOL) return false;
    const users = getStoredUsers().filter(u => u.email !== email);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    setRestaurants(prev => prev.filter(r => r.email !== email));
    if (userProfile.email === email) logout();
    return true;
  };

  const blockAccount = (email: string, protocol: string) => {
    if (protocol !== DEV_PROTOCOL) return false;
    const users = getStoredUsers().map(u => u.email === email ? { ...u, isBlocked: true } : u);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    setRestaurants(prev => prev.map(r => r.email === email ? { ...r, isBlocked: true, isOpen: false } : r));
    if (userProfile.email === email) logout();
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        restaurants, viewMode, setViewMode, currentView, setCurrentView,
        selectedRestaurantId, setSelectedRestaurantId, selectedRestaurant,
        cart, addToCart, removeFromCart, clearCart, placeOrder, activeOrders,
        updateOrderStatus, submitOrderRating, userProfile, isAuthenticated,
        login, register, logout, updateCustomerProfile, updateRestaurantInfo,
        addMenuItem, deleteMenuItem, toggleMenuItemAvailability, toggleRestaurantOpen,
        deleteAccount, blockAccount
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
