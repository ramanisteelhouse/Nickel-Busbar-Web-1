import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/Chatbot';
import { CookieBanner } from './components/CookieBanner';
import { LanguageProvider } from './i18n/LanguageProvider';
import { FloatingContact } from './components/FloatingContact';
import { AdPopup } from './components/AdPopup';
import { LeadCapturePopup } from './components/LeadCapturePopup';
import { GoogleOneTap } from './components/GoogleOneTap';
import { Footer } from './components/Footer';
import { Analytics } from './components/Analytics';
import { BackNavButton } from './components/BackNavButton';
import { ToastContainer, showToast } from './components/Toast';
import { getOrCreateSessionId } from './lib/utils';
import { LANDING_PATHS } from './lib/landingPages';
import { Product, CartItem } from './types';
import { cartLineKey, normaliseSpec, type StripSpec } from './lib/stripSpec';

const FRESH_LOGIN_KEY = 'fresh-login';

const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProductListingPage = React.lazy(() => import('./pages/ProductListingPage').then((m) => ({ default: m.ProductListingPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const ExportEnquiryPage = React.lazy(() => import('./pages/ExportEnquiryPage').then((m) => ({ default: m.ExportEnquiryPage })));
const BlogListingPage = React.lazy(() => import('./pages/BlogListingPage').then((m) => ({ default: m.BlogListingPage })));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const GuidesIndexPage = React.lazy(() => import('./pages/GuidesIndexPage').then((m) => ({ default: m.GuidesIndexPage })));
const GuidePage = React.lazy(() => import('./pages/GuidePage').then((m) => ({ default: m.GuidePage })));
const BlogNickelStripsLithiumPage = React.lazy(() => import('./pages/BlogNickelStripsLithiumPage').then((m) => ({ default: m.BlogNickelStripsLithiumPage })));
const CalculatorPage = React.lazy(() => import('./pages/CalculatorPage').then((m) => ({ default: m.CalculatorPage })));
const ReviewFormPage = React.lazy(() => import('./pages/ReviewFormPage').then((m) => ({ default: m.ReviewFormPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));

/**
 * Holds a full viewport while the route chunk loads, so the footer stays below the fold.
 *
 * This is a Cumulative Layout Shift fix, not a styling choice. Every route is React.lazy, so
 * on first paint the page is Navbar + this fallback + Footer. At 60vh the fallback reserved
 * 487px on a 812px phone, which put the footer inside the viewport; when the real route
 * arrived — often ten to twenty times taller — the footer was shoved thousands of pixels down,
 * and because it had been visible, the move counted in full.
 *
 * Measured on 2026-10-23 in Chrome at 375x812, the shift was attributed to the footer's
 * catalogue section every time: 0.40 on the homepage, 0.34 on a product page, 1.15 on a long
 * blog post, against a "good" threshold of 0.10. The layout-shift entry reported previousRect
 * y=487, which is 60vh exactly.
 *
 * Reserving the full viewport puts the footer below the fold during loading. CLS only counts
 * movement of content that was visible, so the same reflow stops being charged. It does not
 * make the page load faster; it stops the reflow being measured as instability, which is what
 * Core Web Vitals grades. svh rather than vh so a mobile browser's collapsing address bar does
 * not leave the reservation short.
 */
const RouteLoadingFallback: React.FC = () => (
  <div className="flex min-h-[100svh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Log analytics
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        geo: { timestamp: new Date().toISOString() },
        visitorId: getOrCreateSessionId(),
      })
    }).catch(() => {
      // Ignore analytics logging failures.
    });
  }, [pathname]);
  return null;
}

type SessionUser = {
  id: number;
  name?: string;
  email: string;
  role?: string;
};

/**
 * Local cart persistence, for visitors who are not signed in.
 *
 * Deliberately localStorage and not the consent-gated cookie helpers: this is the visitor's own
 * basket held on their own device, not analytics or tracking, and it is what makes a refresh
 * non-destructive. Reads are defensive because a quota-full or privacy-mode browser throws
 * rather than returning null, and a corrupt entry must not take the whole app down on boot.
 */
const CART_STORAGE_KEY = 'cart_items';

const readStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Guard the fields the cart actually reads, so a stale or hand-edited entry cannot render
    // NaN prices or crash the totals.
    return parsed
      .filter(
        (item): item is CartItem =>
          item && typeof item.id === 'number' && typeof item.name === 'string' &&
          Number.isFinite(Number(item.price)) && Number.isFinite(Number(item.quantity))
      )
      // A stored size is re-sanitised on the way in, the same as one arriving from the server.
      .map((item) => (item.spec ? { ...item, spec: normaliseSpec(item.spec) } : item));
  } catch {
    return [];
  }
};

const writeStoredCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or storage blocked — the in-memory cart still works for this page view.
  }
};

// Keyed by product *and* size: the same strip in 0.15 mm and 0.20 mm is two lines.
const mergeCartItems = (localItems: CartItem[], remoteItems: CartItem[]) => {
  const merged = new Map<string, CartItem>();

  remoteItems.forEach((item) => {
    merged.set(cartLineKey(item), { ...item });
  });

  localItems.forEach((item) => {
    const key = cartLineKey(item);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      merged.set(key, { ...item });
    }
  });

  return Array.from(merged.values());
};

export default function App() {
  // Seeded from localStorage, not empty. The cart is synced to the server only for signed-in
  // users, so for everyone else it lived purely in React state and a page refresh silently
  // emptied it — on a site where a buyer assembles a multi-item quote list over a session, and
  // where most visitors never sign in at all.
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const lastUserIdRef = useRef<number | null>(null);

  // Lines are addressed by cartLineKey (product + size), not by product id: one product can be
  // in the cart in several sizes, and each is quoted and made separately.
  const addToCart = (product: Product, spec?: StripSpec, quantity = 1) => {
    const line: CartItem = { ...product, quantity, ...(spec ? { spec: normaliseSpec(spec) } : {}) };
    const key = cartLineKey(line);
    setCart(prev => {
      if (prev.some(item => cartLineKey(item) === key)) {
        return prev.map(item =>
          cartLineKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, line];
    });
  };

  const updateQuantity = (lineKey: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (cartLineKey(item) === lineKey) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (lineKey: string) => {
    setCart(prev => prev.filter(item => cartLineKey(item) !== lineKey));
  };

  /**
   * Sets the size on a line, e.g. one added from the product grid. If another line already has
   * this product at the new size, the two are folded together rather than left as duplicates.
   */
  const updateSpec = (lineKey: string, spec: StripSpec) => {
    setCart(prev => {
      const target = prev.find(item => cartLineKey(item) === lineKey);
      if (!target) return prev;
      const updated: CartItem = { ...target, spec: normaliseSpec(spec) };
      const newKey = cartLineKey(updated);
      const clash = newKey !== lineKey ? prev.find(item => cartLineKey(item) === newKey) : undefined;
      if (clash) {
        return prev
          .filter(item => cartLineKey(item) !== lineKey)
          .map(item => (cartLineKey(item) === newKey ? { ...item, quantity: item.quantity + target.quantity } : item));
      }
      return prev.map(item => (cartLineKey(item) === lineKey ? updated : item));
    });
  };

  useEffect(() => {
    let isActive = true;

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) throw new Error('Unable to fetch session');
        const data = await response.json();
        if (!isActive) return;
        const user = data?.user ?? null;
        setSessionUser(user);

        if (user && typeof window !== 'undefined' && window.sessionStorage.getItem(FRESH_LOGIN_KEY) === '1') {
          window.sessionStorage.removeItem(FRESH_LOGIN_KEY);
          showToast(
            `Welcome to NickelBusbar.com, ${user.name || user.email}!`,
            'Thanks for signing in. Explore our nickel strips, busbars, and battery connection solutions.'
          );
        }
      } catch {
        if (!isActive) return;
        setSessionUser(null);
      }
    };

    fetchSession();

    const handleAuthChange = () => {
      fetchSession();
    };

    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      isActive = false;
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  // Mirror every cart change back to localStorage. Runs for signed-in users too: it keeps the
  // basket intact if their session expires mid-visit.
  useEffect(() => {
    writeStoredCart(cart);
  }, [cart]);

  useEffect(() => {
    let isActive = true;

    if (!sessionUser) {
      lastUserIdRef.current = null;
      setCartLoaded(true);
      return () => {
        isActive = false;
      };
    }

    if (lastUserIdRef.current === sessionUser.id) {
      setCartLoaded(true);
      return () => {
        isActive = false;
      };
    }

    lastUserIdRef.current = sessionUser.id;
    setCartLoaded(false);

    fetch('/api/cart')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load cart');
        }
        return response.json();
      })
      .then((serverItems: CartItem[]) => {
        if (!isActive) return;
        setCart((current) => mergeCartItems(current, Array.isArray(serverItems) ? serverItems : []));
      })
      .catch(() => {
        // Ignore cart load errors; keep local cart.
      })
      .finally(() => {
        if (!isActive) return;
        setCartLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, [sessionUser]);

  useEffect(() => {
    if (!sessionUser || !cartLoaded) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            spec: item.spec ?? null,
          })),
        }),
        signal: controller.signal,
      }).catch(() => {
        // Ignore sync errors.
      });
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cart, cartLoaded, sessionUser]);

  return (
    <Router>
      <LanguageProvider>
        <div className="min-h-screen bg-white font-sans text-[#304e58] selection:bg-[#304e58] selection:text-white">
          <ScrollToTop />
          <Analytics />
          <GoogleOneTap />
          <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
          <ToastContainer />
          <AdPopup />
          {/* Scroll-triggered phone capture. Rendered beside AdPopup rather than inside <main>
              so it is not affected by route transitions, and so its fixed overlay cannot
              participate in the main column’s layout. */}
          <LeadCapturePopup />

          {/* min-h keeps the footer below the fold for the whole of page startup, which is a
              Cumulative Layout Shift fix rather than a styling choice.

              A route settles in two stages, and each one used to let the footer ride up into
              view. First the lazy chunk loads, which RouteLoadingFallback covers. Then the
              component mounts and fetches its own data, and during that second window it
              renders almost nothing — measured on /product/:slug, the document fell from
              1964px to 1348px at 224ms, putting the footer at y=690 inside a 768px viewport,
              and at 548ms the data arrived and pushed it back down to y=5122. Because the
              footer had been visible, that move was charged in full: CLS 0.80 on that load,
              and 1.15 on a long blog post, against a good score of 0.10.

              Reserving a viewport here covers both stages and any route added later, instead
              of each page needing its own skeleton. Subtracting the ad bar keeps the
              reservation from adding a scrollbar when the bar is showing. */}
          <main
            // overflow-x-clip stops entrance animations producing a horizontal scrollbar.
            // Product pages slide their two columns in from the sides (x: ±20 in
            // ProductDetailPage), and while that runs the translated column sticks 4px past a
            // 375px viewport, so the page can be scrolled sideways for the ~600ms it takes to
            // settle. Measured: translateX(19.6px) with scrollWidth 379 at 0ms, transform none
            // and 375 by 600ms.
            //
            // clip, not hidden: hidden makes this a scroll container, which would give the
            // product image's lg:sticky nothing to travel within. clip just stops the paint.
            className="min-h-[calc(100svh-var(--adbar-height,0px))] overflow-x-clip"
            style={{ paddingTop: 'var(--adbar-height, 0px)' }}
          >
            <BackNavButton />
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage onAddToCart={addToCart} />} />
                <Route path="/product/:slug" element={<ProductDetailPage onAddToCart={addToCart} />} />
                <Route path="/categories" element={<ProductListingPage onAddToCart={addToCart} />} />
                <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} updateSpec={updateSpec} />} />
                <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/export-enquiry" element={<ExportEnquiryPage />} />
                <Route path="/blog" element={<BlogListingPage />} />
                <Route path="/guides" element={<GuidesIndexPage />} />
                <Route path="/guides/:slug" element={<GuidePage />} />
                <Route path="/blog/nickel-strips-lithium-batteries" element={<BlogNickelStripsLithiumPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                {/* The shareable review link. The :productSlug form is what goes out after an
                    order; the bare one is for a general review. */}
                <Route path="/review" element={<ReviewFormPage />} />
                <Route path="/review/:productSlug" element={<ReviewFormPage />} />
                {/* Category and state landing pages. Enumerated from lib/landingPages rather
                    than matched with a "/:slug" wildcard, which would swallow every unknown
                    path and turn 404s into blank landing pages. */}
                {LANDING_PATHS.map((path) => (
                  <Route key={path} path={path} element={<LandingPage />} />
                ))}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
          <Chatbot />
          <FloatingContact />
          <CookieBanner />
        </div>
      </LanguageProvider>
    </Router>
  );
}

