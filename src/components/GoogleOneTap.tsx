import React from 'react';
import { ensureGoogleIdentity, promptGoogleOneTap } from '../lib/googleIdentity';

const PROMPT_KEY = 'gsi_one_tap_prompted';

type GoogleCredentialResponse = {
  credential?: string;
};

export const GoogleOneTap: React.FC = () => {
  React.useEffect(() => {
    let isActive = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId || typeof window === 'undefined') return () => {};

    const run = async () => {
      if (window.sessionStorage.getItem(PROMPT_KEY) === '1') return;
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const data = await sessionResponse.json().catch(() => null);
          if (data?.user) {
            window.sessionStorage.setItem(PROMPT_KEY, '1');
            return;
          }
        }
      } catch {
        // Ignore session check errors.
      }

      const ready = await ensureGoogleIdentity(clientId, async (response: GoogleCredentialResponse) => {
        if (!response.credential) return;
        try {
          const loginResponse = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          });
          if (loginResponse.ok) {
            window.sessionStorage.setItem(PROMPT_KEY, '1');
            window.location.reload();
          }
        } catch {
          // Ignore login errors here.
        }
      });

      if (!ready || !isActive) return;
      promptGoogleOneTap((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          window.sessionStorage.setItem(PROMPT_KEY, '1');
        }
      });
      window.sessionStorage.setItem(PROMPT_KEY, '1');
    };

    run();

    return () => {
      isActive = false;
    };
  }, []);

  return null;
};