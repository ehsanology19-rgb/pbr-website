import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import DataTable from './DataTable';
import FormModal from './FormModal';
import DeleteConfirm from './DeleteConfirm';
import {
  getPublicationsAdmin,
  createPublication,
  updatePublication,
  deletePublication,
} from '../../lib/supabase';
import './Dashboard.css';

const defaultRow = {
  title: '',
  journal: '',
  year: new Date().getFullYear(),
  publication_type: 'Research Article',
  doi: '',
  authors: [],
  abstract: '',
  pdf_url: '',
  external_link: '',
  citation_count: 0,
  is_featured: false,
  is_active: true,
};

export default function PublicationsManager() {
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
      const list = await getPublicationsAdmin();
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
    setForm({ ...defaultRow, year: new Date().getFullYear() });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || '',
      journal: row.journal || '',
      year: row.year ?? new Date().getFullYear(),
      publication_type: row.publication_type || 'Research Article',
      doi: row.doi || '',
      authors: Array.isArray(row.authors) ? row.authors : [],
      abstract: row.abstract || '',
      pdf_url: row.pdf_url || '',
      external_link: row.external_link || '',
      citation_count: row.citation_count ?? 0,
      is_featured: !!row.is_featured,
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
        year: Number(form.year) || new Date().getFullYear(),
        citation_count: Number(form.citation_count) || 0,
        authors: Array.isArray(form.authors) ? form.authors : [],
        is_featured: !!form.is_featured,
        is_active: !!form.is_active,
      };
      if (editing) {
        await updatePublication(editing.id, payload);
      } else {
        await createPublication(payload);
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
      await deletePublication(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', tdStyle: { maxWidth: 280 } },
    { key: 'journal', label: 'Journal' },
    { key: 'year', label: 'Year' },
    { key: 'publication_type', label: 'Type' },
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
        <h1 className="dashboard-toolbar__title">Publications</h1>
        <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={openCreate}>
          <FiPlus size={18} /> Add publication
        </button>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={data} emptyMessage="No publications yet." />}

      <FormModal title={editing ? 'Edit publication' : 'Add publication'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="dashboard-form">
          <div className="dashboard-form__group">
            <label>Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="dashboard-form__group">
            <label>Journal *</label>
            <input value={form.journal} onChange={(e) => setForm((f) => ({ ...f, journal: e.target.value }))} required />
          </div>
          <div className="dashboard-form__group">
            <label>Year *</label>
            <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} min="1900" max="2100" />
          </div>
          <div className="dashboard-form__group">
            <label>Type</label>
            <select value={form.publication_type} onChange={(e) => setForm((f) => ({ ...f, publication_type: e.target.value }))}>
              <option value="Research Article">Research Article</option>
              <option value="Review">Review</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Book Chapter">Book Chapter</option>
            </select>
          </div>
          <div className="dashboard-form__group">
            <label>DOI</label>
            <input value={form.doi} onChange={(e) => setForm((f) => ({ ...f, doi: e.target.value }))} placeholder="10.1000/xyz" />
          </div>
          <div className="dashboard-form__group">
            <label>Abstract</label>
            <textarea value={form.abstract} onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))} />
          </div>
          <div className="dashboard-form__group">
            <label>PDF URL</label>
            <input value={form.pdf_url} onChange={(e) => setForm((f) => ({ ...f, pdf_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="dashboard-form__group">
            <label>Citation count</label>
            <input type="number" value={form.citation_count} onChange={(e) => setForm((f) => ({ ...f, citation_count: e.target.value }))} min={0} />
          </div>
          <div className="dashboard-form__group">
            <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} /> Featured on homepage</label>
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

      <DeleteConfirm open={!!deleteTarget} title="Delete publication?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
}
