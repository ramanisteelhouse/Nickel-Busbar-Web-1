import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/Chatbot';
import { CookieBanner } from './components/CookieBanner';
import { LanguageProvider } from './i18n/LanguageProvider';
import { FloatingContact } from './components/FloatingContact';
import { AdPopup } from './components/AdPopup';
import { GoogleOneTap } from './components/GoogleOneTap';
import { Footer } from './components/Footer';
import { Analytics } from './components/Analytics';
import { BackNavButton } from './components/BackNavButton';
import { ToastContainer, showToast } from './components/Toast';
import { getOrCreateSessionId } from './lib/utils';
import { LANDING_PATHS } from './lib/landingPages';
import { Product, CartItem } from './types';

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
const BlogNickelStripsLithiumPage = React.lazy(() => import('./pages/BlogNickelStripsLithiumPage').then((m) => ({ default: m.BlogNickelStripsLithiumPage })));
const CalculatorPage = React.lazy(() => import('./pages/CalculatorPage').then((m) => ({ default: m.CalculatorPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
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
    return parsed.filter(
      (item): item is CartItem =>
        item && typeof item.id === 'number' && typeof item.name === 'string' &&
        Number.isFinite(Number(item.price)) && Number.isFinite(Number(item.quantity))
    );
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

const mergeCartItems = (localItems: CartItem[], remoteItems: CartItem[]) => {
  const merged = new Map<number, CartItem>();

  remoteItems.forEach((item) => {
    merged.set(item.id, { ...item });
  });

  localItems.forEach((item) => {
    const existing = merged.get(item.id);
    if (existing) {
      merged.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      merged.set(item.id, { ...item });
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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
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

          <main style={{ paddingTop: 'var(--adbar-height, 0px)' }}>
            <BackNavButton />
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage onAddToCart={addToCart} />} />
                <Route path="/categories" element={<ProductListingPage />} />
                <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} />} />
                <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/export-enquiry" element={<ExportEnquiryPage />} />
                <Route path="/blog" element={<BlogListingPage />} />
                <Route path="/blog/nickel-strips-lithium-batteries" element={<BlogNickelStripsLithiumPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
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

