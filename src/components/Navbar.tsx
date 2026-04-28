import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageProvider';
import { languageMeta, LanguageCode } from '../i18n/languages';
import { AdBar } from './AdBar';

export const Navbar: React.FC<{ cartCount: number }> = ({ cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const [isLocaleOpen, setIsLocaleOpen] = React.useState(false);
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
  }, [location.search]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = searchInput.trim();
    setIsMenuOpen(false);
    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
      return;
    }
    navigate('/products');
  };

  const closeLocaleModal = () => setIsLocaleOpen(false);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80'
    )}>
      <AdBar />
      <div className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        isScrolled ? "py-3" : "py-5"
      )}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/img/upated-logo.png"
              title='Ramani Steel House'
              alt="Ramani Steel House"
              width="165"
              height="50"
              className="h-9 sm:h-10 md:h-11 w-auto max-w-[180px] md:max-w-[200px] object-contain"
              loading="eager"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-sm font-semibold text-[#304e58] hover:text-[#314e58] transition-colors">{t('nav.products')}</Link>
            <Link to="/categories" className="text-sm font-semibold text-[#304e58] hover:text-[#314e58] transition-colors">{t('nav.categories')}</Link>
            <Link to="/about" className="text-sm font-semibold text-[#304e58] hover:text-[#314e58] transition-colors">{t('nav.about')}</Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-64 bg-white/80 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm text-[#304e58] focus:ring-2 focus:ring-[#314e58]/20 focus:border-[#314e58] outline-none"
              />
            </form>
            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-[#304e58] hover:bg-slate-50 transition-colors"
            >
              <MapPin size={16} />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase text-slate-500">{t('language.deliverTo')}</span>
                <span className="text-xs font-semibold">{countryFlag} {countryName}</span>
              </span>
            </button>
            <Link to="/cart" className="relative group">
              <ShoppingCart className="text-[#304e58] hover:text-[#314e58] transition-colors" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#314e58] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/products?enquiry=1" className="flex items-center gap-2 bg-[#304e58] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#314e58] transition-colors">
              Request a Quote
            </Link>
            <Link to="/login" className="flex items-center gap-2 border border-[#304e58] text-[#304e58] px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-100 transition-colors">
              <User size={16} />
              {t('nav.login')}
            </Link>
          </div>

          <button className="md:hidden text-[#304e58]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <form onSubmit={submitSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-zinc-100 border border-zinc-200 rounded-full pl-9 pr-4 py-2.5 text-sm text-[#304e58] focus:ring-2 focus:ring-[#314e58]/20 focus:border-[#314e58] outline-none"
              />
            </form>
            <Link to="/products" className="block text-lg font-semibold text-[#304e58]" onClick={() => setIsMenuOpen(false)}>{t('nav.products')}</Link>
            <Link to="/categories" className="block text-lg font-semibold text-[#304e58]" onClick={() => setIsMenuOpen(false)}>{t('nav.categories')}</Link>
            <Link to="/about" className="block text-lg font-semibold text-[#304e58]" onClick={() => setIsMenuOpen(false)}>{t('nav.about')}</Link>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsLocaleOpen(true);
              }}
              className="flex items-center gap-2 text-[#304e58]"
            >
              <MapPin size={18} />
              {t('language.deliverTo')} {countryFlag} {countryName}
            </button>
            <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
              <Link to="/products?enquiry=1" className="bg-[#304e58] text-white py-3 rounded-xl text-center font-semibold" onClick={() => setIsMenuOpen(false)}>Request a Quote</Link>
              <Link to="/cart" className="bg-zinc-100 text-[#304e58] py-3 rounded-xl text-center font-semibold" onClick={() => setIsMenuOpen(false)}>{t('nav.cart')} ({cartCount})</Link>
              <Link to="/login" className="border border-[#304e58] text-[#304e58] py-3 rounded-xl text-center font-semibold" onClick={() => setIsMenuOpen(false)}>{t('nav.login')}</Link>
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
            className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white text-[#304e58] shadow-2xl"
          >
            <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#314e58]/10 text-[#314e58]">
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
                  className="p-2 rounded-full text-slate-500 hover:text-[#304e58] hover:bg-slate-100 transition-colors"
                  aria-label="Close location selector"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 border-b border-zinc-200">
                <label className="block text-xs font-semibold text-[#304e58]">
                  {t('language.countryRegion')}
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[#304e58] focus:ring-2 focus:ring-[#314e58]/20 outline-none"
                  >
                    {countries.length > 0 ? (
                      countries.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.flag} {option.name} ({option.code})
                        </option>
                      ))
                    ) : (
                      <option value={country}>
                        {countryFlag} {countryName} ({country})
                      </option>
                    )}
                  </select>
                </label>

                <label className="block text-xs font-semibold text-[#304e58]">
                  {t('language.postalCode')}
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder={t('language.postalPlaceholder')}
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[#304e58] focus:ring-2 focus:ring-[#314e58]/20 outline-none"
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
                  <label className="block text-xs font-semibold text-[#304e58]">
                    Language
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[#304e58] focus:ring-2 focus:ring-[#314e58]/20 outline-none"
                    >
                      {languageOptions.map(([code, meta]) => (
                        <option key={code} value={code}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-[#304e58]">
                    Currency
                    <div className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-[#304e58]">
                      {currency}
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={closeLocaleModal}
                  className="w-full rounded-xl bg-[#304e58] py-3 text-sm font-semibold text-white hover:bg-[#314e58] transition-colors"
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

