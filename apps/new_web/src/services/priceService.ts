/**
 * Simple XLM price fetcher using CoinGecko with in-memory caching.
 */
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd';

type Cache = {
  price: number | null;
  timestamp: number;
  error?: string;
};

const cache: Cache = {
  price: null,
  timestamp: 0,
  error: undefined,
};

const CACHE_TTL_MS = 60_000; // 60s cache to avoid rate limit

export async function getXlmPriceUsd(): Promise<number> {
  const now = Date.now();
  if (cache.price && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.price;
  }

  try {
    const res = await fetch(COINGECKO_URL);
    if (!res.ok) {
      throw new Error(`CoinGecko error ${res.status}`);
    }
    const data = await res.json();
    const price = Number(data?.stellar?.usd);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Invalid price payload');
    }
    cache.price = price;
    cache.timestamp = now;
    cache.error = undefined;
    return price;
  } catch (error: any) {
    cache.error = error?.message || 'Failed to fetch price';
    throw error;
  }
}

export function getCachedXlmPrice(): { price: number | null; error?: string } {
  return { price: cache.price, error: cache.error };
}
