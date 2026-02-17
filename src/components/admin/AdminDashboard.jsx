import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiFileText, FiFolder, FiGlobe,
  FiMail, FiUserCheck, FiArrowLeft, FiLogOut,
  FiRefreshCw, FiTrash2, FiCheck, FiX, FiClock,
  FiEye, FiChevronDown, FiChevronUp, FiMenu
} from 'react-icons/fi';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  adminGetDashboardStats,
  adminGetTeamMembers,
  adminGetPublications,
  adminGetProjects,
  adminGetCollaborations,
  adminGetContactSubmissions,
  adminGetApplications,
  adminUpdateTeamMember,
  adminDeleteTeamMember,
  adminUpdatePublication,
  adminDeletePublication,
  adminUpdateProject,
  adminDeleteProject,
  adminUpdateCollaboration,
  adminDeleteCollaboration,
  adminUpdateContactStatus,
  adminUpdateApplicationStatus,
} from '../../lib/supabase';
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

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('[AdminDashboard] Sign out error:', error);
      window.location.href = '/';
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
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
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`admin-sidebar__item ${activeSection === section.id ? 'admin-sidebar__item--active' : ''}`}
                onClick={() => handleSectionChange(section.id)}
              >
                <Icon size={18} />
                <span>{section.label}</span>
                {section.id === 'contacts' && stats?.contactSubmissions?.new > 0 && (
                  <span className="admin-sidebar__badge">{stats.contactSubmissions.new}</span>
                )}
                {section.id === 'applications' && stats?.applications?.pending > 0 && (
                  <span className="admin-sidebar__badge">{stats.applications.pending}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/account" className="admin-sidebar__footer-link">
            <FiArrowLeft size={16} /> My Account
          </Link>
          <button className="admin-sidebar__footer-link admin-sidebar__footer-link--danger" onClick={handleSignOut}>
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-sidebar__overlay" onClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-topbar__menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu size={22} />
          </button>
          <h1 className="admin-topbar__title">
            {SECTIONS.find((s) => s.id === activeSection)?.label || 'Dashboard'}
          </h1>
          <div className="admin-topbar__user">
            <span className="admin-topbar__user-name">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
            </span>
          </div>
        </header>

        <div className="admin-content">
          {activeSection === 'overview' && (
            <OverviewSection stats={stats} loading={statsLoading} onRefresh={loadStats} />
          )}
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

/* ========== Overview Section ========== */
function OverviewSection({ stats, loading, onRefresh }) {
  if (loading) {
    return <div className="admin-loading">Loading dashboard stats...</div>;
  }

  if (!stats) {
    return (
      <div className="admin-empty">
        <p>Unable to load statistics.</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          <FiRefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

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
        <button className="btn btn-outline admin-overview__refresh" onClick={onRefresh}>
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-card__accent" style={{ background: card.color }} />
            <div className="admin-stat-card__body">
              <p className="admin-stat-card__label">{card.label}</p>
              <p className="admin-stat-card__value">{card.total}</p>
              <p className="admin-stat-card__sub">
                {card.active} {card.activeLabel || 'active'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== Reusable Data Section ========== */
function useDataSection(fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchFn();
      setData(result || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}

/* ========== Team Section ========== */
function TeamSection() {
  const { data, loading, error, reload } = useDataSection(adminGetTeamMembers);
  const [actionError, setActionError] = useState('');

  const handleToggleActive = async (member) => {
    setActionError('');
    try {
      await adminUpdateTeamMember(member.id, { is_active: !member.is_active });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete team member "${member.name}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await adminDeleteTeamMember(member.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading team members...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} member{data.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id}>
                <td className="admin-table__name">{m.name}</td>
                <td>{m.role}</td>
                <td>{m.specialization || '—'}</td>
                <td>
                  <StatusBadge active={m.is_active} />
                </td>
                <td className="admin-table__actions">
                  <button
                    className={`admin-action-btn ${m.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`}
                    onClick={() => handleToggleActive(m)}
                    title={m.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {m.is_active ? <FiX size={14} /> : <FiCheck size={14} />}
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => handleDelete(m)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="admin-table__empty">No team members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== Publications Section ========== */
function PublicationsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetPublications);
  const [actionError, setActionError] = useState('');

  const handleToggleActive = async (pub) => {
    setActionError('');
    try {
      await adminUpdatePublication(pub.id, { is_active: !pub.is_active });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleToggleFeatured = async (pub) => {
    setActionError('');
    try {
      await adminUpdatePublication(pub.id, { is_featured: !pub.is_featured });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (pub) => {
    if (!window.confirm(`Delete publication "${pub.title}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await adminDeletePublication(pub.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading publications...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} publication{data.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Journal</th>
              <th>Year</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td className="admin-table__name">{p.title}</td>
                <td>{p.journal || '—'}</td>
                <td>{p.year}</td>
                <td>
                  <button
                    className={`admin-featured-btn ${p.is_featured ? 'admin-featured-btn--on' : ''}`}
                    onClick={() => handleToggleFeatured(p)}
                    title={p.is_featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {p.is_featured ? 'Yes' : 'No'}
                  </button>
                </td>
                <td><StatusBadge active={p.is_active} /></td>
                <td className="admin-table__actions">
                  <button
                    className={`admin-action-btn ${p.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`}
                    onClick={() => handleToggleActive(p)}
                    title={p.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {p.is_active ? <FiX size={14} /> : <FiCheck size={14} />}
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => handleDelete(p)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="admin-table__empty">No publications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== Projects Section ========== */
function ProjectsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetProjects);
  const [actionError, setActionError] = useState('');

  const handleToggleActive = async (project) => {
    setActionError('');
    try {
      await adminUpdateProject(project.id, { is_active: !project.is_active });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await adminDeleteProject(project.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading projects...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} project{data.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
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
                  <button
                    className={`admin-action-btn ${p.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`}
                    onClick={() => handleToggleActive(p)}
                    title={p.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {p.is_active ? <FiX size={14} /> : <FiCheck size={14} />}
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => handleDelete(p)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="admin-table__empty">No projects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== Collaborations Section ========== */
function CollaborationsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetCollaborations);
  const [actionError, setActionError] = useState('');

  const handleToggleActive = async (collab) => {
    setActionError('');
    try {
      await adminUpdateCollaboration(collab.id, { is_active: !collab.is_active });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (collab) => {
    if (!window.confirm(`Delete collaboration "${collab.name}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await adminDeleteCollaboration(collab.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading collaborations...</div>;
  if (error) return <AdminError message={error} onRetry={reload} />;

  return (
    <div>
      {actionError && <div className="admin-action-error">{actionError}</div>}
      <div className="admin-section-header">
        <p className="admin-section-count">{data.length} collaboration{data.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-outline" onClick={reload}><FiRefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Institution Type</th>
              <th>Country</th>
              <th>Collab Status</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td className="admin-table__name">{c.name}</td>
                <td>{c.institution_type || '—'}</td>
                <td>{c.country || '—'}</td>
                <td><ProjectStatusBadge status={c.status} /></td>
                <td><StatusBadge active={c.is_active} /></td>
                <td className="admin-table__actions">
                  <button
                    className={`admin-action-btn ${c.is_active ? 'admin-action-btn--warn' : 'admin-action-btn--success'}`}
                    onClick={() => handleToggleActive(c)}
                    title={c.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {c.is_active ? <FiX size={14} /> : <FiCheck size={14} />}
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => handleDelete(c)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="admin-table__empty">No collaborations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== Contact Submissions Section ========== */
function ContactsSection() {
  const { data, loading, error, reload } = useDataSection(adminGetContactSubmissions);
  const [actionError, setActionError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleStatusChange = async (contact, newStatus) => {
    setActionError('');
    try {
      await adminUpdateContactStatus(contact.id, newStatus);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
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
                <span className="admin-message-card__date">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                {expandedId === c.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>
            </div>
            {expandedId === c.id && (
              <div className="admin-message-card__body">
                <p className="admin-message-card__subject"><strong>Subject:</strong> {c.subject || 'No subject'}</p>
                <p className="admin-message-card__text">{c.message}</p>
                {c.phone && <p className="admin-message-card__phone"><strong>Phone:</strong> {c.phone}</p>}
                <div className="admin-message-card__actions">
                  <span className="admin-message-card__actions-label">Change status:</span>
                  {['new', 'in_progress', 'resolved', 'closed'].map((s) => (
                    <button
                      key={s}
                      className={`admin-status-btn ${c.status === s ? 'admin-status-btn--current' : ''}`}
                      onClick={() => handleStatusChange(c, s)}
                      disabled={c.status === s}
                    >
                      {s.replace('_', ' ')}
                    </button>
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

/* ========== Applications Section ========== */
function ApplicationsSection({ userId }) {
  const { data, loading, error, reload } = useDataSection(adminGetApplications);
  const [actionError, setActionError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleStatusChange = async (app, newStatus) => {
    setActionError('');
    try {
      await adminUpdateApplicationStatus(app.id, newStatus, userId);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
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
                <span className="admin-message-card__date">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
                {expandedId === a.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>
            </div>
            {expandedId === a.id && (
              <div className="admin-message-card__body">
                <p><strong>Specialization:</strong> {a.specialization || '—'}</p>
                <p><strong>Experience:</strong> {a.experience || '—'}</p>
                {a.cover_letter && <p className="admin-message-card__text">{a.cover_letter}</p>}
                {a.phone && <p><strong>Phone:</strong> {a.phone}</p>}
                {a.resume_url && (
                  <p>
                    <a href={a.resume_url} target="_blank" rel="noopener noreferrer" className="admin-link">
                      <FiEye size={14} /> View Resume
                    </a>
                  </p>
                )}
                {a.reviewed_at && (
                  <p className="admin-message-card__reviewed">
                    <FiClock size={14} /> Reviewed on {new Date(a.reviewed_at).toLocaleDateString()}
                  </p>
                )}
                <div className="admin-message-card__actions">
                  <span className="admin-message-card__actions-label">Decision:</span>
                  {['pending', 'approved', 'rejected'].map((s) => (
                    <button
                      key={s}
                      className={`admin-status-btn admin-status-btn--app ${a.status === s ? 'admin-status-btn--current' : ''}`}
                      onClick={() => handleStatusChange(a, s)}
                      disabled={a.status === s}
                    >
                      {s}
                    </button>
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

/* ========== Small components ========== */
function StatusBadge({ active }) {
  return (
    <span className={`admin-badge ${active ? 'admin-badge--green' : 'admin-badge--gray'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function ProjectStatusBadge({ status }) {
  const colorMap = { Active: 'green', Upcoming: 'blue', Completed: 'gray', 'On Hold': 'orange', Inactive: 'gray', Pending: 'orange' };
  const color = colorMap[status] || 'gray';
  return <span className={`admin-badge admin-badge--${color}`}>{status || '—'}</span>;
}

function ContactStatusBadge({ status }) {
  const colorMap = { new: 'red', in_progress: 'orange', resolved: 'green', closed: 'gray' };
  const color = colorMap[status] || 'gray';
  return <span className={`admin-badge admin-badge--${color}`}>{status?.replace('_', ' ') || '—'}</span>;
}

function AppStatusBadge({ status }) {
  const colorMap = { pending: 'orange', approved: 'green', rejected: 'red' };
  const color = colorMap[status] || 'gray';
  return <span className={`admin-badge admin-badge--${color}`}>{status || '—'}</span>;
}

function AdminError({ message, onRetry }) {
  return (
    <div className="admin-error-card">
      <p>{message}</p>
      <button className="btn btn-outline" onClick={onRetry}>
        <FiRefreshCw size={14} /> Retry
      </button>
    </div>
  );
}
