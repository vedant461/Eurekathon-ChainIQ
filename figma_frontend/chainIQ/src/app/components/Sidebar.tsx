import React from 'react';
import {
  BarChart,
  Map,
  Settings,
  Play,
  FileText,
  User,
  ShoppingBag,
  Package,
  Inbox as InboxIcon,
  Activity,
  LayoutDashboard,
  Truck,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, path: '/suppliers' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'my-performance', label: 'My Performance', icon: Activity, path: '/my-performance' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'my-orders', label: 'My Orders', icon: Package, path: '/my-orders' },
    { id: 'inbox', label: 'Inbox', icon: InboxIcon, path: '/inbox' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">MetricPulse</span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Overview
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');
          return (
            <Link
              key={item.id}
              to={item.path}
              className={clsx(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={clsx(
                  "w-5 h-5",
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </div>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-50 border border-slate-100">
          <img
            src="https://images.unsplash.com/photo-1758691736424-4b4273948341?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBkYXRhJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc3MTQ5Njg1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">Alex Morgan</p>
            <p className="text-xs text-slate-500 truncate">Supply Chain Dir.</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
