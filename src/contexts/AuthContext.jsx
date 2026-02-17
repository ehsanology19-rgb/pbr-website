import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const fetchAdminStatus = useCallback(async (userId) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    setAdminLoading(true);
    try {
      const admin = await checkIsAdmin(userId);
      setIsAdmin(admin);
    } catch (err) {
      console.error('[AuthContext] Error checking admin status:', err);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      console.error('[AuthContext] Supabase not configured.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchAdminStatus(currentUser.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('[AuthContext] Failed to get session:', err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchAdminStatus(currentUser.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchAdminStatus]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    adminLoading,
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
