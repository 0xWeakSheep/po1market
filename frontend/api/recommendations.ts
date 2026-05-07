import { getRecommendationsApiBaseUrl } from "@/config/recommendation";
import type {
  RecommendationApiJsonResponse,
  RecommendationsQueryInput,
  RecommendationsRunState,
  RecommendedSourceRow,
} from "@/types/recommendation";
import { publicHostname } from "@/utils/display";

export { getRecommendationsApiBaseUrl, isRecommendationsApiConfigured } from "@/config/recommendation";

/**
 * POST /api/v1/recommendations — caller supplies base URL (trimmed, no trailing slash).
 */
export async function fetchRecommendations(
  input: RecommendationsQueryInput,
  baseUrl: string,
): Promise<RecommendationsRunState> {
  const body: Record<string, string> = {};
  if (input.mode === "market-id") {
    if (!input.marketId?.trim()) {
      return { state: "error", results: [], errorMessage: "Market ID is required." };
    }
    body.market_id = input.marketId.trim();
  } else {
    if (!input.marketQuestion?.trim()) {
      return { state: "error", results: [], errorMessage: "Market question is required." };
    }
    body.market_question = input.marketQuestion.trim();
  }

  try {
    const res = await fetch(`${baseUrl}/api/v1/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMessage = `API error (${res.status})`;
      try {
        const errJson = (await res.json()) as { message?: string | string[] };
        if (typeof errJson.message === "string") {
          errorMessage = errJson.message;
        } else if (Array.isArray(errJson.message)) {
          errorMessage = errJson.message.join("; ");
        }
      } catch {
        /* keep default */
      }
      return { state: "error", results: [], errorMessage };
    }

    const data = (await res.json()) as RecommendationApiJsonResponse;
    const sources = data.recommended_sources ?? [];
    if (!sources.length) {
      return { state: "no-results", results: [] };
    }

    const results: RecommendedSourceRow[] = sources.map((s) => {
      const host = publicHostname(s.url);
      return {
        url: s.url,
        domain: host,
        label: host,
        reason: "Returned by recommendation API.",
        score: typeof s.score === "number" ? s.score : 0,
      };
    });

    return { state: "success", results };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { state: "error", results: [], errorMessage: message };
  }
}

const MISSING_API_MESSAGE =
  "Recommendation API is not configured. Set NEXT_PUBLIC_API_BASE_URL in frontend/.env.local (see .env.example).";

/** Query Console: reads env base URL or returns a configuration error. */
export async function runRecommendationsQuery(
  input: RecommendationsQueryInput,
): Promise<RecommendationsRunState> {
  const base = getRecommendationsApiBaseUrl();
  if (!base) {
    return { state: "error", results: [], errorMessage: MISSING_API_MESSAGE };
  }
  return fetchRecommendations(input, base);
}
