import { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSetting } from '../../lib/supabase';
import './Dashboard.css';

const EDITABLE_KEYS = [
  { key: 'contact_email', label: 'Contact email', type: 'text' },
  { key: 'contact_phone', label: 'Contact phone', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'organization_name', label: 'Organization name', type: 'text' },
  { key: 'organization_tagline', label: 'Organization tagline', type: 'text' },
];

function parseValue(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  try {
    return typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
  } catch {
    return String(val);
  }
}


export default function SettingsManager() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [local, setLocal] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      setSettings(data);
      const initial = {};
      EDITABLE_KEYS.forEach(({ key }) => {
        initial[key] = parseValue(data[key]);
      });
      setLocal(initial);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (key, value) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key) => {
    setSaving(true);
    setError('');
    try {
      const value = local[key];
      await updateSiteSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading...</p></div>;

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-toolbar__title">Site Settings</h1>
      <p className="dashboard-page__subtitle">Update contact info and organization details shown on the website.</p>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="dashboard-table-wrap" style={{ padding: 24 }}>
        <div className="dashboard-form" style={{ gap: 20 }}>
          {EDITABLE_KEYS.map(({ key, label, type }) => (
            <div key={key} className="dashboard-form__group">
              <label>{label}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type={type}
                  value={local[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <button
                  type="button"
                  className="dashboard-btn dashboard-btn--primary"
                  onClick={() => handleSave(key)}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
