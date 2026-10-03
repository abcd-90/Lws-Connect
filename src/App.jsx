import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import { PublicLandingPage } from './pages/PublicLandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FAQPage } from './pages/FAQPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// User Portal Pages
import { UserChatPage } from './pages/UserChatPage';

// Admin Panel Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminInboxPage } from './pages/AdminInboxPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminDesignStudioPage } from './pages/AdminDesignStudioPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';

// Protected Route Guard
function ProtectedUserRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400 text-xs">Loading application...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Protected Admin Guard
function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400 text-xs">Loading security status...</div>;
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* User Dashboard & Messaging */}
      <Route path="/app" element={<ProtectedUserRoute><UserChatPage /></ProtectedUserRoute>} />
      <Route path="/app/messages" element={<ProtectedUserRoute><UserChatPage /></ProtectedUserRoute>} />
      <Route path="/app/messages/:id" element={<ProtectedUserRoute><UserChatPage /></ProtectedUserRoute>} />

      {/* Admin Panel Routes */}
      <Route path="/lws-portal-secure-x99" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/lws-portal-secure-x99/conversations" element={<ProtectedAdminRoute><AdminInboxPage /></ProtectedAdminRoute>} />
      <Route path="/lws-portal-secure-x99/users" element={<ProtectedAdminRoute><AdminUsersPage /></ProtectedAdminRoute>} />
      <Route path="/lws-portal-secure-x99/reports" element={<ProtectedAdminRoute><AdminModerationPage /></ProtectedAdminRoute>} />
      <Route path="/lws-portal-secure-x99/analytics" element={<ProtectedAdminRoute><AdminAnalyticsPage /></ProtectedAdminRoute>} />
      <Route path="/lws-portal-secure-x99/design-studio" element={<ProtectedAdminRoute><AdminDesignStudioPage /></ProtectedAdminRoute>} />
      <Route path="/lws-portal-secure-x99/audit-logs" element={<ProtectedAdminRoute><AdminAuditLogsPage /></ProtectedAdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
