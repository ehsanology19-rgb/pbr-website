import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const lastCheckedId = useRef(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      console.error('[AuthContext] Supabase not configured.');
      setAuthReady(true);
      setAdminChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
      }
      setUser(session?.user ?? null);
      setAuthReady(true);
    }).catch((err) => {
      console.error('[AuthContext] Failed to get session:', err);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = user?.id ?? null;

    if (!userId) {
      setIsAdmin(false);
      setAdminChecked(true);
      lastCheckedId.current = null;
      return;
    }

    if (lastCheckedId.current === userId) {
      return;
    }

    let cancelled = false;
    setAdminChecked(false);

    checkIsAdmin(userId)
      .then((result) => {
        if (cancelled) return;
        lastCheckedId.current = userId;
        setIsAdmin(result);
        setAdminChecked(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[AuthContext] Admin check failed:', err);
        lastCheckedId.current = userId;
        setIsAdmin(false);
        setAdminChecked(true);
      });

    return () => { cancelled = true; };
  }, [user]);

  const loading = !authReady || (!!user && !adminChecked);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    adminLoading: !!user && !adminChecked,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
