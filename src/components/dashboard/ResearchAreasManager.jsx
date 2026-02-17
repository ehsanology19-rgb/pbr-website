import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import DataTable from './DataTable';
import FormModal from './FormModal';
import DeleteConfirm from './DeleteConfirm';
import {
  getResearchAreasAdmin,
  createResearchArea,
  updateResearchArea,
  deleteResearchArea,
} from '../../lib/supabase';
import './Dashboard.css';

const defaultRow = {
  title: '',
  slug: '',
  description: '',
  highlights: [],
  icon: '',
  gradient_from: '#0ea5e9',
  gradient_to: '#6366f1',
  display_order: 0,
  is_active: true,
};

export default function ResearchAreasManager() {
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
      const list = await getResearchAreasAdmin();
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

  const slugify = (s) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

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
      slug: row.slug || '',
      description: row.description || '',
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
      icon: row.icon || '',
      gradient_from: row.gradient_from || '#0ea5e9',
      gradient_to: row.gradient_to || '#6366f1',
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
      const slug = form.slug || slugify(form.title) || 'area';
      const payload = {
        ...form,
        slug,
        display_order: Number(form.display_order) || 0,
        highlights: Array.isArray(form.highlights) ? form.highlights : [],
        is_active: !!form.is_active,
      };
      if (editing) {
        await updateResearchArea(editing.id, payload);
      } else {
        await createResearchArea(payload);
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
      await deleteResearchArea(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
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
        <h1 className="dashboard-toolbar__title">Research Areas</h1>
        <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={openCreate}>
          <FiPlus size={18} /> Add area
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={data} emptyMessage="No research areas yet." />}

      <FormModal title={editing ? 'Edit research area' : 'Add research area'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="dashboard-form">
          <div className="dashboard-form__group">
            <label>Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} required />
          </div>
          <div className="dashboard-form__group">
            <label>Slug</label>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="in-silico" />
          </div>
          <div className="dashboard-form__group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Icon name</label>
            <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="FiCpu" />
          </div>
          <div className="dashboard-form__group">
            <label>Gradient from</label>
            <input value={form.gradient_from} onChange={(e) => setForm((f) => ({ ...f, gradient_from: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>Gradient to</label>
            <input value={form.gradient_to} onChange={(e) => setForm((f) => ({ ...f, gradient_to: e.target.value }))} />
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

      <DeleteConfirm open={!!deleteTarget} title="Delete research area?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
