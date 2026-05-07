import { describe, expect, it } from "vitest";

import { runMockSearch } from "@/lib/mock-search";

describe("runMockSearch", () => {
  it("returns success for a known mock market id", async () => {
    const result = await runMockSearch({ mode: "market-id", marketId: "540816" });

    expect(result.state).toBe("success");
    expect(result.results[0]?.domain).toBeTruthy();
  });
});
