import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import DataTable from './DataTable';
import FormModal from './FormModal';
import DeleteConfirm from './DeleteConfirm';
import {
  getCollaborationsAdmin,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
} from '../../lib/supabase';
import './Dashboard.css';

const defaultRow = {
  name: '',
  institution_type: 'Academic',
  logo_url: '',
  website_url: '',
  description: '',
  country: '',
  status: 'Active',
  display_order: 0,
  is_active: true,
};

export default function CollaborationsManager() {
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
      const list = await getCollaborationsAdmin();
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
      institution_type: row.institution_type || 'Academic',
      logo_url: row.logo_url || '',
      website_url: row.website_url || '',
      description: row.description || '',
      country: row.country || '',
      status: row.status || 'Active',
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
        await updateCollaboration(editing.id, payload);
      } else {
        await createCollaboration(payload);
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
      await deleteCollaboration(deleteTarget.id);
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
    { key: 'institution_type', label: 'Type' },
    { key: 'country', label: 'Country' },
    { key: 'status', label: 'Status' },
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
        <h1 className="dashboard-toolbar__title">Collaborations</h1>
        <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={openCreate}>
          <FiPlus size={18} /> Add collaboration
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={data} emptyMessage="No collaborations yet." />}

      <FormModal title={editing ? 'Edit collaboration' : 'Add collaboration'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="dashboard-form">
          <div className="dashboard-form__group">
            <label>Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="dashboard-form__group">
            <label>Institution type</label>
            <select value={form.institution_type} onChange={(e) => setForm((f) => ({ ...f, institution_type: e.target.value }))}>
              <option value="Academic">Academic</option>
              <option value="Research Lab">Research Lab</option>
              <option value="Industry">Industry</option>
              <option value="Government">Government</option>
              <option value="Hospital">Hospital</option>
              <option value="NGO">NGO</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="dashboard-form__group">
            <label>Logo URL</label>
            <input value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="dashboard-form__group">
            <label>Website URL</label>
            <input value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="dashboard-form__group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Country</label>
            <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="dashboard-form__group">
            <label>Display order</label>
            <input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
          </div>
          <div className="dashboard-modal__actions">
            <button type="button" className="dashboard-btn dashboard-btn--secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm open={!!deleteTarget} title="Delete collaboration?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
