import { useState, useEffect } from 'react';
import { productApi } from '../api';
 
export function useProducts(configId) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
 
  useEffect(() => {
    if (!configId) return;
    setLoading(true);
    productApi.getAll(configId)
      .then(res => setProducts(res.products || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [configId]);
 
  return { products, loading, error };
}
 