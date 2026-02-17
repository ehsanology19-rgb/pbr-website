import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserRole, clearRoleCache } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: fetch role from DB, always skip cache on initial load / auth change
  const fetchRole = useCallback(async (userId, email, source) => {
    try {
      // Always fetch fresh from DB (skipCache) so role changes are picked up
      const r = await getUserRole(userId, { skipCache: true });
      console.log(`[AuthContext] ${source} - role: ${r} for ${email}`);
      setRole(r ?? 'student');
    } catch (err) {
      console.error(`[AuthContext] ${source} - error fetching role, defaulting to student:`, err);
      setRole('student');
    }
  }, []);

  useEffect(() => {
    // Check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      console.error('[AuthContext] Supabase not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
      setLoading(false);
      return;
    }

    // Clear any stale cache from previous sessions
    clearRoleCache();

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
        setLoading(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        console.log('[AuthContext] User session found:', currentUser.email, 'ID:', currentUser.id);
        await fetchRole(currentUser.id, currentUser.email, 'getSession');
      } else {
        console.log('[AuthContext] No user session');
        setRole(null);
      }
    }).catch((err) => {
      console.error('[AuthContext] Failed to get session (network error):', err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        console.log('[AuthContext] Auth state changed, user:', currentUser.email);
        await fetchRole(currentUser.id, currentUser.email, 'onAuthStateChange');
      } else {
        console.log('[AuthContext] Auth state changed, no user');
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  // Fallback: if role is still null after 5s, try once more then set student
  useEffect(() => {
    if (!user || role !== null) return;
    const t = setTimeout(async () => {
      console.warn('[AuthContext] Role still null after 5s, retrying...');
      await fetchRole(user.id, user.email, 'fallback retry');
    }, 5000);
    return () => clearTimeout(t);
  }, [user, role, fetchRole]);

  // Force refresh role from DB (useful after admin changes)
  const refreshRole = useCallback(async () => {
    if (!user) return;
    clearRoleCache(user.id);
    await fetchRole(user.id, user.email, 'manual refresh');
  }, [user, fetchRole]);

  const value = {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isAuthenticated: !!user,
    refreshRole,
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
