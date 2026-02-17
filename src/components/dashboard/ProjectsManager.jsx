import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import DataTable from './DataTable';
import FormModal from './FormModal';
import DeleteConfirm from './DeleteConfirm';
import {
  getProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
} from '../../lib/supabase';
import './Dashboard.css';

const defaultRow = {
  title: '',
  description: '',
  status: 'Active',
  progress: 0,
  start_date: '',
  end_date: '',
  funding_source: '',
  tags: [],
  is_featured: false,
  is_active: true,
  display_order: 0,
};

export default function ProjectsManager() {
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
      const list = await getProjectsAdmin();
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
      title: row.title || '',
      description: row.description || '',
      status: row.status || 'Active',
      progress: row.progress ?? 0,
      start_date: row.start_date || '',
      end_date: row.end_date || '',
      funding_source: row.funding_source || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      is_featured: !!row.is_featured,
      is_active: row.is_active ?? true,
      display_order: row.display_order ?? 0,
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
        progress: Number(form.progress) || 0,
        display_order: Number(form.display_order) || 0,
        is_featured: !!form.is_featured,
        is_active: !!form.is_active,
        tags: Array.isArray(form.tags) ? form.tags : [],
      };
      if (editing) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
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
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', tdStyle: { maxWidth: 240 } },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Progress', render: (v) => (v != null ? `${v}%` : '-') },
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
        <h1 className="dashboard-toolbar__title">Projects</h1>
        <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={openCreate}>
          <FiPlus size={18} /> Add project
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={data} emptyMessage="No projects yet." />}

      <FormModal title={editing ? 'Edit project' : 'Add project'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="dashboard-form">
          <div className="dashboard-form__group">
            <label>Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="dashboard-form__group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div className="dashboard-form__group">
            <label>Progress (0-100)</label>
            <input type="number" value={form.progress} onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))} min={0} max={100} />
          </div>
          <div className="dashboard-form__group">
            <label>Start date</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>End date</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Funding source</label>
            <input value={form.funding_source} onChange={(e) => setForm((f) => ({ ...f, funding_source: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Display order</label>
            <input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} /> Featured</label>
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

      <DeleteConfirm open={!!deleteTarget} title="Delete project?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
