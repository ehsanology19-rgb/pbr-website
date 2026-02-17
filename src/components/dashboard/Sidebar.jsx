import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLink,
  FiSettings,
  FiMessageSquare,
  FiUserPlus,
} from 'react-icons/fi';
import './Dashboard.css';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Home' },
  { to: '/dashboard/team', icon: FiUsers, label: 'Team' },
  { to: '/dashboard/publications', icon: FiFileText, label: 'Publications' },
  { to: '/dashboard/projects', icon: FiFolder, label: 'Projects' },
  { to: '/dashboard/research-areas', icon: FiGrid, label: 'Research Areas' },
  { to: '/dashboard/collaborations', icon: FiLink, label: 'Collaborations' },
  { to: '/dashboard/settings', icon: FiSettings, label: 'Settings' },
  { to: '/dashboard/messages', icon: FiMessageSquare, label: 'Messages' },
  { to: '/dashboard/members', icon: FiUserPlus, label: 'Members' },
];

export default function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <nav className="dashboard-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `dashboard-nav__link ${isActive ? 'dashboard-nav__link--active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
