
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Restaurant, CartItem, Order, ViewMode, AppView, MenuItem, PaymentMethod, UserProfile, OrderType } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  restaurants: Restaurant[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  selectedRestaurant: Restaurant | null; 
  cart: CartItem[];
  addToCart: (item: MenuItem, restaurantId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (method: PaymentMethod, type: OrderType, changeFor?: number) => void;
  activeOrders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  submitOrderRating: (orderId: string, rating: number, comment: string) => void;
  userProfile: UserProfile;
  isAuthenticated: boolean;
  login: (email: string, pin: string, role: 'customer' | 'partner') => Promise<{ success: boolean, blocked?: boolean }>;
  register: (profile: UserProfile) => Promise<boolean>;
  logout: () => void;
  updateCustomerProfile: (profile: UserProfile) => Promise<void>;
  updateRestaurantInfo: (restaurantId: string, info: Partial<Restaurant>) => Promise<void>;
  addMenuItem: (restaurantId: string, item: Omit<MenuItem, 'id'>) => Promise<void>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<void>;
  toggleMenuItemAvailability: (restaurantId: string, itemId: string) => Promise<void>;
  toggleRestaurantOpen: (restaurantId: string) => Promise<void>;
  deleteAccount: (email: string, protocol: string) => Promise<boolean>;
  blockAccount: (email: string, protocol: string) => Promise<boolean>;
  toast: { message: string, type: 'info' | 'success' | 'order' } | null;
  setToast: (toast: { message: string, type: 'info' | 'success' | 'order' } | null) => void;
  generateShareLink: (restaurantId: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' | 'order' } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', address: '', addressReference: '', phone: '', email: '', role: null
  });

  // 1. CARREGAMENTO INICIAL E REALTIME
  useEffect(() => {
    fetchInitialData();

    // Inscrever em mudanças de Restaurantes
    const restaurantsSub = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'restaurants', schema: 'public' }, () => fetchInitialData())
      .on('postgres_changes', { event: '*', table: 'menu_items', schema: 'public' }, () => fetchInitialData())
      .subscribe();

    // Inscrever em mudanças de Pedidos (ESSENCIAL PARA O PARCEIRO RECEBER NA HORA)
    const ordersSub = supabase.channel('orders-db-changes')
      .on('postgres_changes', { event: 'INSERT', table: 'orders', schema: 'public' }, (payload) => {
          setToast({ message: "Novo pedido recebido!", type: 'order' });
          fetchInitialData();
      })
      .on('postgres_changes', { event: 'UPDATE', table: 'orders', schema: 'public' }, (payload: any) => {
          setToast({ message: `Pedido #${payload.new.id.slice(0,5)} atualizado para ${payload.new.status}`, type: 'info' });
          fetchInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(restaurantsSub);
      supabase.removeChannel(ordersSub);
    };
  }, []);

  const fetchInitialData = async () => {
    const { data: restData } = await supabase.from('restaurants').select('*, menu_items(*)');
    if (restData) {
      setRestaurants(restData.map((r: any) => ({
        ...r,
        menu: r.menu_items || []
      })));
    }

    const { data: orderData } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (orderData) setActiveOrders(orderData);
  };

  // 2. LÓGICA DE NEGÓCIO (AGORA ASSÍNCRONA COM SUPABASE)
  const login = async (email: string, pin: string, role: 'customer' | 'partner') => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .eq('securityPin', pin)
      .single();

    if (data) {
      if (data.isBlocked) return { success: false, blocked: true };
      setUserProfile(data);
      setIsAuthenticated(true);
      setCurrentView('home');
      return { success: true };
    }
    return { success: false };
  };

  const register = async (profile: UserProfile) => {
    const { data, error } = await supabase.from('profiles').insert([profile]).select().single();
    if (data) {
      if (profile.role === 'partner') {
        await supabase.from('restaurants').insert([{
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          isOpen: true,
          deliveryFee: 5.0
        }]);
      }
      setUserProfile(data);
      setIsAuthenticated(true);
      setCurrentView('home');
      return true;
    }
    return false;
  };

  const placeOrder = async (method: PaymentMethod, type: OrderType, changeFor?: number) => {
    if (cart.length === 0) return;
    const restaurant = restaurants.find(r => r.id === cart[0].restaurantId);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = type === 'delivery' ? (restaurant?.deliveryFee || 0) : 0;

    const orderData = {
      restaurantId: cart[0].restaurantId,
      restaurantName: restaurant?.name,
      items: cart,
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

    const { error } = await supabase.from('orders').insert([orderData]);
    if (!error) {
      setCart([]);
      setCurrentView('order_tracking');
      setToast({ message: "Pedido enviado! Já está no celular da loja.", type: 'success' });
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  const toggleRestaurantOpen = async (restaurantId: string) => {
    const rest = restaurants.find(r => r.id === restaurantId);
    await supabase.from('restaurants').update({ isOpen: !rest?.isOpen }).eq('id', restaurantId);
  };

  const addMenuItem = async (restaurantId: string, item: any) => {
    await supabase.from('menu_items').insert([{ ...item, restaurant_id: restaurantId }]);
  };

  const deleteMenuItem = async (restaurantId: string, itemId: string) => {
    await supabase.from('menu_items').delete().eq('id', itemId);
  };

  // HELPERS RESTANTES (MESMA LÓGICA, PORÉM COM SUPABASE NO BACKEND)
  const logout = () => { setIsAuthenticated(false); setCurrentView('landing'); };
  const generateShareLink = (id: string) => `${window.location.origin}/?restaurant=${id}`;
  const selectedRestaurant = useMemo(() => restaurants.find(r => r.id === selectedRestaurantId) || null, [selectedRestaurantId, restaurants]);

  return (
    <AppContext.Provider
      value={{
        restaurants, viewMode, setViewMode, currentView, setCurrentView,
        selectedRestaurantId, setSelectedRestaurantId, selectedRestaurant,
        cart, addToCart: (item, rid) => setCart(prev => [...prev, { ...item, quantity: 1, restaurantId: rid }]), 
        removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)),
        clearCart: () => setCart([]), placeOrder, activeOrders,
        updateOrderStatus, submitOrderRating: async (id, r, c) => { await supabase.from('orders').update({ rating: r, ratingComment: c }).eq('id', id) }, 
        userProfile, isAuthenticated, login, register, logout, 
        updateCustomerProfile: async (p) => { await supabase.from('profiles').update(p).eq('email', p.email) },
        updateRestaurantInfo: async (id, info) => { await supabase.from('restaurants').update(info).eq('id', id) },
        addMenuItem, deleteMenuItem, 
        toggleMenuItemAvailability: async (rid, id) => { 
          const item = restaurants.find(r => r.id === rid)?.menu.find(m => m.id === id);
          await supabase.from('menu_items').update({ available: !item?.available }).eq('id', id);
        },
        toggleRestaurantOpen,
        deleteAccount: async (e, p) => p === '0382690@' ? !!(await supabase.from('profiles').delete().eq('email', e)) : false,
        blockAccount: async (e, p) => p === '0382690@' ? !!(await supabase.from('profiles').update({ isBlocked: true }).eq('email', e)) : false,
        toast, setToast, generateShareLink
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
