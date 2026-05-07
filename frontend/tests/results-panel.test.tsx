import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchRecommendations } from "@/api/recommendations";

describe("fetchRecommendations", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          recommended_sources: [{ url: "https://news.example.com/article", score: 0.91 }],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps API sources to UI rows", async () => {
    const result = await fetchRecommendations(
      { mode: "market-id", marketId: "540816" },
      "http://127.0.0.1:3001",
    );

    expect(result.state).toBe("success");
    if (result.state !== "success") throw new Error("expected success");
    expect(result.results[0]?.domain).toBe("news.example.com");
    expect(result.results[0]?.score).toBe(0.91);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "http://127.0.0.1:3001/api/v1/recommendations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ market_id: "540816" }),
      }),
    );
  });
});
