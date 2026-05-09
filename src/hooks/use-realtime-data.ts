/**
 * Custom hook for real-time data fetching
 * Provides smooth auto-refresh without flickering
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealtimeDataOptions<T> {
  fetchFn: () => Promise<T>;
  interval?: number; // milliseconds
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseRealtimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useRealtimeData<T>({
  fetchFn,
  interval = 5000,
  enabled = true,
  onSuccess,
  onError,
}: UseRealtimeDataOptions<T>): UseRealtimeDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const fetchFnRef = useRef(fetchFn);

  // Always keep fetchFn ref up to date
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchData = useCallback(async (isInitial = false) => {
    if (!enabled) return;
    
    try {
      if (isInitial) setLoading(true);
      
      const result = await fetchFnRef.current();
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        setLastUpdated(new Date());
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current && isInitial) {
        setLoading(false);
      }
    }
  }, [enabled, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Setup interval for auto-refresh
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      fetchData(false);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}
