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
 * Sign up new user (public member). Creates profile and assigns student role.
 */
export async function signUp(email, password, options = {}) {
  const { fullName } = options;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || email.split('@')[0] },
    },
  });
  if (error) throw error;

  if (data.user) {
    try {
      await ensureProfileAndRole(data.user, fullName || data.user.email?.split('@')[0]);
    } catch (e) {
      console.warn('Profile/role setup failed:', e);
    }
  }
  return data;
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

/**
 * Get current user's role from user_roles (admin, instructor, student)
 */
export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.role || 'student';
}

/**
 * Check if current user is admin
 */
export async function isAdmin(userId) {
  const role = await getUserRole(userId);
  return role === 'admin';
}
