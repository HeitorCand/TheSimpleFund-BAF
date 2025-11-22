import { useEffect, useState, useCallback } from 'react';
import { getCachedXlmPrice, getXlmPriceUsd } from '../services/priceService';

export const useXlmPrice = () => {
  const cached = getCachedXlmPrice();
  const [price, setPrice] = useState<number | null>(cached.price);
  const [loading, setLoading] = useState<boolean>(!cached.price);
  const [error, setError] = useState<string | undefined>(cached.error);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const value = await getXlmPriceUsd();
      setPrice(value);
      setError(undefined);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch XLM price');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!price) {
      fetchPrice();
    }
  }, [price, fetchPrice]);

  return {
    price,
    loading,
    error,
    refresh: fetchPrice,
  };
};
