import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiFolder, FiMessageSquare, FiUserPlus, FiGrid, FiLink, FiSettings } from 'react-icons/fi';
import './Dashboard.css';

export default function DashboardHome() {
  const cards = [
    { label: 'Team Members', icon: FiUsers, to: '/dashboard/team', color: 'teal' },
    { label: 'Publications', icon: FiFileText, to: '/dashboard/publications', color: 'navy' },
    { label: 'Projects', icon: FiFolder, to: '/dashboard/projects', color: 'green' },
    { label: 'Research Areas', icon: FiGrid, to: '/dashboard/research-areas', color: 'blue' },
    { label: 'Collaborations', icon: FiLink, to: '/dashboard/collaborations', color: 'purple' },
    { label: 'Contact Messages', icon: FiMessageSquare, to: '/dashboard/messages', color: 'orange' },
    { label: 'Members', icon: FiUserPlus, to: '/dashboard/members', color: 'pink' },
    { label: 'Settings', icon: FiSettings, to: '/dashboard/settings', color: 'gray' },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">Dashboard</h1>
      <p className="dashboard-page__subtitle">Manage your PBR website content</p>
      <div className="dashboard-cards">
        {cards.map(({ label, icon: Icon, to, color }) => (
          <Link key={to} to={to} className={`dashboard-card dashboard-card--${color}`}>
            <Icon size={28} className="dashboard-card__icon" />
            <div className="dashboard-card__content">
              <span className="dashboard-card__label">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
