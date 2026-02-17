import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getUserRole } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        console.log('[AuthContext] User session found:', session.user.email, 'ID:', session.user.id);
        try {
          const r = await getUserRole(session.user.id);
          console.log('[AuthContext] Role fetched:', r, 'for user:', session.user.email);
          setRole(r ?? 'student');
        } catch (err) {
          console.error('[AuthContext] Error fetching role, defaulting to student:', err);
          setRole('student');
        }
      } else {
        console.log('[AuthContext] No user session');
        setRole(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        console.log('[AuthContext] Auth state changed, user:', session.user.email, 'ID:', session.user.id);
        try {
          const r = await getUserRole(session.user.id);
          console.log('[AuthContext] Role fetched on auth change:', r, 'for user:', session.user.email);
          setRole(r ?? 'student');
        } catch (err) {
          console.error('[AuthContext] Error fetching role on auth change, defaulting to student:', err);
          setRole('student');
        }
      } else {
        console.log('[AuthContext] Auth state changed, no user');
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fallback: if role is still null after 8s (e.g. getUserRole hung), try once more then set student
  useEffect(() => {
    if (!user || role !== null) return;
    const t = setTimeout(async () => {
      console.warn('[AuthContext] Role still null after 8s, retrying...');
      try {
        const r = await getUserRole(user.id);
        console.log('[AuthContext] Retry successful, role:', r);
        setRole(r ?? 'student');
      } catch (err) {
        console.error('[AuthContext] Retry failed, defaulting to student:', err);
        setRole('student');
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [user, role]);

  const value = {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isAuthenticated: !!user,
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
