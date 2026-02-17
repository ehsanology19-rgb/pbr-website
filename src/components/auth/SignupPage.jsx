import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/auth';
import './Auth.css';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, { fullName: fullName.trim() || undefined });
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (err) {
      // Provide more helpful error messages
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (err.message) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and ensure Supabase is configured correctly.';
        } else if (err.message.includes('Invalid API key') || err.message.includes('JWT')) {
          errorMessage = 'Configuration error: Please check your Supabase API keys in the environment variables.';
        } else if (err.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (err.message.includes('Password')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('[SignupPage] Sign up error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We&apos;ve sent you a confirmation link. Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="btn btn-primary auth-submit">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join as a member to follow PBR updates</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-submit btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="auth-footer">
          <Link to="/">Back to website</Link>
        </p>
      </div>
    </div>
  );
}
