import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthOnlyRoute from './components/auth/AuthOnlyRoute';
import HomePage from './components/HomePage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResearcherApplication from './components/auth/ResearcherApplication';
import AccountPage from './components/account/AccountPage';

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
