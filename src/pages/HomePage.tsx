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
import { Tilt3D, Reveal } from '../components/Tilt3D';

const fallbackShowcaseImage = '/img/icon-logo.jpg';

const fallbackVariants = [
  {
    title: 'Pure Nickel Strips',
    spec: '99.8%+ purity | 0.10mm - 0.50mm',
    note: 'High conductivity for battery tabs and precision welding.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    cta: '/products?search=pure%20nickel%20strip',
  },
  {
    title: 'Nickel Plated Strips',
    spec: 'Low resistance | 0.15mm x 8mm',
    note: 'Cost-effective performance for high-volume manufacturing.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    cta: '/products?search=nickel%20plated%20strip',
  },
  {
    title: 'Custom Sizes & Coils',
    spec: 'Width 2mm - 50mm | Custom slitting',
    note: 'Built to your cell design, welding process, and load specs.',
    image: '/img/icon-logo.jpg',
    cta: '/products?search=custom%20nickel%20strip',
  },
];

const applications = [
  { title: 'Lithium-ion Batteries', icon: BatteryCharging },
  { title: 'EV Battery Packs', icon: Zap },
  { title: 'Power Tools', icon: Wrench },
  { title: 'Energy Storage Systems', icon: Boxes },
];

const whyChooseUs = [
  { title: '52 Years Manufacturing Experience', icon: Factory, detail: 'Legacy of metallurgical excellence and precision engineering.' },
  { title: 'Consistent Quality & Precision', icon: ShieldCheck, detail: 'Strict ISO processes and multi-stage QA for every batch.' },
  { title: 'Bulk Supply Capability', icon: Layers, detail: 'Scalable production with ready export documentation.' },
  { title: 'Custom Manufacturing Options', icon: Wrench, detail: 'Widths, thickness, and surface finishes tailored to spec.' },
  { title: 'Fast Delivery & Global Shipping', icon: Truck, detail: 'Reliable lead times with worldwide logistics coverage.' },
];

const industries = [
  { title: 'Electric Vehicles (EV)', icon: Zap },
  { title: 'Consumer Electronics', icon: Cpu },
  { title: 'Renewable Energy', icon: Gauge },
  { title: 'Industrial Battery Manufacturers', icon: BatteryCharging },
];

const qualityPoints = [
  'ISO 9001 compliant manufacturing & traceability',
  'High purity nickel with certified material reports',
  'Automated slitting, edge conditioning, and surface inspection',
  'Batch-wise conductivity and tensile testing',
];

const productSpecifications = [
  { label: 'Nickel Purity', value: '99.8%+' },
  { label: 'Thickness Range', value: '0.10mm – 0.50mm' },
  { label: 'Width Range', value: '2mm – 50mm' },
  { label: 'Surface Finish', value: 'Bright, matte, nickel-plated' },
  { label: 'Typical Use', value: 'Battery tabs, busbars, welding strips' },
];

const faqItems = [
  {
    question: 'What is nickel strip used for?',
    answer: 'Nickel strip is used as a battery tab and connector in lithium-ion cells, EV packs, power tools, and energy storage systems because of its conductivity and weldability.',
  },
  {
    question: 'How do I choose the right nickel strip thickness?',
    answer: 'Choose thickness based on current rating, welding method, and cell design. Thin strips suit compact packs; thicker strip supports higher current and durability.',
  },
  {
    question: 'Can you supply custom nickel strips for EV battery assembly?',
    answer: 'Yes, we offer custom slitting, width, and surface preparation for nickel strips used in EV battery modules and high-performance battery systems.',
  },
];

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

  const showcaseItems = dynamicProducts.length
    ? dynamicProducts.slice(0, 3).map((product) => ({
        title: product.name,
        spec: product.dimensions || 'Custom thickness x width',
        note: product.category_name || 'Nickel strip engineered for battery tabs.',
        image: product.image ? resolveImageSrc(product.image) : fallbackShowcaseImage,
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
      <Helmet>
        <title>Nickel Strip Manufacturer India | Pure Nickel Strip & Nickel Busbar Supplier</title>
        <meta
          name="description"
          content="Ramani Steel House is a Nickel Strip Manufacturer India trusted by battery makers, supplying Pure Nickel Strip, H Type Nickel Strip, and Nickel Busbar for 18650 battery packs. PAN India supply and export to 17+ countries."
        />
        <meta
          name="keywords"
          content="Nickel Strip Manufacturer India, Pure Nickel Strip, H Type Nickel Strip, Nickel Busbar, Nickel Strip for 18650 Battery, Battery Nickel Strip Supplier, Nickel Strip Exporter, Nickel Strip Supplier for Export, Nickel Busbar Wholesale Supplier, Bulk Nickel Strip Order"
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ramani Steel House" />
        <meta property="og:title" content="Nickel Strip Manufacturer India | Pure Nickel Strip & Nickel Busbar Supplier" />
        <meta property="og:description" content="Battery Nickel Strip Supplier manufacturing Pure Nickel Strip, H Type Nickel Strip, and Nickel Busbar for lithium-ion and EV battery packs. PAN India supply, exporting to 17+ countries worldwide." />
        <meta property="og:url" content="https://www.nickelbusbar.com/" />
        <meta property="og:image" content="https://www.nickelbusbar.com/img/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nickel Strip Manufacturer India | Pure Nickel Strip Supplier" />
        <meta name="twitter:description" content="Battery Nickel Strip Supplier manufacturing Pure Nickel Strip, H Type Nickel Strip, and Nickel Busbar for lithium-ion and EV battery packs." />
        <meta name="twitter:image" content="https://www.nickelbusbar.com/img/logo.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Ramani Nickel Strips',
            url: 'https://www.nickelbusbar.com/',
            logo: 'https://www.nickelbusbar.com/img/logo.png',
            areaServed: 'Worldwide',
            sameAs: [
              'https://www.linkedin.com/company/ramani-steel-house/',
              'https://www.facebook.com/profile.php?id=61550731232092',
              'https://www.instagram.com/ramanisteelhouse/',
              'https://in.pinterest.com/ramanisteel2023/',
              'https://x.com/SteelHouse69101'
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Nickel Strips for Lithium-Ion Batteries',
            description: 'High purity nickel strips for EV, electronics, and energy storage applications.',
            brand: 'Ramani Nickel Strips',
            url: 'https://www.nickelbusbar.com/products?search=nickel',
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Ramani Steel House',
            image: 'https://www.nickelbusbar.com/img/logo.png',
            telephone: `+${PRIMARY_CALL.e164}`,
            email: PRIMARY_EMAIL,
            contactPoint: PHONE_NUMBERS.map((number) => ({
              '@type': 'ContactPoint',
              telephone: `+${number.e164}`,
              contactType: 'sales',
              areaServed: 'IN',
            })),
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Marine Lines East',
              addressLocality: 'Mumbai',
              addressRegion: 'Maharashtra',
              postalCode: '400004',
              addressCountry: 'IN',
            },
            areaServed: 'Worldwide',
            sameAs: [
              'https://www.linkedin.com/company/ramani-steel-house/posts/?feedView=all',
              'https://www.facebook.com/profile.php?id=61550731232092',
              'https://www.instagram.com/ramanisteelhouse/',
              'https://in.pinterest.com/ramanisteel2023/',
              'https://x.com/SteelHouse69101',
            ],
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '18:00',
              }
            ],
            // No aggregateRating here on purpose: reviewHighlights below is hardcoded
            // placeholder copy attributed to anonymous job titles, and marking that up as a
            // real rating is self-serving review markup — a manual-action risk that would
            // cost rich results site-wide. It stays as plain on-page testimonial content.
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          })}
        </script>
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
          {/* Floating 3D strip accents */}
          <div className="hidden lg:block" style={{ perspective: 1000 }}>
            {[
              { top: '12%', left: '58%', width: 220, rotate: -18, delay: 0 },
              { top: '58%', left: '52%', width: 160, rotate: 12, delay: 0.6 },
              { top: '32%', left: '68%', width: 130, rotate: -8, delay: 1.1 },
            ].map((strip, index) => (
              <motion.div
                key={index}
                className="absolute h-3 rounded-full bg-gradient-to-r from-white/40 via-emerald-200/30 to-white/10 shadow-lg"
                style={{ top: strip.top, left: strip.left, width: strip.width, rotate: strip.rotate, transformStyle: 'preserve-3d' }}
                animate={{ y: [0, -18, 0], rotateZ: [strip.rotate, strip.rotate + 6, strip.rotate] }}
                transition={{ duration: 7 + index, repeat: Infinity, ease: 'easeInOut', delay: strip.delay }}
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] items-start">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                52+ Years of Industrial Excellence
              </p>
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
                    src={heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
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
              { label: 'High Purity Nickel', value: '99.8%+', icon: BadgeCheck },
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
                      <img src={item.image} alt={buildImageAlt(item.title)} loading="lazy" width={640} height={360} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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
                  <img
                    src="/img/iso-9001.jpg"
                    alt="Quality inspection"
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </Tilt3D>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Quality & Certifications</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand">Precision You Can Audit</h2>
              <p className="mt-3 text-slate-500">Every shipment includes material test certificates, traceability, and compliance documentation.</p>
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

