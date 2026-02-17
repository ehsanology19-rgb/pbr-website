import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import DataTable from './DataTable';
import FormModal from './FormModal';
import DeleteConfirm from './DeleteConfirm';
import {
  getTeamMembersAdmin,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../../lib/supabase';
import './Dashboard.css';

const defaultRow = {
  name: '',
  role: '',
  specialization: '',
  bio: '',
  photo_url: '',
  email: '',
  linkedin_url: '',
  orcid_id: '',
  google_scholar_url: '',
  initials: '',
  avatar_color: '#0ea5e9',
  display_order: 0,
  is_active: true,
};

export default function TeamManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultRow);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await getTeamMembersAdmin();
      setData(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultRow);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      role: row.role || '',
      specialization: row.specialization || '',
      bio: row.bio || '',
      photo_url: row.photo_url || '',
      email: row.email || '',
      linkedin_url: row.linkedin_url || '',
      orcid_id: row.orcid_id || '',
      google_scholar_url: row.google_scholar_url || '',
      initials: row.initials || '',
      avatar_color: row.avatar_color || '#0ea5e9',
      display_order: row.display_order ?? 0,
      is_active: row.is_active ?? true,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
      };
      if (editing) {
        await updateTeamMember(editing.id, payload);
      } else {
        await createTeamMember(payload);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTeamMember(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'display_order', label: 'Order' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="dashboard-table__actions">
          <button type="button" className="dashboard-btn dashboard-btn--secondary dashboard-btn--sm" onClick={() => openEdit(row)} aria-label="Edit">
            <FiEdit2 size={14} />
          </button>
          <button type="button" className="dashboard-btn dashboard-btn--danger dashboard-btn--sm" onClick={() => setDeleteTarget(row)} aria-label="Delete">
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <h1 className="dashboard-toolbar__title">Team Members</h1>
        <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={openCreate}>
          <FiPlus size={18} /> Add member
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={data} emptyMessage="No team members. Add one to get started." />}

      <FormModal title={editing ? 'Edit team member' : 'Add team member'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="dashboard-form">
          <div className="dashboard-form__group">
            <label>Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="dashboard-form__group">
            <label>Role *</label>
            <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Lead Researcher" required />
          </div>
          <div className="dashboard-form__group">
            <label>Specialization</label>
            <input value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>LinkedIn URL</label>
            <input value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="dashboard-form__group">
            <label>Initials (for avatar)</label>
            <input value={form.initials} onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value }))} placeholder="AS" maxLength={4} />
          </div>
          <div className="dashboard-form__group">
            <label>Avatar color</label>
            <input type="text" value={form.avatar_color} onChange={(e) => setForm((f) => ({ ...f, avatar_color: e.target.value }))} placeholder="#0ea5e9" />
          </div>
          <div className="dashboard-form__group">
            <label>Display order</label>
            <input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              {' '}Active (visible on site)
            </label>
          </div>
          <div className="dashboard-modal__actions">
            <button type="button" className="dashboard-btn dashboard-btn--secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm
        open={!!deleteTarget}
        title="Delete team member?"
        message="This will remove them from the public team list."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
