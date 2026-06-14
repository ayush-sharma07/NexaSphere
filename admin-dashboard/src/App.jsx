import RealTimeDashboard from './pages/RealTimeDashboard';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { auth } from './services/auth';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardHome } from './pages/DashboardHome';
import { EventsManager } from './pages/EventsManager';
import { ActivityEventsManager } from './pages/ActivityEventsManager';
import { CoreTeamManager } from './pages/CoreTeamManager';
import { MembershipResponsesManager } from './pages/MembershipResponsesManager';
import { RecruitmentResponsesManager } from './pages/RecruitmentResponsesManager';
import './styles/admin.css';

function RequireAuth() {
  return auth.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

import { useState } from 'react';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <header className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <span className="mobile-brand">NexaSphere Admin</span>
      </header>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/events" element={<EventsManager />} />
            <Route path="/dashboard/activity-events" element={<ActivityEventsManager />} />
            <Route path="/dashboard/core-team" element={<CoreTeamManager />} />
            <Route path="/dashboard/analytics" element={<RealTimeDashboard />} />
            <Route path="/dashboard/membership" element={<MembershipResponsesManager />} />
            <Route path="/dashboard/recruitment" element={<RecruitmentResponsesManager />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={auth.isAuthenticated() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
