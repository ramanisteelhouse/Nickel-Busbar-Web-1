import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/Chatbot';
import { CookieBanner } from './components/CookieBanner';
import { LanguageProvider } from './i18n/LanguageProvider';
import { FloatingContact } from './components/FloatingContact';
import { AdPopup } from './components/AdPopup';
import { GoogleOneTap } from './components/GoogleOneTap';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AboutPage } from './pages/AboutPage';
import { Product, CartItem } from './types';

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListingPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage onAddToCart={addToCart} />} />
              <Route path="/categories" element={<ProductListingPage />} />
              <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} />} />
              <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>

          <Chatbot />
          <FloatingContact />
          <CookieBanner />
        </div>
      </LanguageProvider>
    </Router>
  );
}

