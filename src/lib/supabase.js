import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client — single connection point for the whole app.
 * All data (auth, database tables, storage) goes through Supabase:
 * - Auth: sign in/up/out, session (see lib/auth.js)
 * - Database: team_members, publications, research_projects, research_areas,
 *   collaborations, site_settings, contact_submissions, profiles
 * - Storage: avatars bucket for profile photos
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
} else {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

export const supabase = supabaseClient;

// ============================================
// Team Members API
// ============================================
export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ============================================
// Publications API
// ============================================
export async function getPublications({ featured = false, limit = null } = {}) {
  let query = supabase
    .from('publications')
    .select('*')
    .eq('is_active', true)
    .order('year', { ascending: false });
  
  if (featured) {
    query = query.eq('is_featured', true);
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPublicationStats() {
  const { data, error } = await supabase
    .from('publication_stats')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// Research Projects API
// ============================================
export async function getProjects({ status = null, featured = false } = {}) {
  let query = supabase
    .from('research_projects')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (featured) {
    query = query.eq('is_featured', true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProjectStats() {
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// Research Areas API
// ============================================
export async function getResearchAreas() {
  const { data, error } = await supabase
    .from('research_areas')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ============================================
// Collaborations API
// ============================================
export async function getCollaborations() {
  const { data, error } = await supabase
    .from('collaborations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ============================================
// Site Settings API
// ============================================
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');
  
  if (error) throw error;
  
  return data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
}

export async function getSiteSetting(key) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) throw error;
  return data?.value;
}

// ============================================
// Contact Form API
// ============================================
export async function submitContactForm({ name, email, subject, message }) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert([{ name, email, subject, message }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// Statistics API (Combined)
// ============================================
export async function getAllStats() {
  const [pubStats, teamStats, projectStats, settings] = await Promise.all([
    getPublicationStats(),
    supabase.from('team_stats').select('*').single(),
    getProjectStats(),
    getSiteSettings()
  ]);
  
  return {
    publications: pubStats,
    team: teamStats.data,
    projects: projectStats,
    heroStats: settings.hero_stats,
    publicationAchievements: settings.publication_stats
  };
}

// ============================================
// User profile
// ============================================
export async function getMyProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(userId, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  const { data: existing } = await supabase.from('profiles').select('id, email').eq('id', userId).maybeSingle();
  if (existing) {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  let email = updates.email;
  if (!email) {
    const { data: { user } } = await supabase.auth.getUser(userId);
    email = user?.email || null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, email, ...payload }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

const AVATARS_BUCKET = 'avatars';

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || `image/${ext}`,
  });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}
