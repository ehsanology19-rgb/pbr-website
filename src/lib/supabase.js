import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client — single connection point for the whole app.
 * All data (auth, database tables, storage) goes through Supabase:
 * - Auth: sign in/up/out, session (see lib/auth.js)
 * - Database: team_members, publications, research_projects, research_areas,
 *   collaborations, site_settings, contact_submissions, researcher_applications,
 *   profiles, user_roles
 * - Storage: avatars bucket for profile photos
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  
  // Convert array to object for easier access
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
// Admin: Team Members CRUD
// ============================================
export async function getTeamMembersAdmin() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTeamMember(row) {
  const { data, error } = await supabase.from('team_members').insert([row]).select().single();
  if (error) throw error;
  return data;
}

export async function updateTeamMember(id, row) {
  const { data, error } = await supabase.from('team_members').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTeamMember(id) {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Admin: Publications CRUD
// ============================================
export async function getPublicationsAdmin() {
  const { data, error } = await supabase.from('publications').select('*').order('year', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPublication(row) {
  const { data, error } = await supabase.from('publications').insert([row]).select().single();
  if (error) throw error;
  return data;
}

export async function updatePublication(id, row) {
  const { data, error } = await supabase.from('publications').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePublication(id) {
  const { error } = await supabase.from('publications').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Admin: Research Projects CRUD
// ============================================
export async function getProjectsAdmin() {
  const { data, error } = await supabase.from('research_projects').select('*').order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProject(row) {
  const { data, error } = await supabase.from('research_projects').insert([row]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, row) {
  const { data, error } = await supabase.from('research_projects').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from('research_projects').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Admin: Research Areas CRUD
// ============================================
export async function getResearchAreasAdmin() {
  const { data, error } = await supabase.from('research_areas').select('*').order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createResearchArea(row) {
  const { data, error } = await supabase.from('research_areas').insert([row]).select().single();
  if (error) throw error;
  return data;
}

export async function updateResearchArea(id, row) {
  const { data, error } = await supabase.from('research_areas').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteResearchArea(id) {
  const { error } = await supabase.from('research_areas').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Admin: Collaborations CRUD
// ============================================
export async function getCollaborationsAdmin() {
  const { data, error } = await supabase.from('collaborations').select('*').order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCollaboration(row) {
  const { data, error } = await supabase.from('collaborations').insert([row]).select().single();
  if (error) throw error;
  return data;
}

export async function updateCollaboration(id, row) {
  const { data, error } = await supabase.from('collaborations').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCollaboration(id) {
  const { error } = await supabase.from('collaborations').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Admin: Site Settings
// ============================================
export async function updateSiteSetting(key, value) {
  const { data, error } = await supabase.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key).select().single();
  if (error) throw error;
  return data;
}

// ============================================
// Admin: Contact Submissions
// ============================================
export async function getContactSubmissions() {
  const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// Admin: Dashboard Stats (Optimized Count Queries)
// ============================================
export async function getDashboardStats() {
  const [teamResult, pubsResult, projectsResult, messagesResult, applicationsResult] = await Promise.all([
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase.from('publications').select('*', { count: 'exact', head: true }),
    supabase.from('research_projects').select('*', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('researcher_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  // Check for errors
  if (teamResult.error) throw teamResult.error;
  if (pubsResult.error) throw pubsResult.error;
  if (projectsResult.error) throw projectsResult.error;
  if (messagesResult.error) throw messagesResult.error;
  if (applicationsResult.error) throw applicationsResult.error;

  return {
    team: teamResult.count || 0,
    publications: pubsResult.count || 0,
    projects: projectsResult.count || 0,
    messages: messagesResult.count || 0,
    applications: applicationsResult.count || 0,
  };
}

export async function updateContactStatus(id, status) {
  const { data, error } = await supabase.from('contact_submissions').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============================================
// Admin: Researcher Applications
// ============================================
export async function getResearcherApplications() {
  const { data, error } = await supabase.from('researcher_applications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateResearcherApplicationStatus(id, status, notes = null, reviewedBy = null) {
  const row = { status, updated_at: new Date().toISOString(), reviewed_at: new Date().toISOString() };
  if (notes !== null) row.notes = notes;
  if (reviewedBy) row.reviewed_by = reviewedBy;
  const { data, error } = await supabase.from('researcher_applications').update(row).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============================================
// Admin: Members (profiles + roles)
// ============================================
export async function getAllMembers() {
  const { data: profiles, error: e1 } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (e1) throw e1;
  const { data: roles, error: e2 } = await supabase.from('user_roles').select('user_id, role');
  if (e2) throw e2;
  const roleMap = (roles || []).reduce((acc, r) => {
    if (!acc[r.user_id] || r.role === 'admin') acc[r.user_id] = r.role;
    return acc;
  }, {});
  return (profiles || []).map((p) => ({ ...p, role: roleMap[p.id] || 'student' }));
}

export async function updateMemberRole(userId, role) {
  const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
  if (error) throw error;
  const { data, error: e2 } = await supabase.from('user_roles').insert([{ user_id: userId, role }]).select().single();
  if (e2) throw e2;
  return data;
}

// ============================================
// User profile (researcher / member)
// ============================================
export async function getMyProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
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
