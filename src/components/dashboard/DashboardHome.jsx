import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiFolder, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import {
  getTeamMembersAdmin,
  getPublicationsAdmin,
  getProjectsAdmin,
  getContactSubmissions,
  getResearcherApplications,
} from '../../lib/supabase';
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
        const [team, pubs, projects, messages, applications] = await Promise.all([
          getTeamMembersAdmin(),
          getPublicationsAdmin(),
          getProjectsAdmin(),
          getContactSubmissions(),
          getResearcherApplications(),
        ]);
        setStats({
          team: team.length,
          publications: pubs.length,
          projects: projects.length,
          messages: messages.length,
          applications: applications.filter((a) => a.status === 'pending').length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="dashboard-page"><p>Loading...</p></div>;
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
