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
        try {
          const r = await getUserRole(session.user.id);
          setRole(r ?? 'student');
        } catch {
          setRole('student');
        }
      } else {
        setRole(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        try {
          const r = await getUserRole(session.user.id);
          setRole(r ?? 'student');
        } catch {
          setRole('student');
        }
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fallback: if role is still null after 6s (e.g. getUserRole hung), set student so UI doesn't stay stuck
  useEffect(() => {
    if (!user || role !== null) return;
    const t = setTimeout(() => setRole('student'), 6000);
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
