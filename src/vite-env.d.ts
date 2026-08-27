/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** GA4 property, e.g. G-XXXXXXXXXX. Unset means no analytics script is loaded at all. */
  readonly VITE_GA4_MEASUREMENT_ID?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
