import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageProvider';
import { ensureGoogleIdentity, renderGoogleButton } from '../lib/googleIdentity';
import { resolveGoogleClientId } from '../lib/googleAuthConfig';

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type GoogleCredentialResponse = {
  credential?: string;
};

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [currentUser, setCurrentUser] = React.useState<SessionUser | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const googleButtonRef = React.useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  React.useEffect(() => {
    let isActive = true;

    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => {
        if (!isActive) return;
        setCurrentUser(data?.user ?? null);
      })
      .catch(() => {
        if (!isActive) return;
        setCurrentUser(null);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleGoogleCredential = React.useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) return;
    setIsSubmitting(true);
    setError('');

    try {
      const loginResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await loginResponse.json().catch(() => ({}));
      if (!loginResponse.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : t('login.authError'));
      }
      setCurrentUser(data.user ?? null);
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/');
    } catch (googleError) {
      setError(googleError instanceof Error ? googleError.message : t('login.authError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, t]);

  React.useEffect(() => {
    let isActive = true;
    if (!googleButtonRef.current || currentUser) return () => {};

    resolveGoogleClientId()
      .then((clientId) => {
        if (!clientId || !isActive || !googleButtonRef.current) return;
        return ensureGoogleIdentity(clientId, handleGoogleCredential).then((ready) => {
          if (!ready || !isActive || !googleButtonRef.current) return;
          renderGoogleButton(googleButtonRef.current as HTMLElement, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
          });
        });
      })
      .catch(() => {
        // Ignore script load errors.
      });

    return () => {
      isActive = false;
    };
  }, [currentUser, handleGoogleCredential]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isLogin
            ? { email, password }
            : { name: fullName.trim(), email, password }
        ),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : t('login.authError'));
      }

      setCurrentUser(data.user ?? null);
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t('login.authError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setPassword('');
      window.dispatchEvent(new Event('auth-changed'));
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : t('login.authError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center px-4 bg-zinc-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-zinc-100 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">I</div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            {isLogin ? t('login.welcome') : t('login.create')}
          </h1>
          <p className="text-zinc-500 mt-2">
            {isLogin ? t('login.welcomeSub') : t('login.createSub')}
          </p>
        </div>

        {currentUser ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            <p className="font-semibold">{currentUser.name}</p>
            <p className="mt-1 text-xs text-emerald-800">{t('login.loggedInAs', { email: currentUser.email })}</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSubmitting}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? t('login.processing') : t('login.logout')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div ref={googleButtonRef} />
              <span className="text-xs uppercase tracking-widest text-zinc-400">or</span>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">{t('login.fullName')}</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">{t('login.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('login.password')}</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900">{t('login.forgot')}</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                className="w-full bg-[#304e58] text-white py-4 rounded-full font-bold hover:bg-[#314e58] transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('login.processing') : isLogin ? t('login.signIn') : t('login.create')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </>
        )}

        <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
          <p className="text-sm text-zinc-500">
            {isLogin ? t('login.switchToSignUp') : t('login.switchToSignIn')}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-900 font-bold hover:underline"
              type="button"
              disabled={isSubmitting || Boolean(currentUser)}
            >
              {isLogin ? t('login.signUp') : t('login.signIn')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

