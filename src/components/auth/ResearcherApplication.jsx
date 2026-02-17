import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function ResearcherApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    specialization: '',
    experience: '',
    cover_letter: '',
    resume_url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Please sign in first to submit an application.');
      setLoading(false);
      return;
    }

    try {
      const { error: err } = await supabase.from('researcher_applications').insert([
        {
          user_id: user.id,
          full_name: formData.full_name.trim() || user.email,
          email: formData.email.trim() || user.email,
          phone: formData.phone.trim() || null,
          specialization: formData.specialization.trim() || null,
          experience: formData.experience.trim() || null,
          cover_letter: formData.cover_letter.trim() || null,
          resume_url: formData.resume_url.trim() || null,
        },
      ]);

      if (err) throw err;
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Application received</h1>
          <p className="auth-subtitle">
            Thank you for applying to join the PBR research team. We&apos;ll review your application and get back to you.
          </p>
          <Link to="/" className="btn btn-primary auth-submit">
            Back to website
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Researcher Application</h1>
          <p className="auth-subtitle">Sign in or sign up first to submit your application.</p>
          <Link to={`/login?redirect=${encodeURIComponent('/apply')}`} className="btn btn-primary auth-submit">
            Sign In
          </Link>
          <Link to={`/signup`} className="btn btn-outline auth-submit" style={{ marginTop: 8 }}>
            Create Account
          </Link>
          <p className="auth-footer">
            <Link to="/">Back to website</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <h1 className="auth-title">Apply to Join the Team</h1>
        <p className="auth-subtitle">Tell us about your research background and interest.</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="specialization">Specialization / Research Area</label>
            <input
              id="specialization"
              name="specialization"
              type="text"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Computational Drug Design"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="experience">Experience</label>
            <textarea
              id="experience"
              name="experience"
              rows={3}
              value={formData.experience}
              onChange={handleChange}
              placeholder="Brief summary of your research experience, degrees, publications..."
            />
          </div>
          <div className="auth-field">
            <label htmlFor="cover_letter">Cover Letter</label>
            <textarea
              id="cover_letter"
              name="cover_letter"
              rows={5}
              value={formData.cover_letter}
              onChange={handleChange}
              placeholder="Why do you want to join PBR? What do you hope to contribute?"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="resume_url">Resume / CV URL</label>
            <input
              id="resume_url"
              name="resume_url"
              type="url"
              value={formData.resume_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          <button type="submit" className="auth-submit btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/">Back to website</Link>
        </p>
      </div>
    </div>
  );
}
