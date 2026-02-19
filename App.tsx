
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { CustomerView } from './components/CustomerView';
import { RestaurantDashboard } from './components/RestaurantDashboard';
import { ShoppingBag, UtensilsCrossed, ChefHat, Bot, User, Store, ArrowRight, Lock, Phone, Mail, MapPin, MessageCircle, LogIn, UserPlus, ArrowLeft, LogOut, ShieldAlert, BellRing, Sparkles, CheckCircle } from 'lucide-react';
import { AIAssistant } from './components/AIAssistant';

const ToastNotification: React.FC = () => {
  const { toast, setToast } = useAppContext();
  
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] animate-in slide-in-from-top-4 duration-300">
      <div className={`mx-4 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
        toast.type === 'order' ? 'bg-brand-600 border-brand-400 text-white' : 
        toast.type === 'success' ? 'bg-green-600 border-green-400 text-white' : 
        'bg-indigo-600 border-indigo-400 text-white'
      }`}>
        <div className="bg-white/20 p-2 rounded-xl">
           {toast.type === 'order' ? <BellRing size={20} /> : toast.type === 'success' ? <CheckCircle size={20} /> : <Sparkles size={20} />}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Aviso do Sistema</p>
          <p className="text-sm font-bold leading-tight">{toast.message}</p>
        </div>
        <button onClick={() => setToast(null)} className="text-white/50"><LogIn size={16} className="rotate-45" /></button>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const { setCurrentView } = useAppContext();
  
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5519991759068?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20Delivery%20Certo.", "_blank");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full bg-gradient-to-b from-brand-500 to-brand-600 p-8 pt-20 pb-16 flex flex-col items-center text-white text-center rounded-b-[60px] shadow-lg">
        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-6 shadow-xl">
           <UtensilsCrossed size={64} className="text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Delivery Certo</h1>
        <p className="text-brand-50 font-medium max-w-[280px]">O melhor delivery de comidas e bebidas na palma da sua mão.</p>
      </div>

      <div className="flex-1 w-full p-8 flex flex-col gap-6 max-w-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Para que serve o Delivery Certo?</h2>
          <p className="text-sm text-gray-500 font-medium text-justify">
            Somos um aplicativo de delivery especializado em conectar você aos melhores estabelecimentos de comidas e bebidas. 
            Focado em agilidade e economia, permitimos que você peça e escolha entre receber em casa ou retirar no local, eliminando filas e esperas desnecessárias.
          </p>
        </div>

        <div className="grid gap-4 mt-4">
          <button 
            onClick={() => setCurrentView('login')}
            className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            Começar Agora <ArrowRight size={20} />
          </button>
        </div>

        <div className="mt-12 space-y-6 pt-6 border-t border-gray-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contato do Desenvolvedor</h3>
          <div className="space-y-4">
             <button 
                onClick={handleWhatsAppClick}
                className="w-full flex items-center gap-3 text-sm text-gray-700 font-bold bg-green-50 p-3 rounded-2xl border border-green-100 hover:bg-green-100 transition"
             >
                <div className="bg-green-600 text-white p-2 rounded-xl"><MessageCircle size={18} /></div>
                Falar no WhatsApp: (19) 99175-9068
             </button>
             <div className="flex items-center gap-3 text-sm text-gray-600 font-bold px-2">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-xl"><Mail size={16} /></div>
                deliverypirapemas@gmail.com
             </div>
             <div className="flex items-center gap-3 text-sm text-gray-600 font-bold px-2">
                <div className="bg-red-50 text-red-600 p-2 rounded-xl"><MapPin size={16} /></div>
                Rua Dep. Lister Caldas S/N, Pirapemas - MA
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthView: React.FC = () => {
  const { login, register, setCurrentView } = useAppContext();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'partner'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pin: '',
    protocol: ''
  });
  const [error, setError] = useState('');

  const handlePartnerWhatsApp = () => {
    window.open("https://wa.me/5519991759068?text=Olá,%20sou%20um%20restaurante%20e%20gostaria%20de%20solicitar%20meu%20protocolo%20de%20parceiro%20para%20o%20Delivery%20Certo.", "_blank");
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (authMode === 'login') {
      if (!formData.email || !formData.pin) {
        setError('E-mail e PIN são obrigatórios.');
        return;
      }
      
      const result = login(formData.email, formData.pin, role);
      if (result.blocked) {
        setError('Esta conta foi bloqueada por violação dos termos. Fale com o suporte.');
      } else if (!result.success) {
        setError('E-mail ou PIN incorretos. Se não tem conta, cadastre-se.');
      }
      return;
    }

    if (role === 'partner') {
      if (formData.protocol !== '0382690@') {
        setError('Protocolo de parceiro inválido.');
        return;
      }
    }
    
    if (!formData.name || !formData.pin || !formData.email || !formData.phone || !formData.address) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('O PIN deve ter exatamente 4 dígitos.');
      return;
    }

    const success = register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      addressReference: '',
      securityPin: formData.pin,
      role: role
    });

    if (!success) {
      setError('Este e-mail já está cadastrado para esta categoria.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center animate-in slide-in-from-right-4 duration-500">
      <div className="w-full max-w-sm">
        <button 
          onClick={() => setCurrentView('landing')}
          className="mb-6 p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 active:scale-90 transition-transform flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          {role === 'customer' ? 'Área do Cliente' : 'Área do Parceiro'}
        </h1>
        <p className="text-gray-500 text-sm mb-8 font-medium">
          {authMode === 'login' ? 'Acesse sua conta para continuar.' : 'Cadastre-se para começar.'}
        </p>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <button 
            onClick={() => { setRole('customer'); setError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${role === 'customer' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400'}`}
          >
            <User className="inline-block mr-2 mb-0.5" size={14} /> Sou Cliente
          </button>
          <button 
            onClick={() => { setRole('partner'); setError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${role === 'partner' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400'}`}
          >
            <Store className="inline-block mr-2 mb-0.5" size={14} /> Sou Parceiro
          </button>
        </div>

        <div className="flex bg-gray-200 p-1 rounded-2xl mb-6">
          <button 
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${authMode === 'login' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
          >
            <LogIn size={14} /> Entrar
          </button>
          <button 
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${authMode === 'register' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
          >
            <UserPlus size={14} /> Cadastrar
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1 animate-in fade-in duration-300">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input 
                required
                type="text" 
                placeholder="Ex: João Silva"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
            <input 
              required
              type="email" 
              placeholder="exemplo@gmail.com"
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {authMode === 'register' && (
            <>
              <div className="space-y-1 animate-in fade-in duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  placeholder="(00) 00000-0000"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1 animate-in fade-in duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endereço Principal</label>
                <input 
                  required
                  type="text" 
                  placeholder="Rua, Número, Bairro"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PIN de Segurança (4 dígitos)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                required
                type="password" 
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={4}
                placeholder="****"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                value={formData.pin}
                onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
              />
            </div>
          </div>

          {role === 'partner' && authMode === 'register' && (
            <div className="space-y-1 animate-in zoom-in-95">
              <label className="text-[10px] font-black text-brand-600 uppercase tracking-widest ml-1">Protocolo de Parceiro</label>
              <input 
                required
                type="text" 
                placeholder="Código de ativação"
                className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 shadow-sm font-mono"
                value={formData.protocol}
                onChange={e => setFormData({...formData, protocol: e.target.value})}
              />
              <div className="mt-4 p-4 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-3">Não tem um protocolo?</p>
                <button 
                  type="button"
                  onClick={handlePartnerWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-xs font-black uppercase active:scale-95 transition-all shadow-md"
                >
                  <MessageCircle size={16} /> Solicitar via WhatsApp
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-shake flex gap-2 items-center">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-100 mt-6 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {authMode === 'login' ? (
              <><LogIn size={18} /> Entrar na {role === 'customer' ? 'Conta Cliente' : 'Conta Parceiro'}</>
            ) : (
              <><UserPlus size={18} /> Cadastrar como {role === 'customer' ? 'Cliente' : 'Parceiro'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { viewMode, setViewMode, currentView, setCurrentView, cart, activeOrders, isAuthenticated, userProfile, logout } = useAppContext();
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && currentView !== 'landing' && currentView !== 'login') {
      setCurrentView('landing');
    }
  }, [isAuthenticated, currentView, setCurrentView]);

  if (currentView === 'landing' && !isAuthenticated) return <LandingPage />;
  if (currentView === 'login' && !isAuthenticated) return <AuthView />;
  if (!isAuthenticated) return <LandingPage />;

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const handleOrdersClick = () => {
    if (cart.length > 0) {
      setCurrentView('cart');
    } else {
      setCurrentView('order_tracking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">
      <ToastNotification />
      
      <header className="bg-white sticky top-0 z-20 shadow-sm flex flex-col">
        <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 text-white p-1.5 rounded-lg">
              <UtensilsCrossed size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-gray-800">
              Delivery<span className="text-brand-600">Certo</span>
            </h1>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="px-4 py-2 bg-brand-50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-full shadow-sm text-brand-600">
                {userProfile.role === 'customer' ? <User size={14} /> : <Store size={14} />}
              </div>
              <span className="text-[10px] font-black uppercase text-brand-700 tracking-wider">
                Área do {userProfile.role === 'customer' ? 'Cliente' : 'Parceiro'}
              </span>
           </div>
           <span className="text-[10px] font-bold text-brand-400 truncate max-w-[150px]">{userProfile.name}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative no-scrollbar pb-24 bg-gray-50">
        {userProfile.role === 'customer' ? <CustomerView /> : <RestaurantDashboard />}
      </main>

      {userProfile.role === 'customer' && currentView !== 'profile' && (
        <button
          onClick={() => setShowAI(true)}
          className="absolute bottom-24 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-30 flex items-center gap-2 animate-bounce"
        >
          <Bot size={24} />
          <span className="text-sm font-bold pr-1">Ajuda IA</span>
        </button>
      )}

      {userProfile.role === 'customer' && (
        <nav className="bg-white border-t border-gray-200 absolute bottom-0 w-full z-20 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16">
            <button 
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === 'home' || currentView === 'restaurant_detail' ? 'text-brand-600' : 'text-gray-400'}`}
            >
              <UtensilsCrossed size={22} />
              <span className="text-[10px] font-bold mt-1 uppercase">Explorar</span>
            </button>
            <button 
              onClick={handleOrdersClick}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${currentView === 'order_tracking' || currentView === 'cart' ? 'text-brand-600' : 'text-gray-400'}`}
            >
              <ShoppingBag size={22} />
              {(cartItemCount > 0 || activeOrders.length > 0) && (
                <span className="absolute top-2 right-8 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItemCount || activeOrders.length}
                </span>
              )}
              <span className="text-[10px] font-bold mt-1 uppercase">Pedidos</span>
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === 'profile' ? 'text-brand-600' : 'text-gray-400'}`}
            >
              <User size={22} />
              <span className="text-[10px] font-bold mt-1 uppercase">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
