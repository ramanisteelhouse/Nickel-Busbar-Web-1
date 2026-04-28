type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  id: {
    initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
    renderButton: (container: HTMLElement, options: Record<string, unknown>) => void;
    prompt: (momentListener?: (notification: unknown) => void) => void;
  };
};

type GoogleWindow = Window & {
  google?: { accounts?: GoogleAccounts };
  __gsiInitialized?: boolean;
  __gsiCallback?: (response: GoogleCredentialResponse) => void;
};

const SCRIPT_ID = 'google-identity-service';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const getGoogleWindow = () => window as GoogleWindow;

export const loadGoogleIdentityScript = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  const googleWindow = getGoogleWindow();
  if (googleWindow.google?.accounts?.id) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Identity script failed to load.')), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Identity script failed to load.'));
    document.head.appendChild(script);
  });
};

export const ensureGoogleIdentity = async (
  clientId: string,
  callback: (response: GoogleCredentialResponse) => void
) => {
  if (!clientId || typeof window === 'undefined') return false;
  await loadGoogleIdentityScript();
  const googleWindow = getGoogleWindow();
  const google = googleWindow.google;
  if (!google?.accounts?.id) return false;

  googleWindow.__gsiCallback = callback;
  if (!googleWindow.__gsiInitialized) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        googleWindow.__gsiCallback?.(response);
      },
    });
    googleWindow.__gsiInitialized = true;
  }

  return true;
};

export const renderGoogleButton = (container: HTMLElement, options: Record<string, unknown>) => {
  const googleWindow = getGoogleWindow();
  googleWindow.google?.accounts?.id?.renderButton(container, options);
};

export const promptGoogleOneTap = (momentListener?: (notification: unknown) => void) => {
  const googleWindow = getGoogleWindow();
  googleWindow.google?.accounts?.id?.prompt(momentListener);
};
