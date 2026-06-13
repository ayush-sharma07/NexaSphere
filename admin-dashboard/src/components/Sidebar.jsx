import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminIcon } from './AdminIcon';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { to: '/dashboard/events', label: 'Events', icon: 'Calendar' },
  { to: '/dashboard/activity-events', label: 'Activity Events', icon: 'Target' },
  { to: '/dashboard/core-team', label: 'Core Team', icon: 'Users' },
  { to: '/dashboard/membership', label: 'Membership', icon: 'FileText' },
  { to: '/dashboard/recruitment', label: 'Recruitment', icon: 'Users' },
];

export function Sidebar({ isOpen, onClose }) {
  const { email, logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="brand-dot" />
          <span>NexaSphere Control Center</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close Sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <AdminIcon name={icon} size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-email">{email}</span>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>
    </aside>
  );
}
