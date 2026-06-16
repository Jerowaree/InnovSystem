const RATE_LIMIT = 5; // attempts
const RATE_WINDOW = 60 * 1000; // 1 minute

export function canSubmit(key: string) {
  try {
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((t: number) => now - t < RATE_WINDOW);
    return { allowed: filtered.length < RATE_LIMIT, timestamps: filtered };
  } catch (e) {
    return { allowed: true, timestamps: [] };
    console.error("Error checking rate limit", e);
  }
}

export function pushAttempt(key: string) {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((t: number) => now - t < RATE_WINDOW);
    filtered.push(now);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error pushing rate limit attempt", e);
  }
}
