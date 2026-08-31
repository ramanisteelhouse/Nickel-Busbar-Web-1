import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Shield, Truck, RotateCcw, ChevronRight, X, CheckCircle2, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import { buildImageAlt, getProductUnitLabel, getStrikePrice } from '../lib/utils';
import { productImagePath, productImageUrl } from '../lib/productImage';
import {
  RETURN_POLICY_HEADING,
  RETURN_POLICY_LINES,
  RETURN_POLICY_SCHEMA,
} from '../lib/returnPolicy';
import {
  fillKeywordParagraphs,
  resolveProductKeywordBlock,
  keywordMetaDescription,
  productImageAltSubject,
  productPageTitle,
  BUYER_ROLE_KEYWORDS,
} from '../lib/productSeo';
import { EXPORT_PATH, PRODUCT_EXPORT_LEAD, PRODUCT_EXPORT_TERMS } from '../lib/exportEnquiry';
import { buildProductSpecs, NICKEL_PURITY_RANGE } from '../lib/productSpecs';
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
  // Enquiry-only products carry no price; publishing `price: 0` would advertise them as free
  // in structured data, so the Offer node is omitted instead. Mirrored in seoSnapshot.ts.
  const numericPrice = Number(product.price);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;

  // Head and copy below mirror renderProductSnapshot() in seoSnapshot.ts. They have to: this
  // component's tags replace the SSR ones on mount, so anything the snapshot says and the
  // mounted page does not is what Google's rendering pass throws away.
  const keywordBlock = resolveProductKeywordBlock(product);
  const keywordValues = { name: product.name, price: hasPrice ? formatPrice(numericPrice) : null };
  const keywordParagraphs = keywordBlock ? fillKeywordParagraphs(keywordBlock, keywordValues) : [];
  const pageTitle = productPageTitle(product.name, keywordBlock);
  const pageDescription =
    (keywordBlock && keywordMetaDescription(keywordBlock, keywordValues)) ||
    `${product.name} by Ramani Steel House. ${product.description || 'Industrial-grade nickel strip for lithium-ion battery and precision applications.'}`.slice(0, 160);
  // Not the raw product.image: that is a signed Supabase Storage URL, and Supabase serves
  // every object with `X-Robots-Tag: none`, so Google Images may not index it and the page
  // can never earn a search-result thumbnail. src/lib/productImage.ts has the details.
  const imagePath = productImagePath(product.slug, product.image);
  const imageUrl = productImageUrl(siteUrl, product.slug, product.image);
  const imageAlt = buildImageAlt(productImageAltSubject(product.name, keywordBlock));
  // Purity is applied only to nickel items: the catalogue also carries a copper busbar, and a
  // nickel purity there would be a false material claim. See src/lib/productSpecs.ts.
  const productSpecs = buildProductSpecs(product);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={[...(keywordBlock?.keywords ?? []), ...BUYER_ROLE_KEYWORDS].join(', ')} />
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
            countryOfOrigin: 'IN',
            // Mirrors seoSnapshot.ts: the export terms as machine-readable attributes, matching
            // the visible Export supply table rendered further down this page.
            // Exactly the rows the visible spec table renders — Google discounts structured
            // data that states attributes the page itself does not show.
            additionalProperty: [...productSpecs, ...PRODUCT_EXPORT_TERMS].map((row) => ({
              '@type': 'PropertyValue',
              name: row.label,
              value: row.value,
            })),
            ...(hasPrice
              ? {
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'INR',
                    price: numericPrice,
                    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    url: canonicalUrl,
                    // Answers Search Console's "Missing field hasMerchantReturnPolicy (in
                    // offers)". Mirrored in seoSnapshot.ts, and backed by the returns copy
                    // rendered further down this page.
                    hasMerchantReturnPolicy: RETURN_POLICY_SCHEMA,
                    // An Offer with no stated region reads as domestic-only. These say the
                    // catalogue ships worldwide, and point `seller` at the Organization @id
                    // from index.html rather than declaring a second, rival company entity.
                    seller: { '@id': `${siteUrl}/#organization` },
                    // IN, not Worldwide: this price is INR and the return policy above is
                    // India-scoped, because export is quoted separately in USD against an
                    // Incoterm. See the note in seoSnapshot.ts.
                    eligibleRegion: { '@type': 'Country', name: 'IN' },
                  },
                }
              : {}),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${siteUrl}/products` },
              { '@type': 'ListItem', position: 3, name: product.name, item: canonicalUrl },
            ],
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
              src={imagePath}
              alt={imageAlt}
              width={1000}
              height={1000}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover"
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
            {/* Target-phrase copy for this product (src/lib/productSeo.ts). Visible on purpose:
                Google indexes the rendered page, so a phrase hidden from visitors counts for
                nothing — and the SSR snapshot renders this same block. */}
            {keywordBlock && (
              <section className="mb-8">
                <h2 className="text-base font-bold text-zinc-900 mb-2">{keywordBlock.heading}</h2>
                {keywordParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-zinc-500 leading-relaxed mb-2">
                    {paragraph}
                  </p>
                ))}
              </section>
            )}
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

          {/* Full specification table, in the label/value shape marketplace listings use and
              Google lifts single attributes from. Built from the product's own columns plus
              pattern and cell format derived from its name — see src/lib/productSpecs.ts. */}
          <section className="mb-10">
            <h2 className="text-sm font-bold text-zinc-900 mb-3">Specifications</h2>
            <table className="w-full text-left border border-zinc-100 rounded-2xl overflow-hidden">
              <tbody>
                {productSpecs.map((row, index) => (
                  <tr key={row.label} className={index % 2 ? 'bg-white' : 'bg-zinc-50'}>
                    <th scope="row" className="w-2/5 px-4 py-2.5 text-[11px] uppercase font-bold tracking-wide text-zinc-400 align-top">
                      {row.label}
                    </th>
                    <td className="px-4 py-2.5 text-xs font-semibold text-zinc-800">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Export trade terms. Rendered here, on the page an overseas buyer actually lands on
              from a product search, rather than only on /export-enquiry — the HS code, Incoterms
              and port are the details that decide whether they enquire at all. Mirrored in the
              crawler snapshot in seoSnapshot.ts; both read from lib/exportEnquiry. */}
          <section className="mb-10 rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-brand" />
              <h2 className="text-sm font-bold text-zinc-900">Export supply</h2>
            </div>
            <p className="text-xs text-zinc-600 mb-4">{PRODUCT_EXPORT_LEAD}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {PRODUCT_EXPORT_TERMS.map((term) => (
                <div key={term.label} className="flex justify-between gap-3 border-b border-zinc-200/70 py-1.5">
                  <dt className="text-[11px] uppercase font-bold tracking-wide text-zinc-400 shrink-0">{term.label}</dt>
                  <dd className="text-xs font-semibold text-zinc-800 text-right">{term.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              to={EXPORT_PATH}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              Send an export enquiry <ChevronRight size={14} />
            </Link>
          </section>

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
              Material test certificates are issued on request, and export-ready documentation is prepared in-house. Domestic PAN-India
              delivery and international shipping are available, with lead times confirmed at the time of quotation based on
              quantity and custom specification requirements.
            </p>
          </div>
        )}
      </section>

      {/* Always rendered, deliberately not a tab. Google requires the content behind a
          structured-data claim to be on the page, and the tab panels above only enter the DOM
          when their tab is selected — so a returns panel would be absent for a crawler that
          never clicks. This backs hasMerchantReturnPolicy in the Product markup. */}
      <section className="mt-16 rounded-3xl border border-zinc-100 bg-zinc-50 p-8">
        <h2 className="text-lg font-bold text-zinc-900">{RETURN_POLICY_HEADING}</h2>
        {RETURN_POLICY_LINES.map((line) => (
          <p key={line} className="mt-3 text-sm leading-relaxed text-zinc-600">
            {line}
          </p>
        ))}
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

