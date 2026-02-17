import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import FormModal from './FormModal';
import {
  getAllMembers,
  getResearcherApplications,
  updateMemberRole,
  updateResearcherApplicationStatus,
} from '../../lib/supabase';
import './Dashboard.css';

export default function MembersManager() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('student');
  const [savingRole, setSavingRole] = useState(false);
  const [appDetail, setAppDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [m, a] = await Promise.all([getAllMembers(), getResearcherApplications()]);
      setMembers(m);
      setApplications(a);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveRole = async () => {
    if (!roleModal) return;
    setSavingRole(true);
    setError('');
    try {
      await updateMemberRole(roleModal.id, newRole);
      setMembers((prev) => prev.map((r) => (r.id === roleModal.id ? { ...r, role: newRole } : r)));
      setRoleModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleAppStatus = async (app, status) => {
    try {
      await updateResearcherApplicationStatus(app.id, status, null, currentUser?.id);
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
      setAppDetail(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const memberColumns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (v, row) => (
        <span style={{ textTransform: 'capitalize' }}>{v || 'student'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          className="dashboard-btn dashboard-btn--secondary dashboard-btn--sm"
          onClick={() => {
            setRoleModal(row);
            setNewRole(row.role || 'student');
          }}
        >
          Change role
        </button>
      ),
    },
  ];

  const appColumns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'specialization', label: 'Specialization' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span style={{ textTransform: 'capitalize' }}>{v}</span>,
    },
    {
      key: 'created_at',
      label: 'Applied',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) =>
        row.status === 'pending' ? (
          <div className="dashboard-table__actions">
            <button
              type="button"
              className="dashboard-btn dashboard-btn--primary dashboard-btn--sm"
              onClick={() => handleAppStatus(row, 'approved')}
            >
              Approve
            </button>
            <button
              type="button"
              className="dashboard-btn dashboard-btn--danger dashboard-btn--sm"
              onClick={() => handleAppStatus(row, 'rejected')}
            >
              Reject
            </button>
            <button
              type="button"
              className="dashboard-btn dashboard-btn--secondary dashboard-btn--sm"
              onClick={() => setAppDetail(row)}
            >
              View
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="dashboard-btn dashboard-btn--secondary dashboard-btn--sm"
            onClick={() => setAppDetail(row)}
          >
            View
          </button>
        ),
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <h1 className="dashboard-toolbar__title">Members & Applications</h1>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <h2 style={{ fontSize: '1.1rem', marginBottom: 12, marginTop: 24 }}>Registered members</h2>
      {loading ? <p>Loading...</p> : <DataTable columns={memberColumns} data={members} keyField="id" emptyMessage="No members." />}

      <h2 style={{ fontSize: '1.1rem', marginBottom: 12, marginTop: 32 }}>Researcher applications</h2>
      {loading ? null : <DataTable columns={appColumns} data={applications} keyField="id" emptyMessage="No applications." />}

      <FormModal
        title="Change role"
        open={!!roleModal}
        onClose={() => setRoleModal(null)}
      >
        {roleModal && (
          <>
            <p style={{ marginBottom: 16, color: 'var(--color-text-medium)' }}>
              {roleModal.full_name} ({roleModal.email})
            </p>
            <div className="dashboard-form__group">
              <label>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="student">Student / Member</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="dashboard-modal__actions">
              <button type="button" className="dashboard-btn dashboard-btn--secondary" onClick={() => setRoleModal(null)}>Cancel</button>
              <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={handleSaveRole} disabled={savingRole}>
                {savingRole ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </FormModal>

      <FormModal title="Application details" open={!!appDetail} onClose={() => setAppDetail(null)}>
        {appDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p><strong>Name:</strong> {appDetail.full_name}</p>
            <p><strong>Email:</strong> {appDetail.email}</p>
            {appDetail.phone && <p><strong>Phone:</strong> {appDetail.phone}</p>}
            {appDetail.specialization && <p><strong>Specialization:</strong> {appDetail.specialization}</p>}
            {appDetail.experience && <p><strong>Experience:</strong> {appDetail.experience}</p>}
            {appDetail.cover_letter && <p><strong>Cover letter:</strong><br />{appDetail.cover_letter}</p>}
            {appDetail.resume_url && <p><strong>Resume:</strong> <a href={appDetail.resume_url} target="_blank" rel="noopener noreferrer">Open link</a></p>}
            <p><strong>Status:</strong> {appDetail.status}</p>
            {appDetail.status === 'pending' && (
              <div className="dashboard-modal__actions" style={{ border: 'none', padding: 0, marginTop: 16 }}>
                <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={() => handleAppStatus(appDetail, 'approved')}>Approve</button>
                <button type="button" className="dashboard-btn dashboard-btn--danger" onClick={() => handleAppStatus(appDetail, 'rejected')}>Reject</button>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
