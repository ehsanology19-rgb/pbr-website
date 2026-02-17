import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthOnlyRoute from './components/auth/AuthOnlyRoute';
import HomePage from './components/HomePage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResearcherApplication from './components/auth/ResearcherApplication';
import AccountPage from './components/account/AccountPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import TeamManager from './components/dashboard/TeamManager';
import PublicationsManager from './components/dashboard/PublicationsManager';
import ProjectsManager from './components/dashboard/ProjectsManager';
import ResearchAreasManager from './components/dashboard/ResearchAreasManager';
import CollaborationsManager from './components/dashboard/CollaborationsManager';
import SettingsManager from './components/dashboard/SettingsManager';
import MessagesManager from './components/dashboard/MessagesManager';
import MembersManager from './components/dashboard/MembersManager';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/apply" element={<ResearcherApplication />} />
          <Route
            path="/account"
            element={
              <AuthOnlyRoute>
                <AccountPage />
              </AuthOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="team" element={<TeamManager />} />
            <Route path="publications" element={<PublicationsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="research-areas" element={<ResearchAreasManager />} />
            <Route path="collaborations" element={<CollaborationsManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="messages" element={<MessagesManager />} />
            <Route path="members" element={<MembersManager />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
