export type QueryMode = "market-id" | "custom";

export interface MockQueryInput {
  mode: QueryMode;
  marketId?: string;
  marketQuestion?: string;
}

export interface MockResultItem {
  url: string;
  domain: string;
  label: string;
  reason: string;
  score: number;
}

export interface MockSearchResponse {
  state: "success" | "error" | "no-results";
  results: MockResultItem[];
  errorMessage?: string;
}
