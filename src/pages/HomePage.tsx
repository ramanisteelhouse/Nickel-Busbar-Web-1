import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Factory,
  ShieldCheck,
  Globe,
  Zap,
  Layers,
  Truck,
  Wrench,
  BadgeCheck,
  Cpu,
  BatteryCharging,
  Gauge,
  Boxes,
  ClipboardCheck,
  MessageSquareQuote,
  Star,
  Award,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import type { Product, Category, BlogPost } from '../types';
import { buildImageAlt, encodePathSegment, resolveImageSrc } from '../lib/utils';
import { PHONE_NUMBERS, PRIMARY_CALL, PRIMARY_EMAIL } from '../lib/contact';
import { ANSWER_BLOCK, ANSWER_BLOCK_QUESTION } from '../lib/answerBlock';
import {
  applications as applicationTitles,
  faqItems,
  industries as industryTitles,
  productSpecifications,
  productVariants,
  qualityPoints,
  whyChooseUs as whyChooseUsCopy,
} from '../lib/homeContent';
import { Tilt3D, Reveal } from '../components/Tilt3D';
import { NickelStrip3D } from '../components/NickelStrip3D';
import { HeritageBadge, FOUNDED_YEAR } from '../components/HeritageBadge';
import { ProductThumbnail } from '../components/ProductThumbnail';

// Derived, not typed in: "52+ years" stops being true in 2027, and the hero is the worst place
// on the site for a number that quietly goes stale.
const yearsInBusiness = new Date().getFullYear() - FOUNDED_YEAR;

// 9KB WebP rather than the 317KB 1737x1906 JPEG this used to point at. The original is
// displayed in a 160x40 slot and as a favicon, so nothing on screen was ever using the pixels.
const fallbackShowcaseImage = '/img/icon-logo.webp';

// The copy lives in ../lib/homeContent so the SSR snapshot in seoSnapshot.ts can render the
// same words for crawlers that never run this bundle. Icons stay here — that module is
// imported by a Node serverless function and must not pull in React or lucide-react.
const variantImages = [
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  fallbackShowcaseImage,
];

/**
 * A showcase card is either a real catalogue product (addressed by slug through the image
 * proxy) or one of the hardcoded variants below, whose photo is a fixed URL with no product
 * record behind it. `staticImage` is what distinguishes the second case.
 */
type ShowcaseItem = {
  title: string;
  spec: string;
  note: string;
  cta: string;
  slug?: string;
  image?: string | null;
  staticImage?: string;
};

const fallbackVariants: ShowcaseItem[] = productVariants.map((variant, index) => ({
  ...variant,
  staticImage: variantImages[index] ?? fallbackShowcaseImage,
}));

const applicationIcons = [BatteryCharging, Zap, Wrench, Boxes];
const applications = applicationTitles.map((title, index) => ({ title, icon: applicationIcons[index] }));

const industryIcons = [Zap, Cpu, Gauge, BatteryCharging];
const industries = industryTitles.map((title, index) => ({ title, icon: industryIcons[index] }));

const whyChooseUsIcons = [Factory, ShieldCheck, Layers, Wrench, Truck];
const whyChooseUs = whyChooseUsCopy.map((item, index) => ({ ...item, icon: whyChooseUsIcons[index] }));

const heroVideoUrl = 'https://fzrnezhbfyrpvudlsqny.supabase.co/storage/v1/object/sign/video/Hero-section.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ODdiMWJmNC1hOWFhLTQ2N2QtYTAwYy0zYTRkZTVjOTFlNWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby9IZXJvLXNlY3Rpb24ubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4Mjk4Njk4OSwiZXhwIjozMDQ0NDI2OTg5fQ.cETIAf4A-l7iN7w3yBDVk5gAG6sM44Wui_VBav5-AVY';

const fallbackBlogArticles = [
  {
    title: 'Why Nickel Strips are Essential in Lithium Batteries',
    excerpt: 'Read how we manufacture nickel strips used in lithium-ion batteries and deliver competitive pricing to battery manufacturers.',
    link: '/blog/nickel-strips-lithium-batteries',
  },
  {
    title: 'Difference Between Pure Nickel vs Nickel Plated Strips',
    excerpt: 'A practical buyer guide to selecting the right strip for your application and budget.',
    link: '/blog/pure-vs-plated-nickel-strips',
  },
];

const fallbackCategories = [
  { id: 1, name: 'Pure Nickel Strips', slug: 'pure-nickel', image: '' },
  { id: 2, name: 'Nickel Plated Strips', slug: 'nickel-plated', image: '' },
  { id: 3, name: 'Battery Tabs', slug: 'battery-tabs', image: '' },
  { id: 4, name: 'Custom Coils', slug: 'custom-coils', image: '' },
  { id: 5, name: 'Busbars', slug: 'busbars', image: '' },
  { id: 6, name: 'EV Components', slug: 'ev-components', image: '' },
];

const reviewHighlights = [
  {
    quote: 'Excellent weldability and minimal scrap across high-volume packs.',
    name: 'Head of Manufacturing',
    rating: 5,
  },
  {
    quote: 'Consistent thickness and fast deliveries helped our ramp-up.',
    name: 'Supply Chain Lead',
    rating: 5,
  },
  {
    quote: 'Material test certificates are always complete and accurate.',
    name: 'Quality Manager',
    rating: 4,
  },
];

export const HomePage: React.FC = () => {
  const [dynamicProducts, setDynamicProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [formState, setFormState] = React.useState({
    name: '',
    email: '',
    phone: '',
    requirement: '',
    thickness: '',
    quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');
  const [heroVideoSrc, setHeroVideoSrc] = React.useState('');

  // The factory-tour clip is 10.8MB — on its own it was 70% of this page's 15.2MB transfer, and
  // it downloaded during the initial load because the <video> carried a plain `src`. It is
  // decoration sitting behind a poster, so nothing needs it before the page is usable: hold the
  // src back until the load event has fired, then attach it during idle time. Visitors on a
  // metered or slow connection never get it at all and keep the poster.
  React.useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return;
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return;

    let idleHandle = 0;
    const attach = () => {
      const requestIdle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idleHandle = requestIdle(() => setHeroVideoSrc(heroVideoUrl)) as unknown as number;
    };

    if (document.readyState === 'complete') {
      attach();
      return () => window.clearTimeout(idleHandle);
    }

    window.addEventListener('load', attach, { once: true });
    return () => {
      window.removeEventListener('load', attach);
      window.clearTimeout(idleHandle);
    };
  }, []);

  React.useEffect(() => {
    fetch('/api/products?search=nickel')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setDynamicProducts(data))
      .catch(() => {
        setDynamicProducts([]);
      });
  }, []);

  React.useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setCategories(data))
      .catch(() => {
        setCategories([]);
      });
  }, []);

  React.useEffect(() => {
    fetch('/api/blog-posts?limit=4')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load blog posts');
        }
        return res.json();
      })
      .then((data) => {
        setBlogPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setBlogPosts([]);
      });
  }, []);

  // slug rather than a resolved URL: it lets the card render through /api/product-image, which
  // serves the photo from our own domain (indexable, and it falls back to the placeholder when
  // the stored Supabase URL will not fetch) instead of hotlinking a signed storage URL.
  const showcaseItems: ShowcaseItem[] = dynamicProducts.length
    ? dynamicProducts.slice(0, 3).map((product) => ({
        title: product.name,
        spec: product.dimensions || 'Custom thickness x width',
        note: product.category_name || 'Nickel strip engineered for battery tabs.',
        slug: product.slug,
        image: product.image,
        cta: `/product/${product.slug}`,
      }))
    : fallbackVariants;

  const handleFormChange = (key: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: 'Nickel Strips',
          requirement: formState.requirement,
          thickness: formState.thickness,
          fullName: formState.name,
          email: formState.email,
          phone: formState.phone,
          quantity: formState.quantity,
          message: 'Homepage enquiry',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitMessage('Thanks! Our engineering team will reach out within 1 business day.');
      setFormState({ name: '', email: '', phone: '', requirement: '', thickness: '', quantity: '' });
    } catch {
      setSubmitMessage('Unable to submit right now. Please call or WhatsApp us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const marqueeItems = (categories.length ? categories : fallbackCategories).filter((category) => category.slug);
  const marqueeLoop = [...marqueeItems, ...marqueeItems];
  const blogArticles = blogPosts.length > 0
    ? blogPosts.map((post) => ({
        title: post.title,
        excerpt: post.excerpt || 'Read the full article for detailed insights.',
        link: `/blog/${encodePathSegment(post.slug)}`,
      }))
    : fallbackBlogArticles;

  return (
    <div className="pt-28">
      {/*
        Title and description are capped at the lengths search engines render (50-60 and
        120-160 characters) and are repeated verbatim in index.html and in
        STATIC_ROUTE_SEO["/"] in seoSnapshot.ts — all three change together.

        No JSON-LD here. The Organization/LocalBusiness graph ships in index.html on every
        route, and the homepage's FAQPage and Product entities come from the SSR snapshot in
        seoSnapshot.ts. Publishing them again from here put two Organization entities (under
        two different names) and two FAQPage entities on one URL, which is why the audit's
        Local SEO check reported no LocalBusiness at all: nothing said which was authoritative.
      */}
      <Helmet>
        <title>Nickel Strip Manufacturer India | Nickel Busbar Supplier</title>
        <meta
          name="description"
          content="Nickel strip manufacturer in India supplying pure nickel strip, H type nickel strip and nickel busbar for 18650 battery packs. PAN India supply and export."
        />
        <meta
          name="keywords"
          content="Nickel Strip Manufacturer India, Pure Nickel Strip, H Type Nickel Strip, Nickel Busbar, Nickel Strip for 18650 Battery, Battery Nickel Strip Supplier, Nickel Strip Exporter, Nickel Strip Supplier for Export, Nickel Busbar Wholesale Supplier, Bulk Nickel Strip Order"
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ramani Steel House" />
        <meta property="og:title" content="Nickel Strip Manufacturer India | Nickel Busbar Supplier" />
        <meta property="og:description" content="Battery Nickel Strip Supplier manufacturing Pure Nickel Strip, H Type Nickel Strip, and Nickel Busbar for lithium-ion and EV battery packs. PAN India supply, exporting to 17+ countries worldwide." />
        <meta property="og:url" content="https://www.nickelbusbar.com/" />
        <meta property="og:image" content="https://www.nickelbusbar.com/img/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nickel Strip Manufacturer India | Nickel Busbar Supplier" />
        <meta name="twitter:description" content="Battery Nickel Strip Supplier manufacturing Pure Nickel Strip, H Type Nickel Strip, and Nickel Busbar for lithium-ion and EV battery packs." />
        <meta name="twitter:image" content="https://www.nickelbusbar.com/img/og-image.png" />
      </Helmet>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-light text-white">
        {/* Animated aurora backdrop */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-white/10 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-brand-dark/40 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* The product itself, in 3D, instead of the three rounded bars that used to stand in
              for it. Those were generic decoration; this is an H type strip with its real
              rail-and-rung geometry, which a battery pack builder recognises on sight.
              Deliberately behind the headline and dimmed — it is the backdrop to the claim, not
              a competitor for it. Hidden below lg, where the hero is a single narrow column and
              a wide strip has nowhere to sit. */}
          <NickelStrip3D className="absolute right-[-6%] top-1/2 hidden h-[26rem] w-[68%] -translate-y-1/2 opacity-50 lg:block" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] items-start">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
              <div className="flex items-center gap-5">
                <HeritageBadge size={112} className="hidden sm:block" />
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                  </span>
                  {yearsInBusiness}+ Years of Industrial Excellence
                </p>
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold leading-[1.05] tracking-tight">
                <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="block">
                  India's Trusted
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22 }} className="block bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  Nickel Strip Manufacturer
                </motion.span>
              </h1>
              <p className="mt-4 text-xl text-white/85">
                Premium Pure Nickel Strip, Nickel Busbar and H Type Nickel Strip connectors for lithium-ion manufacturing.
              </p>
              <p className="mt-4 text-base text-white/75">
                High conductivity, superior weldability, and precision-engineered Nickel Strip for 18650 Battery, 21700, and
                32650 battery packs &mdash; from a trusted Battery Nickel Strip Supplier.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Link
                    to="/products?enquiry=1"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand shadow-lg shadow-brand-dark/20 hover:bg-white/90"
                  >
                    Request a Quote
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Link
                    to="/products?search=nickel"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Explore Products
                  </Link>
                </motion.div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {(categories.length > 0 ? categories.slice(0, 4) : fallbackCategories.slice(0, 4)).filter((category) => category.slug).map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
                  >
                    <Link
                      to={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/20"
                    >
                      {category.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}>
              <Tilt3D className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl" maxTilt={7} liftZ={16}>
                <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950" style={{ transform: 'translateZ(40px)' }}>
                  <video
                    src={heroVideoSrc || undefined}
                    poster="/img/hero-poster.webp"
                    preload="none"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label="Factory tour: battery pack nickel strip production"
                    className="h-72 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-slate-950/80 p-4 text-white backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Factory Tour</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">Battery pack strip production</h2>
                    <p className="mt-2 text-sm text-slate-300">Real-time manufacturing visuals for nickel strip and connector fabrication.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Cell Compatibility', value: '18650, 21700, 32650' },
                    { label: 'Material Options', value: 'Pure nickel, nickel-plated steel' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </Tilt3D>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-translate-y-8 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: '52+ Years Experience', value: 'Since 1974', icon: Factory },
              { label: 'ISO Certified', value: 'Quality assured', icon: ShieldCheck },
              { label: 'Global Exporter', value: '17+ countries', icon: Globe },
              { label: 'High Purity Nickel', value: '99.6% - 99.8%', icon: BadgeCheck },
            ].map((item, index) => (
              <Reveal key={item.label} delay={index * 0.08}>
                <Tilt3D maxTilt={8} liftZ={12} className="h-full rounded-2xl">
                  <div className="flex h-full flex-col gap-2 rounded-2xl p-2 transition-shadow hover:shadow-lg" style={{ transform: 'translateZ(20px)' }}>
                    <item.icon size={18} className="text-brand" />
                    <p className="text-sm font-semibold text-brand">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.value}</p>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The definition answer engines quote. It is the first prose on the page and one
          self-contained paragraph naming the company inside itself, because an answer that
          needs the surrounding page to make sense gets paraphrased rather than cited - and a
          paraphrase drops the attribution. Same text as the FAQPage markup the `/` snapshot
          publishes (seoSnapshot.ts): the answer marked up has to be the answer on screen. */}
      <section className="bg-white pt-2 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 md:px-10 md:py-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-brand">{ANSWER_BLOCK_QUESTION}</h2>
            <p className="mt-4 max-w-4xl text-base md:text-lg leading-relaxed text-slate-700">{ANSWER_BLOCK}</p>
            {/* Descriptive anchor text, pointing at the page that should own this phrase.
                Until now the homepage was the only URL carrying both "H type nickel strip" and
                "manufacturer India", so it is what Google returned for the query — this hands
                the phrase to /h-type-nickel-strip, which answers it properly. */}
            <p className="mt-5 text-base text-slate-600">
              Looking for a specific pattern?{' '}
              <Link to="/h-type-nickel-strip" className="font-semibold text-brand underline underline-offset-4">
                H type nickel strip manufacturer in India
              </Link>{' '}
              — pure nickel H type strip for 18650, 21700, 32650 and 32700 packs in 2P, 3P and 4P layouts.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Categories</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Browse by Category</h2>
              <p className="mt-2 text-slate-500">Scroll through the most requested nickel strip and battery components.</p>
            </div>
            <Link to="/categories" className="text-sm font-semibold text-brand">View all categories</Link>
          </div>
        </div>
        <div className="overflow-hidden border-y border-slate-200 bg-white py-4">
          <div className="flex min-w-max items-center gap-4 px-6 animate-marquee">
            {marqueeLoop.map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                to={`/products?category=${encodeURIComponent(item.slug)}`}
                className="inline-flex items-center gap-2 rounded-full border border-brand-dark/20 bg-[#ffffff] px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Products</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Nickel Strip Variants</h2>
              <p className="mt-2 text-slate-500">Engineered to match your cell design, welding process, and performance targets.</p>
            </div>
            <Link to="/products?search=nickel" className="text-sm font-semibold text-brand">View all nickel strip products</Link>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseItems.map((item, index) => (
              <Reveal key={`${item.cta}-${index}`} delay={index * 0.1}>
                <Tilt3D maxTilt={6} liftZ={20} className="group h-full rounded-3xl">
                  <div className="h-full rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-2xl hover:shadow-brand/10">
                    <div className="h-48 overflow-hidden">
                      <ProductThumbnail
                        slug={item.slug}
                        image={item.image}
                        src={item.staticImage}
                        name={item.title}
                        size={640}
                        height={360}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6" style={{ transform: 'translateZ(24px)' }}>
                      <h3 className="text-lg font-semibold text-brand">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{item.spec}</p>
                      <p className="mt-3 text-sm text-slate-600">{item.note}</p>
                      <Link
                        to={item.cta}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"
                      >
                        Get Quote
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Applications</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Where Our Nickel Strips Power Innovation</h2>
              <p className="mt-4 text-slate-500">High-performance battery manufacturers rely on consistent conductivity and tight tolerances.</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {applications.map((app) => (
                  <div key={app.title} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <app.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand">{app.title}</p>
                      <p className="text-xs text-slate-500">Optimized for high-current and precise weldability.</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#ffffff] to-[#f5f5f5] p-8">
              <div className="grid grid-cols-2 gap-6">
                {industries.map((industry) => (
                  <div key={industry.title} className="rounded-2xl bg-white p-4 shadow-sm">
                    <industry.icon size={20} className="text-brand" />
                    <p className="mt-3 text-sm font-semibold text-brand">{industry.title}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark">Why Choose Us</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold">Trusted Manufacturing Partner</h2>
              <p className="mt-2 text-white/70">Built on legacy, engineered for modern battery production.</p>
            </div>
            <Link to="/products?enquiry=1" className="inline-flex items-center gap-2 rounded-full bg-white text-brand px-6 py-3 text-sm font-semibold hover:bg-slate-100">
              Speak to an Engineer
              <ArrowRight size={14} />
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <Tilt3D maxTilt={6} liftZ={14} className="h-full rounded-2xl">
                  <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10" style={{ transform: 'translateZ(16px)' }}>
                    <item.icon size={20} className="text-brand-dark" />
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{item.detail}</p>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <Reveal>
              <Tilt3D maxTilt={5} liftZ={18} className="rounded-3xl">
                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/60">
                  {/* The 1163x1650 source was 873KB for a box that never renders wider than
                      900px. WebP at that width is 92KB; the JPEG is the fallback. */}
                  <picture>
                    <source srcSet="/img/iso-9001.webp" type="image/webp" />
                    <img
                      src="/img/iso-9001-900.jpg"
                      alt="ISO 9001 certified nickel strip quality inspection at Ramani Steel House, Mumbai"
                      width={900}
                      height={1277}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </picture>
                </div>
              </Tilt3D>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Quality & Certifications</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Precision You Can Audit</h2>
              <p className="mt-3 text-slate-500">Material test certificates, traceability records and compliance documentation are issued on request.</p>
              <div className="mt-6 space-y-3">
                {qualityPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm text-slate-600">
                    <BadgeCheck size={18} className="text-brand mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/img/iso-9001-2015-certificate.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Award size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand">ISO 9001:2015</p>
                      <p className="text-xs text-slate-500">Quality Management System</p>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:text-brand-dark">
                    View certificate <ArrowRight size={12} />
                  </span>
                </a>
                <a
                  href="/img/iso-14001-certificate.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand">ISO 14001</p>
                      <p className="text-xs text-slate-500">Environmental Management System</p>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:text-brand-dark">
                    View certificate <ArrowRight size={12} />
                  </span>
                </a>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-brand/10 px-4 py-2 text-xs font-semibold text-brand">RoHS Compliant</div>
                <div className="rounded-full bg-brand/10 px-4 py-2 text-xs font-semibold text-brand">REACH Compliant</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Product Specification</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Nickel Strip Technical Specifications</h2>
            <p className="mt-2 text-slate-500">Detailed specifications for battery manufacturing, welding, and electrical connector applications.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {productSpecifications.map((spec) => (
              <div key={spec.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-brand">{spec.label}</p>
                <p className="mt-2 text-sm text-slate-600">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Buyer Guidance</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Choosing the Right Nickel Strip</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-brand">Nickel vs Nickel-Plated</h3>
              <p className="mt-3 text-sm text-slate-600">Pure nickel offers the best conductivity and weld strength for high-current battery tabs. Nickel-plated strip is more economical for lower current assemblies.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-brand">Thickness vs Current Capacity</h3>
              <p className="mt-3 text-sm text-slate-600">Thinner strips are ideal for compact 18650 and 21700 packs. Thicker strips support higher discharge currents and more demanding EV modules.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-brand">Spot Welding Applications</h3>
              <p className="mt-3 text-sm text-slate-600">Our strips are designed for spot welding, laser welding, and ultrasonic bonding used in battery pack assembly and busbar fabrication.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">FAQ</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <details key={faq.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <summary className="cursor-pointer text-lg font-semibold text-brand">{faq.question}</summary>
                <p className="mt-4 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark">Reviews</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">What Manufacturing Teams Say</h2>
            <p className="mt-3 text-slate-500">Verified feedback from lithium battery and EV supply partners.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewHighlights.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-3xl bg-white p-6 shadow-sm border border-brand-dark/20">
                <div className="flex items-center justify-between">
                  <MessageSquareQuote className="text-brand-dark" size={20} />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const filled = index < item.rating;
                      return (
                        <Star
                          key={`${item.name}-${index}`}
                          size={14}
                          className={filled ? 'text-brand' : 'text-slate-300'}
                          fill={filled ? '#304e58' : 'none'}
                        />
                      );
                    })}
                  </div>
                </div>
                <p className="mt-4 text-slate-600">"{item.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-brand">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Global Supply</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-display font-bold text-brand">Nickel Strip Manufacturer India for Global Lithium Battery Supply</h2>
            <p className="mt-4 text-slate-600">
              As a trusted Nickel Strip Manufacturer India, we supply high-purity Pure Nickel Strip, H Type Nickel Strip, and
              Nickel Busbar for lithium-ion batteries, EV battery packs, and industrial energy storage, including precision
              Nickel Strip for 18650 Battery assemblies. Our precision slitting and strict QA make us a preferred Battery
              Nickel Strip Supplier and nickel strip exporter.
            </p>
            <p className="mt-4 text-slate-600">
              Our manufacturing process supports custom widths, accurate thickness tolerances, and batch reports that compliance-focused manufacturers expect.
            </p>
            <p className="mt-4 text-slate-600">
              We support export documentation for international battery pack assembly, and our team works with OEMs, cell makers, and battery module builders.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/export-enquiry"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Nickel strip export enquiry: bulk supply PAN India and to 17+ countries
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/blog/nickel-strips-lithium-batteries"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Read more: Why Nickel Strips are Essential in Lithium Batteries
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Knowledge Hub</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Insights for Battery Engineers</h2>
              <p className="mt-2 text-slate-500">Guides and research to optimize nickel strip selection.</p>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-brand">Explore all articles</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogArticles.map((article, index) => (
              <Link key={`${article.link}-${index}`} to={article.link} className="rounded-3xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-brand">{article.title}</h3>
                <p className="mt-3 text-sm text-slate-500">{article.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">Read more <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-br from-white via-[#ffffff] to-[#f5f5f5] p-10 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Need Custom Nickel Strips?</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Get a Fast Engineering Quote</h2>
                <p className="mt-3 text-slate-600">Share your requirements and receive a specification-based quotation within 24 hours.</p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><ClipboardCheck size={16} className="text-brand" /> Supplier documentation + material test certificates</div>
                  <div className="flex items-center gap-2"><Globe size={16} className="text-brand" /> Global shipping support</div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  value={formState.name}
                  onChange={handleFormChange('name')}
                  placeholder="Name"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  required
                />
                <input
                  value={formState.email}
                  onChange={handleFormChange('email')}
                  placeholder="Email"
                  type="email"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  required
                />
                <input
                  value={formState.phone}
                  onChange={handleFormChange('phone')}
                  placeholder="Phone"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  required
                />
                <input
                  value={formState.thickness}
                  onChange={handleFormChange('thickness')}
                  placeholder="Thickness"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
                <input
                  value={formState.quantity}
                  onChange={handleFormChange('quantity')}
                  placeholder="Quantity"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
                <textarea
                  value={formState.requirement}
                  onChange={handleFormChange('requirement')}
                  placeholder="Requirement (thickness, width, purity, application)"
                  className="sm:col-span-2 min-h-[110px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  required
                />
                {submitMessage && (
                  <p className="sm:col-span-2 text-sm text-brand">{submitMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:col-span-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Request a Quote'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

