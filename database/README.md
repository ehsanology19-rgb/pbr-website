# PBR Website Database Schema

Complete database schema for the Padma BioResearch (PBR) website. This schema supports user authentication, team management, publications, research projects, collaborations, contact forms, researcher applications, and site settings.

## Quick Start

1. **Create a new Supabase project** at https://supabase.com
2. **Open SQL Editor** in your Supabase dashboard
3. **Run `complete_schema.sql`** - Copy and paste the entire file, then execute
4. **Create your admin user** via Supabase Auth dashboard (Authentication → Users → Add User)
5. **Grant admin role** - Run `grant_admin_access.sql` with your admin email
6. **Update environment variables** in your project:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Database Structure

### Tables Overview

#### User Management
- **profiles** - User profile information linked to Supabase auth.users
- **user_roles** - Role assignments (admin, instructor, student)

#### Content Tables
- **team_members** - Research team member profiles
- **research_areas** - Research domains (In Silico, In Vitro, In Vivo)
- **publications** - Research papers and publications
- **research_projects** - Active and completed research projects
- **collaborations** - Institutional partnerships and collaborations

#### Forms & Applications
- **contact_submissions** - Contact form submissions
- **researcher_applications** - Researcher join applications

#### Configuration
- **site_settings** - Website configuration (JSONB key-value store)

### Views

- **publication_stats** - Aggregated publication metrics
- **team_stats** - Aggregated team member statistics
- **project_stats** - Aggregated project statistics

### Storage Buckets

- **avatars** - User profile photos (public read, users manage own)

## Table Descriptions

### profiles
User profiles linked to Supabase authentication. Automatically created when a user signs up via the `handle_new_user()` trigger.

**Key Fields:**
- `id` - UUID, references auth.users(id)
- `full_name`, `email`, `phone` - Contact information
- `avatar_url` - Profile photo URL
- `bio`, `university`, `field_of_study` - Academic information

**RLS Policies:**
- Users can view/update their own profile
- Public profiles are viewable by everyone

### user_roles
Role assignments for users. Supports multiple roles per user (though typically one).

**Key Fields:**
- `user_id` - References profiles(id)
- `role` - Enum: 'student', 'admin', 'instructor'
- Unique constraint on (user_id, role)

**RLS Policies:**
- Users can view their own roles
- Admins can manage all roles

### team_members
Research team member profiles displayed on the website.

**Key Fields:**
- `name`, `role`, `specialization` - Member information
- `photo_url`, `email`, `linkedin_url`, `orcid_id`, `google_scholar_url` - Contact/social links
- `display_order` - For custom ordering
- `is_active` - Soft delete flag

**RLS Policies:**
- Public read access
- Admins can manage all

### research_areas
Research domains (In Silico, In Vitro, In Vivo). Pre-populated with default data.

**Key Fields:**
- `title`, `slug` - Name and URL-friendly identifier
- `description`, `highlights` (JSONB) - Content
- `icon`, `gradient_from`, `gradient_to` - Visual styling
- `methodologies`, `equipment` (JSONB) - Lists

**RLS Policies:**
- Public read access
- Admins can manage all

### publications
Research papers and publications.

**Key Fields:**
- `title`, `journal`, `year` - Publication details
- `doi`, `authors` (JSONB), `abstract` - Academic information
- `pdf_url`, `external_link` - Links
- `citation_count`, `impact_factor` - Metrics
- `research_area_id` - Foreign key to research_areas
- `is_featured` - For homepage highlighting

**RLS Policies:**
- Public read access
- Admins can manage all

### research_projects
Active and completed research projects.

**Key Fields:**
- `title`, `description` - Project information
- `status` - Enum: 'Active', 'Upcoming', 'Completed', 'On Hold'
- `progress` - Integer 0-100
- `start_date`, `end_date` - Timeline
- `funding_source`, `funding_amount` - Funding information
- `tags`, `team_members`, `milestones` (JSONB) - Structured data
- `research_area_id`, `lead_researcher_id` - Foreign keys

**RLS Policies:**
- Public read access
- Admins can manage all

### collaborations
Institutional partnerships and collaborations.

**Key Fields:**
- `name`, `institution_type` - Partner information
- `logo_url`, `website_url` - Branding
- `contact_person`, `contact_email`, `country` - Contact details
- `status` - Enum: 'Active', 'Inactive', 'Pending'
- `collaboration_areas`, `projects_together` (JSONB) - Related data

**RLS Policies:**
- Public read access
- Admins can manage all

### contact_submissions
Contact form submissions from the website.

**Key Fields:**
- `name`, `email`, `phone`, `subject`, `message` - Form data
- `status` - Enum: 'new', 'in_progress', 'resolved', 'closed'

**RLS Policies:**
- Anyone can submit (INSERT)
- Admins can view and update

### researcher_applications
Researcher join applications.

**Key Fields:**
- `user_id` - Optional link to auth.users (if user is logged in)
- `full_name`, `email`, `phone` - Applicant information
- `specialization`, `experience`, `cover_letter` - Application details
- `resume_url` - Uploaded resume
- `status` - Enum: 'pending', 'approved', 'rejected'
- `reviewed_by`, `reviewed_at`, `notes` - Admin review information

**RLS Policies:**
- Anyone can submit (INSERT)
- Users can view their own applications
- Admins can view and update all

### site_settings
Website configuration stored as JSONB key-value pairs.

**Key Fields:**
- `key` - Unique setting identifier
- `value` - JSONB value (can be string, number, object, array)
- `description` - Human-readable description
- `category` - Grouping (general, contact, social, homepage)

**Pre-populated Settings:**
- `site_name`, `site_tagline` - Branding
- `contact_email`, `contact_phone`, `address` - Contact information
- `social_links` - Social media URLs
- `hero_stats` - Homepage statistics
- `publication_stats` - Publication achievements

**RLS Policies:**
- Public read access
- Admins can manage all

## Row Level Security (RLS)

All tables have RLS enabled with the following patterns:

1. **Public Content** (team_members, publications, research_projects, etc.)
   - Public SELECT (anyone can read)
   - Admin-only INSERT/UPDATE/DELETE

2. **User Data** (profiles)
   - Users can SELECT/UPDATE their own data
   - Public SELECT (for displaying profiles)

3. **User Roles** (user_roles)
   - Users can SELECT their own roles
   - Admins can manage all roles

4. **Submissions** (contact_submissions, researcher_applications)
   - Anyone can INSERT (submit forms)
   - Users can SELECT their own submissions
   - Admins can SELECT/UPDATE all

5. **Settings** (site_settings)
   - Public SELECT
   - Admin-only INSERT/UPDATE/DELETE

## Functions & Triggers

### handle_new_user()
Automatically executed when a new user signs up via Supabase Auth. Creates a profile entry and assigns the default 'student' role.

**Trigger:** `on_auth_user_created` on `auth.users`

## Default Data

### Research Areas
Three default research areas are inserted:
1. **In Silico Research** - Computational approaches
2. **In Vitro Research** - Laboratory-based experiments
3. **In Vivo Research** - Studies in living organisms

### Site Settings
Default site settings include:
- Site name and tagline
- Contact information
- Social media links (empty by default)
- Hero section statistics
- Publication achievements

## Storage

### avatars Bucket
Public bucket for user profile photos.

**Policies:**
- Public SELECT (anyone can view)
- Users can INSERT/UPDATE/DELETE their own avatars (based on folder structure: `{user_id}/avatar.*`)

## Migration Notes

### Fresh Installation
Run `complete_schema.sql` in its entirety on a new Supabase project.

### Existing Database
If you have an existing database, you may need to:
1. Check for existing tables/enums before creating
2. Use `CREATE IF NOT EXISTS` or `ON CONFLICT` clauses
3. Run migrations incrementally

### Updating Schema
For schema updates:
1. Create new migration files
2. Test on a development database first
3. Backup production database before applying

## Troubleshooting

### Common Issues

**"relation already exists"**
- Tables/enums already exist. Use `DROP TABLE IF EXISTS` or modify script to check first.

**"permission denied"**
- Ensure you're running as a database superuser or have proper permissions
- Check RLS policies if queries fail

**"function does not exist"**
- Ensure `handle_new_user()` function is created before the trigger

**Storage bucket errors**
- Verify storage is enabled in Supabase project
- Check bucket policies match your requirements

## Admin Setup

After running the schema:

1. Create admin user via Supabase Auth dashboard
2. Run `grant_admin_access.sql` with your admin email:
   ```sql
   -- Update email in the script
   WHERE email = 'your-admin@email.com';
   ```
3. Sign out and sign back in to refresh role cache
4. Access `/dashboard` route

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS policies if access is denied
- Verify environment variables are set correctly
