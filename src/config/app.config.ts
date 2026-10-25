/** App-wide constants (non-secret). */
export const APP_NAME = "Good Food";
export const APP_TAGLINE = "Les repas de qualité, à côté de chez vous";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? window.location.origin : "https://api.c-mbk.fr");

/** Polling interval for the franchisee back-office lists (ms). */
export const BACKOFFICE_REFETCH_MS = 10_000;
