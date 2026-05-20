type Entry = {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
};

const attempts = new Map<string, Entry>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

export function isBlocked(key: string) {
  const entry = attempts.get(key);
  if (!entry) return { blocked: false, retryAfter: 0 };
  if (!entry.blockedUntil) return { blocked: false, retryAfter: 0 };
  const now = Date.now();
  if (now >= entry.blockedUntil) {
    attempts.delete(key);
    return { blocked: false, retryAfter: 0 };
  }
  return { blocked: true, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
}

export function recordFailure(key: string) {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  const nextCount = existing.count + 1;
  const blockedUntil = nextCount >= MAX_ATTEMPTS ? now + BLOCK_MS : existing.blockedUntil;
  attempts.set(key, {
    count: nextCount,
    firstAttemptAt: existing.firstAttemptAt,
    blockedUntil,
  });
}

export function resetAttempts(key: string) {
  attempts.delete(key);
}
