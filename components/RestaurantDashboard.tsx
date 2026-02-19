
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Clock, XCircle, Bell, Settings, Save, Utensils, Plus, Trash2, Eye, EyeOff, Store, MapPin, Phone, Mail, QrCode, Camera, Image as ImageIcon, X, Bike, Package, Coins, User, MessageCircle, RefreshCw, ChefHat, Info, Star, MessageSquare, LogOut, ArrowLeft, Power, ShieldOff, Trash, AlertCircle, Sparkles, Share2 } from 'lucide-react';
import { MenuItem, Restaurant, Order } from '../types';

export const RestaurantDashboard: React.FC = () => {
  const { 
    activeOrders, updateOrderStatus, restaurants, updateRestaurantInfo, 
    addMenuItem, deleteMenuItem, toggleMenuItemAvailability, logout, 
    setViewMode, setCurrentView, toggleRestaurantOpen, deleteAccount, 
    blockAccount, userProfile, generateShareLink, setToast
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'reviews'>('orders');
  const [newItem, setNewItem] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: 'Geral', 
    image: '' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const myRestaurant = restaurants.find(r => r.email === userProfile.email);
  
  const [showSettings, setShowSettings] = useState(false);
  const [editInfo, setEditInfo] = useState<Partial<Restaurant>>(myRestaurant ? {
    name: myRestaurant.name,
    description: myRestaurant.description,
    address: myRestaurant.address,
    phone: myRestaurant.phone,
    email: myRestaurant.email,
    pixKey: myRestaurant.pixKey,
    pixWhatsApp: myRestaurant.pixWhatsApp || myRestaurant.phone,
    deliveryFee: myRestaurant.deliveryFee
  } : {});

  if (!myRestaurant) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="text-brand-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Restaurante não encontrado</h2>
        <p className="text-gray-500 mt-2 mb-6">Parece que sua conta foi removida ou ainda não foi processada.</p>
        <button onClick={logout} className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-black uppercase">Fazer Novo Cadastro</button>
      </div>
    );
  }

  const handleShare = () => {
    const link = generateShareLink(myRestaurant.id);
    navigator.clipboard.writeText(link).then(() => {
      setToast({ message: "Link da loja copiado! Envie para seus clientes.", type: 'success' });
    }).catch(() => {
      alert("Link gerado: " + link);
    });
  };

  const handleAdminAction = (action: 'delete' | 'block') => {
    const protocol = prompt(`Para ${action === 'delete' ? 'DELETAR PERMANENTEMENTE' : 'BLOQUEAR'} esta conta de parceiro, insira o protocolo do desenvolvedor:`);
    if (!protocol) return;

    if (action === 'delete') {
      const confirmText = "VOCÊ TEM CERTEZA? Isso removerá sua loja do aplicativo imediatamente e todos os seus dados serão perdidos.";
      if (!window.confirm(confirmText)) return;

      const success = deleteAccount(userProfile.email, protocol);
      if (success) {
        alert('Conta e Loja deletadas com sucesso.');
      } else {
        alert('Protocolo inválido ou erro ao deletar.');
      }
    } else {
      const success = blockAccount(userProfile.email, protocol);
      if (success) {
        alert('Conta bloqueada com sucesso.');
      } else {
        alert('Protocolo inválido ou erro ao bloquear.');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    
    addMenuItem(myRestaurant.id, {
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image: newItem.image || 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 100),
      available: true
    });

    setNewItem({ name: '', description: '', price: '', category: 'Geral', image: '' });
  };

  const handleSaveInfo = () => {
    updateRestaurantInfo(myRestaurant.id, editInfo);
    alert('Informações atualizadas!');
    setShowSettings(false);
  };

  const incomingOrders = activeOrders.filter(o => o.status === 'pending' && o.restaurantId === myRestaurant.id);
  const confirmedOrders = activeOrders.filter(o => o.status === 'confirmed' && o.restaurantId === myRestaurant.id);
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing' && o.restaurantId === myRestaurant.id);
  const actionRequiredOrders = activeOrders.filter(o => (o.status === 'ready' || o.status === 'out_for_delivery') && o.restaurantId === myRestaurant.id);
  const ratedOrders = activeOrders.filter(o => o.rating !== undefined && o.restaurantId === myRestaurant.id);

  const averageRating = ratedOrders.length > 0 
    ? (ratedOrders.reduce((acc, o) => acc + o.rating!, 0) / ratedOrders.length).toFixed(1)
    : "0.0";

  const OrderCard: React.FC<{ order: Order, actionLabel: string, onAction: () => void, secondaryAction?: React.ReactNode, isNew?: boolean }> = ({ order, actionLabel, onAction, secondaryAction, isNew }) => (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isNew ? 'ring-2 ring-brand-500 animate-pulse' : ''}`}>
       <div className={`bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center ${isNew ? 'bg-brand-50' : ''}`}>
         <div>
            <div className="flex items-center gap-2">
               <span className="font-black text-gray-900">#{order.id.slice(0,5)}</span>
               <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${order.orderType === 'delivery' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                 {order.orderType === 'delivery' ? 'Entrega' : 'Retirada'}
               </span>
               {isNew && <span className="flex items-center gap-1 text-[8px] font-black text-brand-600 uppercase animate-bounce"><Sparkles size={10} /> Novo!</span>}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
         </div>
         <div className="text-right">
            <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-gray-200 text-gray-500 uppercase">
              {order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
            </span>
         </div>
       </div>

       <div className="p-4 space-y-4">
         <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                  <User size={20} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 leading-none">{order.customerName}</h4>
                  <p className="text-xs text-gray-500 mt-1">{order.customerPhone}</p>
               </div>
            </div>
            <a href={`https://wa.me/${order.customerPhone.replace(/\D/g,'')}`} target="_blank" className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition">
               <MessageCircle size={20} />
            </a>
         </div>

         {order.orderType === 'delivery' ? (
           <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2">
              <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest leading-none mb-1">Entregar em:</p>
                <p className="text-xs font-bold text-blue-900 leading-tight">{order.customerAddress}</p>
              </div>
           </div>
         ) : (
           <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
              <div className="flex gap-2 items-center">
                 <Package size={16} className="text-orange-500" />
                 <span className="text-[10px] font-bold text-orange-600 uppercase">Retirada</span>
              </div>
              <span className="text-xl font-black text-orange-700 tracking-tighter">#{order.pickupCode}</span>
           </div>
         )}

         <div className="space-y-2 py-3 border-y border-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-1.5 rounded-lg">
                <div className="flex gap-2 items-center">
                   <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-gray-800 leading-tight"><span className="text-brand-600">{item.quantity}x</span> {item.name}</span>
                     <span className="text-[9px] text-gray-400 font-bold uppercase">{item.category}</span>
                   </div>
                </div>
                <span className="text-xs font-bold text-gray-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
         </div>

         <div className="flex justify-between items-end">
            <div>
               {order.paymentMethod === 'cash' && order.changeFor && (
                 <div className="flex items-center gap-1.5 text-orange-600">
                    <Coins size={14} />
                    <span className="text-xs font-bold">Troco p/ R$ {order.changeFor.toFixed(2)}</span>
                 </div>
               )}
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Total</p>
               <p className="text-lg font-black text-gray-900">R$ {order.total.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
               {secondaryAction}
               <button onClick={onAction} className="bg-brand-600 text-white font-black px-6 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition shadow-lg shadow-brand-100 flex items-center gap-2">
                 {actionLabel}
               </button>
            </div>
         </div>
       </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 min-h-full space-y-4 pb-24">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
           <button 
             onClick={() => { setViewMode('customer'); setCurrentView('home'); }}
             className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 active:scale-90 transition-transform"
           >
             <ArrowLeft size={18} />
           </button>
           <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{myRestaurant.name}</h1>
              <div className="flex items-center gap-1.5">
                 <span className={`w-2 h-2 rounded-full ${myRestaurant.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                 <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                   {myRestaurant.isOpen ? 'Loja Aberta' : 'Loja Fechada'}
                 </p>
              </div>
           </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 bg-brand-50 text-brand-600 rounded-xl border-2 border-brand-100 hover:bg-brand-100 transition flex items-center gap-2"
            title="Compartilhar Link da Loja"
          >
            <Share2 size={20} />
            <span className="text-[10px] font-black uppercase pr-1">Link</span>
          </button>
          <button 
            onClick={() => toggleRestaurantOpen(myRestaurant.id)}
            className={`p-2 rounded-xl border-2 transition flex items-center gap-2 ${myRestaurant.isOpen ? 'bg-green-500 text-white border-green-500' : 'bg-white text-red-500 border-red-200'}`}
          >
            <Power size={20} />
            <span className="text-[10px] font-black uppercase pr-1">{myRestaurant.isOpen ? 'ON' : 'OFF'}</span>
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl border-2 transition ${showSettings ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-400 border-gray-200 shadow-sm'}`}><Settings size={20} /></button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white rounded-2xl p-5 shadow-xl border border-brand-100 mb-6 animate-in slide-in-from-top-4 duration-300 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <h2 className="font-black text-gray-800 flex items-center gap-2"><Store size={18} className="text-brand-500" /> Configurações</h2>
            <button onClick={() => setShowSettings(false)} className="text-gray-400"><XCircle size={20} /></button>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Loja</label>
              <input type="text" value={editInfo.name} onChange={e => setEditInfo({...editInfo, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Taxa de Entrega (R$)</label>
              <input type="number" step="0.10" value={editInfo.deliveryFee} onChange={e => setEditInfo({...editInfo, deliveryFee: parseFloat(e.target.value) || 0})} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-sm outline-none font-bold" />
            </div>
            
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Segurança e Conta</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleAdminAction('block')}
                  className="flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-600 font-bold rounded-xl text-[10px] uppercase border border-orange-100 active:scale-95 transition"
                >
                  <ShieldOff size={14} /> Bloquear Loja
                </button>
                <button 
                  onClick={() => handleAdminAction('delete')}
                  className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-[10px] uppercase border border-red-100 active:scale-95 transition"
                >
                  <Trash size={14} /> Deletar Conta
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-xs uppercase"
              >
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </div>
          <button onClick={handleSaveInfo} className="w-full bg-brand-600 text-white font-black py-3 rounded-xl">Salvar Informações</button>
        </div>
      )}

      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200">
        <button onClick={() => setActiveTab('orders')} className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'orders' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400'}`}>
          <Clock size={16} className="mb-1" /> Pedidos {incomingOrders.length > 0 && `(${incomingOrders.length})`}
        </button>
        <button onClick={() => setActiveTab('menu')} className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'menu' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400'}`}>
          <Utensils size={16} className="mb-1" /> Menu
        </button>
        <button onClick={() => setActiveTab('reviews')} className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'reviews' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400'}`}>
          <Star size={16} className="mb-1" /> Feedback
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="grid gap-2 animate-in slide-in-from-left-4 duration-300 pb-12">
          {incomingOrders.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Novos ({incomingOrders.length})</h2>
              {incomingOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  isNew={true}
                  actionLabel="Aceitar" 
                  onAction={() => updateOrderStatus(order.id, 'confirmed')}
                  secondaryAction={<button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="px-4 bg-white border border-gray-200 rounded-xl text-red-400 transition hover:bg-red-50 flex items-center justify-center"><XCircle size={20} /></button>}
                />
              ))}
            </section>
          )}
          {([...confirmedOrders, ...preparingOrders]).length > 0 && (
            <section className="mt-4">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Cozinhando ({confirmedOrders.length + preparingOrders.length})</h2>
              {[...confirmedOrders, ...preparingOrders].map(order => (
                <OrderCard key={order.id} order={order} actionLabel={order.status === 'confirmed' ? "Começar Preparo" : "Pronto"} onAction={() => { if (order.status === 'confirmed') updateOrderStatus(order.id, 'preparing'); else updateOrderStatus(order.id, 'ready'); }} />
              ))}
            </section>
          )}
          {actionRequiredOrders.length > 0 && (
            <section className="mt-4">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Finalização ({actionRequiredOrders.length})</h2>
              {actionRequiredOrders.map(order => (
                <OrderCard key={order.id} order={order} actionLabel={order.orderType === 'delivery' ? (order.status === 'ready' ? 'Saiu' : 'Concluir') : 'Entregue'} onAction={() => { if (order.orderType === 'delivery') { if (order.status === 'ready') updateOrderStatus(order.id, 'out_for_delivery'); else updateOrderStatus(order.id, 'completed'); } else { updateOrderStatus(order.id, 'completed'); } }} />
              ))}
            </section>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12">
          <form onSubmit={handleAddProduct} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest"><Plus size={18} className="text-brand-500" /> Novo Produto</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                   <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden relative group">
                      {newItem.image ? <><img src={newItem.image} className="w-full h-full object-cover" /><button type="button" onClick={() => setNewItem(prev => ({ ...prev, image: '' }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button></> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300"><ImageIcon size={24} /></div>}
                   </div>
                   <div className="flex-1 flex flex-col gap-2">
                      <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-2 bg-brand-50 text-brand-600 border border-brand-100 px-4 py-2 rounded-xl text-xs font-bold"><Camera size={16} /> Foto</button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"><ImageIcon size={16} /> Galeria</button>
                   </div>
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleImageChange} />
              </div>
              <input placeholder="Nome do prato" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <input type="number" placeholder="Preço" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
              <button className="w-full bg-brand-600 text-white font-black py-3 rounded-xl shadow-lg shadow-brand-100 active:scale-95 transition-all">Adicionar ao Cardápio</button>
            </div>
          </form>
          <div className="space-y-3">
            {myRestaurant.menu.length > 0 ? myRestaurant.menu.map(item => (
              <div key={item.id} className={`bg-white border rounded-2xl p-3 flex gap-4 transition-all ${item.available === false ? 'opacity-60 grayscale scale-[0.98]' : 'shadow-sm border-gray-100'}`}>
                <img src={item.image} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div><h4 className="font-black text-gray-900 truncate text-sm">{item.name}</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.category}</p></div>
                    <span className="text-brand-600 font-black text-sm">R${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => toggleMenuItemAvailability(myRestaurant.id, item.id)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${item.available === false ? 'bg-orange-100 text-orange-600' : 'bg-green-50 text-green-600'}`}>{item.available === false ? 'Pausado' : 'Disponível'}</button>
                    <button onClick={() => { if(window.confirm('Excluir este item?')) deleteMenuItem(myRestaurant.id, item.id) }} className="bg-red-50 text-red-400 p-1.5 rounded-lg border border-red-100"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200"><p className="text-gray-400 text-xs font-bold">Seu cardápio está vazio.</p></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4 pb-12 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 text-center">
             <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100"><Star size={32} fill="currentColor" /></div>
             <h3 className="text-2xl font-black text-gray-800">{averageRating}</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Sua Média Geral</p>
           </div>
           
           <div className="space-y-3">
             {ratedOrders.length > 0 ? ratedOrders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-gray-700">{order.customerName}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= order.rating! ? "fill-yellow-500 text-yellow-500" : "text-gray-200"} />)}</div>
                   </div>
                   <p className="text-xs text-gray-500 italic">"{order.ratingComment || 'Apenas deu as estrelas.'}"</p>
                </div>
             )) : (
                <p className="text-center text-gray-400 text-xs py-10 font-bold">Nenhum feedback recebido ainda.</p>
             )}
           </div>
        </div>
      )}
    </div>
  );
};
