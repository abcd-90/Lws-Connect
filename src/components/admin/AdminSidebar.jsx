import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Palette, 
  FileCode2, 
  History, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminSidebar() {
  const { logout, user } = useAuth();

  const menuItems = [
    { label: 'Overview', path: '/lws-portal-secure-x99', icon: LayoutDashboard, exact: true },
    { label: 'Inbox & Conversations', path: '/lws-portal-secure-x99/conversations', icon: Inbox },
    { label: 'User Directory', path: '/lws-portal-secure-x99/users', icon: Users },
    { label: 'Moderation & Reports', path: '/lws-portal-secure-x99/reports', icon: ShieldAlert },
    { label: 'Analytics & Insights', path: '/lws-portal-secure-x99/analytics', icon: BarChart3 },
    { label: 'Design Studio (Theme)', path: '/lws-portal-secure-x99/design-studio', icon: Palette },
    { label: 'Audit Logs', path: '/lws-portal-secure-x99/audit-logs', icon: History }
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Logo Header */}
        <div className="p-6 border-b border-white/10">
          <Logo size="md" />
          <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Admin Workspace Active
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0284C7] text-white font-semibold shadow-md shadow-sky-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info & Public Site Link */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition"
        >
          <span>View Public Platform</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{user?.full_name || 'Sami'}</span>
              <span className="text-[10px] text-slate-500 uppercase">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
