import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Research', href: '#research' },
  { label: 'Publications', href: '#publications' },
  { label: 'Team', href: '#team' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

// Dropdown menu for user actions
function UserDropdown({ user, isAdmin, onSignOut }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="navbar__user-dropdown">
      <button 
        className="navbar__user-btn"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        <span className="navbar__user-avatar">
          {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </span>
        <svg className={`navbar__dropdown-arrow ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {open && (
        <div className="navbar__dropdown-menu">
          {isAdmin && (
            <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Dashboard
            </Link>
          )}
          <Link to="/account" className="navbar__dropdown-item" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Account
          </Link>
          <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={onSignOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">P</span>
          <span className="navbar__logo-text">
            <strong>Padma</strong> BioResearch
          </span>
        </Link>

        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__auth">
          {user ? (
            <UserDropdown user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />
          ) : (
            <>
              <Link to="/login" className="navbar__auth-link">Sign In</Link>
              <Link to="/signup" className="btn btn-primary navbar__cta">Sign Up</Link>
            </>
          )}
        </div>

        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="navbar__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="navbar__mobile-auth">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/dashboard" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <Link to="/account" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                    Account
                  </Link>
                  <button type="button" className="navbar__mobile-link navbar__mobile-link--danger" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
