import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, Search, SlidersHorizontal } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { usePersona } from '../../context/PersonaContext';
import { clsx } from 'clsx';

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { persona, setPersona, getPersonaLabel } = usePersona();

  // Derive title from path
  const path = location.pathname.split('/')[1] || 'dashboard';
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden border-r border-slate-200 bg-white relative z-20`}>
        <Sidebar onLogout={() => console.log("Logout clicked - dummy action")} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Persona Switcher */}
            <div className="relative group z-50">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors border border-slate-200">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Viewing As:</span>
                <span className="font-bold text-emerald-600">{getPersonaLabel()}</span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full pt-2 w-64 hidden group-hover:block z-50">
                <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 space-y-1">
                    <button onClick={() => setPersona('retailer')} className={clsx("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", persona === 'retailer' ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50")}>
                      Retailer (MegaMart)
                    </button>
                    <button onClick={() => setPersona('tier1_supplier')} className={clsx("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", persona === 'tier1_supplier' ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50")}>
                      Tier 1 Roaster (VRT Nuts)
                    </button>
                    <button onClick={() => setPersona('tier2_supplier')} className={clsx("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", persona === 'tier2_supplier' ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50")}>
                      Tier 2 Farm (Valley Farms)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 w-64"
              />
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
