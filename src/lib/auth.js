import { supabase } from './supabase';

// In-memory role cache to avoid repeated database queries (e.g. dashboard, ProtectedRoute)
const roleCache = new Map();

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign up new user (public member). Creates profile and assigns student role.
 */
export async function signUp(email, password, options = {}) {
  const { fullName } = options;
  
  // Check if Supabase is properly configured
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
      // Enhance error messages for common issues
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        throw new Error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase project status.');
      }
      throw error;
    }

    if (data.user) {
      try {
        await ensureProfileAndRole(data.user, fullName || data.user.email?.split('@')[0]);
      } catch (e) {
        console.warn('Profile/role setup failed:', e);
        // Don't throw here - signup succeeded even if profile setup failed
      }
    }
    return data;
  } catch (err) {
    // Re-throw with enhanced error message if it's a network error
    if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error('Network error: Unable to connect to Supabase. Please check your internet connection and ensure your Supabase project is active.');
    }
    throw err;
  }
}

/**
 * Ensure profile and student role exist for a user (after signup or first login)
 */
async function ensureProfileAndRole(user, fullName) {
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

  const { data: existing } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!existing) {
    await supabase.from('user_roles').insert({
      user_id: user.id,
      role: 'student',
    });
  }
}

/**
 * Sign out current user. Clears role cache so next login gets fresh role.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  roleCache.clear();
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Get current user's role from user_roles (admin, instructor, student).
 * Uses in-memory cache for subsequent calls within the same session.
 * Pass skipCache=true to force a fresh fetch from the database.
 */
export async function getUserRole(userId, { skipCache = false } = {}) {
  if (!skipCache && roleCache.has(userId)) {
    const cached = roleCache.get(userId);
    console.log(`[getUserRole] Using cached role for ${userId}:`, cached);
    return cached;
  }

  try {
    console.log(`[getUserRole] Fetching role from DB for userId: ${userId}`);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[getUserRole] Supabase error:', error);
      throw error;
    }

    console.log(`[getUserRole] Query result - data:`, data);
    
    if (!data) {
      console.warn(`[getUserRole] No role found for userId ${userId}, defaulting to 'student'`);
      const role = 'student';
      roleCache.set(userId, role);
      return role;
    }

    const role = data.role || 'student';
    console.log(`[getUserRole] Fetched role for ${userId}:`, role);
    roleCache.set(userId, role);
    return role;
  } catch (err) {
    console.error('[getUserRole] Error fetching role:', err);
    throw err;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(userId) {
  const role = await getUserRole(userId);
  return role === 'admin';
}

/**
 * Clear role cache (e.g. after role update in admin). Pass userId to clear one, or nothing to clear all.
 */
export function clearRoleCache(userId) {
  if (userId) {
    roleCache.delete(userId);
  } else {
    roleCache.clear();
  }
}

/**
 * Force refresh role for current user (clears cache and refetches)
 */
export async function refreshUserRole(userId) {
  roleCache.delete(userId);
  return getUserRole(userId);
}
