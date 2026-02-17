import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

/**
 * Reusable form modal for creating/editing records.
 *
 * @param {string}   title       - Modal title (e.g. "Add Team Member")
 * @param {Array}    fields      - Field definitions array
 * @param {Object}   initialData - Pre-filled data for editing (null for create)
 * @param {Function} onSave      - Called with form data object
 * @param {Function} onClose     - Called to close the modal
 * @param {boolean}  saving      - Disables form while saving
 *
 * Field definition shape:
 *   { key, label, type, required, placeholder, options, rows, min, max, step }
 *   type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'select' | 'checkbox' | 'date'
 */
export default function AdminFormModal({ title, fields, initialData, onSave, onClose, saving }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const defaults = {};
    fields.forEach((f) => {
      if (initialData && initialData[f.key] !== undefined && initialData[f.key] !== null) {
        defaults[f.key] = initialData[f.key];
      } else if (f.type === 'checkbox') {
        defaults[f.key] = f.defaultValue ?? true;
      } else if (f.type === 'number') {
        defaults[f.key] = f.defaultValue ?? '';
      } else {
        defaults[f.key] = f.defaultValue ?? '';
      }
    });
    setForm(defaults);
  }, [fields, initialData]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    for (const f of fields) {
      if (f.required && !form[f.key] && form[f.key] !== 0 && form[f.key] !== false) {
        setError(`"${f.label}" is required.`);
        return;
      }
    }

    const cleaned = {};
    fields.forEach((f) => {
      let val = form[f.key];
      if (f.type === 'number' && val !== '' && val !== undefined) {
        val = Number(val);
      }
      if (f.type === 'checkbox') {
        val = !!val;
      }
      if (val === '' || val === undefined) {
        val = null;
      }
      cleaned[f.key] = val;
    });

    onSave(cleaned);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{title}</h2>
          <button className="admin-modal__close" onClick={onClose} type="button">
            <FiX size={20} />
          </button>
        </div>

        {error && <div className="admin-action-error" style={{ margin: '0 24px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__body">
            {fields.map((f) => {
              if (f.type === 'checkbox') {
                return (
                  <label key={f.key} className="admin-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.checked)}
                      disabled={saving}
                    />
                    <span>{f.label}</span>
                  </label>
                );
              }

              return (
                <div key={f.key} className="admin-modal__field">
                  <label className="admin-modal__label">
                    {f.label} {f.required && <span className="admin-modal__req">*</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={form[f.key] ?? ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                      rows={f.rows || 3}
                      disabled={saving}
                      className="admin-modal__input"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={form[f.key] ?? ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      disabled={saving}
                      className="admin-modal__input"
                    >
                      {!f.required && <option value="">— Select —</option>}
                      {f.options?.map((opt) => (
                        <option key={opt.value ?? opt} value={opt.value ?? opt}>
                          {opt.label ?? opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.key] ?? ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      disabled={saving}
                      className="admin-modal__input"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="admin-modal__footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FiSave size={16} /> {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
