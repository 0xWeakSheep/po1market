export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function shortenUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export function publicHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return shortenUrl(url).split("/")[0] ?? url;
  }
}
