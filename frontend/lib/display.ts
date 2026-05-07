export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function shortenUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}
