import React from 'react';
import { ensureGoogleIdentity, promptGoogleOneTap } from '../lib/googleIdentity';
import { resolveGoogleClientId } from '../lib/googleAuthConfig';

const PROMPT_KEY = 'gsi_one_tap_prompted_at';
const PROMPT_COOLDOWN_MS = 10 * 60 * 1000;

type GoogleCredentialResponse = {
  credential?: string;
};

export const GoogleOneTap: React.FC = () => {
  React.useEffect(() => {
    let isActive = true;
    if (typeof window === 'undefined') return () => {};

    const shouldSkipPrompt = () => {
      const promptedAtRaw = window.sessionStorage.getItem(PROMPT_KEY);
      if (!promptedAtRaw) return false;
      const promptedAt = Number(promptedAtRaw);
      if (!Number.isFinite(promptedAt) || promptedAt <= 0) return false;
      return Date.now() - promptedAt < PROMPT_COOLDOWN_MS;
    };

    const markPromptAttempt = () => {
      window.sessionStorage.setItem(PROMPT_KEY, String(Date.now()));
    };

    const run = async () => {
      const clientId = await resolveGoogleClientId();
      if (!clientId) return;
      if (shouldSkipPrompt()) return;
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const data = await sessionResponse.json().catch(() => null);
          if (data?.user) {
            markPromptAttempt();
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
            markPromptAttempt();
            window.sessionStorage.setItem('fresh-login', '1');
            window.dispatchEvent(new Event('auth-changed'));
          }
        } catch {
          // Ignore login errors here.
        }
      });

      if (!ready || !isActive) return;
      promptGoogleOneTap((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          markPromptAttempt();
        }
      });
    };

    run();

    return () => {
      isActive = false;
    };
  }, []);

  return null;
};
