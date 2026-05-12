import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category } from '../types';
import { cn, getProductUnitLabel, getStrikePrice } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageProvider';

type EnquiryFormData = {
  requirement: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  quantity: string;
  message: string;
};

const initialEnquiryData: EnquiryFormData = {
  requirement: '',
  fullName: '',
  email: '',
  phone: '',
  company: '',
  location: '',
  quantity: '',
  message: '',
};

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchInput, setSearchInput] = React.useState('');
  const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [enquiryData, setEnquiryData] = React.useState<EnquiryFormData>(initialEnquiryData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');
  const hasOpenedFromParam = React.useRef(false);
  const enquiryStorageKey = 'enquiry_form_draft';
  const { t, formatPrice } = useLanguage();

  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search') ?? '';

  React.useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.sessionStorage.getItem(enquiryStorageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<EnquiryFormData>;
      setEnquiryData((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore invalid stored data.
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(enquiryStorageKey, JSON.stringify(enquiryData));
  }, [enquiryData]);

  React.useEffect(() => {
    if (hasOpenedFromParam.current) return;
    const shouldOpen = searchParams.get('enquiry');
    if (shouldOpen !== '1') return;
    const requestedSlug = searchParams.get('product');
    if (requestedSlug) {
      if (products.length === 0) return;
      const found = products.find(p => p.slug === requestedSlug);
      openEnquiryForm(found);
      hasOpenedFromParam.current = true;
      return;
    }
    setIsEnquiryOpen(true);
    hasOpenedFromParam.current = true;
  }, [searchParams, products]);

  React.useEffect(() => {
    setLoading(true);
    const url = new URL('/api/products', window.location.origin);
    if (categoryFilter) url.searchParams.set('category', categoryFilter);
    if (searchQuery) url.searchParams.set('search', searchQuery);

    const fetchData = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(url.toString()),
          fetch('/api/categories'),
        ]);

        if (!productResponse.ok) {
          throw new Error(`Products API returned ${productResponse.status}`);
        }
        if (!categoryResponse.ok) {
          throw new Error(`Categories API returned ${categoryResponse.status}`);
        }

        const [pData, cData] = await Promise.all([
          productResponse.json(),
          categoryResponse.json(),
        ]);

        setProducts(pData);
        setCategories(cData);
      } catch (error) {
        console.error('Failed to load product listing data', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryFilter, searchQuery]);

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const value = searchInput.trim();
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const openEnquiryForm = (product?: Product) => {
    setSelectedProduct(product ?? null);
    setSubmitMessage('');
    setEnquiryData((prev) => ({
      ...prev,
      requirement: product ? product.name : prev.requirement,
    }));
    setIsEnquiryOpen(true);
  };

  const closeEnquiryForm = () => {
    setIsEnquiryOpen(false);
    setSelectedProduct(null);
    setSubmitMessage('');
  };

  const updateField = (field: keyof EnquiryFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setEnquiryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const payload = {
      ...enquiryData,
      productId: selectedProduct?.id ?? null,
      productName: selectedProduct?.name ?? null,
    };

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to submit');
      }
      setSubmitMessage(t('enquiry.submitSuccess'));
      setEnquiryData(initialEnquiryData);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(enquiryStorageKey);
      }
    } catch {
      setSubmitMessage(t('enquiry.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">
              {categoryFilter ? categories.find(c => c.slug === categoryFilter)?.name : t('product.allProducts')}
            </h1>
            <p className="text-zinc-500">{t('product.showingCount', { count: products.length })}</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={applySearch} className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('product.searchPlaceholder')}
                className="w-full bg-zinc-100 border border-zinc-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-[#304e58]/20 outline-none"
              />
            </form>
            <button className="flex items-center gap-2 bg-[#304e58] text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-[#314e58]">
              <Filter size={18} />
              {t('product.filter')}
            </button>
          </div>
        </div>

        <section className="mb-12 rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 text-[#304e58] shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('product.needQuoteTitle')}</h2>
              <p className="text-[#5B757E] mt-2 max-w-xl text-sm">
                {t('product.needQuoteDesc')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/912245678900?text=Hello%20Ramani%20Steel%20House%2C%20I%20need%20a%20quote%20for%20industrial%20products."
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#304e58] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#314e58] transition-colors text-center"
              >
                {t('product.whatsapp')}
              </a>
              <a
                href="mailto:ramanioffice@gmail.com?subject=Product%20Enquiry"
                className="rounded-full border border-[#304e58]/30 px-5 py-2.5 text-sm font-semibold text-[#304e58] hover:bg-[#f5f5f5] transition-colors text-center"
              >
                {t('product.email')}
              </a>
              <button
                type="button"
                onClick={() => {
                  openEnquiryForm();
                }}
                className="rounded-full bg-[#f5f5f5] px-5 py-2.5 text-sm font-semibold text-[#304e58] hover:bg-[#ededed] transition-colors"
              >
                {t('product.openForm')}
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block space-y-10">
            <div>
              <h3 className="font-bold text-[#304e58] uppercase tracking-widest text-xs mb-6">{t('product.categories')}</h3>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className={cn(
                    "block text-sm transition-colors",
                    !categoryFilter ? "text-[#304e58] font-bold" : "text-[#5B757E] hover:text-[#304e58]"
                  )}
                >
                  {t('product.allCategories')}
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className={cn(
                      "block text-sm transition-colors",
                      categoryFilter === cat.slug ? "text-[#304e58] font-bold" : "text-[#5B757E] hover:text-[#304e58]"
                    )}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* <div>
            <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-xs mb-6">Price Range</h3>
            <div className="space-y-4">
              <input type="range" className="w-full accent-zinc-900" />
              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                <span>₹0</span>
                <span>₹1,00,000+</span>
              </div>
            </div>
            </div> */}

            {/* <div className="p-6 bg-zinc-900 rounded-2xl text-white">
            <h4 className="font-bold mb-2">Need a custom quote?</h4>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">Contact our technical sales team for bulk pricing and custom dimensions.</p>
            <button className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors">
              Contact Sales
            </button>
          </div> */}
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-square bg-zinc-100 rounded-2xl" />
                    <div className="h-4 bg-zinc-100 rounded w-3/4" />
                    <div className="h-4 bg-zinc-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl border border-white/20 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-zinc-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <div className="p-6">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{product.category_name}</div>
                      <h3 className="font-bold text-[#304e58] mb-1 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                      <p className="text-xs text-[#5B757E] mb-4 line-clamp-1">{product.description}</p>
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-[#304e58]">
                            {formatPrice(product.price)}
                            <span className="ml-1 text-xs font-semibold text-[#5B757E]">{getProductUnitLabel(product.unit)}</span>
                          </span>
                          {(() => {
                            const { strike, discountPercent } = getStrikePrice(product.price);
                            const actualPrice = Number(product.price);
                            if (!Number.isFinite(actualPrice) || !(strike > actualPrice)) {
                              return null;
                            }
                            return (
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                <span className="uppercase tracking-wide">M.R.P.</span>
                                <span className="line-through">
                                  {formatPrice(strike)}
                                  <span className="ml-1">{getProductUnitLabel(product.unit)}</span>
                                </span>
                                <span className="text-emerald-600 font-semibold">{discountPercent}% off</span>
                              </div>
                            );
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={() => openEnquiryForm(product)}
                          className="rounded-full bg-[#304e58] text-white px-4 py-2 text-xs font-semibold whitespace-nowrap hover:bg-[#314e58] transition-colors"
                        >
                          {t('product.submitEnquiry')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <p className="text-zinc-500 font-medium">{t('product.noProducts')}</p>
                <Link to="/products" className="text-zinc-900 font-bold mt-4 inline-block border-b-2 border-zinc-900">{t('product.clearFilters')}</Link>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {isEnquiryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={closeEnquiryForm}
            />
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#304e58]">{t('enquiry.title')}</h2>
                <p className="text-xs text-[#5B757E] mt-1">
                  {selectedProduct ? t('enquiry.selectedProduct', { product: selectedProduct.name }) : t('enquiry.requirementHint')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEnquiryForm}
                className="p-2 rounded-full text-zinc-500 hover:text-[#304e58] hover:bg-zinc-100 transition-colors"
                aria-label="Close enquiry form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitEnquiry} className="p-6 space-y-5">
              <label className="block">
                <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.requirement')}</span>
                <textarea
                  rows={3}
                  required
                  value={enquiryData.requirement}
                  onChange={updateField('requirement')}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58] resize-none"
                  placeholder={t('enquiry.requirementPlaceholder')}
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.fullName')}</span>
                  <input
                    type="text"
                    required
                    value={enquiryData.fullName}
                    onChange={updateField('fullName')}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58]"
                    placeholder="Enter full name"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.email')}</span>
                  <input
                    type="email"
                    required
                    value={enquiryData.email}
                    onChange={updateField('email')}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58]"
                    placeholder="Enter email address"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.phone')}</span>
                  <input
                    type="tel"
                    required
                    value={enquiryData.phone}
                    onChange={updateField('phone')}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58]"
                    placeholder="Enter phone number"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.company')}</span>
                  <input
                    type="text"
                    value={enquiryData.company}
                    onChange={updateField('company')}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58]"
                    placeholder="Enter company name"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.location')}</span>
                  <input
                    type="text"
                    value={enquiryData.location}
                    onChange={updateField('location')}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58]"
                    placeholder="City / State / Country"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.quantity')}</span>
                  <input
                    type="text"
                    value={enquiryData.quantity}
                    onChange={updateField('quantity')}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58]"
                    placeholder="Enter quantity"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-sm font-semibold text-[#304e58] mb-1">{t('enquiry.message')}</span>
                <textarea
                  rows={4}
                  value={enquiryData.message}
                  onChange={updateField('message')}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#304e58]/20 focus:border-[#304e58] resize-none"
                  placeholder="Share technical requirements or notes"
                />
              </label>

              {submitMessage && (
                <p className={cn(
                  "text-sm font-medium",
                  submitMessage.startsWith('Unable') ? "text-red-600" : "text-emerald-600"
                )}>
                  {submitMessage}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEnquiryForm}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-zinc-300 text-[#5B757E] hover:bg-zinc-100 transition-colors"
                >
                  {t('enquiry.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#304e58] text-white hover:bg-[#314e58] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t('enquiry.submitting') : t('enquiry.submit')}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

