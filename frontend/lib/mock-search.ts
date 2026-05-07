import { MOCK_RESULTS_BY_MARKET_ID } from "@/lib/mock-data";
import type { MockQueryInput, MockSearchResponse } from "@/lib/types";

export async function runMockSearch(input: MockQueryInput): Promise<MockSearchResponse> {
  if (input.mode === "market-id") {
    if (!input.marketId?.trim()) {
      return { state: "error", results: [], errorMessage: "Market ID is required." };
    }

    const results = MOCK_RESULTS_BY_MARKET_ID[input.marketId] ?? [];
    return results.length ? { state: "success", results } : { state: "no-results", results: [] };
  }

  if (!input.marketQuestion?.trim()) {
    return { state: "error", results: [], errorMessage: "Market question is required." };
  }

  return {
    state: "success",
    results: [
      {
        url: "https://example.com/custom-market-source",
        domain: "example.com",
        label: input.marketQuestion,
        reason: "Prototype result generated from the custom market flow.",
        score: 0.84,
      },
    ],
  };
}
