let cachedRate = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const safeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

export async function getUsdInrRate() {
  const now = Date.now();
  if (cachedRate && now - cachedAtMs < CACHE_TTL_MS) {
    return cachedRate;
  }

  // Try multiple providers in order
  const providers = [
    async () => {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('er-api http error');
      const json = await res.json();
      const rate = json?.rates?.INR;
      return safeNumber(rate, NaN);
    },
    async () => {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR');
      if (!res.ok) throw new Error('exchangerate.host http error');
      const json = await res.json();
      const rate = json?.rates?.INR;
      return safeNumber(rate, NaN);
    }
  ];

  for (const provider of providers) {
    try {
      const rate = await provider();
      if (Number.isFinite(rate) && rate > 0) {
        cachedRate = rate;
        cachedAtMs = now;
        return rate;
      }
    } catch (_) {
      // try next
    }
  }

  // Fallback to env or hardcoded
  const fallback = safeNumber(process.env.USD_INR_RATE, 83);
  cachedRate = fallback;
  cachedAtMs = now;
  return fallback;
}


