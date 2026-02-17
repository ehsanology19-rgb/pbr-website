import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data from Supabase
 * @param {Function} fetchFn - Async function that fetches data
 * @param {Array} deps - Dependencies array for re-fetching
 * @param {any} fallbackData - Fallback data while loading or on error
 */
export function useSupabaseQuery(fetchFn, deps = [], fallbackData = null) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        console.error('Supabase query error:', err);
        if (isMounted) {
          setError(err);
          // Keep fallback data on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return { data, loading, error, refetch: () => {} };
}

/**
 * Custom hook for mutations (insert, update, delete)
 * @param {Function} mutationFn - Async function that performs the mutation
 */
export function useSupabaseMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(...args);
      setData(result);
      return { data: result, error: null };
    } catch (err) {
      console.error('Supabase mutation error:', err);
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}
