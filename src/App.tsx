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
import { BackNavButton } from './components/BackNavButton';
import { Product, CartItem } from './types';

const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProductListingPage = React.lazy(() => import('./pages/ProductListingPage').then((m) => ({ default: m.ProductListingPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const BlogListingPage = React.lazy(() => import('./pages/BlogListingPage').then((m) => ({ default: m.BlogListingPage })));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const CalculatorPage = React.lazy(() => import('./pages/CalculatorPage').then((m) => ({ default: m.CalculatorPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

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
        geo: { timestamp: new Date().toISOString() }
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
  const [cart, setCart] = useState<CartItem[]>([]);
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
        setSessionUser(data?.user ?? null);
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
          <GoogleOneTap />
          <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
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
                <Route path="/blog" element={<BlogListingPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
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

