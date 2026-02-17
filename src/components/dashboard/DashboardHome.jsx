import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiFolder, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import { getDashboardStats } from '../../lib/supabase';
import './Dashboard.css';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    team: 0,
    publications: 0,
    projects: 0,
    messages: 0,
    applications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (e) {
        console.error('Failed to load dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid rgba(78, 205, 196, 0.2)', 
              borderTopColor: 'var(--color-teal)', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: 'var(--color-text-medium)' }}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Team Members', value: stats.team, icon: FiUsers, to: '/dashboard/team', color: 'teal' },
    { label: 'Publications', value: stats.publications, icon: FiFileText, to: '/dashboard/publications', color: 'navy' },
    { label: 'Projects', value: stats.projects, icon: FiFolder, to: '/dashboard/projects', color: 'green' },
    { label: 'Contact Messages', value: stats.messages, icon: FiMessageSquare, to: '/dashboard/messages', color: 'orange' },
    { label: 'Pending Applications', value: stats.applications, icon: FiUserPlus, to: '/dashboard/members', color: 'purple' },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">Dashboard</h1>
      <p className="dashboard-page__subtitle">Manage your PBR website content</p>
      <div className="dashboard-cards">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={to} to={to} className={`dashboard-card dashboard-card--${color}`}>
            <Icon size={28} className="dashboard-card__icon" />
            <div className="dashboard-card__content">
              <span className="dashboard-card__value">{value}</span>
              <span className="dashboard-card__label">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
