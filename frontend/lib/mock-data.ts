import type { MockResultItem } from "@/lib/types";

export const MOCK_RESULTS_BY_MARKET_ID: Record<string, MockResultItem[]> = {
  "540816": [
    {
      url: "https://news.google.com/rss/articles/example-1",
      domain: "news.google.com",
      label: "Google News aggregation",
      reason: "High-signal current coverage around the market topic.",
      score: 0.91,
    },
  ],
};
