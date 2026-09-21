import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield, Ruler, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';
import { getProductUnitLabel, normalizeProductUnit } from '../lib/utils';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { calculateOrderTotals } from '../lib/tax';
import { StripSizePicker } from '../components/StripSizePicker';
import {
  cartLineKey,
  defaultSpecFor,
  formatSpec,
  isSpecComplete,
  takesStripSize,
  type StripSpec,
} from '../lib/stripSpec';

interface CartPageProps {
  cart: CartItem[];
  /** Lines are addressed by cartLineKey (product + size), not by product id. */
  updateQuantity: (lineKey: string, delta: number) => void;
  removeItem: (lineKey: string) => void;
  updateSpec: (lineKey: string, spec: StripSpec) => void;
}

/** A line needs a size before it can be quoted, unless it is a product that is not sized as strip. */
export const lineNeedsSize = (item: CartItem) => takesStripSize(item) && !isSpecComplete(item.spec);

/**
 * One line's size: a readable summary, and an editor that opens in place. A line added from the
 * product grid arrives with no size, so its editor opens already expanded.
 */
const LineSize: React.FC<{ item: CartItem; lineKey: string; onSave: (spec: StripSpec) => void }> = ({ item, lineKey, onSave }) => {
  const missing = lineNeedsSize(item);
  const [open, setOpen] = React.useState(missing);
  const [draft, setDraft] = React.useState<StripSpec>(item.spec ?? defaultSpecFor(item));
  const [tried, setTried] = React.useState(false);

  if (!takesStripSize(item)) return null;

  if (!open) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-700">
          <Ruler size={12} /> {formatSpec(item.spec)}
        </span>
        <button type="button" onClick={() => setOpen(true)} className="font-semibold text-brand underline underline-offset-2">
          Change size
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      {missing ? (
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <AlertTriangle size={14} /> Enter the size you need for this item
        </p>
      ) : null}
      <StripSizePicker value={draft} onChange={setDraft} showErrors={tried} compact idPrefix={`cart-${lineKey}`} />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTried(true);
            if (!isSpecComplete(draft)) return;
            onSave(draft);
            setOpen(false);
          }}
          className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          Save size
        </button>
        {!missing ? (
          <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-200">
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
};

export const CartPage: React.FC<CartPageProps> = ({ cart, updateQuantity, removeItem, updateSpec }) => {
  const { t, formatPrice, country } = useLanguage();
  const linesMissingSize = cart.filter(lineNeedsSize).length;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Destination-based: exports out of India are zero-rated, so an overseas quote carries no GST
  // line. Previously this was an unconditional 18%, inflating every export total. See lib/tax.
  const { gst, total, gstApplicable, gstLabel } = calculateOrderTotals(subtotal, country);

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
          {cart.map(item => {
            const lineKey = cartLineKey(item);
            return (
            <motion.div
              key={lineKey}
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
                    <LineSize item={item} lineKey={lineKey} onSave={(spec) => updateSpec(lineKey, spec)} />
                  </div>
                  <button onClick={() => removeItem(lineKey)} aria-label={`Remove ${item.name}`} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4 bg-zinc-100 rounded-full px-3 py-1">
                    <button onClick={() => updateQuantity(lineKey, -1)} className="p-1 hover:text-zinc-900 text-zinc-400">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold min-w-6 text-center">{item.quantity}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{normalizeProductUnit(item.unit)}</span>
                    <button onClick={() => updateQuantity(lineKey, 1)} className="p-1 hover:text-zinc-900 text-zinc-400">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </motion.div>
            );
          })}
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
                <span>{gstApplicable ? t('cart.gst') : gstLabel}</span>
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
            {linesMissingSize > 0 ? (
              <>
                <p className="mb-3 flex items-start gap-1.5 text-xs font-semibold text-amber-700">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {linesMissingSize === 1
                    ? 'One item still needs a size. Add it above to continue.'
                    : `${linesMissingSize} items still need a size. Add them above to continue.`}
                </p>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed bg-zinc-300 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2"
                >
                  {t('cart.checkout')}
                  <ArrowRight size={20} />
                </button>
              </>
            ) : (
              <Link
                to="/checkout"
                className="w-full bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 group"
              >
                {t('cart.checkout')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
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

