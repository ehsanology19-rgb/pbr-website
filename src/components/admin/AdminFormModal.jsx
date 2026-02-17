import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiUpload, FiImage } from 'react-icons/fi';
import { adminUploadImage } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Reusable form modal for creating/editing records.
 *
 * Field types: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'select' | 'checkbox' | 'date' | 'image'
 *
 * The 'image' type shows a file upload button + URL input + preview.
 * The `category` prop on image fields controls the storage subfolder (e.g. 'team', 'projects').
 */
export default function AdminFormModal({ title, fields, initialData, onSave, onClose, saving }) {
  const { user } = useAuth();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState({});

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

  const handleImageUpload = async (field, file) => {
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setUploading((prev) => ({ ...prev, [field.key]: true }));
    setError('');
    try {
      const url = await adminUploadImage(user.id, file, field.category || 'uploads');
      handleChange(field.key, url);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading((prev) => ({ ...prev, [field.key]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const isUploading = Object.values(uploading).some(Boolean);
    if (isUploading) {
      setError('Please wait for image upload to finish.');
      return;
    }

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

  const isAnyUploading = Object.values(uploading).some(Boolean);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{title}</h2>
          <button className="admin-modal__close" onClick={onClose} type="button">
            <FiX size={20} />
          </button>
        </div>

        {error && <div className="admin-action-error" style={{ margin: '0 24px 0' }}>{error}</div>}

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
                      disabled={saving || isAnyUploading}
                    />
                    <span>{f.label}</span>
                  </label>
                );
              }

              if (f.type === 'image') {
                return (
                  <ImageField
                    key={f.key}
                    field={f}
                    value={form[f.key] || ''}
                    onChange={(val) => handleChange(f.key, val)}
                    onUpload={(file) => handleImageUpload(f, file)}
                    uploading={!!uploading[f.key]}
                    disabled={saving}
                  />
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
                      disabled={saving || isAnyUploading}
                      className="admin-modal__input"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={form[f.key] ?? ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      disabled={saving || isAnyUploading}
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
                      disabled={saving || isAnyUploading}
                      className="admin-modal__input"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="admin-modal__footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving || isAnyUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || isAnyUploading}>
              <FiSave size={16} /> {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageField({ field, value, onChange, onUpload, uploading, disabled }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="admin-modal__field">
      <label className="admin-modal__label">
        {field.label} {field.required && <span className="admin-modal__req">*</span>}
      </label>

      {value && (
        <div className="admin-image-preview">
          <img src={value} alt="Preview" className="admin-image-preview__img" />
          <button
            type="button"
            className="admin-image-preview__remove"
            onClick={() => onChange('')}
            title="Remove image"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      <div className="admin-image-actions">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="admin-image-upload-btn"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
        >
          <FiUpload size={15} />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <span className="admin-image-or">or</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL"
          disabled={disabled || uploading}
          className="admin-modal__input admin-image-url-input"
        />
      </div>
    </div>
  );
}
