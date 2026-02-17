import { supabase } from './supabase';

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign up new user. Creates profile after signup.
 */
export async function signUp(email, password, options = {}) {
  const { fullName } = options;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email.split('@')[0] },
      },
    });

    if (error) {
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        throw new Error('Network error: Unable to connect to Supabase. Please check your internet connection.');
      }
      throw error;
    }

    if (data.user) {
      try {
        await ensureProfile(data.user, fullName || data.user.email?.split('@')[0]);
      } catch (e) {
        console.warn('Profile setup failed:', e);
      }
    }
    return data;
  } catch (err) {
    if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error('Network error: Unable to connect to Supabase. Please check your internet connection.');
    }
    throw err;
  }
}

/**
 * Ensure profile exists for a user after signup
 */
async function ensureProfile(user, fullName) {
  const name = fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || '';

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: name,
      email: user.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
