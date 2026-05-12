let cachedGoogleClientId: string | null = null;

type GoogleConfigResponse = {
  enabled?: boolean;
  clientId?: string;
};

export const resolveGoogleClientId = async () => {
  if (cachedGoogleClientId) {
    return cachedGoogleClientId;
  }

  const viteClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  if (viteClientId) {
    cachedGoogleClientId = viteClientId;
    return cachedGoogleClientId;
  }

  try {
    const response = await fetch("/api/auth/google/config");
    if (!response.ok) {
      return "";
    }
    const payload = (await response.json()) as GoogleConfigResponse;
    const resolved = (payload.clientId || "").trim();
    if (payload.enabled && resolved) {
      cachedGoogleClientId = resolved;
      return cachedGoogleClientId;
    }
  } catch {
    // Ignore config fetch errors and fall back to empty string.
  }

  return "";
};

