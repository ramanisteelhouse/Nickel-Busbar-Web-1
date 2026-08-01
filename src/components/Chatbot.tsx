import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Phone, Mail, MessageCircle, ClipboardList, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn, logCallClick, getSessionValue, setSessionValue } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageProvider';

const SALES_PHONE = '+918369724730';
const SALES_EMAIL = 'ramanioffice@gmail.com';
const SALES_WHATSAPP_URL = 'https://wa.me/918369724730?text=Hello%20Team%2C%20we%20need%20a%20quote%20for%20nickel%20strips%20or%20busbars.';
const TEASER_SEEN_KEY = 'chatbot_teaser_seen';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: t('chatbot.greeting') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatbot-open-changed', { detail: { open: isOpen } }));
  }, [isOpen]);

  useEffect(() => {
    if (getSessionValue(TEASER_SEEN_KEY)) return;
    const showTimer = setTimeout(() => setShowTeaser(true), 4000);
    return () => clearTimeout(showTimer);
  }, []);

  const dismissTeaser = () => {
    setShowTeaser(false);
    setSessionValue(TEASER_SEEN_KEY, '1');
  };

  const openFromTeaser = () => {
    dismissTeaser();
    setIsOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Chatbot API error', res.status, data);
      }
      setMessages(prev => [...prev, { role: 'bot', text: (res.ok && data.text) || t('chatbot.error') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: t('chatbot.connectingError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      key: 'call',
      icon: Phone,
      label: t('product.call'),
      onClick: () => logCallClick(SALES_PHONE, 'chatbot_quick_action'),
      href: `tel:${SALES_PHONE}`,
      className: 'bg-brand-dark',
    },
    {
      key: 'whatsapp',
      icon: MessageCircle,
      label: t('product.whatsapp'),
      onClick: () => logCallClick(SALES_PHONE, 'chatbot_quick_action_whatsapp'),
      href: SALES_WHATSAPP_URL,
      external: true,
      className: 'bg-[#22C55E]',
    },
    {
      key: 'email',
      icon: Mail,
      label: t('product.email'),
      onClick: () => logCallClick(SALES_EMAIL, 'chatbot_quick_action_email'),
      href: `mailto:${SALES_EMAIL}?subject=Product%20Enquiry`,
      className: 'bg-brand',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end" style={{ perspective: 1000 }}>
      <AnimatePresence>
        {showTeaser && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            className="relative mb-3 max-w-[240px] rounded-2xl rounded-br-none border border-slate-100 bg-white p-3 pr-8 text-sm text-brand shadow-[0_18px_45px_-12px_rgba(34,58,65,0.45)] cursor-pointer"
            onClick={openFromTeaser}
          >
            <button
              onClick={(e) => { e.stopPropagation(); dismissTeaser(); }}
              aria-label="Dismiss"
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{t('chatbot.greeting')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -8 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="bg-white rounded-2xl shadow-[0_30px_80px_-20px_rgba(34,58,65,0.55)] w-[calc(100vw-2rem)] max-w-[380px] sm:w-96 h-[min(72vh,560px)] flex flex-col border border-slate-200/70 overflow-hidden mb-4"
          >
            <div className="relative bg-gradient-to-r from-brand-dark via-brand to-brand-light text-white p-4 flex justify-between items-center shrink-0 overflow-hidden">
              <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />
              <div className="relative flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <Bot size={18} className="text-emerald-300" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-brand-dark" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-sm sm:text-base">{t('chatbot.title')}</span>
                  <span className="text-[11px] text-white/70">Online now</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="relative p-1 hover:text-white/70" aria-label="Close chat">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap",
                    m.role === 'user'
                      ? "bg-gradient-to-br from-brand to-brand-dark text-white rounded-tr-none shadow-md"
                      : "bg-white border border-slate-200 text-brand rounded-tl-none shadow-sm"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-t border-slate-200 bg-white px-3 pt-2.5 shrink-0">
              {quickActions.map(({ key, icon: Icon, label, onClick, href, external }) => (
                <a
                  key={key}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  onClick={onClick}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-dark transition-colors hover:bg-slate-100"
                >
                  <Icon size={12} />
                  {label}
                </a>
              ))}
              <button
                onClick={() => { setIsOpen(false); navigate('/products?enquiry=1'); }}
                className="flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-dark transition-colors hover:bg-slate-100"
              >
                <ClipboardList size={12} />
                {t('enquiry.title')}
              </button>
            </div>

            <div className="p-3 sm:p-4 pt-2 border-t border-slate-100 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand outline-none"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading}
                  whileTap={{ scale: 0.92 }}
                  className="bg-gradient-to-br from-brand to-brand-dark text-white p-2.5 rounded-full hover:brightness-110 transition-all disabled:opacity-50 shrink-0 shadow-md"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) dismissTeaser(); }}
        whileHover={{ scale: 1.08, rotateY: 8, rotateX: -4 }}
        whileTap={{ scale: 0.94 }}
        animate={!isOpen && !showTeaser ? { boxShadow: ['0 0 0 0 rgba(52,211,153,0.45)', '0 0 0 14px rgba(52,211,153,0)'] } : {}}
        transition={!isOpen && !showTeaser ? { duration: 2, repeat: Infinity } : { type: 'spring', stiffness: 300 }}
        className="relative bg-gradient-to-br from-brand-light via-brand to-brand-dark text-white p-3.5 sm:p-4 rounded-full shadow-[0_15px_35px_-8px_rgba(34,58,65,0.6)] active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />}
      </motion.button>
    </div>
  );
};
