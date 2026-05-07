/**
 * Browser-visible recommendation API base URL.
 * Reads `process.env.NEXT_PUBLIC_*` on each call so Vitest can `vi.stubEnv`.
 * Set in `frontend/.env.local` (see `.env.example`).
 */

export function getRecommendationsApiBaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  return raw.replace(/\/$/, "");
}

export function isRecommendationsApiConfigured(): boolean {
  return Boolean(getRecommendationsApiBaseUrl());
}
