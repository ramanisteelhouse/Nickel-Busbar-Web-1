import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Shield, Truck, RotateCcw, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import { buildImageAlt, getProductUnitLabel, getStrikePrice, resolveImageSrc } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageProvider';

export const ProductDetailPage: React.FC<{ onAddToCart: (p: Product) => void }> = ({ onAddToCart }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<'not-found' | 'server' | null>(null);
  const [showCartToast, setShowCartToast] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'specs' | 'applications' | 'shipping'>('specs');
  const { t, formatPrice } = useLanguage();
  const siteUrl = 'https://www.nickelbusbar.com';

  React.useEffect(() => {
    let isActive = true;
    setLoading(true);
    setFetchError(null);
    setProduct(null);
    setActiveTab('specs');

    fetch(`/api/products/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('NOT_FOUND');
          }
          throw new Error('REQUEST_FAILED');
        }
        const data = await res.json();
        if (!isActive) return;
        setProduct(data);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : '';
        setFetchError(message === 'NOT_FOUND' ? 'not-found' : 'server');
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [slug]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!showCartToast) return;
    const timer = window.setTimeout(() => setShowCartToast(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showCartToast]);

  if (loading) return <div className="pt-32 text-center">{t('productDetail.loading')}</div>;

  if (fetchError === 'server') {
    const errorCanonical = `${siteUrl}/product/${slug || ''}`;
    return (
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-center">
        <Helmet>
          <title>Product Unavailable</title>
          <meta
            name="description"
            content="We are unable to load this product right now. Please try again shortly or browse other available products."
          />
          <meta name="robots" content="noindex,follow,noarchive" />
          <link rel="canonical" href={errorCanonical} />
        </Helmet>
        <h1 className="text-3xl font-bold text-zinc-900">We could not load this product right now.</h1>
        <p className="mt-3 text-zinc-500">Please refresh, or visit our product listing for available options.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  if (fetchError === 'not-found' || !product) {
    const missingCanonical = `${siteUrl}/product/${slug || ''}`;
    return (
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-center">
        <Helmet>
          <title>404 | Product Not Found</title>
          <meta
            name="description"
            content="The product page you requested is not available. Explore our full nickel strip catalog for available options."
          />
          <meta name="robots" content="noindex,follow,noarchive" />
          <meta name="prerender-status-code" content="404" />
          <link rel="canonical" href={missingCanonical} />
        </Helmet>
        <h1 className="text-3xl font-bold text-zinc-900">{t('productDetail.notFound')}</h1>
        <p className="mt-3 text-zinc-500">The product may have moved, been renamed, or no longer exists.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const canonicalUrl = `${siteUrl}/product/${product.slug}`;
  const pageTitle = `${product.name} | Nickel Strips Manufacturer`;
  const pageDescription = `${product.name} by Ramani Steel House. ${product.description || 'Industrial-grade nickel strip for lithium-ion battery and precision applications.'}`.slice(0, 160);
  const imageUrl = resolveImageSrc(product.image || '/img/logo.png');

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || pageDescription,
            image: [imageUrl],
            brand: { '@type': 'Brand', name: 'Ramani Steel House' },
            category: product.category_name || 'Nickel Strips',
            sku: product.slug,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: Number(product.price) || 0,
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: canonicalUrl,
            },
          })}
        </script>
      </Helmet>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
        <Link to="/" className="hover:text-zinc-900">{t('productDetail.breadcrumbHome')}</Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-zinc-900">{t('productDetail.breadcrumbProducts')}</Link>
        <ChevronRight size={12} />
        <span className="text-zinc-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <img
              src={resolveImageSrc(product.image)}
              alt={buildImageAlt(product.name)}
              width={800}
              height={800}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2 block">
              {product.category_name}
            </span>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">{product.name}</h1>
            <div className="mb-6">
              <p className="text-2xl font-bold text-zinc-900">
                {formatPrice(product.price)}
                <span className="ml-2 text-sm font-semibold text-zinc-500">{getProductUnitLabel(product.unit)}</span>
              </p>
              {(() => {
                const { strike, discountPercent } = getStrikePrice(product.price);
                const actualPrice = Number(product.price);
                if (!Number.isFinite(actualPrice) || !(strike > actualPrice)) {
                  return null;
                }
                return (
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
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
            <p className="text-zinc-500 leading-relaxed mb-8">{product.description}</p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">{t('productDetail.astm')}</span>
              <span className="text-sm font-bold text-zinc-900">{product.astm_value || 'N/A'}</span>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">{t('productDetail.uns')}</span>
              <span className="text-sm font-bold text-zinc-900">{product.uns_value || 'N/A'}</span>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">{t('productDetail.dimensions')}</span>
              <span className="text-sm font-bold text-zinc-900">{product.dimensions || 'N/A'}</span>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">{t('productDetail.availability')}</span>
              <span className="text-sm font-bold text-emerald-600">{product.stock > 0 ? t('productDetail.inStock') : t('productDetail.outOfStock')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={() => {
                onAddToCart(product);
                if (isMobile) {
                  setShowCartToast(true);
                }
              }}
              className="flex-1 bg-zinc-900 text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              {t('productDetail.addToCart')}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/products?enquiry=1&product=${product.slug}`)}
              className="flex-1 bg-zinc-100 text-zinc-900 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all"
            >
              {t('productDetail.requestQuote')}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-100">
            <div className="flex flex-col items-center text-center gap-2">
              <Shield size={20} className="text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">{t('productDetail.quality')}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Truck size={20} className="text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">{t('productDetail.shipping')}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw size={20} className="text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">{t('productDetail.returns')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Technical Details Section */}
      <section className="mt-24">
        <div className="border-b border-zinc-200 flex gap-8 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'specs' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-900'}`}
          >
            {t('productDetail.techSpecs')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`pb-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'applications' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-900'}`}
          >
            {t('productDetail.applications')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'shipping' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-900'}`}
          >
            {t('productDetail.shippingInfo')}
          </button>
        </div>

        {activeTab === 'specs' && (
          <div className="prose prose-zinc max-w-none">
            <p className="text-zinc-600 leading-relaxed">
              {t('productDetail.techDescription', { product: product.name, astm: product.astm_value || 'ASTM' })}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-600">
              <li>• {t('productDetail.bullet1')}</li>
              <li>• {t('productDetail.bullet2')}</li>
              <li>• {t('productDetail.bullet3')}</li>
              <li>• {t('productDetail.bullet4')}</li>
            </ul>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="prose prose-zinc max-w-none">
            {product.applications && product.applications.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.applications.map((application) => (
                  <li key={application} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                    {application}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500">
                Application details for {product.name} are available on request &mdash; {' '}
                <Link to={`/products?enquiry=1&product=${product.slug}`} className="font-semibold text-brand hover:underline">
                  contact our engineering team
                </Link>
                .
              </p>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="prose prose-zinc max-w-none">
            <p className="text-zinc-600 leading-relaxed">
              Orders are dispatched with full material test certificates and export-ready documentation. Domestic PAN-India
              delivery and international shipping are available, with lead times confirmed at the time of quotation based on
              quantity and custom specification requirements.
            </p>
          </div>
        )}
      </section>

      {showCartToast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
          <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{t('productDetail.addedToCart')}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="bg-white text-zinc-900 text-xs font-bold px-3 py-2 rounded-full"
              >
                {t('productDetail.viewCart')}
              </button>
              <button
                type="button"
                onClick={() => setShowCartToast(false)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label={t('productDetail.closeToast')}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

