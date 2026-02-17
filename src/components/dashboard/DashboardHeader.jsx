import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiExternalLink } from 'react-icons/fi';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

export default function DashboardHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__left">
        <span className="dashboard-header__title">PBR Admin</span>
      </div>
      <div className="dashboard-header__right">
        <a href="/" target="_blank" rel="noopener noreferrer" className="dashboard-header__site">
          <FiExternalLink size={16} />
          View site
        </a>
        <span className="dashboard-header__user">{user?.email}</span>
        <button type="button" onClick={handleSignOut} className="dashboard-header__logout" aria-label="Sign out">
          <FiLogOut size={18} />
          Sign out
        </button>
      </div>
    </header>
  );
}
