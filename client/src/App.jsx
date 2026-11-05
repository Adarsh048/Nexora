import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ApplicationsPage } from './pages/ApplicationsPage.jsx';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage.jsx';
import { PipelinePage } from './pages/PipelinePage.jsx';
import { ActivityPage } from './pages/ActivityPage.jsx';
import { InboxIntelligencePage } from './pages/InboxIntelligencePage.jsx';
import { InsightsPage } from './pages/InsightsPage.jsx';
import { CalendarPage } from './pages/CalendarPage.jsx';
import { CompaniesPage } from './pages/CompaniesPage.jsx';
import { AchievementsPage } from './pages/AchievementsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FD] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7652E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Application Workspace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="inbox" element={<InboxIntelligencePage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

