import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaResearchgate,
} from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import './Footer.css';

const footerLinks = {
  'Quick Links': [
    { label: 'About PBR', href: '#about' },
    { label: 'Research Areas', href: '#research' },
    { label: 'Publications', href: '#publications' },
    { label: 'Our Team', href: '#team' },
  ],
  Research: [
    { label: 'In Silico Research', href: '#research' },
    { label: 'In Vitro Research', href: '#research' },
    { label: 'In Vivo Research', href: '#research' },
    { label: 'Ongoing Projects', href: '#projects' },
  ],
  Connect: [
    { label: 'Contact Us', href: '#contact' },
    { label: 'Join Our Team', href: '#contact' },
    { label: 'Collaborate', href: '#contact' },
    { label: 'Newsletter', href: '#contact' },
  ],
};

const socials = [
  { icon: <FaFacebookF size={14} />, href: 'https://www.facebook.com/share/1BXxEYaKui/', label: 'Facebook' },
  { icon: <FaLinkedinIn size={14} />, href: '#', label: 'LinkedIn' },
  { icon: <FaTwitter size={14} />, href: '#', label: 'Twitter' },
  { icon: <FaResearchgate size={14} />, href: '#', label: 'ResearchGate' },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo">
              <span className="footer__logo-icon">P</span>
              <span className="footer__logo-text">
                <strong>Padma</strong> BioResearch
              </span>
            </a>
            <p className="footer__desc">
              Advancing science through integrated in silico, in vitro, and
              in vivo research — shaping the future of biomedical discovery
              under expert guidance.
            </p>
            <div className="footer__socials">
              {socials.map((s, i) => (
                <a
                  href={s.href}
                  className="footer__social"
                  key={i}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div className="footer__col" key={title}>
              <h4 className="footer__col-title">{title}</h4>
              <ul className="footer__col-list">
                {links.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} Padma BioResearch Organization
            (PBR). All rights reserved.
          </p>
          <button
            className="footer__back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <FiArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
