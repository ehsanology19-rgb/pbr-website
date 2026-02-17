import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { getContactSubmissions, updateContactStatus } from '../../lib/supabase';
import './Dashboard.css';

const STATUS_OPTIONS = ['new', 'in_progress', 'resolved', 'closed'];

export default function MessagesManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await getContactSubmissions();
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

  const handleStatusChange = async (row, newStatus) => {
    try {
      await updateContactStatus(row.id, newStatus);
      setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r)));
    } catch (e) {
      setError(e.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject', tdStyle: { maxWidth: 200 } },
    { key: 'message', label: 'Message', tdStyle: { maxWidth: 280 }, render: (v) => (v ? (v.length > 80 ? v.slice(0, 80) + '…' : v) : '-') },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <select
          value={row.status || 'new'}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="dashboard-form__group select"
          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '-'),
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <h1 className="dashboard-toolbar__title">Contact Messages</h1>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={data} emptyMessage="No contact messages yet." />}
    </div>
  );
}
