import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageProvider';
import { languageMeta, LanguageCode } from '../i18n/languages';
import { AdBar } from './AdBar';
import type { Category } from '../types';

export const Navbar: React.FC<{ cartCount: number }> = ({ cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const [searchSuggestions, setSearchSuggestions] = React.useState<Array<{ id: number; slug: string; name: string; category_name?: string }>>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = React.useState(false);
  const [isLocaleOpen, setIsLocaleOpen] = React.useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(false);
  const [countrySearchInput, setCountrySearchInput] = React.useState('');
  const [categoryLinks, setCategoryLinks] = React.useState<Category[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    language,
    setLanguage,
    t,
    currency,
    country,
    countryName,
    countryFlag,
    countries,
    setCountry,
    postalCode,
    setPostalCode,
    postalStatus,
    postalDetails,
  } = useLanguage();
  const languageOptions = Object.entries(languageMeta) as [LanguageCode, typeof languageMeta[LanguageCode]][];

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchInput(params.get('search') ?? '');
    setShowSearchSuggestions(false);
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    setCountrySearchInput(countryName ? `${countryFlag} ${countryName} (${country})` : country);
  }, [country, countryName, countryFlag]);

  React.useEffect(() => {
    const query = searchInput.trim();
    if (query.length < 1) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/products/suggestions?q=${encodeURIComponent(query)}&limit=7`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load suggestions');
          }
          return response.json();
        })
        .then((data) => {
          const suggestions = Array.isArray(data) ? data : [];
          setSearchSuggestions(suggestions);
          setShowSearchSuggestions(suggestions.length > 0);
        })
        .catch(() => {
          setSearchSuggestions([]);
          setShowSearchSuggestions(false);
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchInput]);

  React.useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategoryLinks(data.slice(0, 8));
        }
      })
      .catch(() => {
        setCategoryLinks([]);
      });
  }, []);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isMenuOpen || isLocaleOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isLocaleOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = searchInput.trim();
    setShowSearchSuggestions(false);
    setIsMenuOpen(false);
    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
      return;
    }
    navigate('/products');
  };

  const selectSuggestion = (slug: string, name: string) => {
    setSearchInput(name);
    setShowSearchSuggestions(false);
    setIsMenuOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleCountryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCountrySearchInput(value);
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    const normalizedNamePart = normalized.split('(')[0]?.trim() ?? normalized;
    const matchedCountry = countries.find((option) =>
      option.name.toLowerCase().startsWith(normalized) ||
      option.name.toLowerCase() === normalizedNamePart ||
      option.code.toLowerCase() === normalized ||
      `${option.flag} ${option.name}`.toLowerCase().startsWith(normalizedNamePart)
    );
    if (matchedCountry) {
      setCountry(matchedCountry.code);
    }
  };

  const closeLocaleModal = () => setIsLocaleOpen(false);

  const navLinkClass = (path: string) => cn(
    'text-sm font-semibold transition-colors',
    location.pathname === path ? 'text-brand' : 'text-brand/75 hover:text-brand'
  );

  const primaryLinks: Array<{ to: string; label: string }> = [
    { to: '/products', label: t('nav.products') },
    { to: '/about', label: t('nav.about') },
    { to: '/calculator', label: 'Calculator' },
    { to: '/blog', label: 'Blog' },
    { to: '/export-enquiry', label: 'Export' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80'
    )}>
      <AdBar />
      <div className={cn(
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        isScrolled ? 'py-3' : 'py-4'
      )}>
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/img/icon-logo.jpg"
              title="Ramani Steel House"
              alt="Ramani Steel House"
              width="165"
              height="50"
              className="h-9 sm:h-10 w-auto max-w-[160px] object-contain"
              loading="eager"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <Link
                to="/categories"
                className={cn(navLinkClass('/categories'), 'inline-flex items-center gap-1')}
              >
                {t('nav.categories')}
                <ChevronDown size={14} className={cn('transition-transform', isCategoriesOpen && 'rotate-180')} />
              </Link>
              <AnimatePresence>
                {isCategoriesOpen && categoryLinks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    {categoryLinks.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="block rounded-xl px-4 py-2.5 text-sm font-medium text-brand/85 transition-colors hover:bg-brand-surface hover:text-brand"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {primaryLinks.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <form onSubmit={submitSearch} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSearchSuggestions(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowSearchSuggestions(false), 120);
                }}
                placeholder={t('nav.searchPlaceholder')}
                className="w-40 xl:w-64 bg-white/80 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm text-brand focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all focus:w-64"
              />
              {showSearchSuggestions && searchSuggestions.length > 0 ? (
                <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => selectSuggestion(item.slug, item.name)}
                      className="w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-brand hover:bg-slate-50 last:border-b-0"
                    >
                      <span className="block font-semibold">{item.name}</span>
                      {item.category_name ? (
                        <span className="text-[10px] text-slate-500">{item.category_name}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </form>
            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-brand hover:bg-slate-50 transition-colors"
            >
              <MapPin size={16} />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase text-slate-500">{t('language.deliverTo')}</span>
                <span className="text-xs font-semibold">{countryFlag} {countryName}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className="xl:hidden flex items-center justify-center rounded-full border border-slate-200 p-2.5 text-brand hover:bg-slate-50 transition-colors"
              aria-label={t('language.deliverTo')}
            >
              <MapPin size={18} />
            </button>
            <Link to="/cart" className="relative flex items-center justify-center rounded-full p-2.5 hover:bg-slate-50 transition-colors" aria-label={t('nav.cart')}>
              <ShoppingCart className="text-brand" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/login" className="flex items-center justify-center rounded-full border border-brand/30 p-2.5 text-brand hover:bg-slate-50 transition-colors" aria-label={t('nav.login')}>
              <User size={18} />
            </Link>
            <Link to="/products?enquiry=1" className="flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap">
              Request a Quote
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/cart" className="relative flex items-center justify-center rounded-full p-2 text-brand" aria-label={t('nav.cart')}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="flex items-center justify-center rounded-full p-2 text-brand"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden max-h-[calc(100vh-64px)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg"
          >
            <div className="px-4 py-5 space-y-5">
              <form onSubmit={submitSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onFocus={() => {
                    if (searchSuggestions.length > 0) setShowSearchSuggestions(true);
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setShowSearchSuggestions(false), 120);
                  }}
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-3 text-sm text-brand focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                />
                {showSearchSuggestions && searchSuggestions.length > 0 ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={() => selectSuggestion(item.slug, item.name)}
                        className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-brand hover:bg-slate-50 last:border-b-0"
                      >
                        <span className="block font-semibold">{item.name}</span>
                        {item.category_name ? (
                          <span className="text-xs text-slate-500">{item.category_name}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </form>

              <div className="grid grid-cols-2 gap-2">
                <Link to="/categories" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold text-brand bg-slate-50 hover:bg-slate-100 transition-colors">{t('nav.categories')}</Link>
                {primaryLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-semibold text-brand bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {categoryLinks.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Shop by category</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryLinks.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${encodeURIComponent(category.slug)}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white hover:border-brand transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLocaleOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-brand"
              >
                <MapPin size={18} />
                {t('language.deliverTo')}: {countryFlag} {countryName} · {currency}
              </button>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-full border border-brand text-brand py-3 text-sm font-semibold">
                  <User size={16} />
                  {t('nav.login')}
                </Link>
                <Link to="/products?enquiry=1" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center rounded-full bg-brand text-white py-3 text-sm font-semibold">
                  Request a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLocaleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          >
            <div className="absolute inset-0 bg-black/40" onClick={closeLocaleModal} />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white text-brand shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t('language.specifyLocation')}</p>
                    <p className="text-xs text-slate-500">{t('language.shippingNote')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeLocaleModal}
                  className="p-2 rounded-full text-slate-500 hover:text-brand hover:bg-slate-100 transition-colors"
                  aria-label="Close location selector"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 border-b border-slate-200">
                <label className="block text-xs font-semibold text-brand">
                  {t('language.countryRegion')}
                  <input
                    list="navbar-country-options"
                    value={countrySearchInput}
                    onChange={handleCountryInputChange}
                    placeholder="Type country name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand focus:ring-2 focus:ring-brand/20 outline-none"
                  />
                  <datalist id="navbar-country-options">
                    {countries.length > 0 ? (
                      countries.map((option) => (
                        <option key={option.code} value={`${option.flag} ${option.name} (${option.code})`} />
                      ))
                    ) : (
                      <option value={`${countryFlag} ${countryName} (${country})`} />
                    )}
                  </datalist>
                </label>

                <label className="block text-xs font-semibold text-brand">
                  {t('language.postalCode')}
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder={t('language.postalPlaceholder')}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand focus:ring-2 focus:ring-brand/20 outline-none"
                  />
                </label>
                {postalStatus === 'checking' && (
                  <p className="text-xs text-slate-500">{t('language.checkingLocation')}</p>
                )}
                {postalStatus === 'valid' && (
                  <p className="text-xs text-emerald-600">
                    {postalDetails?.place || postalDetails?.state
                      ? `${postalDetails?.place ?? ''}${postalDetails?.place && postalDetails?.state ? ', ' : ''}${postalDetails?.state ?? ''}`
                      : t('language.locationVerified')}
                  </p>
                )}
                {postalStatus === 'invalid' && postalCode && (
                  <p className="text-xs text-red-600">{t('language.invalidPostal', { country: countryName })}</p>
                )}
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-semibold text-brand">
                    Language
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand focus:ring-2 focus:ring-brand/20 outline-none"
                    >
                      {languageOptions.map(([code, meta]) => (
                        <option key={code} value={code}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-brand">
                    Currency
                    <div className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-brand">
                      {currency}
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={closeLocaleModal}
                  className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
