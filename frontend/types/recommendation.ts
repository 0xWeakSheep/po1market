/**
 * Recommendation API — shared between the Query Console UI and the browser HTTP client.
 * Backend (Nest, `backend/`): POST /api/v1/recommendations → { recommended_sources: { url, score }[] }
 */

export type QueryMode = "market-id" | "custom";

/** Form → request body mapping uses snake_case on the wire (Nest). */
export type RecommendationsQueryInput = {
  mode: QueryMode;
  marketId?: string;
  marketQuestion?: string;
};

/** One row in the results list (UI + mapped from API). */
export type RecommendedSourceRow = {
  url: string;
  domain: string;
  label: string;
  reason: string;
  score: number;
};

export type RecommendationsRunState =
  | { state: "success"; results: RecommendedSourceRow[] }
  | { state: "no-results"; results: [] }
  | { state: "error"; results: []; errorMessage: string };

export type RecommendationApiJsonResponse = {
  recommended_sources: Array<{ url: string; score: number }>;
};
