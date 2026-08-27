import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';
import { getProductUnitLabel, normalizeProductUnit } from '../lib/utils';
import { ProductThumbnail } from '../components/ProductThumbnail';

interface CartPageProps {
  cart: CartItem[];
  updateQuantity: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ cart, updateQuantity, removeItem }) => {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const { t, formatPrice } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-24 max-w-7xl mx-auto px-4 text-center">
        <Helmet>
          <title>Your Cart | Ramani Steel House</title>
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href="https://www.nickelbusbar.com/cart" />
        </Helmet>
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">{t('cart.emptyTitle')}</h1>
        <p className="text-zinc-500 mb-8">{t('cart.emptyDesc')}</p>
        <Link to="/products" className="bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-brand-dark transition-all">
          {t('cart.browseProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Your Cart | Ramani Steel House</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://www.nickelbusbar.com/cart" />
      </Helmet>
      <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-12">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => (
            <motion.div
              key={item.id}
              layout
              className="flex gap-6 p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-zinc-100 rounded-2xl overflow-hidden flex-shrink-0">
                <ProductThumbnail
                  slug={item.slug}
                  image={item.image}
                  name={item.name}
                  size={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900">{item.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1">{item.category_name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatPrice(item.price)} {getProductUnitLabel(item.unit)}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4 bg-zinc-100 rounded-full px-3 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-zinc-900 text-zinc-400">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold min-w-6 text-center">{item.quantity}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{normalizeProductUnit(item.unit)}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-zinc-900 text-zinc-400">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">{t('cart.orderSummary')}</h2>
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between text-zinc-500">
                <span>{t('cart.subtotal')}</span>
                <span className="font-medium text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{t('cart.gst')}</span>
                <span className="font-medium text-zinc-900">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{t('cart.shipping')}</span>
                <span className="font-medium text-emerald-600 uppercase text-[10px] font-bold">{t('cart.shippingNote')}</span>
              </div>
              <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-lg font-bold text-zinc-900">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 group"
            >
              {t('cart.checkout')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">{t('cart.secureTitle')}</h4>
              <p className="text-xs text-emerald-700 mt-1">{t('cart.secureDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

