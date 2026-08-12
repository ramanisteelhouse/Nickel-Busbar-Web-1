import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MessageCircle, Shield } from 'lucide-react';
import { CartItem, Country } from '../types';
import { useLanguage } from '../i18n/LanguageProvider';
import { getCountryOptions } from '../lib/countryCodes';
import { getProductUnitLabel, normalizeProductUnit } from '../lib/utils';
import { PRIMARY_WHATSAPP } from '../lib/contact';

interface CheckoutPageProps {
  cart: CartItem[];
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart }) => {
  const navigate = useNavigate();
  const { t, locale, currency, country, postalCode, formatPrice, exchangeRate } = useLanguage();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const convertAmount = (amount: number) => Number((amount * exchangeRate).toFixed(2));
  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const [selectedShipping, setSelectedShipping] = useState('Bluedart Air');
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearchInput, setCountrySearchInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCountry && countryOptions.length) {
      const preferred = countryOptions.find(c => c.code === country) ?? countryOptions[0];
      setSelectedCountry(preferred);
    }
  }, [countryOptions, country, selectedCountry]);

  useEffect(() => {
    if (!selectedCountry) return;
    setCountrySearchInput(`${selectedCountry.name} (${selectedCountry.dial_code})`);
  }, [selectedCountry]);

  useEffect(() => {
    if (!countryOptions.length) return;
    const preferred = countryOptions.find((item) => item.code === country);
    if (preferred) {
      setSelectedCountry(preferred);
    }
  }, [country, countryOptions]);

  useEffect(() => {
    if (!postalCode) return;
    setPinCode((current) => current || postalCode);
  }, [postalCode]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countryOptions.find(c => c.code === e.target.value);
    if (country) setSelectedCountry(country);
  };

  const handleCountryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCountrySearchInput(value);
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    const normalizedNamePart = normalized.split('(')[0]?.trim() ?? normalized;
    const matchedCountry = countryOptions.find((item) =>
      item.name.toLowerCase().startsWith(normalized) ||
      item.name.toLowerCase() === normalizedNamePart ||
      item.code.toLowerCase() === normalized ||
      item.dial_code.toLowerCase() === normalized ||
      `${item.name.toLowerCase()} (${item.dial_code.toLowerCase()})` === normalized
    );
    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
    }
  };

  const shippingOptions = [
    'Bluedart Air',
    'Bluedart Road',
    'Delhivery Road',
    'By Hand',
    'Porter to Pay',
    'Transport to Pay',
    'Self courier',
  ];

  const resolveErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();
      if (data && typeof data.error === 'string') {
        return data.error;
      }
    } catch {
      // Ignore JSON parsing errors.
    }
    try {
      const text = await response.text();
      return text || t('checkout.saveError');
    } catch {
      return t('checkout.saveError');
    }
  };

  const handleWhatsAppRFQ = async () => {
    // Fallback must be full international format - wa.me rejects a bare 10-digit number.
    const businessPhoneNumber =
      (import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER as string | undefined)?.trim() ||
      PRIMARY_WHATSAPP.e164;
    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();

    // The RFQ is a sales lead, so it is worthless without a way to reply.
    if (!trimmedName || !trimmedEmail || !phoneNumber.trim()) {
      setSaveError('Name, email and mobile number are required to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSaveError('Please enter a valid email address.');
      return;
    }

    const countryCode = selectedCountry?.dial_code ?? '';
    const trimmedPhone = phoneNumber.replace(/\s+/g, '');
    const customerPhone = trimmedPhone ? `${countryCode}${trimmedPhone}` : '';
    const normalizePhoneForWa = (value: string) => value.replace(/[^\d]/g, '');
    const recipientNumber = normalizePhoneForWa(businessPhoneNumber);

    let message = `*RFQ from Ramani Steel House*%0A`;
    message += `--------------------------%0A`;
    message += `Name: ${trimmedName}%0A`;
    message += `Email: ${trimmedEmail}%0A`;
    message += `Customer Phone: ${customerPhone || 'N/A'}%0A`;
    message += `Delivery PIN: ${pinCode || 'N/A'}%0A`;
    message += `Shipping: ${selectedShipping}%0A`;
    message += `--------------------------%0A`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*%0A`;
      message += `   Qty: ${item.quantity} ${normalizeProductUnit(item.unit)}%0A`;
      message += `   Unit Price: ${formatPrice(item.price)} ${getProductUnitLabel(item.unit)}%0A`;
      message += `   Category: ${item.category_name}%0A`;
      message += `--------------------------%0A`;
    });

    message += `%0A*Subtotal:* ${formatPrice(subtotal)}`;
    message += `%0A%0A_Please provide a quote for the above items._`;

    try {
      setIsSavingQuote(true);
      setSaveError(null);
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            full_name: trimmedName,
            email: trimmedEmail,
            phone_country_code: countryCode || null,
            phone_number: phoneNumber || null,
            phone_full: customerPhone || null,
            gst_number: gstNumber || null,
            pin_code: pinCode || null,
          },
          shipping_option: selectedShipping,
          summary: {
            subtotal: convertAmount(subtotal),
            gst: convertAmount(gst),
            total: convertAmount(total),
            currency,
            locale,
          },
          items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            category_name: item.category_name ?? null,
            quantity: item.quantity,
            unit_price: convertAmount(item.price),
            line_total: convertAmount(item.price * item.quantity),
          })),
          meta: {
            source: 'whatsapp_rfq',
            user_agent: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        const errorMessage = await resolveErrorMessage(response);
        throw new Error(errorMessage || 'Failed to save quote');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('checkout.saveError');
      console.error('Failed to save quote request', error);
      setSaveError(message || t('checkout.saveError'));
    } finally {
      setIsSavingQuote(false);
    }

    if (!recipientNumber) {
      setSaveError('Unable to open WhatsApp. Please try again.');
      return;
    }

    const whatsappUrl = `https://wa.me/${recipientNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-24 max-w-7xl mx-auto px-4 text-center">
        <Helmet>
          <title>Checkout | Ramani Steel House</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">{t('checkout.emptyTitle')}</h1>
        <p className="text-zinc-500 mb-8">{t('checkout.emptyDesc')}</p>
        <Link to="/products" className="bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-brand-dark transition-all">
          {t('checkout.browseProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Checkout | Ramani Steel House</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <div className="flex items-center gap-4 mb-10">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark">
          <ArrowLeft size={16} />
          {t('checkout.backToCart')}
        </Link>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">{t('checkout.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">{t('checkout.detailsTitle')}</h2>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900" htmlFor="rfq-name">
                Full Name
              </label>
              <input
                id="rfq-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900" htmlFor="rfq-email">
                Email Address
              </label>
              <input
                id="rfq-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900">{t('checkout.mobileLabel')}</label>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-lg">{selectedCountry?.flag}</span>
                    <div className="w-full sm:w-64">
                      <input
                        list="checkout-country-options"
                        value={countrySearchInput}
                        onChange={handleCountryInputChange}
                        placeholder="Type country name"
                        className="w-full bg-transparent text-sm font-semibold text-zinc-700 outline-none"
                        aria-label="Country code"
                      />
                      <datalist id="checkout-country-options">
                        {countryOptions.map((c) => (
                          <option key={c.code} value={`${c.name} (${c.dial_code})`}>
                            {c.code}
                          </option>
                        ))}
                      </datalist>
                      <select
                        className="sr-only"
                        value={selectedCountry?.code ?? ''}
                        onChange={handleCountryChange}
                        aria-hidden
                      >
                        {countryOptions.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} {c.dial_code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="tel"
                    placeholder={t('checkout.mobilePlaceholder')}
                    className="w-full sm:flex-1 text-sm text-zinc-900 outline-none"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900">{t('checkout.gstLabel')}</label>
              <input
                type="text"
                placeholder={t('checkout.gstPlaceholder')}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900">{t('checkout.pinLabel')}</label>
              <input
                type="text"
                placeholder={t('checkout.pinPlaceholder')}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-bold text-zinc-900">{t('checkout.shippingTitle')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shippingOptions.map(option => {
                const isSelected = selectedShipping === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedShipping(option)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-all ${isSelected
                      ? 'border-blue-600 text-zinc-900 shadow-sm ring-1 ring-blue-200'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">{t('checkout.summaryTitle')}</h2>
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between text-zinc-500">
                <span>{t('checkout.itemsCount', { count: totalItems })}</span>
                <span className="font-medium text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{t('checkout.shippingCharges')}</span>
                <span className="font-medium text-emerald-600 uppercase text-[10px] font-bold">{t('checkout.additionalCharges')}</span>
              </div>
              <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-lg font-bold text-zinc-900">
                <span>{t('checkout.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={handleWhatsAppRFQ}
              className="w-full bg-[#22C55E] text-white py-4 rounded-full font-bold hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={isSavingQuote || !phoneNumber.trim()}
            >
              <MessageCircle size={20} />
              {isSavingQuote ? t('checkout.savingQuote') : t('checkout.placeRfq')}
            </button>
            {saveError ? (
              <p className="text-xs text-red-600 mt-3">{saveError}</p>
            ) : null}
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

