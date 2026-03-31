import { useState, useCallback } from 'react';
import { sessionApi } from '../api';
 
export function useSessionManager() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
 
  const fetchStatus = useCallback(async (sessionId) => {
    setLoading(true); setError(null);
    try {
      const res = await sessionApi.getStatus(sessionId);
      return res.session;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const openSession = useCallback(async (sessionId) => {
    setLoading(true); setError(null);
    try {
      await sessionApi.openSession(sessionId);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const closeSession = useCallback(async (sessionId, notes) => {
    setLoading(true); setError(null);
    try {
      await sessionApi.closeSession(sessionId, notes);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
 
  return { fetchStatus, openSession, closeSession, loading, error };
}