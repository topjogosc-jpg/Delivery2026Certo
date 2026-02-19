
import React, { useState } from 'react';
import { getFoodRecommendation } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { X, Send, Sparkles } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AIAssistant: React.FC<Props> = ({ onClose }) => {
  const { restaurants } = useAppContext();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Olá! Sou seu assistente gastronômico. Me diga o que você está com vontade de comer (ex: 'algo picante', 'saudável', 'comida caseira') e eu checo os cardápios para você!" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const recommendation = await getFoodRecommendation(userMsg, restaurants);
    
    setMessages(prev => [...prev, { role: 'bot', text: recommendation }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <h3 className="font-bold">Assistente Gastronômico</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 p-3 rounded-2xl rounded-bl-none animate-pulse w-12 h-8"></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Estou com fome de..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
