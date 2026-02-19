
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Search, Star, Clock, ChevronRight, ShoppingBag, ArrowLeft, CreditCard, Banknote, QrCode, Copy, Check, Info, User, Phone, Save, Bike, Package, AlertCircle, Coins, MessageSquare, Utensils, Trash2, MessageCircle } from 'lucide-react';
import { Restaurant, PaymentMethod, UserProfile, OrderType, Order } from '../types';

const RatingSection: React.FC<{ order: Order, onRatingSubmit: (id: string, r: number, c: string) => void }> = ({ order, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (order.rating) {
    return (
      <div className="mt-4 p-4 bg-brand-50 rounded-2xl border border-brand-100">
        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Sua Avaliação</p>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={14} className={s <= order.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
          ))}
        </div>
        {order.ratingComment && <p className="text-xs text-gray-700 italic">"{order.ratingComment}"</p>}
      </div>
    );
  }

  const handleSubmit = () => {
    if (rating === 0) return alert("Por favor, selecione as estrelas.");
    onRatingSubmit(order.id, rating, comment);
  };

  return (
    <div className="mt-4 p-4 bg-white border-2 border-brand-100 rounded-2xl shadow-sm">
      <h4 className="font-bold text-gray-800 text-sm mb-3">Como estava seu pedido?</h4>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-125">
            <Star size={28} className={s <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"} />
          </button>
        ))}
      </div>
      <textarea 
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Deixe um comentário (opcional)"
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-brand-500 mb-3 resize-none"
        rows={2}
      />
      <button 
        onClick={handleSubmit}
        className="w-full bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition"
      >
        Enviar Avaliação
      </button>
    </div>
  );
};

export const CustomerView: React.FC = () => {
  const { 
    currentView, setCurrentView, restaurants, selectedRestaurant, setSelectedRestaurant,
    cart, placeOrder, activeOrders, addToCart, removeFromCart, userProfile,
    submitOrderRating
  } = useAppContext();

  const [activeDetailTab, setActiveDetailTab] = useState<'menu' | 'reviews'>('menu');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [copied, setCopied] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currentRestaurantId = cart.length > 0 ? cart[0].restaurantId : (selectedRestaurant?.id || null);
  const currentRestaurant = restaurants.find(r => r.id === currentRestaurantId);
  const deliveryFeeValue = (orderType === 'delivery' && currentRestaurant) ? currentRestaurant.deliveryFee : 0;
  const cartTotal = subtotal + deliveryFeeValue;

  const restaurantStats = useMemo(() => {
    if (!selectedRestaurant) return { avg: 0, count: 0 };
    const reviews = activeOrders.filter(o => o.restaurantId === selectedRestaurant.id && o.rating !== undefined);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((acc, o) => acc + (o.rating || 0), 0);
    return { avg: (sum / reviews.length).toFixed(1), count: reviews.length };
  }, [selectedRestaurant, activeOrders]);

  const handleRestaurantClick = (r: Restaurant) => {
    setSelectedRestaurant(r);
    setActiveDetailTab('menu');
    setCurrentView('restaurant_detail');
  };

  const handleCopyPix = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const OrderViewTabs = ({ active }: { active: 'cart' | 'tracking' }) => (
    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
      <button 
        onClick={() => setCurrentView('cart')}
        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${active === 'cart' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
      >
        Sacola {cart.length > 0 && `(${cart.length})`}
      </button>
      <button 
        onClick={() => setCurrentView('order_tracking')}
        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${active === 'tracking' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
      >
        Ativos {activeOrders.length > 0 && `(${activeOrders.length})`}
      </button>
    </div>
  );

  if (currentView === 'home') {
    return (
      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Entregar em</p>
            <div className="flex items-center gap-1 text-brand-600 font-bold">
              <MapPin size={16} />
              <span className="truncate max-w-[150px]">{userProfile.address}</span>
              <ChevronRight size={16} />
            </div>
          </div>
          <div 
            onClick={() => cart.length > 0 ? setCurrentView('cart') : setCurrentView('order_tracking')}
            className="relative p-2 bg-white rounded-full border border-gray-100 shadow-sm cursor-pointer active:scale-95 transition"
          >
            <ShoppingBag size={20} className="text-gray-700" />
            {(cart.length > 0 || activeOrders.length > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                {cart.length || activeOrders.length}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Pesquisar pratos ou lojas" 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="space-y-4 pb-20">
          <h2 className="font-bold text-lg text-gray-800">Restaurantes</h2>
          {restaurants.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm font-medium">Nenhum restaurante cadastrado ainda.</p>
            </div>
          ) : restaurants.map(r => {
            const reviews = activeOrders.filter(o => o.restaurantId === r.id && o.rating !== undefined);
            const avg = reviews.length > 0 ? (reviews.reduce((acc, o) => acc + (o.rating || 0), 0) / reviews.length).toFixed(1) : null;
            
            return (
              <div 
                key={r.id} 
                onClick={() => handleRestaurantClick(r)}
                className={`bg-white rounded-3xl p-3 shadow-sm border transition-all cursor-pointer active:scale-[0.98] ${r.isOpen ? 'border-gray-100' : 'opacity-70 grayscale-[0.5] border-red-50'}`}
              >
                <div className="relative h-44 rounded-2xl overflow-hidden mb-3">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                  {!r.isOpen && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white font-black px-4 py-2 rounded-xl text-xs uppercase shadow-xl">Fechado Agora</span>
                    </div>
                  )}
                  {avg && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      {avg}
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold text-lg ${r.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{r.name}</h3>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-1 mb-2">{r.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase">
                    <div className="flex items-center gap-1"><Clock size={12} /> {r.deliveryTime}</div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span className={r.isOpen ? "text-brand-600" : "text-gray-400"}>Taxa: R$ {r.deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentView === 'restaurant_detail' && selectedRestaurant) {
    const hasItems = cart.length > 0;
    const isClosed = !selectedRestaurant.isOpen;
    const restaurantReviews = activeOrders.filter(o => o.restaurantId === selectedRestaurant.id && o.rating !== undefined);
    
    return (
      <div className="bg-white min-h-full pb-32 animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative h-64">
          <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className={`w-full h-full object-cover ${isClosed ? 'grayscale opacity-80' : ''}`} />
          <button onClick={() => setCurrentView('home')} className="absolute top-4 left-4 bg-white/90 p-2.5 rounded-full shadow-lg text-gray-800"><ArrowLeft size={22} /></button>
          {isClosed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="bg-red-600 text-white font-black px-6 py-3 rounded-2xl text-sm uppercase shadow-2xl tracking-widest">Loja Offline</span>
            </div>
          )}
        </div>

        <div className="px-6 py-8 -mt-8 relative bg-white rounded-t-[40px] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h1 className={`text-3xl font-black tracking-tight ${isClosed ? 'text-gray-400' : 'text-gray-900'}`}>{selectedRestaurant.name}</h1>
            
            {restaurantStats.count > 0 ? (
              <div className="bg-brand-50 text-brand-600 px-3 py-1 rounded-xl font-bold flex items-center gap-1 text-sm border border-brand-100">
                <Star size={16} className="fill-brand-500" /> {restaurantStats.avg}
              </div>
            ) : (
              <div className="bg-gray-50 text-gray-400 px-3 py-1 rounded-xl font-bold text-[10px] uppercase border border-gray-100">
                Nova Loja
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-6 pb-6 border-b border-gray-50">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
               <Clock size={14} className="text-brand-500" />
               {selectedRestaurant.deliveryTime}
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-2 rounded-xl border border-brand-100">
               <Bike size={14} />
               Entrega: {selectedRestaurant.deliveryFee > 0 ? `R$ ${selectedRestaurant.deliveryFee.toFixed(2)}` : 'Grátis'}
             </div>
          </div>

          <div className="flex border-b border-gray-100 mt-6">
             <button 
                onClick={() => setActiveDetailTab('menu')}
                className={`flex-1 py-3 text-sm font-black uppercase tracking-widest border-b-2 transition ${activeDetailTab === 'menu' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400'}`}
             >
                Cardápio
             </button>
             <button 
                onClick={() => setActiveDetailTab('reviews')}
                className={`flex-1 py-3 text-sm font-black uppercase tracking-widest border-b-2 transition ${activeDetailTab === 'reviews' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400'}`}
             >
                Avaliações {restaurantStats.count > 0 && `(${restaurantStats.count})`}
             </button>
          </div>

          <div className="mt-8 space-y-8">
            {activeDetailTab === 'menu' ? (
              selectedRestaurant.menu.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  O cardápio ainda não está disponível.
                </div>
              ) : selectedRestaurant.menu.map(item => (
                <div key={item.id} className={`flex gap-4 items-center ${item.available === false || isClosed ? 'opacity-50' : ''}`}>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-gray-900">R$ {item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addToCart(item, selectedRestaurant.id)}
                        disabled={item.available === false || isClosed}
                        className={`text-xs font-black px-5 py-2 rounded-xl transition-all active:scale-95 ${
                          item.available === false || isClosed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-lg shadow-brand-100'
                        }`}
                      >
                        {isClosed ? 'OFFLINE' : item.available === false ? 'ESGOTADO' : 'ADICIONAR'}
                      </button>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {restaurantReviews.length > 0 ? (
                  restaurantReviews.map(r => (
                    <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800 text-sm">{r.customerName}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.rating! ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />)}
                        </div>
                      </div>
                      {r.ratingComment && <p className="text-xs text-gray-600 italic">"{r.ratingComment}"</p>}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare size={20} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sem avaliações ainda</p>
                    <p className="text-[10px] text-gray-400 max-w-[150px] mx-auto">Seja o primeiro a avaliar após receber seu pedido!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {hasItems && (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 md:max-w-md">
            <button 
              onClick={() => setCurrentView('cart')}
              className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl shadow-xl flex justify-between px-8"
            >
              <span>Ver Sacola ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'cart') {
     return (
        <div className="h-full flex flex-col bg-white animate-in slide-in-from-right-4 duration-300 pb-20">
           <div className="p-6 border-b border-gray-50 flex items-center gap-4">
              <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-50 rounded-full"><ArrowLeft size={20} /></button>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Minha Sacola</h1>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                 <div className="text-center py-20"><ShoppingBag size={64} className="mx-auto text-gray-200 mb-4"/><h2 className="text-xl font-bold">Sacola Vazia</h2></div>
              ) : (
                 <>
                    <div className="space-y-4">
                       {cart.map(item => (
                          <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                             <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                             <div className="flex-1">
                                <h4 className="font-bold text-sm">{item.name}</h4>
                                <div className="flex justify-between items-center mt-1">
                                   <span className="text-brand-600 font-black">R$ {item.price.toFixed(2)}</span>
                                   <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border">
                                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-bold">-</button>
                                      <span className="text-xs font-bold">{item.quantity}</span>
                                      <button onClick={() => addToCart(item, item.restaurantId)} className="text-brand-600 font-bold">+</button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-sm">
                       <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">R$ {subtotal.toFixed(2)}</span></div>
                       <div className="flex justify-between"><span>Taxa Entrega</span><span className="font-bold text-brand-600">R$ {deliveryFeeValue.toFixed(2)}</span></div>
                       <div className="border-t pt-2 flex justify-between text-lg font-black"><span>Total</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                    </div>

                    <div className="space-y-3">
                       <button 
                          onClick={() => setOrderType('delivery')}
                          className={`w-full py-3 rounded-xl border-2 font-black text-xs uppercase transition ${orderType === 'delivery' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-400 border-gray-100'}`}
                       >Entrega</button>
                       <button 
                          onClick={() => setOrderType('pickup')}
                          className={`w-full py-3 rounded-xl border-2 font-black text-xs uppercase transition ${orderType === 'pickup' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-400 border-gray-100'}`}
                       >Retirada</button>
                    </div>

                    <button 
                       onClick={() => placeOrder(paymentMethod, orderType)}
                       className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl shadow-xl mt-4"
                    >Finalizar Pedido</button>
                 </>
              )}
           </div>
        </div>
     );
  }

  if (currentView === 'order_tracking') {
    return (
      <div className="h-full flex flex-col bg-gray-50 animate-in fade-in duration-300 pb-20">
        <div className="p-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-50 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Meus Pedidos</h1>
          </div>
          <OrderViewTabs active="tracking" />
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white p-8 rounded-full shadow-sm mb-4 border border-gray-100">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Nenhum pedido ativo</h2>
              <p className="text-sm text-gray-400 mt-2 mb-8">Seu histórico aparecerá aqui após o pedido.</p>
            </div>
          ) : (
            activeOrders.map(order => {
              const steps = order.orderType === 'pickup' ? ['pending', 'preparing', 'ready', 'completed'] : ['pending', 'preparing', 'out_for_delivery', 'completed'];
              const stepLabels = order.orderType === 'pickup' ? ['Enviado', 'Cozinha', 'Pronto', 'Entregue'] : ['Enviado', 'Cozinha', 'Rota', 'Entregue'];
              const currentIdx = steps.indexOf(order.status);

              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-xl text-gray-900 tracking-tight">{order.restaurantName}</h3>
                      <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-widest">Pedido #{order.id.slice(0,5)}</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                      ${order.status === 'ready' || order.status === 'out_for_delivery' ? 'bg-green-100 text-green-700 animate-pulse' : 
                        order.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-brand-100 text-brand-700'}
                    `}>{stepLabels[currentIdx] || order.status}</div>
                  </div>

                  <div className="relative h-1.5 bg-gray-100 rounded-full mb-10 mx-2">
                     <div className="absolute top-0 left-0 h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }} />
                     <div className="absolute top-0 left-0 w-full flex justify-between -translate-y-[30%]">
                        {steps.map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${i <= currentIdx ? 'bg-brand-500' : 'bg-gray-200'}`} />
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3 mb-6 border-t border-gray-50 pt-6">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm font-bold text-gray-700"><span className="text-brand-600">{item.quantity}x</span> {item.name}</span>
                        </div>
                        <span className="text-sm font-black text-gray-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.deliveryFee > 0 && order.orderType === 'delivery' && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-50 border-dashed">
                       <span className="text-xs text-gray-400 font-bold uppercase">Taxa de Entrega</span>
                       <span className="text-xs font-black text-gray-600">R$ {order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mt-2">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Pago</span>
                        <span className="font-black text-xl text-gray-900 tracking-tight">R$ {order.total.toFixed(2)}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Método</span>
                        <p className="text-xs font-bold text-gray-600 uppercase">{order.paymentMethod}</p>
                     </div>
                  </div>

                  {order.status === 'completed' && (
                    <RatingSection order={order} onRatingSubmit={submitOrderRating} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return <div className="p-8 text-center text-gray-400 py-20"><p>Carregando vista...</p><button onClick={() => setCurrentView('home')} className="mt-4 text-brand-600 font-bold">Voltar ao Início</button></div>;
};
