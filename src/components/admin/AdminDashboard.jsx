import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiFileText, FiFolder, FiGlobe,
  FiMail, FiUserCheck, FiArrowLeft, FiLogOut,
  FiRefreshCw, FiTrash2, FiCheck, FiX, FiClock,
  FiEye, FiChevronDown, FiChevronUp, FiMenu,
  FiPlus, FiEdit2
} from 'react-icons/fi';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  adminGetDashboardStats,
  adminGetTeamMembers, adminCreateTeamMember, adminUpdateTeamMember, adminDeleteTeamMember,
  adminGetPublications, adminCreatePublication, adminUpdatePublication, adminDeletePublication,
  adminGetProjects, adminCreateProject, adminUpdateProject, adminDeleteProject,
  adminGetCollaborations, adminCreateCollaboration, adminUpdateCollaboration, adminDeleteCollaboration,
  adminGetContactSubmissions, adminUpdateContactStatus,
  adminGetApplications, adminUpdateApplicationStatus,
} from '../../lib/supabase';
import AdminFormModal from './AdminFormModal';
import './AdminDashboard.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: FiHome },
  { id: 'team', label: 'Team Members', icon: FiUsers },
  { id: 'publications', label: 'Publications', icon: FiFileText },
  { id: 'projects', label: 'Projects', icon: FiFolder },
  { id: 'collaborations', label: 'Collaborations', icon: FiGlobe },
  { id: 'contacts', label: 'Contact Messages', icon: FiMail },
  { id: 'applications', label: 'Applications', icon: FiUserCheck },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminGetDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('[AdminDashboard] Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); }
    catch { window.location.href = '/'; }
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <Link to="/" className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-icon">P</span>
            <span className="admin-sidebar__logo-text">PBR Admin</span>
          </Link>
        </div>
        <nav className="admin-sidebar__nav">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} className={`admin-sidebar__item ${activeSection === s.id ? 'admin-sidebar__item--active' : ''}`}
                onClick={() => { setActiveSection(s.id); setSidebarOpen(false); }}>
                <Icon size={18} /><span>{s.label}</span>
                {s.id === 'contacts' && stats?.contactSubmissions?.new > 0 && <span className="admin-sidebar__badge">{stats.contactSubmissions.new}</span>}
                {s.id === 'applications' && stats?.applications?.pending > 0 && <span className="admin-sidebar__badge">{stats.applications.pending}</span>}
              </button>
            );
          })}
        </nav>
        <div className="admin-sidebar__footer">
          <Link to="/account" className="admin-sidebar__footer-link"><FiArrowLeft size={16} /> My Account</Link>
          <button className="admin-sidebar__footer-link admin-sidebar__footer-link--danger" onClick={handleSignOut}><FiLogOut size={16} /> Sign Out</button>
        </div>
      </aside>
      <div className="admin-sidebar__overlay" onClick={() => setSidebarOpen(false)} />
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-topbar__menu" onClick={() => setSidebarOpen(!sidebarOpen)}><FiMenu size={22} /></button>
          <h1 className="admin-topbar__title">{SECTIONS.find((s) => s.id === activeSection)?.label || 'Dashboard'}</h1>
          <div className="admin-topbar__user">
            <span className="admin-topbar__user-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}</span>
          </div>
        </header>
        <div className="admin-content">
          {activeSection === 'overview' && <OverviewSection stats={stats} loading={statsLoading} onRefresh={loadStats} />}
          {activeSection === 'team' && <TeamSection />}
          {activeSection === 'publications' && <PublicationsSection />}
          {activeSection === 'projects' && <ProjectsSection />}
          {activeSection === 'collaborations' && <CollaborationsSection />}
          {activeSection === 'contacts' && <ContactsSection />}
          {activeSection === 'applications' && <ApplicationsSection userId={user?.id} />}
        </div>
      </main>
    </div>
  );
}

/* ========== Overview ========== */
function OverviewSection({ stats, loading, onRefresh }) {
  if (loading) return <div className="admin-loading">Loading dashboard stats...</div>;
  if (!stats) return <div className="admin-empty"><p>Unable to load statistics.</p><button className="btn btn-primary" onClick={onRefresh}><FiRefreshCw size={16} /> Retry</button></div>;

  const cards = [
    { label: 'Team Members', total: stats.teamMembers.total, active: stats.teamMembers.active, color: '#4ECDC4' },
    { label: 'Publications', total: stats.publications.total, active: stats.publications.active, color: '#D4A853' },
    { label: 'Projects', total: stats.projects.total, active: stats.projects.active, color: '#0D5C63' },
    { label: 'Collaborations', total: stats.collaborations.total, active: stats.collaborations.active, color: '#0A2540' },
    { label: 'Contact Messages', total: stats.contactSubmissions.total, active: stats.contactSubmissions.new, activeLabel: 'new', color: '#ef4444' },
    { label: 'Applications', total: stats.applications.total, active: stats.applications.pending, activeLabel: 'pending', color: '#8b5cf6' },
  ];

  return (
    <div>
      <div className="admin-overview__actions">
        <button className="btn btn-outline admin-overview__refresh" onClick={onRefresh}><FiRefreshCw size={16} /> Refresh</button>
      </div>
      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="admin-stat-card">
            <div className="admin-stat-card__accent" style={{ background: c.color }} />
            <div className="admin-stat-card__body">
              <p className="admin-stat-card__label">{c.label}</p>
              <p className="admin-stat-card__value">{c.total}</p>
              <p className="admin-stat-card__sub">{c.active} {c.activeLabel || 'active'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== Reusable hook ========== */
function useDataSection(fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData((await fetchFn()) || []); }
    catch (err) { setError(err.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, [fetchFn]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

/* ========== TEAM MEMBERS ========== */
const TEAM_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Dr. Jane Smith' },
  { key: 'role', label: 'Role / Title', type: 'text', required: true, placeholder: 'e.g. Lead Researcher' },
  { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Computational Biology' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
  { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Brief biography...', rows: 3 },
  { key: 'photo_url', label: 'Photo URL', type: 'url', placeholder: 'https://...' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/...' },
  { key: 'orcid_id', label: 'ORCID ID', type: 'text', placeholder: '0000-0000-0000-0000' },
  { key: 'google_scholar_url', label: 'Google Scholar URL', type: 'url', placeholder: 'https://scholar.google.com/...' },
  { key: 'display_order', label: 'Display Order', type: 'number', min: 0, defaultValue: 0 },
  { key: 'is_active', label: 'Active (visible on website)', type: 'checkbox', defaultValue: true },
];

function TeamSection() {
  const { data, loading, error, reload } = useDataSection(adminGetTeamMembers);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleSave = async (formData) => {
    setSaving(true); setActionError('');
    try {
      if (modal.item) { await adminUpdateTeamMember(modal.item.id, formData); }
      else { await adminCreateTeamMember(formData); }
      setModal(null); reload();
    } catch (err) { setActionError(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (m) => { setActionError(''); try { await adminUpdateTeamMember(m.id, { is_active: !m.is_active }); reload(); } catch (e) { setActionError(e.message); } };
  const handleDelete = async (m) => { if (!window.confirm(`Delete "${m.name}"?`)) return; setActionError(''); try { await adminDeleteTeamMember(m.id); reload(); } catch (e) { setActionError(e.message); } };

  if (loading) return <div className="admin-loading">Loading team members...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} member{data.length !== 1 ? 's' : ''}</p>
        <div className="admin-section-header__right">
          <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setModal({ item: null })}><FiPlus size={14} /> Add Member</button>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Role</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id}>
                <td className="admin-table__name">{m.name}</td>
                <td>{m.role}</td>
                <td>{m.specialization || '—'}</td>
                <td><StatusBadge active={m.is_active} /></td>
                <td className="admin-table__actions">
                  <button className="admin-action-btn" onClick={() => setModal({ item: m })} title="Edit"><FiEdit2 size={14} /></button>
                  <button className={`admin-action-btn ${m.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`} onClick={() => handleToggle(m)} title={m.is_active ? 'Deactivate' : 'Activate'}>{m.is_active ? <FiX size={14} /> : <FiCheck size={14} />}</button>
                  <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(m)} title="Delete"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="admin-table__empty">No team members found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && <AdminFormModal title={modal.item ? 'Edit Team Member' : 'Add Team Member'} fields={TEAM_FIELDS} initialData={modal.item} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/* ========== PUBLICATIONS ========== */
const PUB_FIELDS = [
  { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Publication title' },
  { key: 'journal', label: 'Journal', type: 'text', required: true, placeholder: 'e.g. Nature, Cell, PLOS ONE' },
  { key: 'year', label: 'Year', type: 'number', required: true, min: 1900, max: 2100, placeholder: '2026' },
  { key: 'publication_type', label: 'Type', type: 'select', options: ['Research Article', 'Review', 'Letter', 'Conference Paper', 'Book Chapter', 'Thesis', 'Other'], defaultValue: 'Research Article' },
  { key: 'doi', label: 'DOI', type: 'text', placeholder: '10.1000/xyz123' },
  { key: 'abstract', label: 'Abstract', type: 'textarea', rows: 4, placeholder: 'Publication abstract...' },
  { key: 'external_link', label: 'External Link', type: 'url', placeholder: 'https://...' },
  { key: 'citation_count', label: 'Citation Count', type: 'number', min: 0, defaultValue: 0 },
  { key: 'impact_factor', label: 'Impact Factor', type: 'number', min: 0, step: 0.01 },
  { key: 'is_featured', label: 'Featured', type: 'checkbox', defaultValue: false },
  { key: 'is_active', label: 'Active (visible on website)', type: 'checkbox', defaultValue: true },
];

function PublicationsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetPublications);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleSave = async (formData) => {
    setSaving(true); setActionError('');
    try {
      if (modal.item) { await adminUpdatePublication(modal.item.id, formData); }
      else { await adminCreatePublication(formData); }
      setModal(null); reload();
    } catch (err) { setActionError(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (p) => { setActionError(''); try { await adminUpdatePublication(p.id, { is_active: !p.is_active }); reload(); } catch (e) { setActionError(e.message); } };
  const handleFeatured = async (p) => { setActionError(''); try { await adminUpdatePublication(p.id, { is_featured: !p.is_featured }); reload(); } catch (e) { setActionError(e.message); } };
  const handleDelete = async (p) => { if (!window.confirm(`Delete "${p.title}"?`)) return; setActionError(''); try { await adminDeletePublication(p.id); reload(); } catch (e) { setActionError(e.message); } };

  if (loading) return <div className="admin-loading">Loading publications...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} publication{data.length !== 1 ? 's' : ''}</p>
        <div className="admin-section-header__right">
          <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setModal({ item: null })}><FiPlus size={14} /> Add Publication</button>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Journal</th><th>Year</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td className="admin-table__name">{p.title}</td>
                <td>{p.journal || '—'}</td>
                <td>{p.year}</td>
                <td><button className={`admin-featured-btn ${p.is_featured ? 'admin-featured-btn--on' : ''}`} onClick={() => handleFeatured(p)}>{p.is_featured ? 'Yes' : 'No'}</button></td>
                <td><StatusBadge active={p.is_active} /></td>
                <td className="admin-table__actions">
                  <button className="admin-action-btn" onClick={() => setModal({ item: p })} title="Edit"><FiEdit2 size={14} /></button>
                  <button className={`admin-action-btn ${p.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`} onClick={() => handleToggle(p)} title={p.is_active ? 'Deactivate' : 'Activate'}>{p.is_active ? <FiX size={14} /> : <FiCheck size={14} />}</button>
                  <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(p)} title="Delete"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="admin-table__empty">No publications found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && <AdminFormModal title={modal.item ? 'Edit Publication' : 'Add Publication'} fields={PUB_FIELDS} initialData={modal.item} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/* ========== PROJECTS ========== */
const PROJECT_FIELDS = [
  { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Project title' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'Project description...' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Upcoming', 'Completed', 'On Hold'], defaultValue: 'Active' },
  { key: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100, defaultValue: 0 },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'end_date', label: 'End Date', type: 'date' },
  { key: 'funding_source', label: 'Funding Source', type: 'text', placeholder: 'e.g. NIH, WHO, University grant' },
  { key: 'funding_amount', label: 'Funding Amount', type: 'number', min: 0, step: 0.01 },
  { key: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://...' },
  { key: 'display_order', label: 'Display Order', type: 'number', min: 0, defaultValue: 0 },
  { key: 'is_featured', label: 'Featured', type: 'checkbox', defaultValue: false },
  { key: 'is_active', label: 'Active (visible on website)', type: 'checkbox', defaultValue: true },
];

function ProjectsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetProjects);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleSave = async (formData) => {
    setSaving(true); setActionError('');
    try {
      if (modal.item) { await adminUpdateProject(modal.item.id, formData); }
      else { await adminCreateProject(formData); }
      setModal(null); reload();
    } catch (err) { setActionError(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (p) => { setActionError(''); try { await adminUpdateProject(p.id, { is_active: !p.is_active }); reload(); } catch (e) { setActionError(e.message); } };
  const handleDelete = async (p) => { if (!window.confirm(`Delete "${p.title}"?`)) return; setActionError(''); try { await adminDeleteProject(p.id); reload(); } catch (e) { setActionError(e.message); } };

  if (loading) return <div className="admin-loading">Loading projects...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} project{data.length !== 1 ? 's' : ''}</p>
        <div className="admin-section-header__right">
          <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setModal({ item: null })}><FiPlus size={14} /> Add Project</button>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Status</th><th>Progress</th><th>Visibility</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td className="admin-table__name">{p.title}</td>
                <td><ProjectStatusBadge status={p.status} /></td>
                <td>
                  <div className="admin-progress">
                    <div className="admin-progress__bar" style={{ width: `${p.progress || 0}%` }} />
                    <span className="admin-progress__text">{p.progress || 0}%</span>
                  </div>
                </td>
                <td><StatusBadge active={p.is_active} /></td>
                <td className="admin-table__actions">
                  <button className="admin-action-btn" onClick={() => setModal({ item: p })} title="Edit"><FiEdit2 size={14} /></button>
                  <button className={`admin-action-btn ${p.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`} onClick={() => handleToggle(p)} title={p.is_active ? 'Deactivate' : 'Activate'}>{p.is_active ? <FiX size={14} /> : <FiCheck size={14} />}</button>
                  <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(p)} title="Delete"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="admin-table__empty">No projects found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && <AdminFormModal title={modal.item ? 'Edit Project' : 'Add Project'} fields={PROJECT_FIELDS} initialData={modal.item} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/* ========== COLLABORATIONS ========== */
const COLLAB_FIELDS = [
  { key: 'name', label: 'Institution Name', type: 'text', required: true, placeholder: 'e.g. University of Tokyo' },
  { key: 'institution_type', label: 'Institution Type', type: 'select', options: ['Academic', 'Research Lab', 'Industry', 'Government', 'Hospital', 'NGO', 'Other'], defaultValue: 'Academic' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Collaboration details...' },
  { key: 'website_url', label: 'Website URL', type: 'url', placeholder: 'https://...' },
  { key: 'logo_url', label: 'Logo URL', type: 'url', placeholder: 'https://...' },
  { key: 'contact_person', label: 'Contact Person', type: 'text', placeholder: 'Full name' },
  { key: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'email@example.com' },
  { key: 'country', label: 'Country', type: 'text', placeholder: 'e.g. Japan' },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'status', label: 'Collaboration Status', type: 'select', options: ['Active', 'Inactive', 'Pending'], defaultValue: 'Active' },
  { key: 'display_order', label: 'Display Order', type: 'number', min: 0, defaultValue: 0 },
  { key: 'is_active', label: 'Active (visible on website)', type: 'checkbox', defaultValue: true },
];

function CollaborationsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetCollaborations);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleSave = async (formData) => {
    setSaving(true); setActionError('');
    try {
      if (modal.item) { await adminUpdateCollaboration(modal.item.id, formData); }
      else { await adminCreateCollaboration(formData); }
      setModal(null); reload();
    } catch (err) { setActionError(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (c) => { setActionError(''); try { await adminUpdateCollaboration(c.id, { is_active: !c.is_active }); reload(); } catch (e) { setActionError(e.message); } };
  const handleDelete = async (c) => { if (!window.confirm(`Delete "${c.name}"?`)) return; setActionError(''); try { await adminDeleteCollaboration(c.id); reload(); } catch (e) { setActionError(e.message); } };

  if (loading) return <div className="admin-loading">Loading collaborations...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} collaboration{data.length !== 1 ? 's' : ''}</p>
        <div className="admin-section-header__right">
          <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setModal({ item: null })}><FiPlus size={14} /> Add Collaboration</button>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Type</th><th>Country</th><th>Status</th><th>Visibility</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td className="admin-table__name">{c.name}</td>
                <td>{c.institution_type || '—'}</td>
                <td>{c.country || '—'}</td>
                <td><ProjectStatusBadge status={c.status} /></td>
                <td><StatusBadge active={c.is_active} /></td>
                <td className="admin-table__actions">
                  <button className="admin-action-btn" onClick={() => setModal({ item: c })} title="Edit"><FiEdit2 size={14} /></button>
                  <button className={`admin-action-btn ${c.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`} onClick={() => handleToggle(c)} title={c.is_active ? 'Deactivate' : 'Activate'}>{c.is_active ? <FiX size={14} /> : <FiCheck size={14} />}</button>
                  <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(c)} title="Delete"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="admin-table__empty">No collaborations found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && <AdminFormModal title={modal.item ? 'Edit Collaboration' : 'Add Collaboration'} fields={COLLAB_FIELDS} initialData={modal.item} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/* ========== CONTACT MESSAGES ========== */
function ContactsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetContactSubmissions);
  const [actionError, setActionError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleStatusChange = async (contact, newStatus) => {
    setActionError('');
    try { await adminUpdateContactStatus(contact.id, newStatus); reload(); }
    catch (err) { setActionError(err.message); }
  };

  if (loading) return <div className="admin-loading">Loading contact messages...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} message{data.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-cards-list">
        {data.map((c) => (
          <div key={c.id} className="admin-message-card">
            <div className="admin-message-card__header" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
              <div className="admin-message-card__info">
                <span className="admin-message-card__name">{c.name}</span>
                <span className="admin-message-card__email">{c.email}</span>
                <ContactStatusBadge status={c.status} />
              </div>
              <div className="admin-message-card__meta">
                <span className="admin-message-card__date">{new Date(c.created_at).toLocaleDateString()}</span>
                {expandedId === c.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>
            </div>
            {expandedId === c.id && (
              <div className="admin-message-card__body">
                <p className="admin-message-card__subject"><strong>Subject:</strong> {c.subject || 'No subject'}</p>
                <p className="admin-message-card__text">{c.message}</p>
                {c.phone && <p><strong>Phone:</strong> {c.phone}</p>}
                <div className="admin-message-card__actions">
                  <span className="admin-message-card__actions-label">Change status:</span>
                  {['new', 'in_progress', 'resolved', 'closed'].map((s) => (
                    <button key={s} className={`admin-status-btn ${c.status === s ? 'admin-status-btn--current' : ''}`} onClick={() => handleStatusChange(c, s)} disabled={c.status === s}>{s.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && <p className="admin-empty-text">No contact messages found.</p>}
      </div>
    </div>
  );
}

/* ========== APPLICATIONS ========== */
function ApplicationsSection({ userId }) {
  const { data, loading, error, reload } = useDataSection(adminGetApplications);
  const [actionError, setActionError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleStatusChange = async (app, newStatus) => {
    setActionError('');
    try { await adminUpdateApplicationStatus(app.id, newStatus, userId); reload(); }
    catch (err) { setActionError(err.message); }
  };

  if (loading) return <div className="admin-loading">Loading applications...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} application{data.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-cards-list">
        {data.map((a) => (
          <div key={a.id} className="admin-message-card">
            <div className="admin-message-card__header" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
              <div className="admin-message-card__info">
                <span className="admin-message-card__name">{a.full_name}</span>
                <span className="admin-message-card__email">{a.email}</span>
                <AppStatusBadge status={a.status} />
              </div>
              <div className="admin-message-card__meta">
                <span className="admin-message-card__date">{new Date(a.created_at).toLocaleDateString()}</span>
                {expandedId === a.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>
            </div>
            {expandedId === a.id && (
              <div className="admin-message-card__body">
                <p><strong>Specialization:</strong> {a.specialization || '—'}</p>
                <p><strong>Experience:</strong> {a.experience || '—'}</p>
                {a.cover_letter && <p className="admin-message-card__text">{a.cover_letter}</p>}
                {a.phone && <p><strong>Phone:</strong> {a.phone}</p>}
                {a.resume_url && <p><a href={a.resume_url} target="_blank" rel="noopener noreferrer" className="admin-link"><FiEye size={14} /> View Resume</a></p>}
                {a.reviewed_at && <p className="admin-message-card__reviewed"><FiClock size={14} /> Reviewed on {new Date(a.reviewed_at).toLocaleDateString()}</p>}
                <div className="admin-message-card__actions">
                  <span className="admin-message-card__actions-label">Decision:</span>
                  {['pending', 'approved', 'rejected'].map((s) => (
                    <button key={s} className={`admin-status-btn ${a.status === s ? 'admin-status-btn--current' : ''}`} onClick={() => handleStatusChange(a, s)} disabled={a.status === s}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && <p className="admin-empty-text">No applications found.</p>}
      </div>
    </div>
  );
}

/* ========== Small shared components ========== */
function StatusBadge({ active }) {
  return <span className={`admin-badge ${active ? 'admin-badge--green' : 'admin-badge--gray'}`}>{active ? 'Active' : 'Inactive'}</span>;
}
function ProjectStatusBadge({ status }) {
  const c = { Active: 'green', Upcoming: 'blue', Completed: 'gray', 'On Hold': 'orange', Inactive: 'gray', Pending: 'orange' }[status] || 'gray';
  return <span className={`admin-badge admin-badge--${c}`}>{status || '—'}</span>;
}
function ContactStatusBadge({ status }) {
  const c = { new: 'red', in_progress: 'orange', resolved: 'green', closed: 'gray' }[status] || 'gray';
  return <span className={`admin-badge admin-badge--${c}`}>{status?.replace('_', ' ') || '—'}</span>;
}
function AppStatusBadge({ status }) {
  const c = { pending: 'orange', approved: 'green', rejected: 'red' }[status] || 'gray';
  return <span className={`admin-badge admin-badge--${c}`}>{status || '—'}</span>;
}
function AdminError({ message, onRetry }) {
  return <div className="admin-error-card"><p>{message}</p><button className="btn btn-outline" onClick={onRetry}><FiRefreshCw size={14} /> Retry</button></div>;
}
