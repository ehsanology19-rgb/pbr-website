import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiUser } from 'react-icons/fi';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateMyProfile, uploadAvatar } from '../../lib/supabase';
import './Account.css';

export default function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    university: '',
    field_of_study: '',
    bio: '',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    
    getMyProfile(user.id)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setForm({
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            university: data.university || '',
            field_of_study: data.field_of_study || '',
            bio: data.bio || '',
          });
        }
      })
      .catch((e) => {
        // Ignore abort errors
        if (e.name === 'AbortError' || e.message?.includes('aborted')) {
          return;
        }
        if (!cancelled) {
          const errorMessage = e.message || 'Failed to load profile';
          setError(errorMessage);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { 
      cancelled = true; 
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyProfile(user.id, {
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
        university: form.university.trim() || null,
        field_of_study: form.field_of_study.trim() || null,
        bio: form.bio.trim() || null,
      });
      setProfile(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (e.g. JPG, PNG).');
      return;
    }
    setUploadingPhoto(true);
    setError('');
    try {
      const url = await uploadAvatar(user.id, file);
      await updateMyProfile(user.id, { avatar_url: url });
      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : null));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="account-layout">
        <div className="account-card">
          <p className="account-loading">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-layout">
      <header className="account-header">
        <div className="account-header__inner">
          <Link to="/" className="account-header__back">
            <FiArrowLeft size={20} /> Back to site
          </Link>
          <button type="button" className="account-header__logout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="account-card">
        <h1 className="account-title">My profile</h1>
        <p className="account-subtitle">Update your researcher information. This is visible to the organization.</p>

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }} role="alert">
            {error}
          </div>
        )}

        <div className="account-photo-section">
          <div className="account-photo-wrap">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="account-photo" />
            ) : (
              <div className="account-photo-placeholder">
                <FiUser size={48} />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="account-photo-input"
              aria-label="Upload photo"
            />
            <button
              type="button"
              className="account-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              <FiUpload size={18} /> {uploadingPhoto ? 'Uploading...' : 'Change photo'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="account-form__group">
            <label htmlFor="full_name">Full name *</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="account-form__group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} disabled className="account-input--disabled" />
            <span className="account-hint">Email is managed by your account and cannot be changed here.</span>
          </div>
          <div className="account-form__group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="account-form__group">
            <label htmlFor="university">University / Institution</label>
            <input
              id="university"
              name="university"
              type="text"
              value={form.university}
              onChange={handleChange}
              placeholder="e.g. University of Dhaka"
            />
          </div>
          <div className="account-form__group">
            <label htmlFor="field_of_study">Field of study</label>
            <input
              id="field_of_study"
              name="field_of_study"
              type="text"
              value={form.field_of_study}
              onChange={handleChange}
              placeholder="e.g. Computational Biology, Pharmacology"
            />
          </div>
          <div className="account-form__group">
            <label htmlFor="bio">Short bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              placeholder="A brief description of your research interests and background..."
            />
          </div>
          <button type="submit" className="btn btn-primary account-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
