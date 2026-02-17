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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
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

        {user ? (
          <>
            <Link to="/account" className="navbar__link" style={{ marginRight: 12 }}>Account</Link>
            <button type="button" className="navbar__link navbar__btn-link" onClick={handleSignOut}>Sign out</button>
          </>
        ) : (
          <Link to="/login" className="navbar__link" style={{ marginRight: 12 }}>Login</Link>
        )}
        <a href="#contact" className="btn btn-primary navbar__cta">
          Get in Touch
        </a>

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
            {user ? (
              <>
                <Link to="/account" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Account</Link>
                <button type="button" className="navbar__mobile-link" onClick={handleSignOut}>Sign out</button>
              </>
            ) : (
              <Link to="/login" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Login</Link>
            )}
            <a
              href="#contact"
              className="btn btn-primary"
              onClick={() => setMobileOpen(false)}
            >
              Get in Touch
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
