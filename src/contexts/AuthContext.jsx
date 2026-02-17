import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getUserRole } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check - don't block on role fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false); // Allow UI to render immediately
      
      // Fetch role in background (non-blocking)
      if (session?.user) {
        try {
          const r = await getUserRole(session.user.id);
          setRole(r);
        } catch {
          setRole('student');
        }
      } else {
        setRole(null);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false); // Don't block UI render
      
      // Update role in background
      if (session?.user) {
        try {
          const r = await getUserRole(session.user.id);
          setRole(r);
        } catch {
          setRole('student');
        }
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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